/**
 * The content, indexed for the rules: the blends by code, the ingredients by id, the tea types by
 * name. Built once from the compiled bundle; everything in core reads this rather than the bundle.
 */
import type { Blend, ContentBundle, Ingredient, TeaType, TeaTypeName } from "./content.js";
import { compareText } from "./json.js";

export interface Catalog {
  /** The bundle's hash: a snapshot names the content it was made with (SPEC §3.3). */
  readonly hash: string;
  /** Every blend, retired ones included, by code. */
  readonly blends: readonly Blend[];
  /** Every ingredient, retired ones included, by id. */
  readonly ingredients: readonly Ingredient[];
  readonly blendByCode: ReadonlyMap<string, Blend>;
  readonly ingredientById: ReadonlyMap<string, Ingredient>;
  readonly teaTypeByName: ReadonlyMap<TeaTypeName, TeaType>;
}

export function catalogOf(bundle: Pick<ContentBundle, "hash" | "blends" | "ingredients" | "teaTypes">): Catalog {
  const blends = [...bundle.blends].sort((a, b) => compareText(a.code, b.code));
  const ingredients = [...bundle.ingredients].sort((a, b) => compareText(a.id, b.id));
  return {
    hash: bundle.hash,
    blends,
    ingredients,
    blendByCode: new Map(blends.map((blend) => [blend.code, blend])),
    ingredientById: new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    teaTypeByName: new Map(bundle.teaTypes.map((teaType) => [teaType.type, teaType])),
  };
}
