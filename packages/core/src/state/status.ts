/**
 * The status table (SPEC §3.3): every change a pick's status may make. The reducer and the server's
 * operations both ask it, so no path can move a pick in a way the table doesn't list.
 *
 * A brew has no status: it is logged once (its id is never reused) and removed once.
 */
import type { PickStatus } from "./types.js";

export const PICK_MOVES: { readonly [From in PickStatus]: readonly PickStatus[] } = {
  /** Made it; Skip; an away period over its date. */
  pending: ["made", "skipped", "cancelled"],
  /** Its brew removed (undo). */
  made: ["pending"],
  /** Unskip; or a cup made anyway, since the real cup wins. */
  skipped: ["pending", "made"],
  /** Final: when its date is a tea day again, the pick is dropped and drawn afresh. */
  cancelled: [],
};

export function canMove(from: PickStatus, to: PickStatus): boolean {
  return PICK_MOVES[from].includes(to);
}
