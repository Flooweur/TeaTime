/**
 * `POST commands` (SPEC §3.3): a batch of the phone's offline commands, applied one at a time with
 * core's reducer, inside one transaction with a savepoint each.
 *
 * - **Every command is decided once.** Its result goes into `applied_commands`, so a resend (an
 *   answer lost on the way back) gets the same result, marked `repeat`, and changes nothing.
 * - **A refusal never blocks the queue:** the commands after it are applied as usual.
 * - **Not recorded, so a resend tries again:** a command from a newer app than this server
 *   (`unsupported_version`), and one whose rows couldn't be written (`server_error`, a bug: its
 *   savepoint is rolled back and the batch goes on without it).
 * - **The answer** holds a result per command, in order, and the snapshot after them all. Every
 *   command it answers is in that snapshot or refused, so the phone drops exactly those from its
 *   outbox and replays the rest on top.
 */
import { type CommandResult, applyCommand, isUntouched, parseCommand } from "@teatime/core";
import { eq } from "drizzle-orm";
import type { FastifyBaseLogger } from "fastify";
import type { Conn } from "../db/client.js";
import { appliedCommands } from "../db/schema.js";
import type { Deps } from "../deps.js";
import { safeError } from "../lib/errors.js";
import { bumpRevision, loadState, saveTouched } from "../state/rows.js";
import { type Snapshot, snapshotOf } from "../state/snapshot.js";

/** The most commands one batch may carry: a phone offline for weeks has a few dozen. */
export const MAX_BATCH = 500;

/** What parseCommand refuses: a command that isn't one, or one from a newer app. */
type ParseRefusal = { readonly ok: false; readonly code: "invalid" | "unsupported_version"; readonly problem: string };

/** A decided result, as `applied_commands` stores it. */
type Decided = CommandResult | ParseRefusal;

/** A command's outcome as the phone sees it. */
export type CommandOutcome = { readonly id: string | null; readonly repeat?: true } & (
  Decided | { readonly ok: false; readonly code: "server_error" }
);

/** A stored result's key: the command's own id, when it has a usable one. */
function idOf(raw: unknown): string | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { id } = raw as { id?: unknown };
  return typeof id === "string" && id.length > 0 && id.length <= 64 ? id : null;
}

function typeOf(raw: unknown): string {
  const { type } = raw as { type?: unknown };
  return typeof type === "string" ? type.slice(0, 64) : "?";
}

function record(conn: Conn, id: string, type: string, result: Decided, now: number) {
  conn
    .insert(appliedCommands)
    .values({ id, type, receivedAt: now, result: JSON.stringify(result) })
    .run();
}

export function applyBatch(
  deps: Deps,
  log: Pick<FastifyBaseLogger, "error">,
  raws: readonly unknown[],
): { results: CommandOutcome[]; snapshot: Snapshot } {
  const now = deps.clock().getTime();
  return deps.db.transaction((tx) => {
    let state = loadState(tx, deps.warn);
    let changed = false;
    const results = raws.map((raw): CommandOutcome => {
      const id = idOf(raw);
      if (id !== null) {
        const done = tx.select().from(appliedCommands).where(eq(appliedCommands.id, id)).get();
        if (done) return { id, ...(JSON.parse(done.result) as Decided), repeat: true };
      }

      const parsed = parseCommand(raw);
      if (!parsed.ok) {
        const refusal = { ok: false, code: parsed.code, problem: parsed.problem } as const;
        // A newer app's command may be understood once this server is updated: it isn't decided yet.
        if (id !== null && parsed.code === "invalid") record(tx, id, typeOf(raw), refusal, now);
        return { id, ...refusal };
      }

      const { command } = parsed;
      const applied = applyCommand(state, command, deps.catalog, now);
      try {
        tx.transaction((savepoint) => {
          saveTouched(savepoint, applied.state, applied.touched);
          record(savepoint, command.id, command.type, applied.result, now);
        });
      } catch (err) {
        log.error({ err: safeError(err), type: command.type }, "a command's rows couldn't be written");
        return { id: command.id, ok: false, code: "server_error" };
      }
      state = applied.state;
      if (!isUntouched(applied.touched)) changed = true;
      return { id: command.id, ...applied.result };
    });
    if (changed) bumpRevision(tx);
    return { results, snapshot: snapshotOf(tx, deps.content, now, deps.warn) };
  });
}
