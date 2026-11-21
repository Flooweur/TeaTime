import { describe, expect, it } from "vitest";
import {
  type OnlineResult,
  type State,
  addAway,
  drawDue,
  drawNow,
  removeAway,
  setOverride,
  swapPick,
  updateSettings,
} from "../src/index.js";
import { at, blend, catalog, have, pick, state } from "./fixtures.js";

// Office days are Monday to Wednesday. 2026-11-22 is a Sunday.
const SUNDAY = "2026-11-22";
const MONDAY = "2026-11-23";
const TUESDAY = "2026-11-24";
const THURSDAY = "2026-11-26";

const content = catalog([
  blend("001"),
  blend("002"),
  blend("003"),
  blend("101", { mode: "experimental" }),
  blend("102", { mode: "experimental" }),
]);
const stocked = state({ pantry: { "black-tea": have() } });

function ok(result: OnlineResult): State {
  if (!result.ok) throw new Error(`refused: ${JSON.stringify(result)}`);
  return result.state;
}

const blendOf = (s: State, date: string) => {
  const tea = s.picks[date]?.tea;
  return tea?.kind === "blend" ? tea.code : tea?.kind;
};

describe("drawDue (SPEC §2.2)", () => {
  it("draws tomorrow once the evening time has come, Sunday evening included", () => {
    expect(drawDue(stocked, content, at(SUNDAY, "20:29")).state.picks).toEqual({});
    const { state: after, touched } = drawDue(stocked, content, at(SUNDAY, "20:30"));
    expect(Object.keys(after.picks)).toEqual([MONDAY]);
    expect(after.picks[MONDAY]).toMatchObject({ type: "office", source: "draw", status: "pending", attempt: 0 });
    expect(touched.picks).toEqual([MONDAY]);
    expect(["001", "002", "003"]).toContain(blendOf(after, MONDAY));
  });

  it("draws nothing for a weekend or an away day", () => {
    // Friday evening: Friday itself, missed, is drawn on the day; Saturday has no tea.
    expect(Object.keys(drawDue(stocked, content, at("2026-11-27", "21:00")).state.picks)).toEqual(["2026-11-27"]);
    const away = { ...stocked, away: [{ id: "trip", from: MONDAY, to: MONDAY }] };
    expect(drawDue(away, content, at(SUNDAY, "21:00")).state.picks).toEqual({});
  });

  it("draws a missed day on the day itself, and a missed office kit as a no-kit card", () => {
    const { state: after } = drawDue(stocked, content, at(MONDAY, "07:00"));
    expect(after.picks[MONDAY]).toMatchObject({ source: "no-kit", tea: { kind: "none" } });
    const home = drawDue(stocked, content, at(THURSDAY, "07:00")).state;
    expect(home.picks[THURSDAY]).toMatchObject({ type: "home", source: "draw" });
  });

  it("is idempotent: a drawn date keeps its pick", () => {
    const once = drawDue(stocked, content, at(SUNDAY, "20:30")).state;
    const twice = drawDue(once, content, at(SUNDAY, "21:00"));
    expect(twice.state).toBe(once);
    expect(twice.touched.picks).toEqual([]);
  });

  it("draws today before tomorrow, so tomorrow can't take today's blend", () => {
    const one = { ...stocked, picks: {} };
    const only = catalog([blend("001"), blend("002")]);
    const after = drawDue(one, only, at(MONDAY, "21:00")).state;
    // Monday is drawn on the day (no kit), so it holds nothing; Tuesday draws a blend.
    expect(after.picks[MONDAY]?.source).toBe("no-kit");
    expect(after.picks[TUESDAY]?.source).toBe("draw");
  });
});

describe("drawNow: Draw tomorrow's tea now", () => {
  it("draws tomorrow from 17:00, not before", () => {
    expect(drawNow(stocked, content, at(SUNDAY, "16:59"), MONDAY)).toEqual({ ok: false, code: "too_early" });
    expect(ok(drawNow(stocked, content, at(SUNDAY, "17:00"), MONDAY)).picks[MONDAY]?.source).toBe("draw");
  });

  it("draws from the evening time when it is set before 17:00", () => {
    const early = { ...stocked, settings: { ...stocked.settings, eveningTime: "16:00" } };
    expect(drawNow(early, content, at(SUNDAY, "16:00"), MONDAY).ok).toBe(true);
  });

  it("returns a drawn pick as it is", () => {
    const drawn = ok(drawNow(stocked, content, at(SUNDAY, "18:00"), MONDAY));
    const again = drawNow(drawn, content, at(SUNDAY, "18:05"), MONDAY);
    expect(again).toMatchObject({ ok: true, state: drawn });
  });

  it("draws a home day early only once the evening time has come (self-review of phase 3)", () => {
    expect(drawNow(stocked, content, at("2026-11-25", "18:00"), THURSDAY)).toEqual({ ok: false, code: "not_office" });
    expect(ok(drawNow(stocked, content, at("2026-11-25", "20:30"), THURSDAY)).picks[THURSDAY]?.type).toBe("home");
  });

  it("refuses the past, days further ahead, and days without tea", () => {
    expect(drawNow(stocked, content, at(MONDAY), SUNDAY)).toEqual({ ok: false, code: "past_date" });
    expect(drawNow(stocked, content, at(SUNDAY, "18:00"), TUESDAY)).toEqual({ ok: false, code: "not_drawable" });
    expect(drawNow(stocked, content, at("2026-11-27", "18:00"), "2026-11-28")).toEqual({
      ok: false,
      code: "not_a_tea_day",
    });
    expect(drawNow(stocked, content, at(SUNDAY), "tomorrow")).toMatchObject({ ok: false, code: "invalid" });
  });
});

describe("swapPick (SPEC §2.4)", () => {
  const drawn = drawDue(stocked, content, at(SUNDAY, "20:30")).state;
  const current = drawn.picks[MONDAY]!.tea;

  it("draws another blend, which rests the replaced one, once per pick", () => {
    const swapped = ok(swapPick(drawn, content, at(SUNDAY, "21:00"), MONDAY, current));
    const pick = swapped.picks[MONDAY]!;
    expect(pick.tea).not.toEqual(current);
    expect(pick).toMatchObject({ source: "draw", attempt: 1, swappedFrom: blendOf(drawn, MONDAY) });
    expect(swapPick(swapped, content, at(SUNDAY, "21:05"), MONDAY, pick.tea)).toEqual({ ok: false, code: "swap_used" });
  });

  it("returns the pick as it is when the app's tea is out of date: a retry after a lost answer", () => {
    const swapped = ok(swapPick(drawn, content, at(SUNDAY, "21:00"), MONDAY, current));
    expect(swapPick(swapped, content, at(SUNDAY, "21:01"), MONDAY, current)).toMatchObject({
      ok: true,
      state: swapped,
    });
  });

  it("refuses a packed office kit", () => {
    const packed = {
      ...drawn,
      picks: { [MONDAY]: { ...drawn.picks[MONDAY]!, packedAt: at(SUNDAY, "20:45"), packedCups: 2 } },
    };
    expect(swapPick(packed, content, at(SUNDAY, "21:00"), MONDAY, current)).toEqual({ ok: false, code: "packed" });
  });

  it("refuses when there is no other blend to swap to", () => {
    const lonely = catalog([blend("001")]);
    const s = drawDue(stocked, lonely, at(SUNDAY, "20:30")).state;
    expect(swapPick(s, lonely, at(SUNDAY, "21:00"), MONDAY, { kind: "blend", code: "001" })).toEqual({
      ok: false,
      code: "nothing_else",
    });
  });

  it("gives a free redraw, not counted as the swap, to a pick the pantry can no longer make", () => {
    const greenOnly = catalog([
      blend("001", { ingredients: [{ id: "green-tea", qty: 2, unit: "g", optional: false, role: "base" }] }),
      blend("002"),
    ]);
    const s = state({
      pantry: { "black-tea": have() },
      picks: { [MONDAY]: pick(MONDAY, { tea: { kind: "blend", code: "001" }, swappedFrom: "003" }) },
    });
    const redrawn = ok(swapPick(s, greenOnly, at(SUNDAY, "21:00"), MONDAY, { kind: "blend", code: "001" }));
    expect(redrawn.picks[MONDAY]).toMatchObject({
      tea: { kind: "blend", code: "002" },
      swappedFrom: "003",
      attempt: 1,
    });
  });

  it("gives a free redraw to a pick whose gear the owner no longer has", () => {
    const gaiwanOnly = catalog([blend("001", { gear: [{ id: "gaiwan", optional: false }] }), blend("002")]);
    const s = state({
      pantry: { "black-tea": have(), gaiwan: { ...have(), have: { value: false, at: 2 } } },
      picks: { [MONDAY]: pick(MONDAY, { tea: { kind: "blend", code: "001" }, swappedFrom: "003" }) },
    });
    const redrawn = ok(swapPick(s, gaiwanOnly, at(SUNDAY, "21:00"), MONDAY, { kind: "blend", code: "001" }));
    expect(redrawn.picks[MONDAY]).toMatchObject({ tea: { kind: "blend", code: "002" }, swappedFrom: "003" });
  });

  it("redraws a plain-tea fallback for free once a blend can be made", () => {
    const s = state({
      pantry: { "black-tea": have() },
      picks: {
        [MONDAY]: pick(MONDAY, { tea: { kind: "plain", tea: "black-tea" }, source: "fallback", swappedFrom: "003" }),
      },
    });
    const redrawn = ok(swapPick(s, content, at(SUNDAY, "21:00"), MONDAY, { kind: "plain", tea: "black-tea" }));
    expect(redrawn.picks[MONDAY]?.source).toBe("draw");
    const nothing = catalog([
      blend("009", { ingredients: [{ id: "mint", qty: 1, unit: "g", optional: false, role: "base" }] }),
    ]);
    expect(swapPick(s, nothing, at(SUNDAY, "21:00"), MONDAY, { kind: "plain", tea: "black-tea" })).toEqual({
      ok: false,
      code: "nothing_else",
    });
  });

  it("refuses a pick that isn't pending, a past one, and a date without a pick", () => {
    const made = { ...drawn, picks: { [MONDAY]: { ...drawn.picks[MONDAY]!, status: "made" as const } } };
    expect(swapPick(made, content, at(SUNDAY, "21:00"), MONDAY, current)).toEqual({ ok: false, code: "not_pending" });
    expect(swapPick(drawn, content, at(TUESDAY), MONDAY, current)).toEqual({ ok: false, code: "past_date" });
    expect(swapPick(drawn, content, at(SUNDAY, "21:00"), TUESDAY, current)).toEqual({ ok: false, code: "no_pick" });
  });
});

describe("changing the days re-checks the pending picks (SPEC §2.4)", () => {
  const drawn = drawDue(stocked, content, at(SUNDAY, "20:30")).state;

  it("redraws a pick from the new pool when an override changes its day type", () => {
    const home = ok(setOverride(drawn, content, at(SUNDAY, "21:00"), MONDAY, "home"));
    expect(home.overrides).toEqual({ [MONDAY]: "home" });
    expect(home.picks[MONDAY]).toMatchObject({ type: "home", attempt: 1 });
    expect(["101", "102"]).toContain(blendOf(home, MONDAY));
    const back = ok(setOverride(home, content, at(SUNDAY, "21:10"), MONDAY, null));
    expect(back.overrides).toEqual({});
    expect(back.picks[MONDAY]).toMatchObject({ type: "office", attempt: 2 });
  });

  it("redraws today as a safe blend, not a missed kit, when the day turns into an office day (self-review of phase 3)", () => {
    const home = drawDue(stocked, content, at("2026-11-25", "20:30")).state;
    expect(home.picks[THURSDAY]?.type).toBe("home");
    const office = ok(setOverride(home, content, at(THURSDAY, "07:00"), THURSDAY, "office"));
    expect(office.picks[THURSDAY]).toMatchObject({ type: "office", source: "draw" });
    expect(["001", "002", "003"]).toContain(blendOf(office, THURSDAY));
  });

  it("asks before throwing away a packed kit, and does it with confirm", () => {
    const packed = {
      ...drawn,
      picks: { [MONDAY]: { ...drawn.picks[MONDAY]!, packedAt: at(SUNDAY, "20:45"), packedCups: 2 } },
    };
    expect(setOverride(packed, content, at(SUNDAY, "21:00"), MONDAY, "home")).toEqual({
      ok: false,
      code: "packed_kits",
      dates: [MONDAY],
    });
    expect(ok(setOverride(packed, content, at(SUNDAY, "21:00"), MONDAY, "home", true)).picks[MONDAY]?.type).toBe(
      "home",
    );
  });

  it("refuses an override in the past or on a weekend", () => {
    expect(setOverride(drawn, content, at(MONDAY), SUNDAY, "home")).toEqual({ ok: false, code: "past_date" });
    expect(setOverride(drawn, content, at(MONDAY), "2026-11-28", "office")).toEqual({
      ok: false,
      code: "not_a_tea_day",
    });
  });

  it("cancels the picks an away period covers, and draws them again when it is removed", () => {
    const away = ok(addAway(drawn, content, at(SUNDAY, "21:00"), { id: "trip", from: MONDAY, to: TUESDAY }));
    expect(away.picks[MONDAY]?.status).toBe("cancelled");
    const back = removeAway(away, content, at(SUNDAY, "21:30"), "trip");
    expect(back.ok && back.state.picks[MONDAY]).toMatchObject({ status: "pending", attempt: 0 });
    expect(back.ok && back.touched).toMatchObject({ away: ["trip"], picks: [MONDAY] });
  });

  it("refuses an away period that starts in the past or is malformed", () => {
    expect(addAway(drawn, content, at(MONDAY), { id: "late", from: SUNDAY, to: MONDAY })).toEqual({
      ok: false,
      code: "past_date",
    });
    expect(addAway(drawn, content, at(SUNDAY), { id: "", from: TUESDAY, to: MONDAY })).toEqual({
      ok: false,
      code: "invalid",
      problems: ["id: must be a string of 1 to 64 characters", "to: must not be before from"],
    });
    expect(removeAway(drawn, content, at(SUNDAY), "nope")).toEqual({ ok: false, code: "unknown_away" });
    // A malformed body is refused, never thrown on (self-review of phase 3).
    expect(addAway(drawn, content, at(SUNDAY), null)).toMatchObject({ ok: false, code: "invalid" });
    expect(addAway(drawn, content, at(SUNDAY), { id: "x", from: MONDAY, to: MONDAY, colour: "red" })).toEqual({
      ok: false,
      code: "invalid",
      problems: ["colour: unknown field"],
    });
  });

  it("re-checks the pending picks when the office days change", () => {
    const thursday = ok(updateSettings(drawn, content, at(SUNDAY, "21:00"), { officeDays: [2, 3, 4] }));
    expect(thursday.settings.officeDays).toEqual([2, 3, 4]);
    expect(thursday.picks[MONDAY]?.type).toBe("home");
    const result = updateSettings(drawn, content, at(SUNDAY, "21:00"), {
      officeDays: [6],
      eveningTime: "23:00",
      nope: 1,
    });
    expect(result).toEqual({
      ok: false,
      code: "invalid",
      problems: [
        "officeDays: must be distinct weekdays from 1 (Monday) to 5 (Friday)",
        "eveningTime: must be a time from 05:00 to 22:00",
        "nope: not a setting",
      ],
    });
  });

  it("leaves made and skipped picks as they were", () => {
    const made = { ...drawn, picks: { [MONDAY]: { ...drawn.picks[MONDAY]!, status: "made" as const } } };
    const after = ok(addAway(made, content, at(SUNDAY, "21:00"), { id: "trip", from: MONDAY, to: MONDAY }));
    expect(after.picks[MONDAY]?.status).toBe("made");
  });
});
