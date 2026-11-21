/**
 * The content: the bundle the app was built with, the same the server imports (SPEC §5.4). A
 * snapshot carries the content of its pending picks (SPEC §3.3): one a newer server drew from
 * content this app doesn't have yet is added, so the pick can still be shown.
 */
import { BUNDLE } from "@teatime/content/bundle";
import { type Catalog, type ContentBundle, type PickContent, catalogOf } from "@teatime/core";

export const bundle: ContentBundle = BUNDLE;
export const baseCatalog: Catalog = catalogOf(BUNDLE);

const missing = <T>(have: readonly T[], extra: readonly T[], key: (item: T) => string) => {
  const known = new Set(have.map(key));
  return extra.filter((item) => !known.has(key(item)));
};

/** The bundle's content, with what a snapshot's picks name that it lacks. */
export function contentWith(extra: PickContent | null | undefined): { content: ContentBundle; catalog: Catalog } {
  if (!extra) return { content: BUNDLE, catalog: baseCatalog };
  const blends = missing(BUNDLE.blends, extra.blends, (b) => b.code);
  const ingredients = missing(BUNDLE.ingredients, extra.ingredients, (i) => i.id);
  const gear = missing(BUNDLE.gear, extra.gear, (g) => g.id);
  const shops = missing(BUNDLE.shops, extra.shops, (s) => s.id);
  const teaTypes = missing(BUNDLE.teaTypes, extra.teaTypes, (t) => t.type);
  if (!blends.length && !ingredients.length && !gear.length && !shops.length && !teaTypes.length) {
    return { content: BUNDLE, catalog: baseCatalog };
  }
  const content: ContentBundle = {
    ...BUNDLE,
    blends: [...BUNDLE.blends, ...blends],
    ingredients: [...BUNDLE.ingredients, ...ingredients],
    gear: [...BUNDLE.gear, ...gear],
    shops: [...BUNDLE.shops, ...shops],
    teaTypes: [...BUNDLE.teaTypes, ...teaTypes],
  };
  return { content, catalog: catalogOf(content) };
}
