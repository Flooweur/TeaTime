import {
  type Pantry,
  type PantryEntry,
  catalogOf,
  isMakeable,
  scaleRecipe,
  shortfallsOf,
  unlockCounts,
} from "@teatime/core";
import { describe, expect, it } from "vitest";
import { BUNDLE } from "../src/bundle.js";

// Core's rules on the real content: what the gear in the YAML does to the draw (SPEC §2.3, §2.6).
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

  it("counts the required gear among the purchases, and never the optional gear", () => {
    const recipes = catalog.blends.map((blend) => scaleRecipe(blend, 1));
    const counts = unlockCounts(recipes, { catalog, pantry: pantryWith([]), on });
    expect(Object.fromEntries(counts)).toEqual({ gaiwan: 1, "tea-sock": 1 });
  });
});
