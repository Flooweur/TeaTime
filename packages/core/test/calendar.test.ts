import { describe, expect, it } from "vitest";
import { type Week, dayOf, inSeason, poolOf, seasonOf, teaDayType } from "../src/index.js";

// 2026-11-23 is a Monday.
const week: Week = { officeDays: [1, 2, 3], overrides: {}, away: [] };

describe("dayOf (SPEC §2.1)", () => {
  it("gives the office weekdays and the home ones", () => {
    expect(dayOf("2026-11-23", week)).toEqual({ kind: "tea", type: "office" });
    expect(dayOf("2026-11-25", week)).toEqual({ kind: "tea", type: "office" });
    expect(dayOf("2026-11-26", week)).toEqual({ kind: "tea", type: "home" });
    expect(dayOf("2026-11-27", week)).toEqual({ kind: "tea", type: "home" });
  });

  it("has no tea at the weekend, whatever the overrides say", () => {
    const overridden: Week = { ...week, overrides: { "2026-11-28": "office" } };
    expect(dayOf("2026-11-28", overridden)).toEqual({ kind: "off", why: "weekend" });
    expect(dayOf("2026-11-29", week)).toEqual({ kind: "off", why: "weekend" });
  });

  it("lets an override change a day, and an away period win over it", () => {
    const overridden: Week = { ...week, overrides: { "2026-11-23": "home", "2026-11-26": "office" } };
    expect(teaDayType("2026-11-23", overridden)).toBe("home");
    expect(teaDayType("2026-11-26", overridden)).toBe("office");
    const away: Week = { ...overridden, away: [{ id: "a", from: "2026-11-26", to: "2026-11-27" }] };
    expect(dayOf("2026-11-26", away)).toEqual({ kind: "off", why: "away" });
    expect(dayOf("2026-11-27", away)).toEqual({ kind: "off", why: "away" });
    expect(teaDayType("2026-11-25", away)).toBe("office");
  });

  it("includes both ends of an away period", () => {
    const away: Week = { ...week, away: [{ id: "a", from: "2026-11-24", to: "2026-11-24" }] };
    expect(teaDayType("2026-11-23", away)).toBe("office");
    expect(teaDayType("2026-11-24", away)).toBeNull();
    expect(teaDayType("2026-11-25", away)).toBe("office");
  });

  it("draws office days from the safe pool and home days from the experimental one", () => {
    expect(poolOf("office")).toBe("safe");
    expect(poolOf("home")).toBe("experimental");
  });
});

describe("seasons", () => {
  it("follows the meteorological seasons of the northern hemisphere", () => {
    const cases: [string, string][] = [
      ["2026-11-30", "autumn"],
      ["2026-12-01", "winter"],
      ["2027-02-28", "winter"],
      ["2028-02-29", "winter"],
      ["2027-03-01", "spring"],
      ["2027-05-31", "spring"],
      ["2027-06-01", "summer"],
      ["2027-08-31", "summer"],
      ["2027-09-01", "autumn"],
    ];
    for (const [date, season] of cases) expect(seasonOf(date), date).toBe(season);
  });

  it("counts a blend without season tags as in season all year", () => {
    expect(inSeason([], "2026-07-01")).toBe(true);
    expect(inSeason(["winter"], "2026-12-15")).toBe(true);
    expect(inSeason(["winter", "autumn"], "2026-07-01")).toBe(false);
  });

  it("refuses what isn't a date", () => {
    expect(() => seasonOf("2026-13-01")).toThrow(RangeError);
  });
});
