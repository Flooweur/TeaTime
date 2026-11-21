/**
 * What Today shows (SPEC §7), decided from the state and the time alone, so it can be tested for
 * any date and pantry. The rules themselves are core's (the day's type, when a home blend is
 * revealed, the recipes); this only chooses the card.
 */
import {
  type Blend,
  type Catalog,
  type DayType,
  EARLY_DRAW_TIME,
  type Gear,
  type Ingredient,
  type PickRecord,
  type Settings,
  type State,
  type TeaType,
  addDays,
  dayOf,
  instantAt,
  minutesOf,
  revealsAt,
  teaDayType,
  wallClockAt,
  weekOf,
} from "@teatime/core";

/** The purchase a fallback suggests: an ingredient, or a piece of gear. */
export type Unlock =
  { readonly kind: "ingredient"; readonly item: Ingredient } | { readonly kind: "gear"; readonly item: Gear };

export interface NextDay {
  readonly date: string;
  readonly type: DayType;
  readonly pick: PickRecord | null;
}

export type DayCard =
  | { readonly kind: "weekend"; readonly next: NextDay | null }
  | { readonly kind: "away"; readonly next: NextDay | null }
  /** A tea day whose tea isn't drawn yet: the server draws it at its next pass, or the app asks. */
  | { readonly kind: "undrawn"; readonly type: DayType }
  /** A home-day blend before the morning time: a surprise, with Peek. */
  | { readonly kind: "teaser"; readonly pick: PickRecord; readonly revealsAt: number }
  | { readonly kind: "blend"; readonly pick: PickRecord; readonly blend: Blend }
  | {
      readonly kind: "plain";
      readonly pick: PickRecord;
      readonly tea: Ingredient;
      readonly teaType: TeaType;
      readonly unlock: Unlock | null;
    }
  /** No tea to make: what to buy, or (the missed kit) nothing kept at the office. */
  | { readonly kind: "nothing"; readonly pick: PickRecord; readonly unlock: Unlock | null }
  | { readonly kind: "cancelled"; readonly pick: PickRecord }
  /** A tea this version of the app doesn't know: a newer server drew it. */
  | { readonly kind: "unknown"; readonly pick: PickRecord };

/** The evening before a tea day (SPEC §2.2): its kit to pack, its blend to start, or its draw. */
export interface Evening {
  readonly date: string;
  readonly type: DayType;
  readonly pick: PickRecord | null;
  /** The tea of tomorrow's pick, as a card (a home blend stays a teaser until the morning). */
  readonly card: DayCard | null;
  /** "Draw tomorrow's tea now": an office kit from 17:00 (or the evening time), any day from the evening time. */
  readonly canDraw: boolean;
}

export interface TodayModel {
  readonly date: string;
  readonly minutes: number;
  readonly settings: Settings;
  readonly card: DayCard;
  readonly evening: Evening | null;
}

export interface Reveal {
  /** The dates the owner peeked at. */
  readonly peeked: ReadonlySet<string>;
  /** The date a push opened the app for: it shows that day's tea, whatever the time. */
  readonly fromPush: string | null;
}

const NO_REVEAL: Reveal = { peeked: new Set(), fromPush: null };

function unlockOf(id: string | null, catalog: Catalog): Unlock | null {
  if (id === null) return null;
  const ingredient = catalog.ingredientById.get(id);
  if (ingredient) return { kind: "ingredient", item: ingredient };
  const gear = catalog.gearById.get(id);
  return gear ? { kind: "gear", item: gear } : null;
}

/** The card for a pick: its tea, or a teaser while a home blend is still a surprise. */
export function cardOfPick(pick: PickRecord, state: State, catalog: Catalog, now: number, reveal: Reveal): DayCard {
  if (pick.status === "cancelled") return { kind: "cancelled", pick };
  const { tea } = pick;
  if (tea.kind === "none") return { kind: "nothing", pick, unlock: unlockOf(pick.unlock, catalog) };
  if (tea.kind === "plain") {
    const ingredient = catalog.ingredientById.get(tea.tea);
    const teaType = ingredient?.teaType ? catalog.teaTypeByName.get(ingredient.teaType) : undefined;
    if (!ingredient || !teaType) return { kind: "unknown", pick };
    return { kind: "plain", pick, tea: ingredient, teaType, unlock: unlockOf(pick.unlock, catalog) };
  }
  const blend = catalog.blendByCode.get(tea.code);
  if (!blend) return { kind: "unknown", pick };
  const at = revealsAt(pick, state, catalog);
  const revealed =
    at === null ||
    now >= at ||
    pick.status !== "pending" ||
    reveal.peeked.has(pick.date) ||
    reveal.fromPush === pick.date;
  return revealed ? { kind: "blend", pick, blend } : { kind: "teaser", pick, revealsAt: at };
}

/** The next tea day after `date`, within two weeks. */
function nextTeaDay(date: string, state: State): NextDay | null {
  const week = weekOf(state);
  for (let d = 1; d <= 14; d++) {
    const day = addDays(date, d);
    const type = teaDayType(day, week);
    if (type) return { date: day, type, pick: state.picks[day] ?? null };
  }
  return null;
}

export function todayModel(state: State, catalog: Catalog, now: number, reveal: Reveal = NO_REVEAL): TodayModel {
  const { settings } = state;
  const { date, minutes } = wallClockAt(now, settings.timeZone);
  const day = dayOf(date, weekOf(state));
  const pick = state.picks[date];

  let card: DayCard;
  if (day.kind === "off") card = { kind: day.why, next: nextTeaDay(date, state) };
  else if (!pick) card = { kind: "undrawn", type: day.type };
  else card = cardOfPick(pick, state, catalog, now, reveal);

  return { date, minutes, settings, card, evening: eveningOf(state, catalog, now, date, reveal) };
}

/** Tomorrow's section, from the time its draw may happen, when tomorrow is a tea day. */
function eveningOf(state: State, catalog: Catalog, now: number, today: string, reveal: Reveal): Evening | null {
  const { settings } = state;
  const date = addDays(today, 1);
  const type = teaDayType(date, weekOf(state));
  if (!type) return null;
  const at = (time: string) => instantAt(today, minutesOf(time), settings.timeZone);
  const evening = at(settings.eveningTime);
  const early = Math.min(at(EARLY_DRAW_TIME), evening);
  const canDraw = now >= evening || (type === "office" && now >= early);
  const pick = state.picks[date] ?? null;
  if (!pick && !canDraw) return null;
  return { date, type, pick, card: pick ? cardOfPick(pick, state, catalog, now, reveal) : null, canDraw };
}
