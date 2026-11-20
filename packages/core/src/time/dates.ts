/**
 * Calendar dates as "YYYY-MM-DD" strings, counted at UTC midnight so no time zone or clock change
 * can move them. Which date "today" is depends on the owner's time zone: see zone.ts.
 */

/** A date's shape, with real months and days of month (31 at most; `isDate` checks the month's length). */
export const DATE_PATTERN = "^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$";

const DATE_RE = new RegExp(DATE_PATTERN);
const DAY_MS = 86_400_000;

/** Whether `text` is a real calendar date, "2026-02-29" refused, "2028-02-29" accepted. */
export function isDate(text: string): boolean {
  if (!DATE_RE.test(text)) return false;
  // Engines differ on "2026-02-30": V8 rolls it over to March, others answer NaN. Both are refused.
  const ms = Date.parse(`${text}T00:00:00Z`);
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === text;
}

function midnight(date: string): number {
  if (!isDate(date)) throw new RangeError(`Not a date: ${JSON.stringify(date)}`);
  return Date.parse(`${date}T00:00:00Z`);
}

/** Whole days from one date to another: negative when `to` comes first. */
export function daysBetween(from: string, to: string): number {
  return Math.round((midnight(to) - midnight(from)) / DAY_MS);
}

/** The date `days` after `date` (before it, for a negative `days`). */
export function addDays(date: string, days: number): string {
  if (!Number.isInteger(days)) throw new RangeError(`Not a whole number of days: ${days}`);
  return new Date(midnight(date) + days * DAY_MS).toISOString().slice(0, 10);
}

/** ISO weekdays: 1 is Monday, 7 is Sunday. */
export const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** The ISO weekday of `date`: 1 for a Monday … 7 for a Sunday. */
export function isoWeekday(date: string): Weekday {
  const day = new Date(midnight(date)).getUTCDay();
  return (day === 0 ? 7 : day) as Weekday;
}

/** Saturday and Sunday: the days without a tea of the day (SPEC §2.1). */
export function isWeekend(date: string): boolean {
  return isoWeekday(date) >= 6;
}
