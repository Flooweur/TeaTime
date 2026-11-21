/**
 * Sync (SPEC §3.3): the outbox goes to the server, and its snapshot comes back.
 *
 * - **No command counts twice:** with unsent commands the app syncs by sending them (`POST
 *   commands`), never by `GET state` alone. Each answered command leaves the outbox in the same
 *   transaction that stores the snapshot holding it, so the outbox never replays one on a
 *   snapshot that has it. A refused one is kept to show the owner.
 * - **Not answered yet:** `server_error` and `unsupported_version` stay in the outbox, to be sent
 *   again (a server fixed, or updated).
 * - **A snapshot older than the one kept** (a lower revision) is ignored.
 * - **One sync at a time,** across tabs too (Web Locks, where the browser has them).
 * - **When:** at launch, when the app comes back to the front, on `online`, 2 s after a write, and
 *   every 60 s while visible.
 */
import type { Command, CommandOutcome, CommandsAnswer, Snapshot } from "@teatime/core";
import { ApiError, api } from "./api";
import { type Queued, type TeaDb, teaDb } from "./db";
import { syncStatus } from "./store";

/** The most commands one request carries (the server takes 500). */
export const BATCH = 200;

const UNDECIDED = new Set(["server_error", "unsupported_version"]);

/** Stores a snapshot unless the one kept is newer. Call it inside a transaction on `snapshot`. */
export async function adopt(db: TeaDb, snapshot: Snapshot): Promise<boolean> {
  const current = await db.snapshot.get("current");
  if (current && current.snapshot.revision > snapshot.revision) return false;
  await db.snapshot.put({ key: "current", snapshot });
  return true;
}

/** What an answer does to the outbox: the commands to drop, and those refused, to show. */
export function settle(sent: readonly Queued[], results: readonly CommandOutcome[], at: number) {
  const drop: number[] = [];
  const refused: { id: string; command: Command; code: string; problem: string | null; at: number }[] = [];
  sent.forEach((queued, i) => {
    const result = results[i];
    if (!result || (!result.ok && UNDECIDED.has(result.code))) return;
    drop.push(queued.seq as number);
    if (!result.ok) {
      const problem = "problem" in result ? result.problem : null;
      refused.push({ id: queued.command.id, command: queued.command, code: result.code, problem, at });
    }
  });
  return { drop, refused };
}

/** One pass: the outbox sent in batches (or the state fetched when it's empty), each answer stored. */
async function pass(db: TeaDb): Promise<void> {
  for (;;) {
    const sent = await db.outbox.orderBy("seq").limit(BATCH).toArray();
    if (sent.length === 0) {
      const snapshot = await api<Snapshot>("GET", "state");
      await db.transaction("rw", db.snapshot, async () => {
        await adopt(db, snapshot);
      });
      return;
    }
    const answer = await api<CommandsAnswer>("POST", "commands", { commands: sent.map((q) => q.command) });
    const { drop, refused } = settle(sent, answer.results, Date.now());
    await db.transaction("rw", db.snapshot, db.outbox, db.refused, async () => {
      await adopt(db, answer.snapshot);
      await db.outbox.bulkDelete(drop);
      if (refused.length) await db.refused.bulkPut(refused);
    });
    // Only undecided ones left in this batch: they wait for the next sync.
    if (drop.length < sent.length || sent.length < BATCH) return;
  }
}

let running: Promise<void> | null = null;
/** A sync was asked for while one was running: it may have missed a change made meanwhile. */
let again = false;

/**
 * Syncs now. A sync already running in this tab is joined, and runs once more when it ends, so a
 * change made while it was under way isn't left for the next trigger. Never throws: `syncStatus`
 * says how it went.
 */
export function syncNow(): Promise<void> {
  if (running) {
    again = true;
    return running;
  }
  running = (async () => {
    syncStatus.update((s) => ({ ...s, running: true }));
    try {
      const db = teaDb();
      const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
      do {
        again = false;
        if (locks) await locks.request("teatime-sync", () => pass(db));
        else await pass(db);
      } while (again);
      syncStatus.set({ running: false, lastSyncedAt: Date.now(), error: null });
    } catch (err) {
      const error =
        err instanceof ApiError
          ? { code: err.code, message: err.message }
          : { code: "storage", message: err instanceof Error ? err.message : String(err) };
      syncStatus.update((s) => ({ ...s, running: false, error }));
    } finally {
      running = null;
      again = false;
    }
  })();
  return running;
}

let soon: ReturnType<typeof setTimeout> | undefined;

/** A sync 2 s after a write: a burst of taps goes in one request. */
export function syncSoon(delayMs = 2000): void {
  clearTimeout(soon);
  soon = setTimeout(() => void syncNow(), delayMs);
}

/** Starts the triggers. Returns their stop. */
export function startSync(): () => void {
  const visible = () => document.visibilityState === "visible";
  const onVisible = () => {
    if (visible()) void syncNow();
  };
  const onOnline = () => void syncNow();
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("online", onOnline);
  const every = setInterval(() => {
    if (visible()) void syncNow();
  }, 60_000);
  void syncNow();
  return () => {
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("online", onOnline);
    clearInterval(every);
    clearTimeout(soon);
  };
}

/**
 * An online operation (SPEC §3.3: draw, swap, settings…): the server's answer is the new snapshot,
 * stored like a sync's. Throws the `ApiError` of a refusal or of the server out of reach.
 */
export async function online(method: "POST" | "PUT" | "DELETE", path: string, body?: unknown): Promise<Snapshot> {
  const snapshot = await api<Snapshot>(method, path, body);
  const db = teaDb();
  await db.transaction("rw", db.snapshot, async () => {
    await adopt(db, snapshot);
  });
  return snapshot;
}
