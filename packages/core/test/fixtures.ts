/** A small content catalog and state builders for the rules' tests. */
import {
  type Blend,
  type BrewRecord,
  type Catalog,
  type Command,
  DEFAULT_SETTINGS,
  type Ingredient,
  type PantryEntry,
  type PickRecord,
  type Settings,
  type State,
  type TeaType,
  catalogOf,
  initialState,
  instantAt,
  minutesOf,
} from "../src/index.js";

export const PARIS = "Europe/Paris";

/** The instant of a Paris wall-clock time. */
export function at(date: string, time = "12:00"): number {
  return instantAt(date, minutesOf(time), PARIS);
}

export function blend(code: string, overrides: Partial<Blend> = {}): Blend {
  return {
    code,
    slug: `blend-${code}`,
    name: `Blend ${code}`,
    mode: "safe",
    family: "household",
    trust: "documented",
    sourceType: "grandmother",
    origin: "Lyon",
    story: "A story.",
    difficulty: 1,
    seasons: [],
    flavours: [],
    caffeine: "medium",
    scaling: { kind: "per-cup", serves: 1 },
    prep: "none",
    guides: [],
    retired: false,
    sources: [],
    ingredients: [{ id: "black-tea", qty: 2.5, unit: "g", optional: false, role: "base" }],
    brew: { water: "tap", tempC: 95, waterMl: 250, vessel: "mug", preheat: false, infusionsS: [180] },
    steps: [{ text: "Brew.", office: "Brew in a mug.", infusions: true, stage: "day" }],
    gear: [],
    ...overrides,
  };
}

export function ingredient(id: string, overrides: Partial<Ingredient> = {}): Ingredient {
  return {
    id,
    name: id,
    category: "other",
    unit: "g",
    perishable: false,
    shelfLifeDays: 365,
    storage: "Dry.",
    quality: "Good.",
    shops: [],
    retired: false,
    ...overrides,
  };
}

export const INGREDIENTS: readonly Ingredient[] = [
  ingredient("black-tea", { name: "Black tea", category: "tea", teaType: "black" }),
  ingredient("green-tea", { name: "Green tea", category: "tea", teaType: "green" }),
  ingredient("oolong", { name: "Oolong", category: "tea", teaType: "oolong" }),
  ingredient("mint", { name: "Fresh mint", category: "herb", perishable: true, shelfLifeDays: 8 }),
  ingredient("sugar", { name: "Sugar", category: "sweetener" }),
  ingredient("milk", { name: "Milk", category: "dairy", unit: "ml", perishable: true, shelfLifeDays: 4 }),
  ingredient("lemon", { name: "Lemon", category: "citrus", unit: "pieces", perishable: true, shelfLifeDays: 14 }),
];

function teaType(type: TeaType["type"], ratioGPer100ml: number, waterMl: number): TeaType {
  return {
    type,
    name: type,
    tempC: 90,
    ratioGPer100ml,
    waterMl,
    infusionsS: [180],
    office: { tempC: 90, method: "Let the kettle rest.", infusionsS: [180] },
    sources: [],
  };
}

export const TEA_TYPES: readonly TeaType[] = [
  teaType("black", 1, 250),
  teaType("green", 1.2, 250),
  teaType("oolong", 2, 150),
];

export function catalog(blends: readonly Blend[], ingredients: readonly Ingredient[] = INGREDIENTS): Catalog {
  return catalogOf({ hash: "test", blends, ingredients, teaTypes: TEA_TYPES });
}

/** An ingredient the owner has: an amount, or untracked. Stamped at time 1, before any test's commands. */
export function have(amount: number | null = null, extra: Partial<Record<"openedOn", string>> = {}): PantryEntry {
  return {
    have: { value: true, at: 1 },
    amount: { value: amount, at: 1 },
    openedOn: { value: extra.openedOn ?? null, at: 1 },
    atOffice: { value: false, at: 1 },
  };
}

export function pick(date: string, overrides: Partial<PickRecord> = {}): PickRecord {
  return {
    date,
    type: "office",
    tea: { kind: "blend", code: "001" },
    source: "draw",
    unlock: null,
    attempt: 0,
    drawnAt: 1,
    swappedFrom: null,
    swappedAt: null,
    status: "pending",
    statusAt: 1,
    packedAt: null,
    packedCups: null,
    brew: null,
    ...overrides,
  };
}

let brewCount = 0;
export function brew(code: string, date: string, overrides: Partial<BrewRecord> = {}): BrewRecord {
  brewCount++;
  const id = `00000000-0000-4000-8000-${String(brewCount).padStart(12, "0")}`;
  return {
    id,
    date,
    at: at(date),
    tea: { kind: "blend", code },
    cups: 1,
    pick: null,
    office: false,
    rating: { value: null, at: 1 },
    colleagueRating: { value: null, at: 1 },
    takes: [],
    ...overrides,
  };
}

/** The tests' own week, whatever the owner's default: office on Monday to Wednesday, home on Thursday and Friday. */
export const TEST_OFFICE_DAYS = [1, 2, 3] as const;

export function state(parts: Partial<Omit<State, "settings">> & { settings?: Partial<Settings> } = {}): State {
  const { settings, ...rest } = parts;
  return { ...initialState({ ...DEFAULT_SETTINGS, officeDays: TEST_OFFICE_DAYS, ...settings }), ...rest };
}

/** Brews keyed by id, as the state holds them. */
export function brews(...records: BrewRecord[]): Record<string, BrewRecord> {
  return Object.fromEntries(records.map((record) => [record.id, record]));
}

let commandCount = 0;
/** A command with a fresh id, at a Paris time. */
export function command<C extends Command>(type: C["type"], payload: C["payload"], when: number): C {
  commandCount++;
  return {
    id: `11111111-1111-4111-8111-${String(commandCount).padStart(12, "0")}`,
    v: 1,
    at: when,
    type,
    payload,
  } as C;
}

/** A UUID for a new brew. */
export function uuid(n: number): string {
  return `22222222-2222-4222-8222-${String(n).padStart(12, "0")}`;
}
