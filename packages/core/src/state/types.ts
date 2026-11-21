/**
 * The owner's state (SPEC §3.3): small enough that the server always sends all of it. The server
 * stores it as rows (SPEC §3.6); the phone keeps the last snapshot, with its unsent commands
 * replayed on top. Plain JSON, so it travels and stores as it is.
 */
import type { AwayPeriod, DayType, Week } from "../calendar.js";
import { DEFAULT_SETTINGS, type Settings } from "./settings.js";

/**
 * A value and when the owner last set it, in Unix milliseconds (0: never). The fields merged
 * last-writer-wins carry one: a command changes a field only if it is at least as recent (SPEC §3.3).
 */
export interface Stamped<T> {
  readonly value: T;
  readonly at: number;
}

export const RATINGS = [1, 2, 3, 4, 5] as const;
export type Rating = (typeof RATINGS)[number];

export function isRating(value: unknown): value is Rating {
  return RATINGS.includes(value as Rating);
}

/** What a cup is made of: a blend, or a plain tea from the pantry (SPEC §2.5). */
export type Tea = { readonly kind: "blend"; readonly code: string } | { readonly kind: "plain"; readonly tea: string };

/** A pick's tea, or nothing at all to make (no tea in the pantry, or none at the office). */
export type PickTea = Tea | { readonly kind: "none" };

export function sameTea(a: PickTea, b: PickTea): boolean {
  if (a.kind === "blend") return b.kind === "blend" && a.code === b.code;
  if (a.kind === "plain") return b.kind === "plain" && a.tea === b.tea;
  return b.kind === "none";
}

export const PICK_STATUSES = ["pending", "made", "skipped", "cancelled"] as const;
export type PickStatus = (typeof PICK_STATUSES)[number];

/** How a pick's tea came: drawn from the pool, the plain-tea fallback (SPEC §2.5), or the missed-kit card. */
export const PICK_SOURCES = ["draw", "fallback", "no-kit"] as const;
export type PickSource = (typeof PICK_SOURCES)[number];

/** The tea drawn for a tea day (SPEC §2.4). */
export interface PickRecord {
  readonly date: string;
  /** The day type it was drawn for. */
  readonly type: DayType;
  readonly tea: PickTea;
  readonly source: PickSource;
  /** With a fallback: the purchase that would unlock the most blends of the pool, if one would. */
  readonly unlock: string | null;
  /** 0 for the first draw, then one more for each swap or redraw: the next draw's seed (SPEC §2.3). */
  readonly attempt: number;
  readonly drawnAt: number;
  /** The blend the pick's one swap replaced: it rests 7 days. */
  readonly swappedFrom: string | null;
  readonly swappedAt: number | null;
  readonly status: PickStatus;
  readonly statusAt: number;
  /** Packed: the office kit is in the bag, for `packedCups`. Made it then defaults to those cups. */
  readonly packedAt: number | null;
  readonly packedCups: number | null;
  /** The brew that made it, while it is made. */
  readonly brew: string | null;
}

/** What a brew took off one pantry amount. `emptied`: it took the amount to 0, which set *don't have*. */
export interface Take {
  readonly id: string;
  readonly qty: number;
  readonly emptied: boolean;
}

/** A cup actually made (SPEC §2.4). */
export interface BrewRecord {
  /** A UUID made by the device. */
  readonly id: string;
  /** The owner's date it was made on. */
  readonly date: string;
  readonly at: number;
  readonly tea: Tea;
  readonly cups: number;
  /** The date of the pick it made, or null for I made this. */
  readonly pick: string | null;
  /** Made for an office pick: the colleague's rating goes with it. */
  readonly office: boolean;
  readonly rating: Stamped<Rating | null>;
  readonly colleagueRating: Stamped<Rating | null>;
  /** What it took off the pantry, so removing it puts back exactly that. */
  readonly takes: readonly Take[];
}

/** ★, make again, and Not for me: each its own last-writer-wins field. */
export interface Marks {
  readonly favourite: Stamped<boolean>;
  readonly makeAgain: Stamped<boolean>;
  readonly notForMe: Stamped<boolean>;
}

/** One ingredient in the pantry (SPEC §2.6). An ingredient without an entry is *don't have*. */
export interface PantryEntry {
  readonly have: Stamped<boolean>;
  /** What is left, in the ingredient's unit; null when it isn't tracked. */
  readonly amount: Stamped<number | null>;
  readonly openedOn: Stamped<string | null>;
  /** Some of it is kept at the office: what the missed-kit card offers (SPEC §2.5). */
  readonly atOffice: Stamped<boolean>;
}

export interface State {
  readonly settings: Settings;
  /** By date. */
  readonly overrides: Readonly<Record<string, DayType>>;
  /** In the order they were added. */
  readonly away: readonly AwayPeriod[];
  /** By ingredient id. */
  readonly pantry: Readonly<Record<string, PantryEntry>>;
  /** By date. */
  readonly picks: Readonly<Record<string, PickRecord>>;
  /** By id. */
  readonly brews: Readonly<Record<string, BrewRecord>>;
  /** By blend code. */
  readonly marks: Readonly<Record<string, Marks>>;
}

export function initialState(settings: Settings = DEFAULT_SETTINGS): State {
  return { settings, overrides: {}, away: [], pantry: {}, picks: {}, brews: {}, marks: {} };
}

export function weekOf(state: State): Week {
  return { officeDays: state.settings.officeDays, overrides: state.overrides, away: state.away };
}

const NEVER = { at: 0 } as const;

export const EMPTY_ENTRY: PantryEntry = {
  have: { ...NEVER, value: false },
  amount: { ...NEVER, value: null },
  openedOn: { ...NEVER, value: null },
  atOffice: { ...NEVER, value: false },
};

export const NO_MARKS: Marks = {
  favourite: { ...NEVER, value: false },
  makeAgain: { ...NEVER, value: false },
  notForMe: { ...NEVER, value: false },
};
