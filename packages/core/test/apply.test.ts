import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  type BlendMarked,
  type BrewLogged,
  type BrewRated,
  type BrewRemoved,
  type Command,
  PICK_MOVES,
  PICK_STATUSES,
  type PantrySet,
  type PickPacked,
  type PickSkipped,
  type PickStatus,
  type PickUnskipped,
  type State,
  applyCommand,
  canMove,
  parseCommand,
} from "../src/index.js";
import { at, blend, catalog, command, have, ingredient, pick, state, uuid } from "./fixtures.js";

const MONDAY = "2026-11-23";
const content = catalog([
  blend("001", {
    ingredients: [
      { id: "black-tea", qty: 2.5, unit: "g", optional: false, role: "base" },
      { id: "sugar", qty: 5, unit: "g", optional: true, role: "accent" },
      { id: "lemon", qty: 1, unit: "pieces", optional: true, role: "garnish" },
    ],
  }),
  blend("002"),
]);

const apply = (s: State, c: Command, now = c.at) => applyCommand(s, c, content, now);

type BrewOverrides = { [K in keyof BrewLogged["payload"]]?: BrewLogged["payload"][K] | undefined };

/** Made it for Monday's pick by default; `pick: undefined` makes it I made this. */
const logged = (overrides: BrewOverrides = {}, when = at(MONDAY, "10:00")) => {
  const payload = {
    brew: uuid(1),
    tea: { kind: "blend", code: "001" },
    cups: 2,
    date: MONDAY,
    pick: MONDAY,
    ...overrides,
  };
  const defined = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
  return command<BrewLogged>("brew.logged", defined as BrewLogged["payload"], when);
};

const amountOf = (s: State, id: string) => s.pantry[id]?.amount.value;

describe("brew.logged: Made it and I made this", () => {
  const before = state({
    pantry: { "black-tea": have(100), sugar: have(4), lemon: { ...have(3), have: { value: false, at: 1 } } },
    picks: { [MONDAY]: pick(MONDAY) },
  });

  it("makes the pick, logs the brew, and takes what it used off the pantry", () => {
    const { state: after, result, touched } = apply(before, logged({ rating: 4 }));
    expect(result).toEqual({ ok: true, notes: [] });
    expect(after.picks[MONDAY]).toMatchObject({ status: "made", brew: uuid(1) });
    expect(after.brews[uuid(1)]).toMatchObject({
      tea: { kind: "blend", code: "001" },
      cups: 2,
      pick: MONDAY,
      office: true,
      rating: { value: 4 },
      // 5 g of black tea; sugar, optional and had, down to 0, which sets don't have; no lemon, not had.
      takes: [
        { id: "black-tea", qty: 5, emptied: false },
        { id: "sugar", qty: 4, emptied: true },
      ],
    });
    expect(amountOf(after, "black-tea")).toBe(95);
    expect(after.pantry["sugar"]).toMatchObject({ have: { value: false }, amount: { value: 0 } });
    expect(after.pantry["lemon"]).toBe(before.pantry["lemon"]);
    expect(touched).toMatchObject({ brews: [uuid(1)], picks: [MONDAY], pantry: ["black-tea", "sugar"] });
  });

  it("logs I made this without a pick, outside the office", () => {
    const { state: after, result } = apply(before, logged({ pick: undefined, brew: uuid(2) }));
    expect(result.ok).toBe(true);
    expect(after.brews[uuid(2)]).toMatchObject({ pick: null, office: false });
    expect(after.picks[MONDAY]?.status).toBe("pending");
  });

  it("refuses a second Made it for the same pick", () => {
    const made = apply(before, logged()).state;
    expect(apply(made, logged({ brew: uuid(2) })).result).toEqual({ ok: false, code: "already_made" });
  });

  it("accepts a cup made anyway after a skip, and a different tea than the pick's", () => {
    const skipped = { ...before, picks: { [MONDAY]: pick(MONDAY, { status: "skipped" }) } };
    const { state: after, result } = apply(skipped, logged({ tea: { kind: "blend", code: "002" } }));
    expect(result).toEqual({ ok: true, notes: [{ code: "different_tea", drawn: { kind: "blend", code: "001" } }] });
    expect(after.picks[MONDAY]).toMatchObject({ status: "made", tea: { kind: "blend", code: "001" } });
    expect(after.brews[uuid(1)]?.tea).toEqual({ kind: "blend", code: "002" });
  });

  it("logs a cup on its own when its pick was cancelled or is gone", () => {
    const cancelled = { ...before, picks: { [MONDAY]: pick(MONDAY, { status: "cancelled" }) } };
    const { state: after, result } = apply(cancelled, logged());
    expect(result).toEqual({ ok: true, notes: [{ code: "pick_gone" }] });
    expect(after.picks[MONDAY]?.status).toBe("cancelled");
    expect(after.brews[uuid(1)]?.pick).toBeNull();
    expect(apply({ ...before, picks: {} }, logged()).result).toEqual({ ok: true, notes: [{ code: "pick_gone" }] });
  });

  it("takes nothing from the pantry for a missed-kit pick: the office's tea was used", () => {
    const noKit = {
      ...before,
      picks: { [MONDAY]: pick(MONDAY, { source: "no-kit", tea: { kind: "plain", tea: "black-tea" } }) },
    };
    const { state: after } = apply(noKit, logged({ tea: { kind: "plain", tea: "black-tea" } }));
    expect(after.brews[uuid(1)]?.takes).toEqual([]);
    expect(amountOf(after, "black-tea")).toBe(100);
  });

  it("deducts a plain tea by its tea type", () => {
    const { state: after } = apply(
      before,
      logged({ pick: undefined, tea: { kind: "plain", tea: "black-tea" }, cups: 1 }),
    );
    expect(after.brews[uuid(1)]?.takes).toEqual([{ id: "black-tea", qty: 2.5, emptied: false }]);
  });

  it("refuses a plain tea that can't be brewed plain, instead of throwing (self-review of phase 3)", () => {
    const bags = catalog(
      [blend("001")],
      [
        ingredient("black-tea", { category: "tea", teaType: "black" }),
        ingredient("tea-bags", { category: "tea", teaType: "black", unit: "pieces" }),
      ],
    );
    const command = logged({ pick: undefined, tea: { kind: "plain", tea: "tea-bags" }, cups: 1 });
    expect(applyCommand(before, command, bags, command.at).result).toEqual({ ok: false, code: "unknown_tea" });
  });

  it("refuses a used brew id, an unknown tea and a date after the day it was logged", () => {
    const made = apply(before, logged({ pick: undefined })).state;
    expect(apply(made, logged({ pick: undefined })).result).toEqual({ ok: false, code: "duplicate" });
    expect(apply(before, logged({ tea: { kind: "blend", code: "999" } })).result).toEqual({
      ok: false,
      code: "unknown_tea",
    });
    expect(apply(before, logged({ tea: { kind: "plain", tea: "sugar" } })).result).toEqual({
      ok: false,
      code: "unknown_tea",
    });
    expect(apply(before, logged({ date: "2026-11-24" })).result).toEqual({ ok: false, code: "future_date" });
  });
});

describe("deductions and measurements, in any order (SPEC §3.3)", () => {
  const measure = (amount: number | null, when: number) =>
    command<PantrySet>("pantry.set", { ingredient: "black-tea", amount }, when);
  const start = state({ pantry: { "black-tea": have(100) } });
  const cup = (when: number, n = 1) => logged({ pick: undefined, brew: uuid(n), cups: 1 }, when);

  it("skips a cup that a later measurement already counts", () => {
    const measured = apply(start, measure(40, at(MONDAY, "11:00"))).state;
    const { state: after } = apply(measured, cup(at(MONDAY, "10:00")));
    expect(amountOf(after, "black-tea")).toBe(40);
    expect(after.brews[uuid(1)]?.takes).toEqual([]);
  });

  it("takes a cup's share off an earlier measurement that arrives after it", () => {
    const brewed = apply(start, cup(at(MONDAY, "10:00"))).state;
    expect(amountOf(brewed, "black-tea")).toBe(97.5);
    const { state: after } = apply(brewed, measure(40, at(MONDAY, "09:00")));
    expect(amountOf(after, "black-tea")).toBe(37.5);
    // Undo still puts the cup's share back: no measurement came after it.
    expect(amountOf(apply(after, removal(uuid(1), at(MONDAY, "12:00"))).state, "black-tea")).toBe(40);
  });

  it("ends the same whichever arrives first", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200 }),
        fc.integer({ min: 0, max: 12 * 60 }),
        fc.integer({ min: 0, max: 12 * 60 }),
        (amount, measuredAfter, brewedAfter) => {
          const measuredAt = at(MONDAY, "06:00") + measuredAfter * 60_000;
          const brewedAt = at(MONDAY, "06:00") + brewedAfter * 60_000 + 1;
          const m = measure(amount, measuredAt);
          const b = cup(brewedAt);
          const one = apply(apply(start, m).state, b).state;
          const other = apply(apply(start, b).state, m).state;
          const expected = brewedAt > measuredAt ? Math.max(0, amount - 2.5) : amount;
          expect(amountOf(one, "black-tea")).toBe(expected);
          expect(amountOf(other, "black-tea")).toBe(expected);
        },
      ),
      { seed: 7 },
    );
  });
});

const removal = (brew: string, when: number) => command<BrewRemoved>("brew.removed", { brew }, when);

describe("brew.removed: undo", () => {
  const before = state({
    pantry: { "black-tea": have(100), sugar: have(4) },
    picks: { [MONDAY]: pick(MONDAY) },
  });
  const made = apply(before, logged()).state;

  it("puts back what the cup took, have included, and reopens the pick", () => {
    const { state: after, result, touched } = apply(made, removal(uuid(1), at(MONDAY, "11:00")));
    expect(result).toEqual({ ok: true, notes: [] });
    expect(after.brews[uuid(1)]).toBeUndefined();
    expect(after.picks[MONDAY]).toMatchObject({ status: "pending", brew: null });
    expect(amountOf(after, "black-tea")).toBe(100);
    expect(after.pantry["sugar"]).toMatchObject({ have: { value: true }, amount: { value: 4 } });
    expect(touched).toMatchObject({ brews: [uuid(1)], picks: [MONDAY], pantry: ["black-tea", "sugar"] });
  });

  it("leaves an amount measured since, and says so", () => {
    const measured = apply(
      made,
      command<PantrySet>("pantry.set", { ingredient: "black-tea", amount: 60 }, at(MONDAY, "11:00")),
    ).state;
    const { state: after, result } = apply(measured, removal(uuid(1), at(MONDAY, "12:00")));
    expect(result).toEqual({ ok: true, notes: [{ code: "not_restored", ingredient: "black-tea" }] });
    expect(amountOf(after, "black-tea")).toBe(60);
    expect(amountOf(after, "sugar")).toBe(4);
  });

  it("keeps don't have when the owner changed it since", () => {
    const set = apply(
      made,
      command<PantrySet>("pantry.set", { ingredient: "sugar", have: false }, at(MONDAY, "11:00")),
    ).state;
    expect(apply(set, removal(uuid(1), at(MONDAY, "12:00"))).state.pantry["sugar"]).toMatchObject({
      have: { value: false },
      amount: { value: 4 },
    });
  });

  it("changes nothing for a brew already removed", () => {
    expect(apply(before, removal(uuid(9), at(MONDAY, "12:00"))).result).toEqual({
      ok: true,
      notes: [{ code: "no_change" }],
    });
  });
});

describe("brew.rated", () => {
  const made = apply(state({ pantry: { "black-tea": have() }, picks: { [MONDAY]: pick(MONDAY) } }), logged()).state;
  const rate = (payload: Omit<BrewRated["payload"], "brew">, when: number) =>
    command<BrewRated>("brew.rated", { brew: uuid(1), ...payload }, when);

  it("sets each rating, last writer wins", () => {
    const rated = apply(made, rate({ rating: 5, colleagueRating: 3 }, at(MONDAY, "18:00"))).state;
    expect(rated.brews[uuid(1)]).toMatchObject({ rating: { value: 5 }, colleagueRating: { value: 3 } });
    const late = apply(rated, rate({ rating: 2 }, at(MONDAY, "17:00")));
    expect(late.result).toEqual({ ok: true, notes: [{ code: "no_change" }] });
    expect(apply(rated, rate({ rating: null }, at(MONDAY, "19:00"))).state.brews[uuid(1)]?.rating.value).toBeNull();
  });

  it("refuses a brew it doesn't have", () => {
    expect(apply(made, command<BrewRated>("brew.rated", { brew: uuid(5), rating: 3 }, at(MONDAY))).result).toEqual({
      ok: false,
      code: "not_found",
    });
  });
});

describe("pick.skipped, pick.unskipped and the status table", () => {
  const skip = command<PickSkipped>("pick.skipped", { date: MONDAY }, at(MONDAY, "09:00"));
  const unskip = command<PickUnskipped>("pick.unskipped", { date: MONDAY }, at(MONDAY, "09:30"));
  const withStatus = (status: PickStatus) => state({ picks: { [MONDAY]: pick(MONDAY, { status }) } });

  it("answers each status as the table says", () => {
    const expected: Record<PickStatus, [skip: unknown, unskip: unknown]> = {
      pending: [
        { ok: true, notes: [] },
        { ok: true, notes: [{ code: "no_change" }] },
      ],
      skipped: [
        { ok: true, notes: [{ code: "no_change" }] },
        { ok: true, notes: [] },
      ],
      made: [
        { ok: false, code: "already_made" },
        { ok: false, code: "already_made" },
      ],
      cancelled: [
        { ok: false, code: "cancelled" },
        { ok: false, code: "cancelled" },
      ],
    };
    for (const status of PICK_STATUSES) {
      expect(apply(withStatus(status), skip).result, `skip ${status}`).toEqual(expected[status][0]);
      expect(apply(withStatus(status), unskip).result, `unskip ${status}`).toEqual(expected[status][1]);
    }
    expect(apply(state(), skip).result).toEqual({ ok: false, code: "no_pick" });
  });

  it("lists every move the reducer makes", () => {
    expect(PICK_MOVES).toEqual({
      pending: ["made", "skipped", "cancelled"],
      made: ["pending"],
      skipped: ["pending", "made"],
      cancelled: [],
    });
    expect(canMove("made", "skipped")).toBe(false);
    expect(canMove("cancelled", "pending")).toBe(false);
  });
});

describe("pick.packed", () => {
  const pack = (cups = 3) => command<PickPacked>("pick.packed", { date: MONDAY, cups }, at("2026-11-22", "21:00"));

  it("records the cups packed, again if repacked", () => {
    const packed = apply(state({ picks: { [MONDAY]: pick(MONDAY) } }), pack()).state;
    expect(packed.picks[MONDAY]).toMatchObject({ packedAt: at("2026-11-22", "21:00"), packedCups: 3 });
    expect(apply(packed, pack(1)).state.picks[MONDAY]?.packedCups).toBe(1);
  });

  it("refuses a home pick, one with nothing to pack, and one no longer pending", () => {
    const refusal = (overrides: Parameters<typeof pick>[1]) =>
      apply(state({ picks: { [MONDAY]: pick(MONDAY, overrides) } }), pack()).result;
    expect(refusal({ type: "home" })).toEqual({ ok: false, code: "not_office" });
    expect(refusal({ tea: { kind: "none" } })).toEqual({ ok: false, code: "nothing_to_pack" });
    expect(refusal({ source: "no-kit", tea: { kind: "plain", tea: "black-tea" } })).toEqual({
      ok: false,
      code: "nothing_to_pack",
    });
    expect(refusal({ status: "made" })).toEqual({ ok: false, code: "already_made" });
    expect(refusal({ status: "skipped" })).toEqual({ ok: false, code: "not_pending" });
  });
});

describe("pantry.set", () => {
  const set = (payload: Omit<PantrySet["payload"], "ingredient">, when: number, ingredient = "mint") =>
    command<PantrySet>("pantry.set", { ingredient, ...payload }, when);

  it("merges each field last-writer-wins", () => {
    const first = apply(state(), set({ have: true, amount: 30, atOffice: true }, at(MONDAY, "10:00"))).state;
    const older = apply(first, set({ have: false, amount: 10 }, at(MONDAY, "09:00")));
    expect(older.result).toEqual({ ok: true, notes: [{ code: "no_change" }] });
    const newer = apply(first, set({ amount: 12 }, at(MONDAY, "11:00"))).state;
    expect(newer.pantry["mint"]).toMatchObject({
      have: { value: true },
      amount: { value: 12 },
      atOffice: { value: true },
    });
  });

  it("sets the opened date to that day when have is turned on, unless one is given", () => {
    // 00:30 in Paris on Tuesday is still Monday in UTC: the owner's date is Tuesday.
    const late = apply(state(), set({ have: true }, at("2026-11-24", "00:30"))).state;
    expect(late.pantry["mint"]?.openedOn.value).toBe("2026-11-24");
    const given = apply(state(), set({ have: true, openedOn: "2026-11-20" }, at(MONDAY))).state;
    expect(given.pantry["mint"]?.openedOn.value).toBe("2026-11-20");
    const again = apply(given, set({ have: true }, at("2026-11-25"))).state;
    expect(again.pantry["mint"]?.openedOn.value).toBe("2026-11-20");
  });

  it("refuses an ingredient the content doesn't have", () => {
    expect(apply(state(), set({ have: true }, at(MONDAY), "unicorn-tears")).result).toEqual({
      ok: false,
      code: "unknown_ingredient",
    });
  });

  it("sets a piece of gear to have or don't have, with no opened date (SPEC §2.6)", () => {
    const bought = apply(state(), set({ have: true }, at(MONDAY), "gaiwan"));
    expect(bought.result).toEqual({ ok: true, notes: [] });
    expect(bought.touched.pantry).toEqual(["gaiwan"]);
    expect(bought.state.pantry["gaiwan"]).toMatchObject({
      have: { value: true },
      amount: { value: null },
      openedOn: { value: null },
      atOffice: { value: false },
    });
    const broken = apply(bought.state, set({ have: false }, at("2026-11-24"), "gaiwan")).state;
    expect(broken.pantry["gaiwan"]?.have.value).toBe(false);
  });

  it("refuses an amount, an opened date or the office for a piece of gear", () => {
    for (const payload of [{ amount: 1 }, { amount: null }, { openedOn: MONDAY }, { atOffice: true }]) {
      expect(apply(state(), set({ have: true, ...payload }, at(MONDAY), "gaiwan")).result).toEqual({
        ok: false,
        code: "gear_have_only",
      });
    }
  });
});

describe("blend.marked", () => {
  const mark = (payload: Omit<BlendMarked["payload"], "blend">, when: number, blendCode = "001") =>
    command<BlendMarked>("blend.marked", { blend: blendCode, ...payload }, when);

  it("merges each mark last-writer-wins", () => {
    const starred = apply(state(), mark({ favourite: true, notForMe: true }, at(MONDAY, "10:00"))).state;
    const later = apply(starred, mark({ notForMe: false }, at(MONDAY, "11:00"))).state;
    expect(later.marks["001"]).toMatchObject({ favourite: { value: true }, notForMe: { value: false } });
    expect(apply(later, mark({ notForMe: true }, at(MONDAY, "10:30"))).state.marks["001"]?.notForMe.value).toBe(false);
  });

  it("refuses a blend the content doesn't have", () => {
    expect(apply(state(), mark({ favourite: true }, at(MONDAY), "999")).result).toEqual({
      ok: false,
      code: "unknown_blend",
    });
  });
});

describe("clock skew (SPEC §3.3)", () => {
  it("takes a command more than a day ahead of the clock as the clock's time", () => {
    const now = at(MONDAY, "10:00");
    const ahead = command<PantrySet>("pantry.set", { ingredient: "mint", have: true }, now + 3 * 86_400_000);
    expect(applyCommand(state(), ahead, content, now).state.pantry["mint"]?.have.at).toBe(now);
    const slightly = command<PantrySet>("pantry.set", { ingredient: "mint", have: true }, now + 3_600_000);
    expect(applyCommand(state(), slightly, content, now).state.pantry["mint"]?.have.at).toBe(now + 3_600_000);
  });
});

describe("parseCommand", () => {
  const valid = {
    id: "33333333-3333-4333-8333-333333333333",
    v: 1,
    at: 1_790_000_000_000,
    type: "pantry.set",
    payload: { ingredient: "mint", have: true, amount: null },
  };

  it("accepts a well-formed command", () => {
    expect(parseCommand(valid)).toEqual({ ok: true, command: valid });
    const brewCommand = {
      ...valid,
      type: "brew.logged",
      payload: { brew: uuid(1), tea: { kind: "plain", tea: "black-tea" }, cups: 1, date: MONDAY },
    };
    expect(parseCommand(brewCommand).ok).toBe(true);
  });

  it("refuses unknown fields, missing ones and wrong values, naming them", () => {
    const problem = (raw: unknown) => {
      const parsed = parseCommand(raw);
      return parsed.ok ? null : parsed.problem;
    };
    expect(problem({ ...valid, extra: 1 })).toBe("unknown field: extra");
    expect(problem({ ...valid, id: "not-a-uuid" })).toBe("id: must be a lowercase UUID");
    expect(problem({ ...valid, type: "pantry.burnt" })).toBe('type: unknown command "pantry.burnt"');
    expect(problem({ ...valid, payload: { ingredient: "mint", colour: "green" } })).toBe(
      "payload.colour: unknown field",
    );
    expect(problem({ ...valid, payload: { have: true } })).toBe("payload.ingredient: missing");
    expect(problem({ ...valid, payload: { ingredient: "mint" } })).toBe("payload: pantry.set must change something");
    expect(problem({ ...valid, payload: { ingredient: "mint", amount: -1 } })).toMatch(
      /^payload.amount: must be an amount/,
    );
    expect(problem({ ...valid, type: "brew.rated", payload: { brew: uuid(1), rating: 6 } })).toMatch(
      /^payload.rating:/,
    );
    expect(problem({ ...valid, type: "pick.packed", payload: { date: MONDAY, cups: 0 } })).toMatch(/^payload.cups:/);
    expect(problem({ ...valid, type: "pick.skipped", payload: { date: "2026-02-30" } })).toMatch(/^payload.date:/);
    expect(
      problem({
        ...valid,
        type: "brew.logged",
        payload: { brew: uuid(1), tea: { kind: "blend", code: "17" }, cups: 1, date: MONDAY },
      }),
    ).toMatch(/^payload.tea:/);
    expect(problem("pantry.set")).toBe("a command must be an object");
  });

  it("tells a command from a newer app apart", () => {
    expect(parseCommand({ ...valid, v: 2 })).toMatchObject({ ok: false, code: "unsupported_version" });
  });
});
