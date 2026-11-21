/**
 * The pantry's rules (SPEC §2.6): freshness, whether a recipe can be made, what Made it takes, and
 * which purchase would unlock the most blends. The pantry holds the ingredients and the gear, by id.
 */
import type { Catalog } from "./catalog.js";
import type { Ingredient } from "./content.js";
import { compareText } from "./json.js";
import type { Recipe } from "./recipe.js";
import { EMPTY_ENTRY, type PantryEntry } from "./state/types.js";
import { daysBetween } from "./time/dates.js";

export type Pantry = Readonly<Record<string, PantryEntry>>;

/** Quantities are rounded to 0.1 at the finest, so this only absorbs floating-point noise. */
const EPSILON = 1e-9;

export function entryOf(pantry: Pantry, id: string): PantryEntry {
  return pantry[id] ?? EMPTY_ENTRY;
}

export type Freshness = "fresh" | "use-soon" | "stale";

/** *Use soon* once this share of the shelf life has gone. */
export const USE_SOON_SHARE = 0.75;

/**
 * How fresh an ingredient is on a date: *stale* past its shelf life, *use soon* once 75 % of it
 * has gone, *fresh* before. Null when its opened date isn't known.
 */
export function freshnessOf(entry: PantryEntry, ingredient: Ingredient, on: string): Freshness | null {
  const opened = entry.openedOn.value;
  if (opened === null) return null;
  const elapsed = daysBetween(opened, on);
  if (elapsed > ingredient.shelfLifeDays) return "stale";
  if (elapsed >= ingredient.shelfLifeDays * USE_SOON_SHARE) return "use-soon";
  return "fresh";
}

/** The pantry as the rules read it, for a tea made on a date. */
export interface Stock {
  readonly catalog: Catalog;
  readonly pantry: Pantry;
  /** The date the tea will be made: freshness is judged on it. */
  readonly on: string;
  /** What other pending picks hold, set aside before "enough" is judged (SPEC §2.3). */
  readonly reserved?: ReadonlyMap<string, number>;
}

export type ShortfallReason = "missing" | "stale" | "low";

/**
 * What the recipe can't have: a required ingredient that is *don't have*, perishable and stale, or
 * not enough; or a required piece of gear the owner doesn't have (SPEC §2.6).
 */
export type Shortfall =
  | {
      readonly kind: "ingredient";
      readonly id: string;
      readonly reason: ShortfallReason;
      readonly need: number;
      /** What is left once the reserved quantities are set aside; null when the amount isn't tracked. */
      readonly left: number | null;
    }
  | { readonly kind: "gear"; readonly id: string; readonly reason: "missing" };

/**
 * What stops the recipe being made, ingredient by ingredient, then piece of gear by piece of gear.
 * An optional ingredient or piece of gear never does.
 */
export function shortfallsOf(recipe: Recipe, stock: Stock): Shortfall[] {
  const shortfalls: Shortfall[] = [];
  for (const item of recipe.ingredients) {
    if (item.optional) continue;
    const ingredient = stock.catalog.ingredientById.get(item.id);
    const entry = entryOf(stock.pantry, item.id);
    const amount = entry.amount.value;
    const left = amount === null ? null : amount - (stock.reserved?.get(item.id) ?? 0);
    const shortfall = (reason: ShortfallReason): Shortfall => ({
      kind: "ingredient",
      id: item.id,
      reason,
      need: item.qty,
      left,
    });
    if (!ingredient || !entry.have.value) shortfalls.push(shortfall("missing"));
    else if (ingredient.perishable && freshnessOf(entry, ingredient, stock.on) === "stale") {
      shortfalls.push(shortfall("stale"));
    } else if (left !== null && left < item.qty - EPSILON) shortfalls.push(shortfall("low"));
  }
  // Gear is only have or don't have: never stale, never too little, and never held by another pick.
  for (const item of recipe.gear) {
    if (item.optional) continue;
    if (!stock.catalog.gearById.has(item.id) || !entryOf(stock.pantry, item.id).have.value) {
      shortfalls.push({ kind: "gear", id: item.id, reason: "missing" });
    }
  }
  return shortfalls;
}

export function isMakeable(recipe: Recipe, stock: Stock): boolean {
  return shortfallsOf(recipe, stock).length === 0;
}

/**
 * What Made it takes off the pantry (SPEC §2.4): the shown quantity of each ingredient whose amount
 * is tracked, an optional one only when it is *have*.
 */
export function plannedTakes(recipe: Recipe, pantry: Pantry): { readonly id: string; readonly qty: number }[] {
  return recipe.ingredients
    .filter((item) => {
      const entry = entryOf(pantry, item.id);
      return entry.amount.value !== null && (!item.optional || entry.have.value);
    })
    .map((item) => ({ id: item.id, qty: item.qty }));
}

/**
 * For each ingredient or piece of gear, how many of these recipes can't be made now but could be if
 * it alone were added (SPEC §2.6). An ingredient that is *have* but too low or stale counts as
 * missing. The two never share an id, so one map holds both.
 */
export function unlockCounts(recipes: Iterable<Recipe>, stock: Stock): Map<string, number> {
  const counts = new Map<string, number>();
  for (const recipe of recipes) {
    const missing = [...new Set(shortfallsOf(recipe, stock).map((shortfall) => shortfall.id))];
    const [id] = missing;
    if (missing.length === 1 && id !== undefined) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

/** The `n` purchases that unlock the most, most first, ties by id. */
export function topUnlocks(counts: ReadonlyMap<string, number>, n: number): { id: string; count: number }[] {
  return [...counts]
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count || compareText(a.id, b.id))
    .slice(0, n);
}
