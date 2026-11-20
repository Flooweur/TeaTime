import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { clockTimeOf, instantAt, isTimeZone, minutesOf, wallClockAt } from "../src/index.js";

const PARIS = "Europe/Paris";
const iso = (ms: number) => new Date(ms).toISOString();

describe("instantAt in Europe/Paris", () => {
  it("reads winter time as UTC+1 and summer time as UTC+2", () => {
    expect(iso(instantAt("2026-11-23", minutesOf("08:00"), PARIS))).toBe("2026-11-23T07:00:00.000Z");
    expect(iso(instantAt("2026-06-15", minutesOf("08:00"), PARIS))).toBe("2026-06-15T06:00:00.000Z");
  });

  it("is right on both sides of the spring change (2026-03-29, 02:00 → 03:00)", () => {
    expect(iso(instantAt("2026-03-28", minutesOf("20:30"), PARIS))).toBe("2026-03-28T19:30:00.000Z");
    expect(iso(instantAt("2026-03-29", minutesOf("08:00"), PARIS))).toBe("2026-03-29T06:00:00.000Z");
  });

  it("is right on both sides of the autumn change (2026-10-25, 03:00 → 02:00)", () => {
    expect(iso(instantAt("2026-10-24", minutesOf("20:30"), PARIS))).toBe("2026-10-24T18:30:00.000Z");
    expect(iso(instantAt("2026-10-25", minutesOf("08:00"), PARIS))).toBe("2026-10-25T07:00:00.000Z");
  });

  it("reads a skipped wall time as the time it becomes", () => {
    // 02:30 doesn't exist on 2026-03-29: it is read as 03:30 CEST.
    expect(iso(instantAt("2026-03-29", minutesOf("02:30"), PARIS))).toBe("2026-03-29T01:30:00.000Z");
  });

  it("reads a repeated wall time as its first occurrence", () => {
    // 02:30 happens twice on 2026-10-25: first in CEST (00:30Z), then in CET (01:30Z).
    expect(iso(instantAt("2026-10-25", minutesOf("02:30"), PARIS))).toBe("2026-10-25T00:30:00.000Z");
  });

  it("refuses minutes outside a day and malformed dates", () => {
    expect(() => instantAt("2026-11-23", 1440, PARIS)).toThrow(RangeError);
    expect(() => instantAt("2026-11-23", -1, PARIS)).toThrow(RangeError);
    expect(() => instantAt("23/11/2026", 480, PARIS)).toThrow(RangeError);
  });

  it("throws on an unknown time zone instead of guessing UTC", () => {
    expect(() => instantAt("2026-11-23", 480, "Mars/Olympus")).toThrow(RangeError);
    expect(isTimeZone("Mars/Olympus")).toBe(false);
    expect(isTimeZone(PARIS)).toBe(true);
  });
});

describe("wallClockAt", () => {
  it("gives the local date and minutes, midnight as 0", () => {
    expect(wallClockAt(Date.parse("2026-11-22T23:30:00Z"), PARIS)).toEqual({ date: "2026-11-23", minutes: 30 });
    expect(wallClockAt(Date.parse("2026-11-22T22:59:00Z"), PARIS)).toEqual({ date: "2026-11-22", minutes: 1439 });
  });

  it("round-trips with instantAt over every minute of years crossing both changes", () => {
    const from = Date.parse("2025-01-01T00:00:00Z");
    const to = Date.parse("2031-01-01T00:00:00Z");
    fc.assert(
      fc.property(fc.integer({ min: from / 60_000, max: to / 60_000 }), (minute) => {
        const at = minute * 60_000;
        const wall = wallClockAt(at, PARIS);
        const back = instantAt(wall.date, wall.minutes, PARIS);
        // The same instant, or, for the second pass of a repeated hour, the first one of that wall time.
        expect(back <= at).toBe(true);
        expect(at - back === 0 || at - back === 3_600_000).toBe(true);
        expect(wallClockAt(back, PARIS)).toEqual(wall);
      }),
      { numRuns: 2000, seed: 2011 },
    );
  });
});

describe("times of day", () => {
  it("converts between HH:MM and minutes", () => {
    expect(minutesOf("00:00")).toBe(0);
    expect(minutesOf("20:30")).toBe(1230);
    expect(clockTimeOf(1230)).toBe("20:30");
    expect(clockTimeOf(5)).toBe("00:05");
  });

  it("refuses what isn't a time of day", () => {
    for (const text of ["24:00", "8:00", "08:60", "08h00", ""]) expect(() => minutesOf(text), text).toThrow(RangeError);
    expect(() => clockTimeOf(1440)).toThrow(RangeError);
  });
});
