/**
 * What the library and the pantry show about the pantry, from core's rules: whether a blend can be
 * made now and what stops it, and what each ingredient or piece of gear would unlock.
 */
import {
  type Blend,
  type Catalog,
  type Shortfall,
  type State,
  type Stock,
  cupsFor,
  scaleRecipe,
  shortfallsOf,
  unlockCounts,
} from "@teatime/core";

/** The pantry as it is, on `date`: the library judges a blend without setting the picks' shares aside. */
export const stockOn = (state: State, catalog: Catalog, date: string): Stock => ({
  catalog,
  pantry: state.pantry,
  on: date,
});

/** The cups a blend is judged for: the office's default for a safe blend, home's for an experimental one. */
export const defaultCups = (blend: Blend, state: State): number =>
  cupsFor(blend.mode === "safe" ? "office" : "home", state.settings);

export function shortfallsNow(blend: Blend, state: State, catalog: Catalog, date: string): Shortfall[] {
  return shortfallsOf(scaleRecipe(blend, defaultCups(blend, state)), stockOn(state, catalog, date));
}

/** Each ingredient's or piece of gear's unlock count, over the blends not retired (SPEC §2.6). */
export function unlocksNow(state: State, catalog: Catalog, date: string): Map<string, number> {
  const recipes = catalog.blends.filter((b) => !b.retired).map((b) => scaleRecipe(b, defaultCups(b, state)));
  return unlockCounts(recipes, stockOn(state, catalog, date));
}

/** "Missing: sencha", "Low: milk (100 ml left)", "Stale: mint", "Gear: gaiwan". */
export function shortfallText(shortfall: Shortfall, catalog: Catalog): string {
  if (shortfall.kind === "gear") return `${catalog.gearById.get(shortfall.id)?.name ?? shortfall.id} (gear)`;
  const name = catalog.ingredientById.get(shortfall.id)?.name ?? shortfall.id;
  if (shortfall.reason === "missing") return name;
  if (shortfall.reason === "stale") return `${name} (past its shelf life)`;
  return `${name} (too little left)`;
}
