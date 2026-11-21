/**
 * The devices' push subscriptions (SPEC §3.6, §3.8; ported from EagleEye's push/service.ts):
 * storing one, removing one, and sending a push to every one that is on. A subscription whose push
 * service answers 404 or 410 is gone: it is turned off for good, and the app subscribes afresh.
 */
import { and, eq, isNull, sql } from "drizzle-orm";
import type { Conn, Db } from "../db/client.js";
import { pushSubscriptions } from "../db/schema.js";
import type { Clock } from "../lib/clock.js";
import { HttpError, safeMessage } from "../lib/errors.js";
import type { PushMessage, PushSender } from "./sender.js";

/** The push services browsers use: the server calls an endpoint, so no other host is one (against SSRF). */
const PUSH_HOSTS = [
  /(^|\.)googleapis\.com$/, // Chrome, Edge on Android (fcm.googleapis.com)
  /(^|\.)push\.services\.mozilla\.com$/, // Firefox
  /(^|\.)push\.apple\.com$/, // Safari, iOS home-screen apps (web.push.apple.com)
  /(^|\.)notify\.windows\.com$/, // Edge on Windows (WNS)
];

/** The most subscriptions on at once: the owner's devices, with room for a new one before an old one goes. */
export const MAX_SUBSCRIPTIONS = 10;

/** An https endpoint of a browser's push service, or a 400 `invalid_endpoint`. */
export function assertPushEndpoint(endpoint: string): void {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    throw new HttpError(400, "That isn't a push endpoint.", "invalid_endpoint");
  }
  if (url.protocol !== "https:" || !PUSH_HOSTS.some((host) => host.test(url.hostname))) {
    throw new HttpError(400, "That isn't a push service's endpoint.", "invalid_endpoint");
  }
}

export interface SubscriptionInput {
  readonly endpoint: string;
  readonly keys: { readonly p256dh: string; readonly auth: string };
}

/** Stores a subscription. The same endpoint again takes its new keys, and one turned off starts afresh. */
export function subscribe(db: Db, clock: Clock, input: SubscriptionInput): void {
  assertPushEndpoint(input.endpoint);
  const now = clock().getTime();
  db.transaction((tx) => {
    const existing = tx
      .select({ id: pushSubscriptions.id, disabledAt: pushSubscriptions.disabledAt })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, input.endpoint))
      .get();
    if (!existing || existing.disabledAt !== null) {
      const on = tx
        .select({ count: sql<number>`count(*)` })
        .from(pushSubscriptions)
        .where(isNull(pushSubscriptions.disabledAt))
        .get();
      if ((on?.count ?? 0) >= MAX_SUBSCRIPTIONS) {
        throw new HttpError(409, "Too many devices get pushes: turn one off first.", "too_many_subscriptions");
      }
    }
    const fresh = { p256dh: input.keys.p256dh, auth: input.keys.auth, disabledAt: null, failures: 0 };
    tx.insert(pushSubscriptions)
      .values({ endpoint: input.endpoint, createdAt: now, ...fresh })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: existing?.disabledAt === null ? { p256dh: fresh.p256dh, auth: fresh.auth } : { ...fresh, createdAt: now },
      })
      .run();
  });
}

/** Forgets a subscription: the device turned pushes off. An endpoint never stored changes nothing. */
export function unsubscribe(db: Db, endpoint: string): void {
  db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint)).run();
}

/** The subscriptions on. */
export function activeSubscriptions(conn: Conn) {
  return conn.select().from(pushSubscriptions).where(isNull(pushSubscriptions.disabledAt)).all();
}

/** What a push to every device came to. */
export interface SendOutcome {
  readonly sent: number;
  readonly failed: number;
  /** Turned off: their push service said they're gone. */
  readonly gone: number;
  /** The first failure's message, for the log and the diagnostics: never a subscription's keys. */
  readonly error: string | null;
}

/** Sends one push to every subscription on, one after another, and settles each one's row. */
export async function sendToAll(
  db: Db,
  clock: Clock,
  send: PushSender,
  message: PushMessage,
  ttlS: number,
): Promise<SendOutcome> {
  let sent = 0;
  let failed = 0;
  let gone = 0;
  let error: string | null = null;
  for (const sub of activeSubscriptions(db)) {
    try {
      await send(sub, message, ttlS);
      sent++;
      db.update(pushSubscriptions)
        .set({ lastSuccessAt: clock().getTime(), failures: 0 })
        .where(eq(pushSubscriptions.id, sub.id))
        .run();
    } catch (err) {
      const status = (err as { statusCode?: unknown }).statusCode;
      if (status === 404 || status === 410) {
        gone++;
        db.update(pushSubscriptions)
          .set({ disabledAt: clock().getTime() })
          .where(and(eq(pushSubscriptions.id, sub.id), isNull(pushSubscriptions.disabledAt)))
          .run();
      } else {
        failed++;
        error ??= typeof status === "number" ? `The push service answered ${status}` : safeMessage(err);
        db.update(pushSubscriptions)
          .set({ failures: sql`${pushSubscriptions.failures} + 1` })
          .where(eq(pushSubscriptions.id, sub.id))
          .run();
      }
    }
  }
  return { sent, failed, gone, error };
}
