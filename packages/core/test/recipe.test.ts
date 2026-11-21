import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { type Ingredient, plainBrewOf, plainTeaRecipe, roundQty, scaleRecipe } from "../src/index.js";
import { TEA_TYPES, blend, catalog, ingredient } from "./fixtures.js";

describe("roundQty (SPEC §2.4)", () => {
  it("rounds grams to 0.5 g, or 0.1 g under 2 g, halves up", () => {
    expect(roundQty(2.2, "g")).toBe(2);
    expect(roundQty(2.25, "g")).toBe(2.5);
    expect(roundQty(7.74, "g")).toBe(7.5);
    expect(roundQty(1.15, "g")).toBe(1.2);
    expect(roundQty(1.94, "g")).toBe(1.9);
    expect(roundQty(1.96, "g")).toBe(2);
  });

  it("rounds millilitres to 5 ml and pieces to whole ones", () => {
    expect(roundQty(12, "ml")).toBe(10);
    expect(roundQty(12.5, "ml")).toBe(15);
    expect(roundQty(333.3, "ml")).toBe(335);
    expect(roundQty(1.5, "pieces")).toBe(2);
    expect(roundQty(2.4, "pieces")).toBe(2);
  });

  it("never rounds a needed quantity to nothing", () => {
    expect(roundQty(0.04, "g")).toBe(0.1);
    expect(roundQty(2, "ml")).toBe(5);
    expect(roundQty(0.25, "pieces")).toBe(1);
  });

  it("refuses a quantity that isn't positive", () => {
    for (const qty of [0, -1, Number.NaN, Number.POSITIVE_INFINITY])
      expect(() => roundQty(qty, "g")).toThrow(RangeError);
  });

  it("lands on its unit's steps, within half a step", () => {
    fc.assert(
      fc.property(fc.double({ min: 0.05, max: 5000, noNaN: true }), (qty) => {
        const grams = roundQty(qty, "g");
        const step = qty < 2 ? 0.1 : 0.5;
        expect(Math.abs(grams / step - Math.round(grams / step))).toBeLessThan(1e-9);
        expect(Math.abs(grams - qty)).toBeLessThanOrEqual(step / 2 + 1e-9);
        const ml = roundQty(qty, "ml");
        expect(ml % 5).toBe(0);
        expect(ml).toBeGreaterThanOrEqual(5);
      }),
      { seed: 2011 },
    );
  });
});

describe("scaleRecipe", () => {
  const forTwo = blend("001", {
    scaling: { kind: "per-cup", serves: 2 },
    ingredients: [
      { id: "black-tea", qty: 5, unit: "g", optional: false, role: "base" },
      { id: "lemon", qty: 1, unit: "pieces", optional: true, role: "garnish" },
    ],
    brew: { water: "tap", tempC: 95, waterMl: 500, vessel: "teapot", preheat: true, infusionsS: [240] },
  });

  it("scales a per-cup recipe in proportion to the cups", () => {
    const one = scaleRecipe(forTwo, 1);
    expect(one.ingredients.map((item) => item.qty)).toEqual([2.5, 1]);
    expect(one.waterMl).toBe(250);
    expect(one.sessions).toBeNull();
    const three = scaleRecipe(forTwo, 3);
    expect(three.ingredients.map((item) => item.qty)).toEqual([7.5, 2]);
    expect(three.waterMl).toBe(750);
  });

  it("shares a session among up to sessionMax people, and adds sessions beyond", () => {
    const gongfu = blend("002", {
      scaling: { kind: "per-session", sessionMax: 3 },
      ingredients: [{ id: "oolong", qty: 6, unit: "g", optional: false, role: "base" }],
      brew: {
        water: "soft-bottled",
        tempC: 95,
        waterMl: 120,
        vessel: "gaiwan",
        preheat: true,
        infusionsS: [20, 25, 30],
      },
    });
    for (const cups of [1, 2, 3]) {
      expect(scaleRecipe(gongfu, cups)).toMatchObject({ sessions: 1, waterMl: 120, ingredients: [{ qty: 6 }] });
    }
    expect(scaleRecipe(gongfu, 4)).toMatchObject({ sessions: 2, waterMl: 240, ingredients: [{ qty: 12 }] });
  });

  it("refuses cups outside the selector", () => {
    for (const cups of [0, 13, 1.5]) expect(() => scaleRecipe(forTwo, cups)).toThrow(RangeError);
  });
});

describe("plainTeaRecipe (SPEC §2.5)", () => {
  it("brews a tea by its type's ratio and water", () => {
    const black = TEA_TYPES.find((type) => type.type === "black");
    const tea = ingredient("black-tea", { category: "tea", teaType: "black" });
    expect(plainTeaRecipe(tea, black!, 1)).toMatchObject({
      waterMl: 250,
      ingredients: [{ id: "black-tea", qty: 2.5 }],
      gear: [],
    });
    expect(plainTeaRecipe(tea, black!, 2)).toMatchObject({ waterMl: 500, ingredients: [{ qty: 5 }] });
  });

  it("only brews a tea counted in grams, and never one marked plain: false", () => {
    const black = TEA_TYPES[0]!;
    expect(() => plainTeaRecipe(ingredient("sugar"), black, 1)).toThrow(RangeError);
    const matcha = ingredient("matcha", { category: "tea", teaType: "green", plain: false });
    expect(() => plainTeaRecipe(matcha, black, 1)).toThrow(RangeError);
  });
});

describe("plainBrewOf (SPEC §2.5)", () => {
  const content = catalog([]);
  const own = { ...TEA_TYPES[1]!, tempC: 100, waterMl: 200, ratioGPer100ml: 3, infusionsS: [30] };

  it("brews a tea by its own brew when it has one, else by its type's", () => {
    const genmaicha = ingredient("genmaicha", { category: "tea", teaType: "green", plainBrew: own });
    expect(plainBrewOf(genmaicha, content)).toBe(own);
    expect(plainTeaRecipe(genmaicha, own, 2)).toMatchObject({ waterMl: 400, ingredients: [{ qty: 12 }] });
    const sencha = ingredient("sencha", { category: "tea", teaType: "green" });
    expect(plainBrewOf(sencha, content)).toBe(content.teaTypeByName.get("green"));
  });

  it("has none for matcha, a tea not in grams, anything but a tea, or a type the content lacks", () => {
    const tea = (overrides: Partial<Ingredient>) =>
      ingredient("tea", { category: "tea", teaType: "green", ...overrides });
    expect(plainBrewOf(tea({ plain: false }), content)).toBeNull();
    expect(plainBrewOf(tea({ unit: "pieces", plainBrew: own }), content)).toBeNull();
    expect(plainBrewOf(ingredient("sugar"), content)).toBeNull();
    expect(plainBrewOf(tea({ teaType: "white" }), content)).toBeNull();
  });
});
