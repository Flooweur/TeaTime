/**
 * What the Saturday review shows (SPEC §2.8), from the state alone, so it can be tested: the week's
 * tea days and what came of each, the other cups made that week, what is going stale, the purchases
 * that unlock the most, and next week's office days with how many safe blends the pantry makes now.
 */
import {
  type BrewRecord,
  type Catalog,
  type Day,
  type Freshness,
  type Gear,
  type Ingredient,
  type PickRecord,
  type State,
  addDays,
  dayOf,
  entryOf,
  freshnessOf,
  isoWeekday,
  teaDayType,
  topUnlocks,
  weekOf,
} from "@teatime/core";
import { shortfallsNow, unlocksNow } from "../lib/pantryView";

export interface ReviewDay {
  readonly date: string;
  readonly day: Day;
  readonly pick: PickRecord | null;
  /** The cup that made the pick. */
  readonly brew: BrewRecord | null;
}

export interface ReviewModel {
  /** Monday to Friday of the week reviewed. */
  readonly days: readonly ReviewDay[];
  /** Cups made that week outside the picks (I made this). */
  readonly otherBrews: readonly BrewRecord[];
  /** Ingredients you have that are past or near the end of their shelf life. */
  readonly going: readonly { readonly ingredient: Ingredient; readonly freshness: Exclude<Freshness, "fresh"> }[];
  /** The 3 purchases that would unlock the most blends (SPEC §2.6). */
  readonly unlocks: readonly { readonly item: Ingredient | Gear; readonly count: number }[];
  /** Next week's office days, and how many safe blends the pantry makes now, for the office's cups. */
  readonly preview: { readonly officeDays: readonly string[]; readonly safeMakeable: number };
}

/** The Monday of `date`'s week. */
export const mondayOf = (date: string): string => addDays(date, 1 - isoWeekday(date));

/** The review of the week holding `date` (a weekend reviews the week just past), on `today`. */
export function reviewModel(state: State, catalog: Catalog, date: string, today: string): ReviewModel {
  const week = weekOf(state);
  const monday = mondayOf(date);
  const dates = [0, 1, 2, 3, 4].map((d) => addDays(monday, d));
  const brews = Object.values(state.brews);
  const days = dates.map((d): ReviewDay => {
    const pick = state.picks[d] ?? null;
    return { date: d, day: dayOf(d, week), pick, brew: pick?.brew ? (state.brews[pick.brew] ?? null) : null };
  });
  const sunday = addDays(monday, 6);
  const otherBrews = brews
    .filter((b) => b.pick === null && b.date >= monday && b.date <= sunday)
    .sort((a, b) => a.at - b.at);

  const going = catalog.ingredients
    .filter((i) => !i.retired && entryOf(state.pantry, i.id).have.value)
    .flatMap((ingredient) => {
      const freshness = freshnessOf(entryOf(state.pantry, ingredient.id), ingredient, today);
      return freshness === "stale" || freshness === "use-soon" ? [{ ingredient, freshness }] : [];
    });

  const unlocks = topUnlocks(unlocksNow(state, catalog, today), 3).flatMap(({ id, count }) => {
    const item = catalog.ingredientById.get(id) ?? catalog.gearById.get(id);
    return item ? [{ item, count }] : [];
  });

  const nextMonday = addDays(monday, 7);
  const officeDays = [0, 1, 2, 3, 4].map((d) => addDays(nextMonday, d)).filter((d) => teaDayType(d, week) === "office");
  const safeMakeable = catalog.blends.filter(
    (b) =>
      !b.retired &&
      b.mode === "safe" &&
      !state.marks[b.code]?.notForMe.value &&
      shortfallsNow(b, state, catalog, today).length === 0,
  ).length;

  return { days, otherBrews, going, unlocks, preview: { officeDays, safeMakeable } };
}
