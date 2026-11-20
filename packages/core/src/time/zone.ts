/**
 * Wall clocks in an IANA time zone (the owner's is Europe/Paris), read through `Intl` so daylight
 * saving time is the platform's own data. Ported from EagleEye's `time/clock.ts` and
 * `plan/week.ts#instantOnDate`, without its 04:00 day start: a TeaTime day is the calendar day.
 */

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MINUTES = 1440;

const formatters = new Map<string, Intl.DateTimeFormat>();

/**
 * A time zone's wall clock to the minute, in the Gregorian calendar with Latin digits whatever the
 * runtime's locale, so the parts always parse the same. An unknown time zone throws a RangeError.
 */
function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US-u-ca-gregory-nu-latn", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

/** Whether `timeZone` is an IANA time zone this runtime knows. */
export function isTimeZone(timeZone: string): boolean {
  try {
    formatterFor(timeZone);
    return true;
  } catch {
    return false;
  }
}

/** A moment as a wall clock shows it: the date there, and the minutes since that date's midnight. */
export interface WallClock {
  readonly date: string;
  /** 0 to 1439. */
  readonly minutes: number;
}

interface Parts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly hour: number;
  readonly minute: number;
}

function partsAt(at: number, timeZone: string): Parts {
  if (!Number.isFinite(at)) throw new RangeError(`Not an instant: ${at}`);
  const parts: Record<string, string> = {};
  for (const part of formatterFor(timeZone).formatToParts(new Date(at))) parts[part.type] = part.value;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

/** The wall clock of `timeZone` at the instant `at` (ms since the epoch). */
export function wallClockAt(at: number, timeZone: string): WallClock {
  const p = partsAt(at, timeZone);
  const date = `${String(p.year).padStart(4, "0")}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
  return { date, minutes: p.hour * 60 + p.minute };
}

/** How far the wall clock of `timeZone` is ahead of UTC at the instant `at`, in ms. */
function offsetAt(at: number, timeZone: string): number {
  const p = partsAt(at, timeZone);
  const wall = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return wall - (at - (((at % MINUTE_MS) + MINUTE_MS) % MINUTE_MS));
}

/**
 * The instant (ms since the epoch) when the wall clock of `timeZone` shows `minutes` after `date`'s
 * midnight: `wallClockAt`'s other way. A wall time the clocks skip (02:30 on the night they go
 * forward) is read as the time it is once they've moved (03:30); one that happens twice (02:30 on
 * the night they go back), as the first.
 */
export function instantAt(date: string, minutes: number, timeZone: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new RangeError(`Not a date: ${JSON.stringify(date)}`);
  if (!Number.isInteger(minutes) || minutes < 0 || minutes >= DAY_MINUTES) {
    throw new RangeError(`Not a time of day in minutes: ${minutes}`);
  }
  const wall = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) + minutes * MINUTE_MS;
  // The offsets on either side of any change near this time (they last months, not hours).
  const before = offsetAt(wall - 14 * HOUR_MS, timeZone);
  const after = offsetAt(wall + 14 * HOUR_MS, timeZone);
  const fits = [before, after].filter((offset) => offsetAt(wall - offset, timeZone) === offset);
  if (fits.length === 0) return wall - before;
  return Math.min(...fits.map((offset) => wall - offset));
}

/** A time of day as settings write it: "08:00", "20:30". */
export const CLOCK_TIME_PATTERN = "^([01][0-9]|2[0-3]):[0-5][0-9]$";
const CLOCK_TIME_RE = new RegExp(CLOCK_TIME_PATTERN);

/** "20:30" → 1230. A string that isn't a time of day throws a RangeError. */
export function minutesOf(time: string): number {
  if (!CLOCK_TIME_RE.test(time)) throw new RangeError(`Not a time of day: ${JSON.stringify(time)}`);
  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
}

/** 1230 → "20:30". */
export function clockTimeOf(minutes: number): string {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes >= DAY_MINUTES) {
    throw new RangeError(`Not a time of day in minutes: ${minutes}`);
  }
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
