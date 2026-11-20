/**
 * The owner's settings (SPEC §2): the week, the three notification times, the cooldown and the
 * default cups. They change only through the server (SPEC §3.3), which checks a patch here.
 */
import type { DayType } from "../calendar.js";
import { MAX_CUPS, isCups } from "../recipe.js";
import { type Weekday, WEEKDAYS } from "../time/dates.js";
import { CLOCK_TIME_PATTERN, isTimeZone, minutesOf } from "../time/zone.js";

export interface Settings {
  /** The owner's IANA time zone: every wall-clock time is read in it. */
  readonly timeZone: string;
  /** The weekdays spent at the office, Monday (1) to Friday (5). */
  readonly officeDays: readonly Weekday[];
  /** "HH:MM": the evening draw and push, on the calendar day before each tea day. */
  readonly eveningTime: string;
  /** "HH:MM": the morning push, and when a home-day blend stops being a surprise. */
  readonly morningTime: string;
  /** "HH:MM": the Saturday review's push. */
  readonly reviewTime: string;
  /** Pushes on or off. With them off, the draws still happen. */
  readonly notifications: boolean;
  /** How many days a made blend waits before it can be drawn again. */
  readonly cooldownDays: number;
  /** The cups selector's default on office days, and on home days. */
  readonly officeCups: number;
  readonly homeCups: number;
}

export const DEFAULT_SETTINGS: Settings = {
  timeZone: "Europe/Paris",
  officeDays: [1, 2, 4],
  eveningTime: "20:30",
  morningTime: "08:00",
  reviewTime: "10:00",
  notifications: true,
  cooldownDays: 21,
  officeCups: 2,
  homeCups: 1,
};

/**
 * The notification times are set between these, so none falls in the hour a clock change skips or
 * repeats (02:00–03:00 in Paris), nor so late that its grace window runs past the next day (SPEC §2.7).
 */
export const EARLIEST_TIME = "05:00";
export const LATEST_TIME = "22:00";

export const MAX_COOLDOWN_DAYS = 365;

export function cupsFor(type: DayType, settings: Settings): number {
  return type === "office" ? settings.officeCups : settings.homeCups;
}

const TIME_RE = new RegExp(CLOCK_TIME_PATTERN);

function isSettingTime(value: unknown): value is string {
  if (typeof value !== "string" || !TIME_RE.test(value)) return false;
  const minutes = minutesOf(value);
  return minutes >= minutesOf(EARLIEST_TIME) && minutes <= minutesOf(LATEST_TIME);
}

function isOfficeDays(value: unknown): value is readonly Weekday[] {
  return (
    Array.isArray(value) &&
    value.every((day) => WEEKDAYS.includes(day as Weekday) && (day as number) <= 5) &&
    new Set(value).size === value.length
  );
}

const CHECKS: { readonly [K in keyof Settings]: { readonly ok: (value: unknown) => boolean; readonly rule: string } } =
  {
    timeZone: { ok: (v) => typeof v === "string" && isTimeZone(v), rule: "an IANA time zone" },
    officeDays: { ok: isOfficeDays, rule: "distinct weekdays from 1 (Monday) to 5 (Friday)" },
    eveningTime: { ok: isSettingTime, rule: `a time from ${EARLIEST_TIME} to ${LATEST_TIME}` },
    morningTime: { ok: isSettingTime, rule: `a time from ${EARLIEST_TIME} to ${LATEST_TIME}` },
    reviewTime: { ok: isSettingTime, rule: `a time from ${EARLIEST_TIME} to ${LATEST_TIME}` },
    notifications: { ok: (v) => typeof v === "boolean", rule: "true or false" },
    cooldownDays: {
      ok: (v) => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= MAX_COOLDOWN_DAYS,
      rule: `a whole number of days from 0 to ${MAX_COOLDOWN_DAYS}`,
    },
    officeCups: { ok: isCups, rule: `a whole number of cups from 1 to ${MAX_CUPS}` },
    homeCups: { ok: isCups, rule: `a whole number of cups from 1 to ${MAX_CUPS}` },
  };

function isSettingKey(key: string): key is keyof Settings {
  return Object.hasOwn(CHECKS, key);
}

export type SettingsPatch = Partial<Settings>;

/** A patch of some settings, checked: every problem is named, and nothing is applied when there is one. */
export function parseSettingsPatch(
  raw: unknown,
): { readonly ok: true; readonly patch: SettingsPatch } | { readonly ok: false; readonly problems: readonly string[] } {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, problems: ["settings: must be an object"] };
  }
  const problems: string[] = [];
  for (const [key, value] of Object.entries(raw)) {
    if (!isSettingKey(key)) problems.push(`${key}: not a setting`);
    else if (!CHECKS[key].ok(value)) problems.push(`${key}: must be ${CHECKS[key].rule}`);
  }
  if (problems.length) return { ok: false, problems };
  return { ok: true, patch: raw as SettingsPatch };
}

/** Whether a whole settings object holds: what a stored copy is checked against when it is loaded. */
export function isSettings(raw: unknown): raw is Settings {
  if (typeof raw !== "object" || raw === null) return false;
  const keys = Object.keys(raw);
  return (
    keys.length === Object.keys(CHECKS).length &&
    keys.every((key) => isSettingKey(key) && CHECKS[key].ok((raw as Record<string, unknown>)[key]))
  );
}
