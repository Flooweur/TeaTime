import { describe, expect, it } from "vitest";
import {
  type Recipe,
  freshnessOf,
  plannedTakes,
  scaleRecipe,
  shortfallsOf,
  topUnlocks,
  unlockCounts,
} from "../src/index.js";
import { blend, catalog, have, ingredient } from "./fixtures.js";

const mint = ingredient("mint", { perishable: true, shelfLifeDays: 8 });

describe("freshnessOf (SPEC §2.6)", () => {
  it("is fresh, then use soon once 75 % of the shelf life is gone, then stale past it", () => {
    const entry = have(null, { openedOn: "2026-11-01" });
    expect(freshnessOf(entry, mint, "2026-11-01")).toBe("fresh");
    expect(freshnessOf(entry, mint, "2026-11-06")).toBe("fresh");
    expect(freshnessOf(entry, mint, "2026-11-07")).toBe("use-soon");
    expect(freshnessOf(entry, mint, "2026-11-09")).toBe("use-soon");
    expect(freshnessOf(entry, mint, "2026-11-10")).toBe("stale");
  });

  it("can't tell without an opened date", () => {
    expect(freshnessOf(have(), mint, "2026-11-10")).toBeNull();
  });
});

describe("shortfallsOf", () => {
  const minty = blend("001", {
    ingredients: [
      { id: "green-tea", qty: 3, unit: "g", optional: false, role: "base" },
      { id: "mint", qty: 4, unit: "g", optional: false, role: "accent" },
      { id: "sugar", qty: 5, unit: "g", optional: true, role: "accent" },
    ],
  });
  const content = catalog([minty]);
  const recipe = scaleRecipe(minty, 1);
  const on = "2026-11-23";

  it("finds nothing when every required ingredient is there, fresh and enough", () => {
    const pantry = { "green-tea": have(50), mint: have(null, { openedOn: "2026-11-20" }) };
    expect(shortfallsOf(recipe, { catalog: content, pantry, on })).toEqual([]);
  });

  it("names an ingredient the owner doesn't have", () => {
    const pantry = { "green-tea": have(50), mint: { ...have(), have: { value: false, at: 1 } } };
    expect(shortfallsOf(recipe, { catalog: content, pantry, on })).toEqual([
      { kind: "ingredient", id: "mint", reason: "missing", need: 4, left: null },
    ]);
    expect(shortfallsOf(recipe, { catalog: content, pantry: { "green-tea": have(50) }, on })).toMatchObject([
      { id: "mint", reason: "missing" },
    ]);
  });

  it("counts a stale perishable as missing, but not a stale dry ingredient", () => {
    const pantry = { "green-tea": have(50, { openedOn: "2020-01-01" }), mint: have(null, { openedOn: "2026-11-01" }) };
    expect(shortfallsOf(recipe, { catalog: content, pantry, on })).toMatchObject([{ id: "mint", reason: "stale" }]);
  });

  it("sets aside what other picks hold before judging enough", () => {
    const pantry = { "green-tea": have(5), mint: have() };
    expect(shortfallsOf(recipe, { catalog: content, pantry, on })).toEqual([]);
    const reserved = new Map([["green-tea", 2.5]]);
    expect(shortfallsOf(recipe, { catalog: content, pantry, on, reserved })).toEqual([
      { kind: "ingredient", id: "green-tea", reason: "low", need: 3, left: 2.5 },
    ]);
  });

  it("never lets an optional ingredient stop a blend", () => {
    const pantry = { "green-tea": have(), mint: have() };
    expect(shortfallsOf(recipe, { catalog: content, pantry, on })).toEqual([]);
  });
});

describe("plannedTakes (SPEC §2.4)", () => {
  const recipe: Recipe = {
    cups: 1,
    sessions: null,
    waterMl: 250,
    ingredients: [
      { id: "black-tea", qty: 2.5, unit: "g", optional: false, role: "base" },
      { id: "milk", qty: 50, unit: "ml", optional: false, role: "accent" },
      { id: "sugar", qty: 5, unit: "g", optional: true, role: "accent" },
      { id: "lemon", qty: 1, unit: "pieces", optional: true, role: "garnish" },
    ],
    gear: [{ id: "thermometer", optional: true }],
  };

  it("takes each tracked amount, and an optional one only when the owner has it", () => {
    const pantry = {
      "black-tea": have(100),
      milk: have(),
      sugar: have(200),
      lemon: { ...have(3), have: { value: false, at: 1 } },
      thermometer: have(),
    };
    expect(plannedTakes(recipe, pantry)).toEqual([
      { id: "black-tea", qty: 2.5 },
      { id: "sugar", qty: 5 },
    ]);
  });
});

describe("gear (SPEC §2.6)", () => {
  const gongfu = blend("009", {
    ingredients: [{ id: "oolong", qty: 5, unit: "g", optional: false, role: "base" }],
    gear: [
      { id: "gaiwan", optional: false },
      { id: "thermometer", optional: true },
    ],
  });
  const content = catalog([gongfu]);
  const recipe = scaleRecipe(gongfu, 1);
  const on = "2026-11-23";

  it("names a piece of gear the owner doesn't have, after the ingredients", () => {
    const pantry = { gaiwan: { ...have(), have: { value: false, at: 1 } } };
    expect(shortfallsOf(recipe, { catalog: content, pantry, on })).toEqual([
      { kind: "ingredient", id: "oolong", reason: "missing", need: 5, left: null },
      { kind: "gear", id: "gaiwan", reason: "missing" },
    ]);
    expect(shortfallsOf(recipe, { catalog: content, pantry: { oolong: have() }, on })).toEqual([
      { kind: "gear", id: "gaiwan", reason: "missing" },
    ]);
  });

  it("is enough when it is have, and optional gear never stops a blend", () => {
    expect(shortfallsOf(recipe, { catalog: content, pantry: { oolong: have(), gaiwan: have() }, on })).toEqual([]);
  });

  it("counts gear the content doesn't have as missing", () => {
    const without = catalog([gongfu], undefined, []);
    expect(shortfallsOf(recipe, { catalog: without, pantry: { oolong: have(), gaiwan: have() }, on })).toEqual([
      { kind: "gear", id: "gaiwan", reason: "missing" },
    ]);
  });

  it("keeps the same gear whatever the cups", () => {
    expect(scaleRecipe(gongfu, 6).gear).toEqual(gongfu.gear);
  });

  it("is never taken off the pantry", () => {
    expect(plannedTakes(recipe, { oolong: have(50), gaiwan: have() })).toEqual([{ id: "oolong", qty: 5 }]);
  });

  it("can be the purchase that unlocks the most", () => {
    const content = catalog([
      gongfu,
      blend("010", {
        ingredients: [{ id: "green-tea", qty: 3, unit: "g", optional: false, role: "base" }],
        gear: [{ id: "gaiwan", optional: false }],
      }),
      blend("011", { ingredients: [{ id: "mint", qty: 4, unit: "g", optional: false, role: "base" }] }),
    ]);
    const pantry = { oolong: have(), "green-tea": have() };
    const counts = unlockCounts(
      content.blends.map((b) => scaleRecipe(b, 1)),
      { catalog: content, pantry, on },
    );
    expect(Object.fromEntries(counts)).toEqual({ gaiwan: 2, mint: 1 });
    expect(topUnlocks(counts, 1)).toEqual([{ id: "gaiwan", count: 2 }]);
  });
});

describe("unlockCounts", () => {
  const content = catalog([
    blend("001", { ingredients: [{ id: "mint", qty: 4, unit: "g", optional: false, role: "base" }] }),
    blend("002", {
      ingredients: [
        { id: "mint", qty: 4, unit: "g", optional: false, role: "base" },
        { id: "black-tea", qty: 2, unit: "g", optional: false, role: "base" },
      ],
    }),
    blend("003", {
      ingredients: [
        { id: "mint", qty: 4, unit: "g", optional: false, role: "base" },
        { id: "lemon", qty: 1, unit: "pieces", optional: false, role: "base" },
      ],
    }),
    blend("004", { ingredients: [{ id: "lemon", qty: 1, unit: "pieces", optional: false, role: "base" }] }),
  ]);

  it("counts the blends one purchase alone would unlock, a too-low amount included", () => {
    const pantry = { "black-tea": have(1) };
    const recipes = content.blends.map((b) => scaleRecipe(b, 1));
    const counts = unlockCounts(recipes, { catalog: content, pantry, on: "2026-11-23" });
    // 001 needs mint; 002 needs mint and more black tea (two); 003 needs two; 004 needs lemon.
    expect(Object.fromEntries(counts)).toEqual({ mint: 1, lemon: 1 });
    expect(topUnlocks(counts, 3)).toEqual([
      { id: "lemon", count: 1 },
      { id: "mint", count: 1 },
    ]);
  });

  it("puts the purchase unlocking most first", () => {
    const counts = new Map([
      ["a", 1],
      ["b", 3],
      ["c", 3],
      ["d", 2],
    ]);
    expect(topUnlocks(counts, 3).map((unlock) => unlock.id)).toEqual(["b", "c", "d"]);
  });
});
