/**
 * Changing the state in one transaction: read it from the rows, run core's rule on it, write what
 * the rule touched and count a revision (SPEC §3.3). better-sqlite3's transactions are synchronous,
 * so nothing else runs between the read and the write.
 */
import { type OnlineResult, type State, type Touched, isUntouched } from "@teatime/core";
import type { Conn } from "../db/client.js";
import type { Deps } from "../deps.js";
import { HttpError } from "../lib/errors.js";
import { bumpRevision, loadState, saveTouched } from "./rows.js";
import { type Snapshot, snapshotOf } from "./snapshot.js";

/** Stores a change and counts a revision. A change that touched nothing stores nothing. */
export function storeChange(conn: Conn, state: State, touched: Touched): void {
  if (isUntouched(touched)) return;
  saveTouched(conn, state, touched);
  bumpRevision(conn);
}

type Refusal = Extract<OnlineResult, { ok: false }>;

/** Each refusal of core's online operations, as the HTTP error the app sees (SPEC §3.4). */
export function refusalError(refusal: Refusal): HttpError {
  switch (refusal.code) {
    case "invalid":
      return new HttpError(400, refusal.problems.join("; "), "invalid", { problems: refusal.problems });
    case "past_date":
      return new HttpError(409, "That date is past.", refusal.code);
    case "not_a_tea_day":
      return new HttpError(409, "That day has no tea: it's a weekend, or you're away.", refusal.code);
    case "too_early":
      return new HttpError(409, "Tomorrow's tea can't be drawn yet.", refusal.code);
    case "not_office":
      return new HttpError(409, "Before the evening, only an office kit can be drawn early.", refusal.code);
    case "not_drawable":
      return new HttpError(409, "Only today's tea, and tomorrow's from the evening, can be drawn.", refusal.code);
    case "no_pick":
      return new HttpError(404, "No tea is drawn for that day.", refusal.code);
    case "not_pending":
      return new HttpError(409, "That tea is made, skipped or cancelled already.", refusal.code);
    case "swap_used":
      return new HttpError(409, "This tea has had its swap.", refusal.code);
    case "packed":
      return new HttpError(409, "The kit is packed: it can't be swapped.", refusal.code);
    case "nothing_else":
      return new HttpError(409, "There's no other blend to swap to.", refusal.code);
    case "unknown_away":
      return new HttpError(404, "No such away period.", refusal.code);
    case "packed_kits":
      return new HttpError(409, "Packed kits would be thrown away: confirm to go on.", refusal.code, {
        dates: refusal.dates,
      });
  }
}

/**
 * One of core's online operations (SPEC §3.3: draw, swap, settings, overrides, away), in one
 * transaction: the new snapshot, or the refusal thrown as an `HttpError`, having changed nothing.
 */
export function runOnline(deps: Deps, op: (state: State, now: number) => OnlineResult): Snapshot {
  const now = deps.clock().getTime();
  return deps.db.transaction((tx) => {
    const result = op(loadState(tx, deps.warn), now);
    if (!result.ok) throw refusalError(result);
    storeChange(tx, result.state, result.touched);
    return snapshotOf(tx, deps.content, now, deps.warn);
  });
}

/** The snapshot as it stands, changing nothing. */
export function currentSnapshot(deps: Deps): Snapshot {
  return snapshotOf(deps.db, deps.content, deps.clock().getTime(), deps.warn);
}
