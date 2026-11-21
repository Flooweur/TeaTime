/** The time source, injected everywhere time matters (SPEC §4.2; ported from EagleEye), so tests move the clock. */
export type Clock = () => Date;

export const systemClock: Clock = () => new Date();

/** A clock that stays where a test puts it: `clock.set(...)`, `clock.advance(ms)`. */
export function testClock(start: Date | string | number = "2026-11-23T09:00:00Z") {
  let now = new Date(start).getTime();
  const clock = (() => new Date(now)) as Clock & {
    set: (at: Date | string | number) => void;
    advance: (ms: number) => void;
  };
  clock.set = (at) => {
    now = new Date(at).getTime();
  };
  clock.advance = (ms) => {
    now += ms;
  };
  return clock;
}
