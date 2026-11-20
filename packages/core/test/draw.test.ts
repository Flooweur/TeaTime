import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  type Blend,
  type DrawRequest,
  type Marks,
  NO_MARKS,
  type State,
  blendHistories,
  drawPick,
  drawableBlends,
  isMakeable,
  poolOf,
  scaleRecipe,
  stockFor,
} from "../src/index.js";
import { blend, brew, brews, catalog, have, pick, state } from "./fixtures.js";

// Sunday evening, drawing Monday's office tea.
const TODAY = "2026-11-22";
const MONDAY = "2026-11-23";
const first: DrawRequest = { date: MONDAY, type: "office", timing: "evening", reason: "first", attempt: 0 };

const marks = (m: Partial<Record<keyof Marks, boolean>>): Marks => ({
  favourite: { value: m.favourite ?? false, at: 1 },
  makeAgain: { value: m.makeAgain ?? false, at: 1 },
  notForMe: { value: m.notForMe ?? false, at: 1 },
});

const withTea = (parts: Partial<State> = {}) => state({ pantry: { "black-tea": have() }, ...parts });

function drawn(s: State, content: ReturnType<typeof catalog>, request: Partial<DrawRequest> = {}) {
  const outcome = drawPick(s, content, TODAY, { ...first, ...request });
  return outcome.kind === "blend" ? outcome.code : outcome.kind;
}

describe("the rules that always hold (SPEC §2.3, step 1)", () => {
  it("draws from the day's pool only", () => {
    const content = catalog([blend("001", { mode: "experimental" }), blend("002")]);
    expect(drawn(withTea(), content)).toBe("002");
    expect(drawn(withTea(), content, { type: "home" })).toBe("001");
  });

  it("never draws a retired blend, one marked Not for me, or one last rated 1–2", () => {
    const content = catalog([blend("001", { retired: true }), blend("002"), blend("003"), blend("004")]);
    const s = withTea({
      marks: { "002": marks({ notForMe: true }) },
      brews: brews(brew("003", "2026-10-01", { rating: { value: 2, at: 1 } })),
    });
    expect(drawn(s, content)).toBe("004");
  });

  it("brings back a blend rated 1–2 when it is marked make again", () => {
    const content = catalog([blend("001")]);
    const low = brews(brew("001", "2026-10-01", { rating: { value: 1, at: 1 } }));
    expect(drawn(withTea({ brews: low }), content)).toBe("plain");
    expect(drawn(withTea({ brews: low, marks: { "001": marks({ makeAgain: true }) } }), content)).toBe("001");
  });

  it("uses the last rating: a later good one lifts an earlier bad one", () => {
    const content = catalog([blend("001")]);
    const history = brews(
      brew("001", "2026-09-01", { rating: { value: 1, at: 1 } }),
      brew("001", "2026-10-01", { rating: { value: 4, at: 1 } }),
      brew("001", "2026-10-15"),
    );
    expect(blendHistories(Object.values(history)).get("001")).toEqual({ lastMadeOn: "2026-10-15", lastRating: 4 });
    expect(drawn(withTea({ brews: history }), content)).toBe("001");
  });

  it("skips a blend held by another pending pick from today on, but not by a past one", () => {
    const content = catalog([blend("001"), blend("002")]);
    const tomorrowHolds = withTea({
      picks: { "2026-11-24": pick("2026-11-24", { tea: { kind: "blend", code: "001" } }) },
    });
    for (let attempt = 0; attempt < 10; attempt++) expect(drawn(tomorrowHolds, content, { attempt })).toBe("002");
    const pastHolds = withTea({ picks: { "2026-11-20": pick("2026-11-20", { tea: { kind: "blend", code: "001" } }) } });
    const outcomes = new Set(Array.from({ length: 20 }, (_, attempt) => drawn(pastHolds, content, { attempt })));
    expect(outcomes).toEqual(new Set(["001", "002"]));
  });

  it("sets aside what other pending picks hold before judging enough", () => {
    const greenBlend = blend("002", {
      ingredients: [{ id: "green-tea", qty: 2, unit: "g", optional: false, role: "base" }],
    });
    const content = catalog([blend("001"), greenBlend, blend("003")]);
    // 2 cups at the office: 001 and 003 each need 5 g of black tea. Tuesday's pick of 003 holds 5 of the 7 g.
    const s = state({
      pantry: { "black-tea": have(7), "green-tea": have() },
      picks: { "2026-11-24": pick("2026-11-24", { tea: { kind: "blend", code: "003" } }) },
      marks: { "002": marks({ favourite: true }) },
      brews: brews(brew("002", "2026-11-01")),
    });
    expect(isMakeable(scaleRecipe(content.blendByCode.get("001")!, 2), stockFor(s, content, TODAY, MONDAY))).toBe(
      false,
    );
    // 001, never made, would come before 002; it can't be made once Tuesday's share is set aside.
    for (let attempt = 0; attempt < 10; attempt++) expect(drawn(s, content, { attempt })).toBe("002");
    const greenHold = { ...s, picks: { "2026-11-24": pick("2026-11-24", { tea: { kind: "blend", code: "002" } }) } };
    expect(drawn(greenHold, content)).not.toBe("002");
  });

  it("never draws a blend to start the evening before in a same-day draw", () => {
    const content = catalog([blend("001", { prep: "evening" }), blend("002")]);
    for (let attempt = 0; attempt < 10; attempt++) {
      expect(drawn(withTea(), content, { timing: "same-day", reason: "redraw", attempt })).toBe("002");
    }
    const overnightOnly = catalog([blend("001", { prep: "evening" })]);
    expect(drawn(withTea(), overnightOnly)).toBe("001");
    expect(drawn(withTea(), overnightOnly, { timing: "same-day", reason: "redraw" })).toBe("plain");
  });

  it("never draws the blend a swap replaces", () => {
    const content = catalog([blend("001"), blend("002")]);
    for (let attempt = 1; attempt < 10; attempt++) {
      expect(drawn(withTea(), content, { reason: "swap", replacing: "001", attempt })).toBe("002");
    }
  });
});

describe("the order and the soft filters (SPEC §2.3, steps 2–3)", () => {
  const content = catalog([blend("001"), blend("002"), blend("003"), blend("004", { seasons: ["summer"] })]);
  const favourite = brew("001", "2026-09-01", { rating: { value: 5, at: 1 } });
  const other = brew("003", "2026-09-01", { rating: { value: 3, at: 1 } });

  it("takes never made, then favourites, then the others, in season first", () => {
    const s = withTea({ brews: brews(favourite, other) });
    expect(drawPick(s, content, TODAY, first)).toEqual({
      kind: "blend",
      code: "002",
      level: "strict",
      group: "new",
      inSeason: true,
    });
    const no002 = { ...s, marks: { "002": marks({ notForMe: true }) } };
    expect(drawPick(no002, content, TODAY, first)).toMatchObject({ code: "001", group: "favourite", inSeason: true });
    const no001 = { ...no002, marks: { ...no002.marks, "001": marks({ notForMe: true }) } };
    expect(drawPick(no001, content, TODAY, first)).toMatchObject({ code: "003", group: "other", inSeason: true });
    const no003 = { ...no001, marks: { ...no001.marks, "003": marks({ notForMe: true }) } };
    expect(drawPick(no003, content, TODAY, first)).toMatchObject({ code: "004", group: "new", inSeason: false });
  });

  it("counts a ★ or make again as a favourite, whatever the rating", () => {
    const s = withTea({
      brews: brews(brew("001", "2026-08-01"), brew("003", "2026-09-01", { rating: { value: 3, at: 1 } })),
      marks: { "002": marks({ notForMe: true }), "003": marks({ favourite: true }) },
    });
    // 001 is older but unrated; 003, starred, is a favourite and comes first.
    expect(drawPick(s, content, TODAY, first)).toMatchObject({ code: "003", group: "favourite" });
  });

  it("among made blends, draws the one made longest ago", () => {
    const s = withTea({
      brews: brews(
        brew("001", "2026-10-01", { rating: { value: 4, at: 1 } }),
        brew("003", "2026-09-15", { rating: { value: 5, at: 1 } }),
      ),
      marks: { "002": marks({ notForMe: true }) },
    });
    for (let attempt = 0; attempt < 10; attempt++) expect(drawn(s, content, { attempt })).toBe("003");
  });

  it("breaks a tie between equally old blends with the seed", () => {
    const s = withTea({
      brews: brews(
        brew("001", "2026-09-01", { rating: { value: 4, at: 1 } }),
        brew("003", "2026-09-01", { rating: { value: 4, at: 1 } }),
      ),
      marks: { "002": marks({ notForMe: true }), "004": marks({ notForMe: true }) },
    });
    const outcomes = new Set(Array.from({ length: 20 }, (_, attempt) => drawn(s, content, { attempt })));
    expect(outcomes).toEqual(new Set(["001", "003"]));
  });

  it("rests a skipped or swapped-away blend 7 days, then lets it back", () => {
    const only = catalog([blend("001"), blend("002")]);
    const skipped = (date: string) =>
      withTea({ picks: { [date]: pick(date, { tea: { kind: "blend", code: "002" }, status: "skipped" }) } });
    // Skipped on 11-17: 6 days before Monday, so it rests; 001, also never made, wins.
    for (let attempt = 0; attempt < 10; attempt++) expect(drawn(skipped("2026-11-17"), only, { attempt })).toBe("001");
    // Skipped on 11-16: 7 days before, so the rest is over.
    const back = new Set(Array.from({ length: 20 }, (_, attempt) => drawn(skipped("2026-11-16"), only, { attempt })));
    expect(back).toEqual(new Set(["001", "002"]));
    const swapped = withTea({ picks: { "2026-11-20": pick("2026-11-20", { swappedFrom: "002" }) } });
    for (let attempt = 0; attempt < 10; attempt++) expect(drawn(swapped, only, { attempt })).toBe("001");
  });

  it("relaxes the rest before giving up on a resting blend", () => {
    const only = catalog([blend("002")]);
    const s = withTea({
      picks: { "2026-11-20": pick("2026-11-20", { tea: { kind: "blend", code: "002" }, status: "skipped" }) },
    });
    expect(drawPick(s, only, TODAY, first)).toMatchObject({ code: "002", level: "no-rest" });
  });

  it("keeps a made blend back for the cooldown, then brings back the oldest, favourites first", () => {
    const pair = catalog([blend("001"), blend("003")]);
    const cooling = withTea({
      brews: brews(
        brew("001", "2026-11-15", { rating: { value: 5, at: 1 } }),
        brew("003", "2026-11-10", { rating: { value: 3, at: 1 } }),
      ),
    });
    expect(drawPick(cooling, pair, TODAY, first)).toMatchObject({
      code: "001",
      level: "no-cooldown",
      group: "favourite",
    });
    // 21 days after 11-02 is Monday: the cooldown is over for 003, still on for 001.
    const oneBack = withTea({
      brews: brews(
        brew("001", "2026-11-15", { rating: { value: 5, at: 1 } }),
        brew("003", "2026-11-02", { rating: { value: 3, at: 1 } }),
      ),
    });
    expect(drawPick(oneBack, pair, TODAY, first)).toMatchObject({ code: "003", level: "strict", group: "other" });
    expect(
      drawPick({ ...cooling, settings: { ...cooling.settings, cooldownDays: 0 } }, pair, TODAY, first),
    ).toMatchObject({
      level: "strict",
    });
  });

  it("is deterministic: the same state and attempt give the same blend", () => {
    const many = catalog(["001", "002", "003", "004", "005", "006"].map((code) => blend(code)));
    for (let attempt = 0; attempt < 10; attempt++) {
      expect(drawPick(withTea(), many, TODAY, { ...first, attempt })).toEqual(
        drawPick(withTea(), many, TODAY, { ...first, attempt }),
      );
    }
    const spread = new Set(Array.from({ length: 30 }, (_, attempt) => drawn(withTea(), many, { attempt })));
    expect(spread.size).toBeGreaterThan(2);
  });
});

describe("the fallbacks (SPEC §2.5)", () => {
  const minty = (code: string) =>
    blend(code, { ingredients: [{ id: "mint", qty: 4, unit: "g", optional: false, role: "base" }] });
  const content = catalog([minty("001"), minty("002")]);

  it("brews a plain tea when no blend can be made, and names the purchase that unlocks most", () => {
    const s = state({ pantry: { "black-tea": have(100), oolong: have() } });
    expect(drawPick(s, content, TODAY, first)).toEqual({ kind: "plain", tea: "black-tea", unlock: "mint" });
  });

  it("picks the plain tea to use soon first, then the one with most left, an untracked amount last", () => {
    const pantry = {
      "black-tea": have(100),
      "green-tea": have(30, { openedOn: "2026-01-01" }),
      oolong: have(),
    };
    expect(drawPick(state({ pantry }), content, TODAY, first)).toMatchObject({ tea: "green-tea" });
    const { ["green-tea"]: _, ...rest } = pantry;
    expect(drawPick(state({ pantry: rest }), content, TODAY, first)).toMatchObject({ tea: "black-tea" });
    expect(drawPick(state({ pantry: { oolong: have() } }), content, TODAY, first)).toMatchObject({ tea: "oolong" });
  });

  it("says what to buy when there is no tea at all", () => {
    expect(drawPick(state(), content, TODAY, first)).toEqual({ kind: "nothing", unlock: "mint" });
  });

  it("offers a tea kept at the office when an office day is first drawn on the day, so no kit was packed", () => {
    const atOffice = { ...have(0), atOffice: { value: true, at: 1 }, have: { value: false, at: 1 } };
    const s = state({ pantry: { "black-tea": have(100), "green-tea": atOffice } });
    const sameDay: DrawRequest = { ...first, timing: "same-day" };
    expect(drawPick(s, content, MONDAY, sameDay)).toEqual({ kind: "no-kit", tea: "green-tea" });
    expect(drawPick(state({ pantry: { "black-tea": have(100) } }), content, MONDAY, sameDay)).toEqual({
      kind: "no-kit",
      tea: null,
    });
    // A swap or a redraw on the day isn't a missed kit: it draws as usual.
    const plain = catalog([blend("003")]);
    expect(drawPick(s, plain, MONDAY, { ...sameDay, reason: "redraw", attempt: 1 })).toMatchObject({ code: "003" });
    // A home day drawn on the day draws as usual too.
    expect(
      drawPick(s, catalog([blend("004", { mode: "experimental" })]), MONDAY, { ...sameDay, type: "home" }),
    ).toMatchObject({
      code: "004",
    });
  });
});

describe("the draw's invariants over random states", () => {
  const INGREDIENT_IDS = ["black-tea", "green-tea", "mint", "sugar"] as const;
  const CODES = ["001", "002", "003", "004", "005", "006", "007", "008"];
  const DATES = ["2026-09-01", "2026-10-15", "2026-11-05", "2026-11-18", "2026-11-21"];

  const arbBlend = (code: string) =>
    fc
      .record({
        mode: fc.constantFrom("safe" as const, "experimental" as const),
        ids: fc.subarray([...INGREDIENT_IDS], { minLength: 1 }),
        prep: fc.constantFrom("none" as const, "evening" as const),
        seasons: fc.subarray(["spring", "summer", "autumn", "winter"] as const, { maxLength: 2 }),
      })
      .map(({ mode, ids, prep, seasons }) =>
        blend(code, {
          mode,
          prep,
          seasons,
          ingredients: ids.map((id) => ({
            id,
            qty: 2,
            unit: "g" as const,
            optional: id === "sugar",
            role: "base" as const,
          })),
        }),
      );

  const arbWorld = fc.record({
    blends: fc.tuple(...CODES.map(arbBlend)),
    pantry: fc.dictionary(
      fc.constantFrom(...INGREDIENT_IDS),
      fc
        .oneof(fc.constant(null), fc.integer({ min: 0, max: 12 }))
        .map((amount) => have(amount, { openedOn: "2026-11-01" })),
    ),
    made: fc.array(
      fc.record({
        code: fc.constantFrom(...CODES),
        date: fc.constantFrom(...DATES),
        rating: fc.constantFrom(null, 1, 2, 3, 4, 5),
      }),
    ),
    notForMe: fc.subarray(CODES),
    holds: fc.subarray(CODES, { maxLength: 3 }),
    request: fc.record({
      type: fc.constantFrom("office" as const, "home" as const),
      timing: fc.constantFrom("evening" as const, "same-day" as const),
      reason: fc.constantFrom("first" as const, "swap" as const, "redraw" as const),
      attempt: fc.nat({ max: 5 }),
    }),
  });

  it("only ever draws a blend of the pool, drawable, not held and makeable; and does so the same way twice", () => {
    fc.assert(
      fc.property(arbWorld, (world) => {
        const content = catalog(world.blends as Blend[]);
        const holdDates = ["2026-11-24", "2026-11-25", "2026-11-26"];
        const s = state({
          pantry: world.pantry,
          brews: brews(
            ...world.made.map(({ code, date, rating }) =>
              brew(code, date, { rating: { value: rating as never, at: 1 } }),
            ),
          ),
          marks: Object.fromEntries(
            world.notForMe.map((code) => [code, { ...NO_MARKS, notForMe: { value: true, at: 1 } }]),
          ),
          picks: Object.fromEntries(
            world.holds.map((code, i) => [holdDates[i], pick(holdDates[i]!, { tea: { kind: "blend", code } })]),
          ),
        });
        const request: DrawRequest = { date: MONDAY, ...world.request };
        const outcome = drawPick(s, content, TODAY, request);
        expect(drawPick(s, content, TODAY, request)).toEqual(outcome);
        if (outcome.kind !== "blend") return;
        const chosen = content.blendByCode.get(outcome.code)!;
        expect(chosen.mode).toBe(poolOf(request.type));
        expect(drawableBlends(s, content, chosen.mode).map((b) => b.code)).toContain(chosen.code);
        expect(world.holds).not.toContain(chosen.code);
        expect(
          isMakeable(scaleRecipe(chosen, request.type === "office" ? 2 : 1), stockFor(s, content, TODAY, MONDAY)),
        ).toBe(true);
        if (request.timing === "same-day") expect(chosen.prep).toBe("none");
        if (request.reason === "first" && request.timing === "same-day") expect(request.type).toBe("home");
      }),
      { numRuns: 500, seed: 2026 },
    );
  });
});
