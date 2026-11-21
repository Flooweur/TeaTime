/**
 * The tests' app: an in-memory database, migrated; a clock the test moves; the real content
 * bundle; and a push sender that records what it is asked to send, and fails when told to.
 */
import { randomUUID } from "node:crypto";
import { instantAt, minutesOf } from "@teatime/core";
import { buildApp } from "../src/app.js";
import { openDb } from "../src/db/client.js";
import { testClock } from "../src/lib/clock.js";
import type { PushMessage, PushSender, PushTarget } from "../src/push/sender.js";
import type { Snapshot } from "../src/state/snapshot.js";

export const ORIGIN = "https://teatime.test:8443";

/** An instant at a wall-clock time in Paris: `at("2026-11-22", "20:30")`. */
export const at = (date: string, time: string) => instantAt(date, minutesOf(time), "Europe/Paris");

export interface SentPush {
  readonly endpoint: string;
  readonly message: PushMessage;
  readonly ttlS: number;
}

/** A fake push sender: `failWith` makes every send fail with that status (or no status: unreachable). */
export function fakePush() {
  const sent: SentPush[] = [];
  const control: { failWith: number | "unreachable" | null } = { failWith: null };
  const send: PushSender = async (target: PushTarget, message, ttlS) => {
    if (control.failWith !== null) {
      const err = new Error("push refused") as Error & { statusCode?: number };
      if (control.failWith !== "unreachable") err.statusCode = control.failWith;
      throw err;
    }
    sent.push({ endpoint: target.endpoint, message, ttlS });
  };
  return { send, sent, control };
}

export async function testApp(options: { now?: number | string; push?: PushSender | null; backupDir?: string } = {}) {
  const db = openDb(":memory:");
  const clock = testClock(options.now ?? at("2026-11-23", "09:00"));
  const push = options.push === undefined ? fakePush() : null;
  const send = options.push === undefined ? (push?.send ?? null) : options.push;
  const { app, deps } = await buildApp({
    db,
    clock,
    origins: [ORIGIN],
    publicOrigin: ORIGIN,
    push: send,
    pushKey: send ? "test-public-key" : null,
    backupDir: options.backupDir ?? null,
    environment: "test",
    logger: false,
  });

  /** A JSON request from the app's origin. */
  const call = async (method: "GET" | "POST" | "PUT" | "DELETE", url: string, body?: unknown) => {
    const res = await app.inject({
      method,
      url,
      headers: { origin: ORIGIN },
      ...(body === undefined ? {} : { payload: body as object }),
    });
    return { status: res.statusCode, body: res.body ? (JSON.parse(res.body) as Record<string, unknown>) : null, res };
  };

  /** Sends commands and returns the answer. */
  const commands = async (...list: unknown[]) => {
    const { status, body } = await call("POST", "/api/commands", { commands: list });
    if (status !== 200) throw new Error(`POST commands answered ${status}: ${JSON.stringify(body)}`);
    return body as unknown as { results: Record<string, unknown>[]; snapshot: Snapshot };
  };

  const snapshot = async () => (await call("GET", "/api/state")).body as unknown as Snapshot;

  return { app, deps, db, clock, push, call, commands, snapshot };
}

export type TestApp = Awaited<ReturnType<typeof testApp>>;

/** A command of version 1, made now by the test's clock unless `at` says otherwise. */
export function command(type: string, payload: Record<string, unknown>, at: number, id: string = randomUUID()) {
  return { id, v: 1, at, type, payload };
}

/** `pantry.set` for having an ingredient, with an amount when given. */
export const have = (ingredient: string, at: number, amount?: number) =>
  command("pantry.set", { ingredient, have: true, ...(amount === undefined ? {} : { amount }) }, at);
