/**
 * The draw (SPEC §2.3) and its fallbacks (§2.5): which tea a date gets. A pure, deterministic
 * function of the state, the content and the request; its randomness is seeded by the date and
 * the attempt, so a draw can be replayed.
 */
import type { Catalog } from "./catalog.js";
import { type DayType, inSeason, poolOf } from "./calendar.js";
import type { Blend, Ingredient, Mode } from "./content.js";
import { type BlendHistory, blendHistories } from "./history.js";
import { compareText } from "./json.js";
import { type Stock, entryOf, freshnessOf, isMakeable, topUnlocks, unlockCounts } from "./pantry.js";
import { type Recipe, plainTeaRecipe, scaleRecipe } from "./recipe.js";
import { type Random, pickOne, randomFrom } from "./rng.js";
import { type Settings, cupsFor } from "./state/settings.js";
import { NO_MARKS, type PantryEntry, type PickRecord, type PickTea, type State } from "./state/types.js";
import { daysBetween } from "./time/dates.js";

/** A blend skipped or swapped away rests this many days. */
export const REST_DAYS = 7;

/** The soft filters' levels, relaxed one at a time: both filters, the cooldown only, neither. */
export const LEVELS = ["strict", "no-rest", "no-cooldown"] as const;
export type Level = (typeof LEVELS)[number];

/** Within each season half, in this order: never made, favourites, the others. */
export const GROUPS = ["new", "favourite", "other"] as const;
export type Group = (typeof GROUPS)[number];

/**
 * Why a date is drawn: its first draw, a swap (the owner's one per pick), or a redraw (the pick
 * can't be made any more, or its day type changed). Only a first draw can find no kit.
 */
export type DrawReason = "first" | "swap" | "redraw";

export interface DrawRequest {
  readonly date: string;
  readonly type: DayType;
  /** On the calendar day before the date (the evening draw, or an early one), or on the date itself. */
  readonly timing: "evening" | "same-day";
  readonly reason: DrawReason;
  /** The seed's attempt: 0 for a first draw, then the pick's attempt plus one. */
  readonly attempt: number;
  /** The blend a swap or a redraw replaces: never drawn again for the date. */
  readonly replacing?: string;
}

export type DrawOutcome =
  | {
      readonly kind: "blend";
      readonly code: string;
      /** How far the soft filters had to be relaxed, and which group won: for tests and diagnostics. */
      readonly level: Level;
      readonly group: Group;
      readonly inSeason: boolean;
    }
  /** Nothing in the pool can be made: a plain tea, and the purchase that would unlock the most. */
  | { readonly kind: "plain"; readonly tea: string; readonly unlock: string | null }
  /** Not even a plain tea: what to buy. */
  | { readonly kind: "nothing"; readonly unlock: string | null }
  /** An office day drawn on the day itself, so no kit was packed: a tea kept at the office, if any. */
  | { readonly kind: "no-kit"; readonly tea: string | null };

/** The tea and its source that a pick records for an outcome. */
export function pickTeaOf(outcome: DrawOutcome): Pick<PickRecord, "tea" | "source" | "unlock"> {
  switch (outcome.kind) {
    case "blend":
      return { tea: { kind: "blend", code: outcome.code }, source: "draw", unlock: null };
    case "plain":
      return { tea: { kind: "plain", tea: outcome.tea }, source: "fallback", unlock: outcome.unlock };
    case "nothing":
      return { tea: { kind: "none" }, source: "fallback", unlock: outcome.unlock };
    case "no-kit":
      return {
        tea: outcome.tea ? { kind: "plain", tea: outcome.tea } : { kind: "none" },
        source: "no-kit",
        unlock: null,
      };
  }
}

/** The cups a pick is made for by default: what was packed, or the day type's setting. */
export function pickCups(pick: PickRecord, settings: Settings): number {
  return pick.packedCups ?? cupsFor(pick.type, settings);
}

/** A tea's recipe for some cups, or null for none (or content this build doesn't have). */
export function recipeOf(tea: PickTea, cups: number, catalog: Catalog): Recipe | null {
  if (tea.kind === "blend") {
    const blend = catalog.blendByCode.get(tea.code);
    return blend ? scaleRecipe(blend, cups) : null;
  }
  if (tea.kind === "plain") {
    const ingredient = catalog.ingredientById.get(tea.tea);
    const teaType = ingredient?.teaType ? catalog.teaTypeByName.get(ingredient.teaType) : undefined;
    return ingredient && teaType ? plainTeaRecipe(ingredient, teaType, cups) : null;
  }
  return null;
}

/** The pending picks from `today` on, other than `date`'s: they hold their blend and its quantities (SPEC §2.4). */
export function holdingPicks(state: State, today: string, date: string): PickRecord[] {
  return Object.values(state.picks).filter(
    (pick) => pick.status === "pending" && pick.date >= today && pick.date !== date,
  );
}

/** What the holding picks will take from the pantry. A missed-kit pick uses the office's tea, not the pantry's. */
function reservations(holders: readonly PickRecord[], state: State, catalog: Catalog): Map<string, number> {
  const reserved = new Map<string, number>();
  for (const pick of holders) {
    if (pick.source === "no-kit") continue;
    for (const item of recipeOf(pick.tea, pickCups(pick, state.settings), catalog)?.ingredients ?? []) {
      reserved.set(item.id, (reserved.get(item.id) ?? 0) + item.qty);
    }
  }
  return reserved;
}

/** The pantry as a tea made on `date` sees it: what the other pending picks hold is set aside. */
export function stockFor(state: State, catalog: Catalog, today: string, date: string): Stock {
  return {
    catalog,
    pantry: state.pantry,
    on: date,
    reserved: reservations(holdingPicks(state, today, date), state, catalog),
  };
}

/**
 * The blends a pool can ever draw: in the pool, not retired, not Not for me, and not last rated
 * 1–2 unless marked make again (SPEC §2.3).
 */
export function drawableBlends(
  state: State,
  catalog: Catalog,
  pool: Mode,
  histories: ReadonlyMap<string, BlendHistory> = blendHistories(Object.values(state.brews)),
): Blend[] {
  return catalog.blends.filter((blend) => {
    if (blend.mode !== pool || blend.retired) return false;
    const marks = state.marks[blend.code] ?? NO_MARKS;
    if (marks.notForMe.value) return false;
    const rating = histories.get(blend.code)?.lastRating ?? null;
    return rating === null || rating >= 3 || marks.makeAgain.value;
  });
}

function groupOf(blend: Blend, state: State, histories: ReadonlyMap<string, BlendHistory>): Group {
  const history = histories.get(blend.code);
  if (!history) return "new";
  const marks = state.marks[blend.code] ?? NO_MARKS;
  const favourite = (history.lastRating ?? 0) >= 4 || marks.favourite.value || marks.makeAgain.value;
  return favourite ? "favourite" : "other";
}

/** The blends resting on `date`: skipped, or swapped away, by a pick of the 7 days up to it. */
function restingOn(state: State, date: string): Set<string> {
  const resting = new Set<string>();
  for (const pick of Object.values(state.picks)) {
    const days = daysBetween(pick.date, date);
    if (days < 0 || days >= REST_DAYS) continue;
    if (pick.status === "skipped" && pick.tea.kind === "blend") resting.add(pick.tea.code);
    if (pick.swappedFrom !== null) resting.add(pick.swappedFrom);
  }
  return resting;
}

function coolingOn(history: BlendHistory | undefined, date: string, cooldownDays: number): boolean {
  return history !== undefined && daysBetween(history.lastMadeOn, date) < cooldownDays;
}

/** A never-made blend is drawn at random; a made one is the one made longest ago, ties broken by the seed. */
function choose(members: readonly Blend[], group: Group, histories: ReadonlyMap<string, BlendHistory>, random: Random) {
  if (group === "new") return pickOne(random, members);
  const madeOn = (blend: Blend) => histories.get(blend.code)?.lastMadeOn ?? "";
  const oldest = members.map(madeOn).reduce((min, date) => (date < min ? date : min));
  return pickOne(
    random,
    members.filter((blend) => madeOn(blend) === oldest),
  );
}

interface TeaOption {
  readonly id: string;
  readonly useSoon: boolean;
  readonly left: number | null;
}

/**
 * Use soon first, then the most left (an untracked amount after every tracked one), then by id.
 * The office's stock isn't tracked, so a missed kit's tea skips the amounts (`byAmount` false).
 */
function plainTeaOrder(byAmount: boolean) {
  return (a: TeaOption, b: TeaOption): number => {
    if (a.useSoon !== b.useSoon) return a.useSoon ? -1 : 1;
    if (byAmount && a.left !== b.left) {
      if (a.left === null) return 1;
      if (b.left === null) return -1;
      return b.left - a.left;
    }
    return compareText(a.id, b.id);
  };
}

/** The teas that could be brewed plain, in the fallback's order (SPEC §2.5). */
function plainTeas(
  stock: Stock,
  cups: number,
  usable: (tea: Ingredient, entry: PantryEntry, recipe: Recipe) => boolean,
  byAmount = true,
): string[] {
  const options: TeaOption[] = [];
  for (const ingredient of stock.catalog.ingredients) {
    if (ingredient.category !== "tea" || ingredient.unit !== "g" || ingredient.retired || !ingredient.teaType) continue;
    const teaType = stock.catalog.teaTypeByName.get(ingredient.teaType);
    if (!teaType) continue;
    const entry = entryOf(stock.pantry, ingredient.id);
    if (!usable(ingredient, entry, plainTeaRecipe(ingredient, teaType, cups))) continue;
    const amount = entry.amount.value;
    options.push({
      id: ingredient.id,
      useSoon: freshnessOf(entry, ingredient, stock.on) === "use-soon",
      left: amount === null ? null : amount - (stock.reserved?.get(ingredient.id) ?? 0),
    });
  }
  return options.sort(plainTeaOrder(byAmount)).map((option) => option.id);
}

/**
 * Draws a tea for `request.date` from the state as it is. Callers decide when a draw is due and
 * store the outcome as a pick (state/online.ts).
 */
export function drawPick(state: State, catalog: Catalog, today: string, request: DrawRequest): DrawOutcome {
  const cups = cupsFor(request.type, state.settings);
  const holders = holdingPicks(state, today, request.date);
  const stock = stockFor(state, catalog, today, request.date);

  if (request.reason === "first" && request.timing === "same-day" && request.type === "office") {
    // The kit was never packed: only a tea kept at the office can be made (SPEC §2.5).
    const [tea] = plainTeas(
      stock,
      cups,
      (tea, entry) => entry.atOffice.value && !(tea.perishable && freshnessOf(entry, tea, stock.on) === "stale"),
      false,
    );
    return { kind: "no-kit", tea: tea ?? null };
  }

  const histories = blendHistories(Object.values(state.brews));
  const held = new Set(holders.flatMap((pick) => (pick.tea.kind === "blend" ? [pick.tea.code] : [])));
  const open = drawableBlends(state, catalog, poolOf(request.type), histories).filter(
    (blend) =>
      !held.has(blend.code) &&
      blend.code !== request.replacing &&
      !(request.timing === "same-day" && blend.prep === "evening"),
  );
  const candidates = open.filter((blend) => isMakeable(scaleRecipe(blend, cups), stock));

  if (candidates.length === 0) {
    const [best] = topUnlocks(
      unlockCounts(
        open.map((blend) => scaleRecipe(blend, cups)),
        stock,
      ),
      1,
    );
    const unlock = best?.id ?? null;
    const [tea] = plainTeas(stock, cups, (_tea, _entry, recipe) => isMakeable(recipe, stock));
    return tea ? { kind: "plain", tea, unlock } : { kind: "nothing", unlock };
  }

  const random = randomFrom(`${request.date}#${request.attempt}`);
  const resting = restingOn(state, request.date);
  for (const level of LEVELS) {
    const eligible = candidates.filter(
      (blend) =>
        (level !== "strict" || !resting.has(blend.code)) &&
        (level === "no-cooldown" || !coolingOn(histories.get(blend.code), request.date, state.settings.cooldownDays)),
    );
    for (const seasonal of [true, false]) {
      for (const group of GROUPS) {
        const members = eligible.filter(
          (blend) => groupOf(blend, state, histories) === group && inSeason(blend.seasons, request.date) === seasonal,
        );
        if (members.length > 0) {
          const { code } = choose(members, group, histories, random);
          return { kind: "blend", code, level, group, inSeason: seasonal };
        }
      }
    }
  }
  // The last level filters nothing, and every blend is in a group and in or out of season.
  throw new Error("drawPick: no group took a candidate");
}
