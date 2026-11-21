/**
 * The notifier (SPEC §2.7, §3.5), every 30 s:
 * 1. **Draws what is due** (core's `drawDue`): today if the evening draw was missed, tomorrow once
 *    the evening time has come. Whether pushes are on or not.
 * 2. **Sends what is due** (core's `dueNotifications`): each push once per kind and date, rebuilt
 *    from the state on each pass, never planned ahead. A push is claimed (`sending`) before it is
 *    sent and settled (`sent` or `failed`) after, outside the transaction. One that failed, or was
 *    left `sending` for 2 minutes by a crash, is tried again until its grace window ends: at least
 *    once, and a duplicate replaces the first on the device (same tag). Its TTL is what is left of
 *    the window. Without a sender (no VAPID keys) or a device, nothing is claimed.
 */
import { type DueNotification, dueNotifications, drawDue } from "@teatime/core";
import { and, eq } from "drizzle-orm";
import type { Conn } from "../db/client.js";
import { notifications } from "../db/schema.js";
import type { Deps } from "../deps.js";
import { activeSubscriptions, sendToAll } from "../push/service.js";
import type { PushSender } from "../push/sender.js";
import { loadState } from "../state/rows.js";
import { storeChange } from "../state/service.js";

export const NOTIFIER_EVERY_MS = 30_000;

/** A push left `sending` this long was cut off (a crash, a deploy): it is tried again. */
export const STALE_SENDING_MS = 2 * 60_000;

export interface NotifierDeps extends Deps {
  readonly send: PushSender | null;
  /** The base of each push's link. */
  readonly publicOrigin: string;
}

/** What a pass did, for the tests and the log. */
export interface NotifierPass {
  readonly drawn: readonly string[];
  readonly pushes: readonly { readonly tag: string; readonly sent: number; readonly failed: number }[];
}

/** Takes a push for this pass, unless it went already or another pass is sending it. */
function claim(conn: Conn, due: DueNotification, now: number): boolean {
  const key = and(eq(notifications.kind, due.kind), eq(notifications.date, due.date));
  const row = conn.select().from(notifications).where(key).get();
  if (!row) {
    conn
      .insert(notifications)
      .values({ kind: due.kind, date: due.date, status: "sending", attempts: 1, updatedAt: now })
      .run();
    return true;
  }
  if (row.status === "sent") return false;
  if (row.status === "sending" && now - row.updatedAt < STALE_SENDING_MS) return false;
  conn
    .update(notifications)
    .set({ status: "sending", attempts: row.attempts + 1, updatedAt: now })
    .where(key)
    .run();
  return true;
}

export async function notifier(deps: NotifierDeps): Promise<NotifierPass> {
  const now = deps.clock().getTime();
  const { drawn, claimed } = deps.db.transaction((tx) => {
    const due = drawDue(loadState(tx, deps.warn), deps.catalog, now);
    storeChange(tx, due.state, due.touched);
    const sendable = deps.send !== null && activeSubscriptions(tx).length > 0;
    const plans = sendable ? dueNotifications(due.state, deps.catalog, now) : [];
    return { drawn: due.touched.picks, claimed: plans.filter((plan) => claim(tx, plan, now)) };
  });

  const pushes: { tag: string; sent: number; failed: number }[] = [];
  /** The first unexpected error: thrown once every claimed push is settled, for the job's log. */
  let error: unknown = null;
  for (const due of claimed) {
    const message = {
      title: due.title,
      body: due.body,
      navigate: new URL(due.url, deps.publicOrigin).href,
      tag: due.tag,
    };
    const ttlS = Math.max(1, Math.ceil((due.until - now) / 1000));
    let sent = 0;
    let failed: number;
    try {
      // `send` is set: nothing is claimed without it.
      ({ sent, failed } = await sendToAll(deps.db, deps.clock, deps.send as PushSender, message, ttlS));
    } catch (err) {
      failed = 1;
      error ??= err;
    }
    const settledAt = deps.clock().getTime();
    deps.db
      .update(notifications)
      .set(
        sent > 0
          ? { status: "sent", updatedAt: settledAt, sentAt: settledAt }
          : { status: "failed", updatedAt: settledAt },
      )
      .where(and(eq(notifications.kind, due.kind), eq(notifications.date, due.date)))
      .run();
    pushes.push({ tag: due.tag, sent, failed });
  }
  if (error !== null) throw error;
  return { drawn, pushes };
}
