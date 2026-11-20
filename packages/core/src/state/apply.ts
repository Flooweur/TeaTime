/**
 * The reducer (SPEC §3.3): one offline command applied to the state, purely. The server applies a
 * batch with it, one command at a time; the phone replays its unsent commands on the server's
 * snapshot with it. Neither writes these rules again.
 */
import type { Catalog } from "../catalog.js";
import { recipeOf } from "../draw.js";
import { entryOf, plannedTakes } from "../pantry.js";
import { wallClockAt } from "../time/zone.js";
import type {
  BlendMarked,
  BrewLogged,
  BrewRated,
  BrewRemoved,
  Command,
  PantrySet,
  PickPacked,
  PickSkipped,
  PickUnskipped,
} from "./commands.js";
import { canMove } from "./status.js";
import { type Touched, NOTHING_TOUCHED, touched } from "./touched.js";
import {
  type BrewRecord,
  type Marks,
  NO_MARKS,
  type PantryEntry,
  type PickRecord,
  type PickStatus,
  type PickTea,
  type Stamped,
  type State,
  type Take,
  type Tea,
  sameTea,
} from "./types.js";

/** Why a command was refused. A refusal changes nothing, and never blocks the commands after it. */
export const REFUSALS = [
  /** The brew's id is already used. */
  "duplicate",
  /** A brew dated after the day it was logged. */
  "future_date",
  "unknown_tea",
  "unknown_blend",
  "unknown_ingredient",
  /** No brew with that id. */
  "not_found",
  /** No pick on that date. */
  "no_pick",
  /** The pick is made already: two devices pressed Made it. */
  "already_made",
  "cancelled",
  "not_pending",
  /** Only an office pick has a kit to pack. */
  "not_office",
  /** The pick has nothing to pack: no tea, or the office's own. */
  "nothing_to_pack",
] as const;
export type Refusal = (typeof REFUSALS)[number];

/** What an accepted command did that the owner should hear about. */
export type Note =
  /** Nothing changed: the state already said so, or a more recent change won. */
  | { readonly code: "no_change" }
  /** The pick was cancelled or is gone: the brew is logged on its own, like I made this. */
  | { readonly code: "pick_gone" }
  /** The cup made isn't the pick's tea: the real cup wins, and the pick is made with it. */
  | { readonly code: "different_tea"; readonly drawn: PickTea }
  /** Undo couldn't put this amount back: it was measured, or switched to untracked, since. */
  | { readonly code: "not_restored"; readonly ingredient: string };

export type CommandResult =
  { readonly ok: true; readonly notes: readonly Note[] } | { readonly ok: false; readonly code: Refusal };

export interface Applied {
  readonly state: State;
  readonly result: CommandResult;
  readonly touched: Touched;
}

const DAY_MS = 86_400_000;

/** A command time more than a day ahead of the clock is taken as the clock's time (SPEC §3.3). */
export function effectiveTime(at: number, now: number): number {
  return at > now + DAY_MS ? now : at;
}

/** Amounts are entered and deducted in tenths: this drops the floating-point dust. */
function tidy(amount: number): number {
  return Math.round(amount * 1000) / 1000;
}

const refuse = (state: State, code: Refusal): Applied => ({
  state,
  result: { ok: false, code },
  touched: NOTHING_TOUCHED,
});

const unchanged = (state: State): Applied => ({
  state,
  result: { ok: true, notes: [{ code: "no_change" }] },
  touched: NOTHING_TOUCHED,
});

/** The refusal for a pick whose status doesn't allow what was asked. */
function refusalFor(status: PickStatus): Refusal {
  if (status === "made") return "already_made";
  if (status === "cancelled") return "cancelled";
  return "not_pending";
}

/** Sets a stamped field when the change is at least as recent as the field's (last writer wins). */
function stamp<T>(current: Stamped<T>, value: T | undefined, at: number): Stamped<T> {
  return value === undefined || at < current.at ? current : { value, at };
}

/** A blend the content has, or a tea that can be brewed plain: counted in grams, with a known tea type. */
function knownTea(tea: Tea, catalog: Catalog): boolean {
  if (tea.kind === "blend") return catalog.blendByCode.has(tea.code);
  const ingredient = catalog.ingredientById.get(tea.tea);
  return (
    ingredient?.category === "tea" &&
    ingredient.unit === "g" &&
    ingredient.teaType !== undefined &&
    catalog.teaTypeByName.has(ingredient.teaType)
  );
}

/**
 * Applies one command. `now` is the applier's clock, used only for SPEC §3.3's skew rule. The state
 * is never mutated: a new one comes back with the result and the keys it touched.
 */
export function applyCommand(state: State, command: Command, catalog: Catalog, now: number): Applied {
  const at = effectiveTime(command.at, now);
  switch (command.type) {
    case "brew.logged":
      return logBrew(state, command, catalog, at);
    case "brew.rated":
      return rateBrew(state, command, at);
    case "brew.removed":
      return removeBrew(state, command);
    case "pick.skipped":
      return movePick(state, command, "pending", "skipped", at);
    case "pick.unskipped":
      return movePick(state, command, "skipped", "pending", at);
    case "pick.packed":
      return packPick(state, command, at);
    case "pantry.set":
      return setPantry(state, command, catalog, at);
    case "blend.marked":
      return markBlend(state, command, catalog, at);
  }
}

function logBrew(state: State, { payload: p }: BrewLogged, catalog: Catalog, at: number): Applied {
  if (Object.hasOwn(state.brews, p.brew)) return refuse(state, "duplicate");
  if (!knownTea(p.tea, catalog)) return refuse(state, "unknown_tea");
  if (p.date > wallClockAt(at, state.settings.timeZone).date) return refuse(state, "future_date");

  const notes: Note[] = [];
  let pick: PickRecord | null = null;
  if (p.pick !== undefined) {
    const current = state.picks[p.pick];
    if (current?.status === "made") return refuse(state, "already_made");
    if (current && canMove(current.status, "made")) {
      pick = { ...current, status: "made", statusAt: at, brew: p.brew };
      if (!sameTea(current.tea, p.tea)) notes.push({ code: "different_tea", drawn: current.tea });
    } else {
      notes.push({ code: "pick_gone" });
    }
  }

  // A missed-kit pick is made with the office's tea: the pantry at home keeps its own.
  const fromOffice = pick?.source === "no-kit";
  const recipe = fromOffice ? null : recipeOf(p.tea, p.cups, catalog);
  const pantry: Record<string, PantryEntry> = { ...state.pantry };
  const takes: Take[] = [];
  for (const { id, qty } of recipe ? plannedTakes(recipe, state.pantry) : []) {
    const entry = entryOf(pantry, id);
    const amount = entry.amount.value;
    // A measurement made at or after the brew already counts it (SPEC §3.3).
    if (amount === null || entry.amount.at >= at) continue;
    const took = tidy(Math.min(qty, amount));
    const left = tidy(amount - took);
    // Reaching 0 sets *don't have*, unless the owner set *have* after this cup.
    const emptied = left <= 0 && entry.have.value && entry.have.at <= at;
    if (took === 0 && !emptied) continue;
    pantry[id] = {
      ...entry,
      amount: { value: left, at: entry.amount.at },
      have: emptied ? { value: false, at } : entry.have,
    };
    takes.push({ id, qty: took, emptied });
  }

  const brew: BrewRecord = {
    id: p.brew,
    date: p.date,
    at,
    tea: p.tea,
    cups: p.cups,
    pick: pick?.date ?? null,
    office: pick?.type === "office",
    rating: { value: p.rating ?? null, at },
    colleagueRating: { value: p.colleagueRating ?? null, at },
    takes,
  };
  return {
    state: {
      ...state,
      pantry,
      brews: { ...state.brews, [brew.id]: brew },
      picks: pick ? { ...state.picks, [pick.date]: pick } : state.picks,
    },
    result: { ok: true, notes },
    touched: touched({ brews: [brew.id], picks: pick ? [pick.date] : [], pantry: takes.map((take) => take.id) }),
  };
}

function rateBrew(state: State, { payload: p }: BrewRated, at: number): Applied {
  const brew = state.brews[p.brew];
  if (!brew) return refuse(state, "not_found");
  const next: BrewRecord = {
    ...brew,
    rating: stamp(brew.rating, p.rating, at),
    colleagueRating: stamp(brew.colleagueRating, p.colleagueRating, at),
  };
  if (next.rating === brew.rating && next.colleagueRating === brew.colleagueRating) return unchanged(state);
  return {
    state: { ...state, brews: { ...state.brews, [brew.id]: next } },
    result: { ok: true, notes: [] },
    touched: touched({ brews: [brew.id] }),
  };
}

function removeBrew(state: State, { payload: p }: BrewRemoved): Applied {
  const brew = state.brews[p.brew];
  if (!brew) return unchanged(state);

  const notes: Note[] = [];
  const pantry: Record<string, PantryEntry> = { ...state.pantry };
  for (const take of brew.takes) {
    const entry = entryOf(pantry, take.id);
    const amount = entry.amount.value;
    // Measured since the cup: the measurement already holds the truth, so nothing goes back.
    if (amount === null || entry.amount.at >= brew.at) {
      notes.push({ code: "not_restored", ingredient: take.id });
      continue;
    }
    const restoreHave = take.emptied && !entry.have.value && entry.have.at === brew.at;
    pantry[take.id] = {
      ...entry,
      amount: { value: tidy(amount + take.qty), at: entry.amount.at },
      have: restoreHave ? { value: true, at: brew.at } : entry.have,
    };
  }

  const pick = brew.pick === null ? undefined : state.picks[brew.pick];
  const reopened: PickRecord | null =
    pick && pick.brew === brew.id && canMove(pick.status, "pending")
      ? { ...pick, status: "pending", statusAt: brew.at, brew: null }
      : null;

  const brews = { ...state.brews };
  delete brews[brew.id];
  return {
    state: {
      ...state,
      pantry,
      brews,
      picks: reopened ? { ...state.picks, [reopened.date]: reopened } : state.picks,
    },
    result: { ok: true, notes },
    touched: touched({
      brews: [brew.id],
      picks: reopened ? [reopened.date] : [],
      pantry: brew.takes.map((take) => take.id).filter((id) => pantry[id] !== state.pantry[id]),
    }),
  };
}

/** Skip (pending → skipped) and unskip (skipped → pending). Asking again for where the pick already is changes nothing. */
function movePick(
  state: State,
  { payload: p }: PickSkipped | PickUnskipped,
  from: PickStatus,
  to: PickStatus,
  at: number,
): Applied {
  const pick = state.picks[p.date];
  if (!pick) return refuse(state, "no_pick");
  if (pick.status === to) return unchanged(state);
  if (pick.status !== from || !canMove(from, to)) return refuse(state, refusalFor(pick.status));
  const next: PickRecord = { ...pick, status: to, statusAt: at };
  return {
    state: { ...state, picks: { ...state.picks, [pick.date]: next } },
    result: { ok: true, notes: [] },
    touched: touched({ picks: [pick.date] }),
  };
}

function packPick(state: State, { payload: p }: PickPacked, at: number): Applied {
  const pick = state.picks[p.date];
  if (!pick) return refuse(state, "no_pick");
  if (pick.status !== "pending") return refuse(state, refusalFor(pick.status));
  if (pick.type !== "office") return refuse(state, "not_office");
  if (pick.tea.kind === "none" || pick.source === "no-kit") return refuse(state, "nothing_to_pack");
  const next: PickRecord = { ...pick, packedAt: at, packedCups: p.cups };
  return {
    state: { ...state, picks: { ...state.picks, [pick.date]: next } },
    result: { ok: true, notes: [] },
    touched: touched({ picks: [pick.date] }),
  };
}

function setPantry(state: State, { payload: p }: PantrySet, catalog: Catalog, at: number): Applied {
  if (!catalog.ingredientById.has(p.ingredient)) return refuse(state, "unknown_ingredient");
  const before = entryOf(state.pantry, p.ingredient);
  let entry: PantryEntry = {
    ...before,
    have: stamp(before.have, p.have, at),
    openedOn: stamp(before.openedOn, p.openedOn, at),
    atOffice: stamp(before.atOffice, p.atOffice, at),
  };
  // Turning *have* on sets the opened date to that day, unless the command sets one (SPEC §2.6).
  if (entry.have.value && !before.have.value && p.openedOn === undefined) {
    entry = { ...entry, openedOn: stamp(entry.openedOn, wallClockAt(at, state.settings.timeZone).date, at) };
  }
  if (p.amount !== undefined && at >= before.amount.at) {
    // A measurement: what is left at `at`. The cups made after it still take their share.
    const later = Object.values(state.brews)
      .filter((brew) => brew.at > at)
      .flatMap((brew) => brew.takes.filter((take) => take.id === p.ingredient));
    const value =
      p.amount === null
        ? null
        : tidy(
            Math.max(
              0,
              later.reduce((left, take) => left - take.qty, p.amount),
            ),
          );
    entry = { ...entry, amount: { value, at } };
  }
  const changed = (Object.keys(entry) as (keyof PantryEntry)[]).some((key) => entry[key] !== before[key]);
  if (!changed) return unchanged(state);
  return {
    state: { ...state, pantry: { ...state.pantry, [p.ingredient]: entry } },
    result: { ok: true, notes: [] },
    touched: touched({ pantry: [p.ingredient] }),
  };
}

function markBlend(state: State, { payload: p }: BlendMarked, catalog: Catalog, at: number): Applied {
  if (!catalog.blendByCode.has(p.blend)) return refuse(state, "unknown_blend");
  const before = state.marks[p.blend] ?? NO_MARKS;
  const marks: Marks = {
    favourite: stamp(before.favourite, p.favourite, at),
    makeAgain: stamp(before.makeAgain, p.makeAgain, at),
    notForMe: stamp(before.notForMe, p.notForMe, at),
  };
  const changed = (Object.keys(marks) as (keyof Marks)[]).some((key) => marks[key] !== before[key]);
  if (!changed) return unchanged(state);
  return {
    state: { ...state, marks: { ...state.marks, [p.blend]: marks } },
    result: { ok: true, notes: [] },
    touched: touched({ marks: [p.blend] }),
  };
}
