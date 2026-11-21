/**
 * The content, indexed for the rules: the blends by code, the ingredients and the gear by id, the
 * tea types by name. Built once from the compiled bundle; everything in core reads this rather than
 * the bundle.
 */
import type { Blend, ContentBundle, Gear, Ingredient, TeaType, TeaTypeName } from "./content.js";
import { compareText } from "./json.js";

export interface Catalog {
  /** The bundle's hash: a snapshot names the content it was made with (SPEC §3.3). */
  readonly hash: string;
  /** Every blend, retired ones included, by code. */
  readonly blends: readonly Blend[];
  /** Every ingredient, retired ones included, by id. */
  readonly ingredients: readonly Ingredient[];
  /** Every piece of gear, retired ones included, by id. No id is both an ingredient's and gear's (SPEC §5.2). */
  readonly gear: readonly Gear[];
  readonly blendByCode: ReadonlyMap<string, Blend>;
  readonly ingredientById: ReadonlyMap<string, Ingredient>;
  readonly gearById: ReadonlyMap<string, Gear>;
  readonly teaTypeByName: ReadonlyMap<TeaTypeName, TeaType>;
}

export function catalogOf(
  bundle: Pick<ContentBundle, "hash" | "blends" | "ingredients" | "gear" | "teaTypes">,
): Catalog {
  const blends = [...bundle.blends].sort((a, b) => compareText(a.code, b.code));
  const ingredients = [...bundle.ingredients].sort((a, b) => compareText(a.id, b.id));
  const gear = [...bundle.gear].sort((a, b) => compareText(a.id, b.id));
  return {
    hash: bundle.hash,
    blends,
    ingredients,
    gear,
    blendByCode: new Map(blends.map((blend) => [blend.code, blend])),
    ingredientById: new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    gearById: new Map(gear.map((piece) => [piece.id, piece])),
    teaTypeByName: new Map(bundle.teaTypes.map((teaType) => [teaType.type, teaType])),
  };
}
