/**
 * The time source, injected wherever time matters (SPEC §4.2). The server passes the system's,
 * and tests pass one they move. Core never reads the time itself: ESLint refuses `Date.now()`,
 * an argument-less `new Date()` and `Math.random()` in packages/core/src.
 */
export type Clock = () => Date;

/** The clock's reading in Unix milliseconds. An invalid date is refused. */
export function epochMs(clock: Clock): number {
  const ms = clock().getTime();
  if (!Number.isInteger(ms)) throw new RangeError("The clock gave an invalid date");
  return ms;
}
