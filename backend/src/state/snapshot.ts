/**
 * What the server answers with (SPEC §3.3): the whole state, its revision, the content's hash, and
 * the content every pending pick needs, so a phone with an older bundle can still show what was
 * drawn (a hash it doesn't have shows the update toast).
 */
import type { Blend, ContentBundle, Gear, Ingredient, Shop, State, TeaType } from "@teatime/core";
import type { Conn } from "../db/client.js";
import { loadState, readRevision } from "./rows.js";

/** The content of the pending picks: their blends, the ingredients, gear and shops those name, and the tea types. */
export interface PickContent {
  readonly blends: readonly Blend[];
  readonly ingredients: readonly Ingredient[];
  readonly gear: readonly Gear[];
  readonly shops: readonly Shop[];
  readonly teaTypes: readonly TeaType[];
}

export interface Snapshot {
  readonly revision: number;
  readonly contentHash: string;
  /** The server's clock, in Unix milliseconds: the diagnostics flag a device more than 60 s off it (SPEC §3.8). */
  readonly serverTime: number;
  readonly state: State;
  readonly content: PickContent;
}

/** What the pending picks name, from the bundle: a plain tea or an unlock is an ingredient (or gear) too. */
export function pickContent(state: State, content: ContentBundle): PickContent {
  const codes = new Set<string>();
  const items = new Set<string>();
  for (const pick of Object.values(state.picks)) {
    if (pick.status !== "pending") continue;
    if (pick.tea.kind === "blend") codes.add(pick.tea.code);
    if (pick.tea.kind === "plain") items.add(pick.tea.tea);
    if (pick.unlock !== null) items.add(pick.unlock);
  }
  const blends = content.blends.filter((blend) => codes.has(blend.code));
  for (const blend of blends) {
    for (const ingredient of blend.ingredients) items.add(ingredient.id);
    for (const gear of blend.gear) items.add(gear.id);
  }
  const ingredients = content.ingredients.filter((ingredient) => items.has(ingredient.id));
  const gear = content.gear.filter((piece) => items.has(piece.id));
  const shopIds = new Set([...ingredients, ...gear].flatMap((item) => item.shops.map((ref) => ref.shop)));
  const teaTypeNames = new Set(ingredients.flatMap((ingredient) => (ingredient.teaType ? [ingredient.teaType] : [])));
  return {
    blends,
    ingredients,
    gear,
    shops: content.shops.filter((shop) => shopIds.has(shop.id)),
    teaTypes: content.teaTypes.filter((teaType) => teaTypeNames.has(teaType.type)),
  };
}

/** The snapshot as stored now: read back from the rows, so it is exactly what the database holds. */
export function snapshotOf(
  conn: Conn,
  content: ContentBundle,
  now: number,
  warn: (message: string) => void = () => {},
): Snapshot {
  const state = loadState(conn, warn);
  return {
    revision: readRevision(conn),
    contentHash: content.hash,
    serverTime: now,
    state,
    content: pickContent(state, content),
  };
}
