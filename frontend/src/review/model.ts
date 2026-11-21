/**
 * What the Saturday review shows (SPEC §2.8), from the state alone, so it can be tested: the week's
 * tea days and what came of each, the other cups made that week, what is going stale, the purchases
 * that unlock the most, and next week's office days with how many safe blends the pantry makes now.
 */
import {
  type Blend,
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
  scaleRecipe,
  teaDayType,
  topUnlocks,
  weekOf,
} from "@teatime/core";
import { defaultCups, shortfallsNow, unlocksNow } from "../lib/pantryView";

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
  /**
   * Ingredients running low (decision of 2026-11-21): what's left can't make two more of the blend
   * that uses the most of it, at that blend's default cups. Only tracked amounts are judged.
   */
  readonly low: readonly { readonly ingredient: Ingredient; readonly left: number; readonly twoCups: number }[];
  /**
   * Next week's office days; how many safe blends the pantry makes now, for the office's cups; and
   * what wouldn't last them (decision of 2026-11-21): each office day counted as the office blend that
   * needs the most of the ingredient.
   */
  readonly preview: {
    readonly officeDays: readonly string[];
    readonly safeMakeable: number;
    readonly restock: readonly { readonly ingredient: Ingredient; readonly left: number; readonly need: number }[];
  };
}

/** For each ingredient, the most any of these blends takes of it, at its cups. */
function mostTaken(blends: readonly Blend[], cupsOf: (blend: Blend) => number): Map<string, number> {
  const most = new Map<string, number>();
  for (const blend of blends) {
    for (const item of scaleRecipe(blend, cupsOf(blend)).ingredients) {
      most.set(item.id, Math.max(most.get(item.id) ?? 0, item.qty));
    }
  }
  return most;
}

/** The ingredients you have, with a tracked amount: what the two lists judge. */
function tracked(state: State, catalog: Catalog): { ingredient: Ingredient; left: number }[] {
  return catalog.ingredients.flatMap((ingredient) => {
    const entry = entryOf(state.pantry, ingredient.id);
    const left = entry.amount.value;
    return !ingredient.retired && entry.have.value && left !== null ? [{ ingredient, left }] : [];
  });
}

const tidy = (qty: number) => Math.round(qty * 10) / 10;

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

  const live = catalog.blends.filter((b) => !b.retired);
  const most = mostTaken(live, (b) => defaultCups(b, state));
  const low = tracked(state, catalog).flatMap(({ ingredient, left }) => {
    const one = most.get(ingredient.id);
    return one !== undefined && left < 2 * one ? [{ ingredient, left, twoCups: tidy(2 * one) }] : [];
  });

  const nextMonday = addDays(monday, 7);
  const officeDays = [0, 1, 2, 3, 4].map((d) => addDays(nextMonday, d)).filter((d) => teaDayType(d, week) === "office");
  const office = live.filter((b) => b.mode === "safe" && !state.marks[b.code]?.notForMe.value);
  const safeMakeable = office.filter((b) => shortfallsNow(b, state, catalog, today).length === 0).length;
  const perDay = mostTaken(office, () => state.settings.officeCups);
  const restock = tracked(state, catalog).flatMap(({ ingredient, left }) => {
    const one = perDay.get(ingredient.id);
    const need = one === undefined ? 0 : tidy(one * officeDays.length);
    return need > 0 && left < need ? [{ ingredient, left, need }] : [];
  });

  return { days, otherBrews, going, unlocks, low, preview: { officeDays, safeMakeable, restock } };
}
