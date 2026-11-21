import {
  type Pantry,
  type PantryEntry,
  catalogOf,
  isMakeable,
  plainBrewOf,
  scaleRecipe,
  shortfallsOf,
  unlockCounts,
} from "@teatime/core";
import { describe, expect, it } from "vitest";
import { BUNDLE } from "../src/bundle.js";

// Core's rules on the real content: what the gear and the plain brews in the YAML do to the draw
// (SPEC §2.3, §2.5, §2.6).
const catalog = catalogOf(BUNDLE);
const on = "2026-11-23";

const HAVE: PantryEntry = {
  have: { value: true, at: 1 },
  amount: { value: null, at: 1 },
  openedOn: { value: null, at: 1 },
  atOffice: { value: false, at: 1 },
};

/** Every ingredient, untracked, and only the gear named. */
function pantryWith(gear: readonly string[]): Pantry {
  return Object.fromEntries([...catalog.ingredients.map((item) => item.id), ...gear].map((id) => [id, HAVE]));
}

describe("the content's gear in core's rules", () => {
  it("lets every safe blend be made without any gear", () => {
    const stock = { catalog, pantry: pantryWith([]), on };
    for (const blend of catalog.blends.filter((b) => b.mode === "safe")) {
      expect(isMakeable(scaleRecipe(blend, 2), stock), blend.code).toBe(true);
    }
  });

  it("keeps the gongfu oolong out until the gaiwan is bought", () => {
    const oolong = scaleRecipe(catalog.blendByCode.get("009")!, 1);
    expect(shortfallsOf(oolong, { catalog, pantry: pantryWith([]), on })).toEqual([
      { kind: "gear", id: "gaiwan", reason: "missing" },
    ]);
    expect(isMakeable(oolong, { catalog, pantry: pantryWith(["gaiwan"]), on })).toBe(true);
  });

  it("keeps the matcha out until both the bowl and the whisk are bought", () => {
    const matcha = scaleRecipe(catalog.blendByCode.get("023")!, 1);
    expect(shortfallsOf(matcha, { catalog, pantry: pantryWith(["chawan"]), on })).toEqual([
      { kind: "gear", id: "chasen", reason: "missing" },
    ]);
    expect(isMakeable(matcha, { catalog, pantry: pantryWith(["chawan", "chasen"]), on })).toBe(true);
  });

  it("counts the required gear among the purchases, and never the optional gear", () => {
    const recipes = catalog.blends.map((blend) => scaleRecipe(blend, 1));
    const counts = unlockCounts(recipes, { catalog, pantry: pantryWith([]), on });
    // The gaiwan unlocks the oolong and the silver needle. The matcha needs the chawan and the
    // chasen together, so neither alone unlocks anything.
    expect(Object.fromEntries(counts)).toEqual({ gaiwan: 2, "tea-sock": 1 });
  });
});

describe("the content's teas in the plain-tea fallback", () => {
  it("never brews matcha as a plain tea, and every other tea in grams can be (self-review of batch 2)", () => {
    const teas = catalog.ingredients.filter((item) => item.category === "tea" && item.unit === "g");
    expect(teas.filter((tea) => plainBrewOf(tea, catalog) === null).map((tea) => tea.id)).toEqual(["matcha"]);
  });

  it("brews a plain genmaicha or hojicha at a boil for 30 seconds, as their blends do", () => {
    for (const id of ["genmaicha", "hojicha"]) {
      const brew = plainBrewOf(catalog.ingredientById.get(id)!, catalog);
      expect(brew, id).toMatchObject({ tempC: 100, infusionsS: [30], office: { tempC: 100, infusionsS: [30] } });
    }
  });
});
