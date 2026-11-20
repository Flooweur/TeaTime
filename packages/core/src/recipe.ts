/**
 * Recipes scaled to the cups (SPEC §2.4): the quantities and water shown on Today, which are also
 * what Made it deducts. One rounding rule per unit, used for both.
 */
import type { Blend, BlendIngredient, Ingredient, TeaType, Unit } from "./content.js";

/** The cups selector's range. */
export const MIN_CUPS = 1;
export const MAX_CUPS = 12;

export function isCups(cups: unknown): cups is number {
  return Number.isInteger(cups) && (cups as number) >= MIN_CUPS && (cups as number) <= MAX_CUPS;
}

function checkCups(cups: number): void {
  if (!isCups(cups)) throw new RangeError(`Cups must be a whole number from ${MIN_CUPS} to ${MAX_CUPS}, got ${cups}`);
}

/** Rounds to a whole number of `step`s, halves up, and never to nothing: a needed ingredient shows at least one step. */
function roundToStep(qty: number, step: number): number {
  // The epsilon keeps 1.15 / 0.1 (11.4999…) rounding up, as it reads.
  const steps = Math.max(1, Math.round(qty / step + 1e-9));
  return Number((steps * step).toFixed(1));
}

/**
 * SPEC §2.4's rounding: grams to the nearest 0.5 g, or 0.1 g under 2 g; millilitres to the nearest
 * 5 ml; pieces to the nearest whole piece. A positive quantity never rounds to zero: at least
 * 0.1 g, 5 ml or one piece.
 */
export function roundQty(qty: number, unit: Unit): number {
  if (!Number.isFinite(qty) || qty <= 0) throw new RangeError(`A quantity must be positive, got ${qty}`);
  switch (unit) {
    case "g":
      return roundToStep(qty, qty < 2 ? 0.1 : 0.5);
    case "ml":
      return roundToStep(qty, 5);
    case "pieces":
      return roundToStep(qty, 1);
  }
}

/** A recipe for a number of cups: what Today shows, and what Made it deducts. */
export interface Recipe {
  readonly cups: number;
  /** A `per-session` recipe: how many sessions those cups take. Null for `per-cup`. */
  readonly sessions: number | null;
  /** Rounded, in each ingredient's unit. */
  readonly ingredients: readonly BlendIngredient[];
  /** Rounded to 5 ml. */
  readonly waterMl: number;
}

/**
 * The blend's recipe for `cups`. A `per-cup` recipe makes `serves` cups and scales in proportion.
 * A `per-session` one shares a session's leaves among up to `sessionMax` people, so more people
 * make more sessions.
 */
export function scaleRecipe(blend: Pick<Blend, "scaling" | "ingredients" | "brew">, cups: number): Recipe {
  checkCups(cups);
  const { scaling } = blend;
  const sessions = scaling.kind === "per-session" ? Math.ceil(cups / scaling.sessionMax) : null;
  const factor = scaling.kind === "per-cup" ? cups / scaling.serves : (sessions as number);
  return {
    cups,
    sessions,
    ingredients: blend.ingredients.map((item) => ({ ...item, qty: roundQty(item.qty * factor, item.unit) })),
    waterMl: roundQty(blend.brew.waterMl * factor, "ml"),
  };
}

/**
 * A plain tea's recipe (SPEC §2.5): its tea type's ratio and water per cup. Only a tea counted in
 * grams can be brewed plain.
 */
export function plainTeaRecipe(tea: Ingredient, teaType: TeaType, cups: number): Recipe {
  checkCups(cups);
  if (tea.category !== "tea" || tea.unit !== "g") throw new RangeError(`${tea.id} isn't a tea counted in grams`);
  const waterMl = teaType.waterMl * cups;
  const grams = (teaType.ratioGPer100ml * waterMl) / 100;
  return {
    cups,
    sessions: null,
    ingredients: [{ id: tea.id, qty: roundQty(grams, "g"), unit: "g", optional: false, role: "base" }],
    waterMl: roundQty(waterMl, "ml"),
  };
}
