/**
 * What needs the server (SPEC §3.3): drawing and swapping picks, and changing the settings, the
 * overrides and the away periods, which re-check the pending picks they touch (SPEC §2.4). Pure,
 * like the reducer: the server runs them in a transaction and stores what they touched.
 */
import { type AwayPeriod, type DayType, dayOf, teaDayType } from "../calendar.js";
import type { Catalog } from "../catalog.js";
import { type DrawOutcome, type DrawReason, drawPick, pickCups, pickTeaOf, recipeOf, stockFor } from "../draw.js";
import { isMakeable } from "../pantry.js";
import { addDays, isDate, isWeekend } from "../time/dates.js";
import { instantAt, minutesOf, wallClockAt } from "../time/zone.js";
import { type Settings, type SettingsPatch, parseSettingsPatch } from "./settings.js";
import { canMove } from "./status.js";
import { type Touched, NOTHING_TOUCHED, mergeTouched, touched } from "./touched.js";
import { type PickRecord, type PickTea, type State, sameTea, weekOf } from "./types.js";

/** "Draw tomorrow's tea now" works from this time, or from the evening time if that is earlier (SPEC §2.2). */
export const EARLY_DRAW_TIME = "17:00";

/** Why an operation was refused. A refusal changes nothing. */
export type OnlineRefusal =
  | { readonly code: "invalid"; readonly problems: readonly string[] }
  /** A date before today: the past can't be changed (SPEC §2.4). */
  | { readonly code: "past_date" }
  | { readonly code: "not_a_tea_day" }
  /** Tomorrow's tea can be drawn from 17:00 (or the evening time). */
  | { readonly code: "too_early" }
  /** Before the evening time, only an office kit can be drawn early (SPEC §2.2). */
  | { readonly code: "not_office" }
  /** Only today, and tomorrow from 17:00, can be drawn on demand. */
  | { readonly code: "not_drawable" }
  | { readonly code: "no_pick" }
  | { readonly code: "not_pending" }
  /** One swap per pick. */
  | { readonly code: "swap_used" }
  /** An office kit can't be swapped once it is packed. */
  | { readonly code: "packed" }
  /** The swap found no other blend: the pick stays as it is. */
  | { readonly code: "nothing_else" }
  | { readonly code: "unknown_away" }
  /** These packed kits would be thrown away: ask the owner, and send again with `confirm`. */
  | { readonly code: "packed_kits"; readonly dates: readonly string[] };

export type OnlineResult =
  { readonly ok: true; readonly state: State; readonly touched: Touched } | ({ readonly ok: false } & OnlineRefusal);

const refused = (refusal: OnlineRefusal): OnlineResult => ({ ok: false, ...refusal });

/** The owner's date and minutes now. */
function localNow(state: State, now: number) {
  return wallClockAt(now, state.settings.timeZone);
}

function storeOutcome(
  previous: PickRecord | undefined,
  date: string,
  type: DayType,
  outcome: DrawOutcome,
  attempt: number,
  now: number,
): PickRecord {
  return {
    date,
    type,
    ...pickTeaOf(outcome),
    attempt,
    drawnAt: now,
    swappedFrom: previous?.swappedFrom ?? null,
    swappedAt: previous?.swappedAt ?? null,
    status: "pending",
    statusAt: now,
    packedAt: null,
    packedCups: null,
    brew: null,
  };
}

/** Draws a date that has no pick yet, as its first draw. */
function drawFirst(state: State, catalog: Catalog, now: number, date: string, type: DayType): State {
  const today = localNow(state, now).date;
  const timing = date > today ? "evening" : "same-day";
  const outcome = drawPick(state, catalog, today, { date, type, timing, reason: "first", attempt: 0 });
  return { ...state, picks: { ...state.picks, [date]: storeOutcome(undefined, date, type, outcome, 0, now) } };
}

/**
 * Draws what is due (SPEC §2.2), as the notifier does on each pass: today, if it is a tea day the
 * evening draw missed; and tomorrow, once the evening time has come.
 */
export function drawDue(state: State, catalog: Catalog, now: number): { state: State; touched: Touched } {
  const { date: today } = localNow(state, now);
  const tomorrow = addDays(today, 1);
  const evening = instantAt(today, minutesOf(state.settings.eveningTime), state.settings.timeZone);
  const week = weekOf(state);
  let next = state;
  const drawn: string[] = [];
  for (const date of now >= evening ? [today, tomorrow] : [today]) {
    const type = teaDayType(date, week);
    if (type === null || next.picks[date]) continue;
    next = drawFirst(next, catalog, now, date, type);
    drawn.push(date);
  }
  return { state: next, touched: touched({ picks: drawn }) };
}

/**
 * The app's draw (`POST picks/:date/draw`): today; tomorrow's office kit from 17:00 ("Draw
 * tomorrow's tea now"); and any tea day tomorrow once the evening time has come, like the notifier.
 * Idempotent: a date that has a pick keeps it.
 */
export function drawNow(state: State, catalog: Catalog, now: number, date: string): OnlineResult {
  if (!isDate(date)) return refused({ code: "invalid", problems: ["date: must be a date, YYYY-MM-DD"] });
  const { date: today } = localNow(state, now);
  if (date < today) return refused({ code: "past_date" });
  if (date !== today && date !== addDays(today, 1)) return refused({ code: "not_drawable" });
  const type = teaDayType(date, weekOf(state));
  if (type === null) return refused({ code: "not_a_tea_day" });
  if (state.picks[date]) return { ok: true, state, touched: NOTHING_TOUCHED };
  const { eveningTime, timeZone } = state.settings;
  if (date !== today && now < instantAt(today, minutesOf(eveningTime), timeZone)) {
    // Before the evening draw, only an office kit can be drawn early, from 17:00.
    if (type !== "office") return refused({ code: "not_office" });
    const from = Math.min(minutesOf(EARLY_DRAW_TIME), minutesOf(eveningTime));
    if (now < instantAt(today, from, timeZone)) return refused({ code: "too_early" });
  }
  return { ok: true, state: drawFirst(state, catalog, now, date, type), touched: touched({ picks: [date] }) };
}

/** Whether a pending blend can still be made, once the other pending picks' quantities are set aside. */
function stillMakeable(state: State, catalog: Catalog, pick: PickRecord, today: string): boolean {
  const recipe = recipeOf(pick.tea, pickCups(pick, state.settings), catalog);
  return recipe !== null && isMakeable(recipe, stockFor(state, catalog, today, pick.date));
}

/**
 * Swap (`POST picks/:date/swap`, SPEC §2.4): one per pick, until an office kit is packed. A pick
 * that can no longer be made, or a fallback, gets a free redraw that isn't counted as its swap.
 * `current` is the tea the app shows: if the pick has moved on (a retry after a lost answer), the
 * pick is returned as it is.
 */
export function swapPick(state: State, catalog: Catalog, now: number, date: string, current: PickTea): OnlineResult {
  const pick = state.picks[date];
  if (!pick) return refused({ code: "no_pick" });
  if (!sameTea(pick.tea, current)) return { ok: true, state, touched: NOTHING_TOUCHED };
  if (pick.status !== "pending") return refused({ code: "not_pending" });
  const { date: today } = localNow(state, now);
  if (date < today) return refused({ code: "past_date" });

  // A packed kit stays what it is, whatever the pantry says now.
  if (pick.type === "office" && pick.packedAt !== null) return refused({ code: "packed" });
  const free = pick.tea.kind !== "blend" || !stillMakeable(state, catalog, pick, today);
  if (!free && pick.swappedFrom !== null) return refused({ code: "swap_used" });
  const reason: DrawReason = free ? "redraw" : "swap";
  const attempt = pick.attempt + 1;
  const outcome = drawPick(state, catalog, today, {
    date,
    type: pick.type,
    timing: date > today ? "evening" : "same-day",
    reason,
    attempt,
    ...(pick.tea.kind === "blend" ? { replacing: pick.tea.code } : {}),
  });
  const next = storeOutcome(pick, date, pick.type, outcome, attempt, now);
  // A swap must land on another blend; a free redraw may fall back, but must change something.
  if (outcome.kind !== "blend" && (!free || sameTea(next.tea, pick.tea))) return refused({ code: "nothing_else" });
  const swapped: PickRecord =
    reason === "swap" && pick.tea.kind === "blend" ? { ...next, swappedFrom: pick.tea.code, swappedAt: now } : next;
  return {
    ok: true,
    state: { ...state, picks: { ...state.picks, [date]: swapped } },
    touched: touched({ picks: [date] }),
  };
}

/**
 * Re-checks the picks from today on after a change of day types (SPEC §2.4): a pending pick whose
 * date is no longer a tea day is cancelled; one whose day type changed is drawn again; a cancelled
 * pick whose date is a tea day again is dropped, to be drawn afresh. A packed kit is thrown away
 * only with `confirm`. Then whatever is due is drawn.
 */
function recheck(before: State, after: State, catalog: Catalog, now: number, confirm: boolean): OnlineResult {
  const { date: today } = localNow(after, now);
  const week = weekOf(after);
  const dates = Object.keys(after.picks)
    .filter((date) => date >= today)
    .sort();

  const packed = dates.filter((date) => {
    const pick = after.picks[date] as PickRecord;
    const day = dayOf(date, week);
    const changes = day.kind === "off" || day.type !== pick.type;
    return pick.status === "pending" && pick.packedAt !== null && changes;
  });
  if (packed.length && !confirm) return refused({ code: "packed_kits", dates: packed });

  let state = after;
  const changed: string[] = [];
  for (const date of dates) {
    const pick = state.picks[date] as PickRecord;
    const day = dayOf(date, week);
    if (day.kind === "off") {
      if (!canMove(pick.status, "cancelled")) continue;
      state = { ...state, picks: { ...state.picks, [date]: { ...pick, status: "cancelled", statusAt: now } } };
      changed.push(date);
    } else if (pick.status === "cancelled") {
      const picks = { ...state.picks };
      delete picks[date];
      state = { ...state, picks };
      changed.push(date);
    } else if (pick.status === "pending" && pick.type !== day.type) {
      const timing = date > today ? "evening" : "same-day";
      const attempt = pick.attempt + 1;
      // A redraw, not a first draw: the evening draw wasn't missed, so it is no missed kit.
      const outcome = drawPick(state, catalog, today, { date, type: day.type, timing, reason: "redraw", attempt });
      state = {
        ...state,
        picks: { ...state.picks, [date]: storeOutcome(pick, date, day.type, outcome, attempt, now) },
      };
      changed.push(date);
    }
  }
  const due = drawDue(state, catalog, now);
  return {
    ok: true,
    state: due.state,
    touched: mergeTouched(mergeTouched(touchedBetween(before, after), touched({ picks: changed })), due.touched),
  };
}

/** The settings, overrides and away periods that differ between two states. */
function touchedBetween(before: State, after: State): Touched {
  const keys = (a: object, b: object) =>
    [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(
      (key) => (a as Record<string, unknown>)[key] !== (b as Record<string, unknown>)[key],
    );
  const awayById = (state: State) => Object.fromEntries(state.away.map((period) => [period.id, period]));
  return touched({
    settings: before.settings !== after.settings,
    overrides: keys(before.overrides, after.overrides),
    away: keys(awayById(before), awayById(after)),
  });
}

/** `PUT settings`: a patch of some settings. A change of office days re-checks the pending picks. */
export function updateSettings(
  state: State,
  catalog: Catalog,
  now: number,
  rawPatch: unknown,
  confirm = false,
): OnlineResult {
  const parsed = parseSettingsPatch(rawPatch);
  if (!parsed.ok) return refused({ code: "invalid", problems: parsed.problems });
  const patch: SettingsPatch = parsed.patch;
  const settings: Settings = { ...state.settings, ...patch };
  return recheck(state, { ...state, settings }, catalog, now, confirm);
}

/** `PUT overrides/:date`: "that day I'm at the office", or home, or null to follow the office days again. */
export function setOverride(
  state: State,
  catalog: Catalog,
  now: number,
  date: string,
  type: DayType | null,
  confirm = false,
): OnlineResult {
  if (!isDate(date)) return refused({ code: "invalid", problems: ["date: must be a date, YYYY-MM-DD"] });
  if (type !== null && type !== "office" && type !== "home") {
    return refused({ code: "invalid", problems: ['type: must be "office", "home" or null'] });
  }
  if (date < localNow(state, now).date) return refused({ code: "past_date" });
  if (isWeekend(date)) return refused({ code: "not_a_tea_day" });
  const overrides = { ...state.overrides };
  if (type === null) delete overrides[date];
  else overrides[date] = type;
  return recheck(state, { ...state, overrides }, catalog, now, confirm);
}

/** `POST away`: an away period from today or later, as the request's body. Its pending picks are cancelled. */
export function addAway(state: State, catalog: Catalog, now: number, raw: unknown, confirm = false): OnlineResult {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return refused({ code: "invalid", problems: ["away: must be an object with id, from and to"] });
  }
  const { id, from, to, ...extra } = raw as Record<string, unknown>;
  const problems = Object.keys(extra).map((key) => `${key}: unknown field`);
  if (typeof id !== "string" || id.length === 0 || id.length > 64) {
    problems.push("id: must be a string of 1 to 64 characters");
  } else if (state.away.some((other) => other.id === id)) problems.push("id: already used");
  const fromOk = typeof from === "string" && isDate(from);
  const toOk = typeof to === "string" && isDate(to);
  if (!fromOk) problems.push("from: must be a date, YYYY-MM-DD");
  if (!toOk) problems.push("to: must be a date, YYYY-MM-DD");
  else if (fromOk && to < from) problems.push("to: must not be before from");
  if (problems.length) return refused({ code: "invalid", problems });
  const period: AwayPeriod = { id: id as string, from: from as string, to: to as string };
  if (period.from < localNow(state, now).date) return refused({ code: "past_date" });
  return recheck(state, { ...state, away: [...state.away, period] }, catalog, now, confirm);
}

/** `DELETE away/:id`: its days become tea days again, from today on. */
export function removeAway(state: State, catalog: Catalog, now: number, id: string): OnlineResult {
  if (!state.away.some((period) => period.id === id)) return refused({ code: "unknown_away" });
  return recheck(state, { ...state, away: state.away.filter((period) => period.id !== id) }, catalog, now, false);
}
