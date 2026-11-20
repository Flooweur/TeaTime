/**
 * The week (SPEC §2.1): each date's day type, and which pool a tea day draws from (§2.2).
 */
import type { Mode, Season } from "./content.js";
import { type Weekday, isDate, isWeekend, isoWeekday } from "./time/dates.js";

/** A tea day is spent at the office or at home. */
export const DAY_TYPES = ["office", "home"] as const;
export type DayType = (typeof DAY_TYPES)[number];

/** "Away from … to …", both dates included: no tea and no notification. */
export interface AwayPeriod {
  readonly id: string;
  readonly from: string;
  readonly to: string;
}

/** What decides the day types: the office weekdays, the per-date overrides, the away periods. */
export interface Week {
  readonly officeDays: readonly Weekday[];
  readonly overrides: Readonly<Record<string, DayType>>;
  readonly away: readonly AwayPeriod[];
}

/** A tea day and its type, or a day without tea and why. */
export type Day =
  { readonly kind: "tea"; readonly type: DayType } | { readonly kind: "off"; readonly why: "weekend" | "away" };

/**
 * A date's day, in SPEC §2.1's order: a weekend has no tea; then an away period wins; then the
 * date's override; then the office weekdays.
 */
export function dayOf(date: string, week: Week): Day {
  if (isWeekend(date)) return { kind: "off", why: "weekend" };
  if (isAway(date, week)) return { kind: "off", why: "away" };
  const override = week.overrides[date];
  if (override) return { kind: "tea", type: override };
  return { kind: "tea", type: week.officeDays.includes(isoWeekday(date)) ? "office" : "home" };
}

/** Whether the date falls in an away period: no tea, and no notification (SPEC §2.1). */
export function isAway(date: string, week: Pick<Week, "away">): boolean {
  return week.away.some((period) => period.from <= date && date <= period.to);
}

/** The day type of a tea day, or null for a day without tea. */
export function teaDayType(date: string, week: Week): DayType | null {
  const day = dayOf(date, week);
  return day.kind === "tea" ? day.type : null;
}

/** An office day draws from the safe blends, a home day from the experimental ones (SPEC §2.2). */
export function poolOf(type: DayType): Mode {
  return type === "office" ? "safe" : "experimental";
}

/** The date's meteorological season in the northern hemisphere: winter is December to February. */
export function seasonOf(date: string): Season {
  if (!isDate(date)) throw new RangeError(`Not a date: ${JSON.stringify(date)}`);
  const month = Number(date.slice(5, 7));
  if (month === 12 || month <= 2) return "winter";
  if (month <= 5) return "spring";
  if (month <= 8) return "summer";
  return "autumn";
}

/** A blend without season tags is in season all year (SPEC §2.3). */
export function inSeason(seasons: readonly Season[], date: string): boolean {
  return seasons.length === 0 || seasons.includes(seasonOf(date));
}
