import {
  type BrewRecord,
  DEFAULT_SETTINGS,
  type Marks,
  NOTHING_TOUCHED,
  type PantryEntry,
  type PickRecord,
  type State,
  type Touched,
  initialState,
} from "@teatime/core";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { openDb } from "../src/db/client.js";
import { settings as settingsTable } from "../src/db/schema.js";
import { bumpRevision, loadState, readRevision, saveTouched } from "../src/state/rows.js";

const CODES = ["001", "002", "005", "006", "009"];
const ITEMS = ["assam", "earl-grey", "lemon", "sugar", "whole-milk", "gaiwan"];

const date = fc
  .integer({ min: Date.UTC(2026, 0, 1), max: Date.UTC(2028, 11, 31) })
  .map((ms) => new Date(Math.floor(ms / 86_400_000) * 86_400_000).toISOString().slice(0, 10));
const time = fc.integer({ min: 0, max: 2_000_000_000_000 });
const stamped = <T>(value: fc.Arbitrary<T>) => fc.record({ value, at: time });
const amount = fc.double({ min: 0, max: 100_000, noNaN: true, noDefaultInfinity: true });
const rating = fc.option(fc.integer({ min: 1, max: 5 }) as fc.Arbitrary<1 | 2 | 3 | 4 | 5>, { nil: null });
const clock = fc
  .integer({ min: 5 * 60, max: 22 * 60 })
  .map((m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);

const settings = fc.record({
  timeZone: fc.constantFrom("Europe/Paris", "UTC", "Pacific/Auckland"),
  officeDays: fc.subarray([1, 2, 3, 4, 5] as const),
  eveningTime: clock,
  morningTime: clock,
  reviewTime: clock,
  notifications: fc.boolean(),
  cooldownDays: fc.integer({ min: 0, max: 365 }),
  officeCups: fc.integer({ min: 1, max: 12 }),
  homeCups: fc.integer({ min: 1, max: 12 }),
});

const entry: fc.Arbitrary<PantryEntry> = fc.record({
  have: stamped(fc.boolean()),
  amount: stamped(fc.option(amount, { nil: null })),
  openedOn: stamped(fc.option(date, { nil: null })),
  atOffice: stamped(fc.boolean()),
});

const tea = fc.oneof(
  fc.constantFrom(...CODES).map((code) => ({ kind: "blend" as const, code })),
  fc.constantFrom(...ITEMS).map((t) => ({ kind: "plain" as const, tea: t })),
);

const pick = (forDate: string): fc.Arbitrary<PickRecord> =>
  fc
    .record({
      type: fc.constantFrom("office", "home" as const),
      tea: fc.oneof(tea, fc.constant({ kind: "none" as const })),
      source: fc.constantFrom("draw", "fallback", "no-kit" as const),
      unlock: fc.option(fc.constantFrom(...ITEMS), { nil: null }),
      attempt: fc.nat({ max: 20 }),
      drawnAt: time,
      swappedFrom: fc.option(fc.constantFrom(...CODES), { nil: null }),
      swappedAt: fc.option(time, { nil: null }),
      status: fc.constantFrom("pending", "made", "skipped", "cancelled" as const),
      statusAt: time,
      packed: fc.option(fc.record({ at: time, cups: fc.integer({ min: 1, max: 12 }) }), { nil: null }),
      brew: fc.option(fc.uuid(), { nil: null }),
    })
    .map(({ packed, ...rest }) => ({
      date: forDate,
      ...rest,
      packedAt: packed?.at ?? null,
      packedCups: packed?.cups ?? null,
    }));

const brew: fc.Arbitrary<BrewRecord> = fc.record({
  id: fc.uuid(),
  date,
  at: time,
  tea,
  cups: fc.integer({ min: 1, max: 12 }),
  pick: fc.option(date, { nil: null }),
  office: fc.boolean(),
  rating: stamped(rating),
  colleagueRating: stamped(rating),
  takes: fc.array(fc.record({ id: fc.constantFrom(...ITEMS), qty: amount, emptied: fc.boolean() }), { maxLength: 4 }),
});

const marks: fc.Arbitrary<Marks> = fc.record({
  favourite: stamped(fc.boolean()),
  makeAgain: stamped(fc.boolean()),
  notForMe: stamped(fc.boolean()),
});

const state: fc.Arbitrary<State> = fc
  .record({
    settings,
    overrides: fc.dictionary(date, fc.constantFrom("office", "home" as const)),
    away: fc.uniqueArray(
      fc
        .record({ id: fc.uuid(), a: date, b: date })
        .map(({ id, a, b }) => ({ id, from: a < b ? a : b, to: a < b ? b : a })),
      { selector: (p) => p.id, maxLength: 4 },
    ),
    pantry: fc.dictionary(fc.constantFrom(...ITEMS), entry),
    pickDates: fc.uniqueArray(date, { maxLength: 6 }),
    brews: fc.uniqueArray(brew, { selector: (b) => b.id, maxLength: 6 }),
    marks: fc.dictionary(fc.constantFrom(...CODES), marks),
  })
  .chain(({ pickDates, brews, ...rest }) =>
    fc.tuple(...pickDates.map(pick)).map((picks) => {
      // A pick is made by one brew at most: a pick date shared by two brews keeps the first.
      const taken = new Set<string>();
      const unique = brews.map((b) => {
        if (b.pick === null || !taken.has(b.pick)) {
          if (b.pick !== null) taken.add(b.pick);
          return b;
        }
        return { ...b, pick: null };
      });
      return {
        ...rest,
        picks: Object.fromEntries(picks.map((p) => [p.date, p])),
        brews: Object.fromEntries(unique.map((b) => [b.id, b])),
      };
    }),
  );

/** Every key of a state, as touched. */
const everything = (s: State): Touched => ({
  settings: true,
  overrides: Object.keys(s.overrides),
  away: s.away.map((p) => p.id),
  pantry: Object.keys(s.pantry),
  picks: Object.keys(s.picks),
  brews: Object.keys(s.brews),
  marks: Object.keys(s.marks),
});

describe("the state's rows (SPEC §3.3, §3.6)", () => {
  it("gives back the same state, saved then loaded", () => {
    fc.assert(
      fc.property(state, (s) => {
        const db = openDb(":memory:");
        db.transaction((tx) => saveTouched(tx, s, everything(s)));
        expect(loadState(db)).toEqual(s);
      }),
      { numRuns: 150 },
    );
  });

  it("loads the defaults from a database nothing was stored in", () => {
    const db = openDb(":memory:");
    expect(loadState(db)).toEqual(initialState());
    expect(readRevision(db)).toBe(0);
  });

  it("deletes a touched key gone from the state, and leaves the untouched ones", () => {
    const db = openDb(":memory:");
    const before: State = {
      ...initialState(),
      overrides: { "2026-11-24": "home", "2026-11-26": "office" },
      away: [
        { id: "a", from: "2026-12-01", to: "2026-12-02" },
        { id: "b", from: "2026-12-10", to: "2026-12-11" },
      ],
    };
    saveTouched(db, before, everything(before));
    const after: State = { ...before, overrides: { "2026-11-26": "office" }, away: [before.away[1]!] };
    saveTouched(db, after, { ...NOTHING_TOUCHED, overrides: ["2026-11-24"], away: ["a"] });
    expect(loadState(db)).toEqual(after);
  });

  it("keeps the away periods in the order they were added, across a removal", () => {
    const db = openDb(":memory:");
    const a = { id: "z", from: "2026-12-01", to: "2026-12-01" };
    const b = { id: "m", from: "2026-12-05", to: "2026-12-05" };
    const c = { id: "a", from: "2026-12-09", to: "2026-12-09" };
    saveTouched(db, { ...initialState(), away: [a, b] }, { ...NOTHING_TOUCHED, away: ["z", "m"] });
    saveTouched(db, { ...initialState(), away: [b] }, { ...NOTHING_TOUCHED, away: ["z"] });
    saveTouched(db, { ...initialState(), away: [b, c] }, { ...NOTHING_TOUCHED, away: ["a"] });
    expect(loadState(db).away).toEqual([b, c]);
  });

  it("frees a pick's brew before another brew takes the pick, in one change", () => {
    const db = openDb(":memory:");
    const made: BrewRecord = {
      id: "brew-1",
      date: "2026-11-23",
      at: 1,
      tea: { kind: "blend", code: "005" },
      cups: 2,
      pick: "2026-11-23",
      office: true,
      rating: { value: null, at: 0 },
      colleagueRating: { value: null, at: 0 },
      takes: [],
    };
    saveTouched(db, { ...initialState(), brews: { [made.id]: made } }, { ...NOTHING_TOUCHED, brews: [made.id] });
    const again = { ...made, id: "brew-2" };
    saveTouched(
      db,
      { ...initialState(), brews: { [again.id]: again } },
      { ...NOTHING_TOUCHED, brews: ["brew-1", "brew-2"] },
    );
    expect(Object.keys(loadState(db).brews)).toEqual(["brew-2"]);
  });

  it("uses a setting's default when its stored value no longer holds, and says so", () => {
    const db = openDb(":memory:");
    db.insert(settingsTable)
      .values({ key: "eveningTime", value: JSON.stringify("23:30") })
      .run();
    db.insert(settingsTable)
      .values({ key: "cooldownDays", value: JSON.stringify(14) })
      .run();
    const warnings: string[] = [];
    const loaded = loadState(db, (message) => warnings.push(message));
    expect(loaded.settings).toEqual({ ...DEFAULT_SETTINGS, cooldownDays: 14 });
    expect(warnings).toEqual(['The stored setting "eveningTime" no longer holds: its default is used']);
  });

  it("counts the revision up", () => {
    const db = openDb(":memory:");
    expect(bumpRevision(db)).toBe(1);
    expect(bumpRevision(db)).toBe(2);
    expect(readRevision(db)).toBe(2);
  });
});
