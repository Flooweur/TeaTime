/**
 * The commands that work offline (SPEC §3.3): what the owner does, queued on the phone and applied
 * by `applyCommand` on both sides. A command is plain JSON; `parseCommand` checks one as it
 * arrives, so the server and the phone agree on what is well formed.
 */
import { MAX_CUPS, MIN_CUPS, isCups } from "../recipe.js";
import { isDate } from "../time/dates.js";
import { type Rating, type Tea, isRating } from "./types.js";

/** Raised when a command's shape changes; the server upgrades older ones (SPEC §3.3). */
export const COMMAND_VERSION = 1;

interface CommandOf<T extends string, P> {
  /** A UUID made by the device: applying the same command twice changes nothing. */
  readonly id: string;
  readonly v: number;
  /** When the owner did it, in Unix milliseconds by the device's clock. */
  readonly at: number;
  readonly type: T;
  readonly payload: P;
}

/** Made it (with `pick`), or I made this. */
export type BrewLogged = CommandOf<
  "brew.logged",
  {
    /** The new brew's id, a UUID. */
    readonly brew: string;
    readonly tea: Tea;
    readonly cups: number;
    /** The owner's date it was made on. */
    readonly date: string;
    /** The date of the pick it makes. */
    readonly pick?: string;
    readonly rating?: Rating;
    readonly colleagueRating?: Rating;
  }
>;

/** A rating given or changed; null takes it back. */
export type BrewRated = CommandOf<
  "brew.rated",
  { readonly brew: string; readonly rating?: Rating | null; readonly colleagueRating?: Rating | null }
>;

/** Undo: the brew is removed, and what it took goes back where it can (SPEC §2.4). */
export type BrewRemoved = CommandOf<"brew.removed", { readonly brew: string }>;

export type PickSkipped = CommandOf<"pick.skipped", { readonly date: string }>;
export type PickUnskipped = CommandOf<"pick.unskipped", { readonly date: string }>;

/** The office kit is packed, for these cups. */
export type PickPacked = CommandOf<"pick.packed", { readonly date: string; readonly cups: number }>;

/** Some of an ingredient's fields, each merged last-writer-wins. `amount` is a measurement: what is left. */
export type PantrySet = CommandOf<
  "pantry.set",
  {
    readonly ingredient: string;
    readonly have?: boolean;
    readonly amount?: number | null;
    readonly openedOn?: string | null;
    readonly atOffice?: boolean;
  }
>;

/** ★, make again, Not for me: each merged last-writer-wins. */
export type BlendMarked = CommandOf<
  "blend.marked",
  { readonly blend: string; readonly favourite?: boolean; readonly makeAgain?: boolean; readonly notForMe?: boolean }
>;

export type Command =
  BrewLogged | BrewRated | BrewRemoved | PickSkipped | PickUnskipped | PickPacked | PantrySet | BlendMarked;

export type CommandType = Command["type"];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const CODE = /^[0-9]{3}$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** The most an amount can be, in any unit: far beyond any pantry, and a guard against typos. */
export const MAX_AMOUNT = 100_000;

interface Field {
  readonly ok: (value: unknown) => boolean;
  readonly rule: string;
  readonly optional?: true;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const field = (ok: (value: unknown) => boolean, rule: string): Field => ({ ok, rule });
const optional = (f: Field): Field => ({ ...f, optional: true });
const orNull = (f: Field): Field => ({ ok: (value) => value === null || f.ok(value), rule: `${f.rule}, or null` });

const ID = field((v) => typeof v === "string" && UUID.test(v), "a lowercase UUID");
const DATE = field((v) => typeof v === "string" && isDate(v), "a date, YYYY-MM-DD");
const CUPS = field(isCups, `a whole number of cups from ${MIN_CUPS} to ${MAX_CUPS}`);
const RATING = field(isRating, "a rating from 1 to 5");
const BOOLEAN = field((v) => typeof v === "boolean", "true or false");
const BLEND = field((v) => typeof v === "string" && CODE.test(v), "a blend's code, like 017");
const INGREDIENT = field((v) => typeof v === "string" && SLUG.test(v), "an ingredient's id");
const AMOUNT = field(
  (v) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= MAX_AMOUNT,
  `an amount from 0 to ${MAX_AMOUNT}`,
);
const TEA = field(
  (v) =>
    isRecord(v) &&
    ((v["kind"] === "blend" && Object.keys(v).length === 2 && BLEND.ok(v["code"])) ||
      (v["kind"] === "plain" && Object.keys(v).length === 2 && INGREDIENT.ok(v["tea"]))),
  '{ kind: "blend", code } or { kind: "plain", tea }',
);

/** Each payload's fields, and how many of its optional ones must be there. */
const PAYLOADS: {
  readonly [T in CommandType]: { readonly fields: Record<string, Field>; readonly atLeastOne?: true };
} = {
  "brew.logged": {
    fields: {
      brew: ID,
      tea: TEA,
      cups: CUPS,
      date: DATE,
      pick: optional(DATE),
      rating: optional(RATING),
      colleagueRating: optional(RATING),
    },
  },
  "brew.rated": {
    fields: { brew: ID, rating: optional(orNull(RATING)), colleagueRating: optional(orNull(RATING)) },
    atLeastOne: true,
  },
  "brew.removed": { fields: { brew: ID } },
  "pick.skipped": { fields: { date: DATE } },
  "pick.unskipped": { fields: { date: DATE } },
  "pick.packed": { fields: { date: DATE, cups: CUPS } },
  "pantry.set": {
    fields: {
      ingredient: INGREDIENT,
      have: optional(BOOLEAN),
      amount: optional(orNull(AMOUNT)),
      openedOn: optional(orNull(DATE)),
      atOffice: optional(BOOLEAN),
    },
    atLeastOne: true,
  },
  "blend.marked": {
    fields: { blend: BLEND, favourite: optional(BOOLEAN), makeAgain: optional(BOOLEAN), notForMe: optional(BOOLEAN) },
    atLeastOne: true,
  },
};

function isCommandType(type: unknown): type is CommandType {
  return typeof type === "string" && Object.hasOwn(PAYLOADS, type);
}

export type ParsedCommand =
  | { readonly ok: true; readonly command: Command }
  | { readonly ok: false; readonly code: "invalid" | "unsupported_version"; readonly problem: string };

/**
 * Checks a command as it arrives: its envelope, its type, and its payload's fields, with no field
 * missing and none unknown. A command from a newer app than this code is `unsupported_version`.
 */
export function parseCommand(raw: unknown): ParsedCommand {
  const invalid = (problem: string): ParsedCommand => ({ ok: false, code: "invalid", problem });
  if (!isRecord(raw)) return invalid("a command must be an object");
  const extra = Object.keys(raw).filter((key) => !["id", "v", "at", "type", "payload"].includes(key));
  if (extra.length) return invalid(`unknown field: ${extra.join(", ")}`);
  const { id, v, at, type, payload } = raw;
  if (!ID.ok(id)) return invalid(`id: must be ${ID.rule}`);
  if (!Number.isInteger(v) || (v as number) < 1) return invalid("v: must be a version from 1");
  if ((v as number) > COMMAND_VERSION) {
    return { ok: false, code: "unsupported_version", problem: `v: ${v as number} is newer than ${COMMAND_VERSION}` };
  }
  if (!Number.isSafeInteger(at) || (at as number) < 0) return invalid("at: must be a time in Unix milliseconds");
  if (!isCommandType(type)) return invalid(`type: unknown command ${JSON.stringify(type)}`);
  if (!isRecord(payload)) return invalid("payload: must be an object");

  const { fields, atLeastOne } = PAYLOADS[type];
  for (const key of Object.keys(payload)) {
    if (!Object.hasOwn(fields, key)) return invalid(`payload.${key}: unknown field`);
  }
  let optionalCount = 0;
  for (const [key, f] of Object.entries(fields)) {
    const value = payload[key];
    if (value === undefined) {
      if (!f.optional) return invalid(`payload.${key}: missing`);
      continue;
    }
    if (!f.ok(value)) return invalid(`payload.${key}: must be ${f.rule}`);
    if (f.optional) optionalCount++;
  }
  if (atLeastOne && optionalCount === 0) return invalid(`payload: ${type} must change something`);
  // Version 1 is the only one so far: an older version would be upgraded here.
  return { ok: true, command: { id, v: COMMAND_VERSION, at, type, payload } as Command };
}
