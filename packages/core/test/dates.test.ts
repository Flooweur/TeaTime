import { describe, expect, it } from "vitest";
import { addDays, daysBetween, isDate, isWeekend, isoWeekday } from "../src/index.js";

describe("isDate", () => {
  it("accepts real calendar dates", () => {
    expect(isDate("2026-11-20")).toBe(true);
    expect(isDate("2028-02-29")).toBe(true);
    expect(isDate("2026-12-31")).toBe(true);
  });

  it("refuses dates that don't exist and other shapes", () => {
    for (const text of [
      "2026-02-29",
      "2026-02-30",
      "2026-04-31",
      "2026-13-01",
      "2026-00-10",
      "2026-1-01",
      "20261120",
      "",
    ]) {
      expect(isDate(text), text).toBe(false);
    }
  });
});

describe("addDays and daysBetween", () => {
  it("crosses months, years and leap days", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("is not moved by daylight saving time (dates are counted at UTC midnight)", () => {
    expect(addDays("2026-03-28", 1)).toBe("2026-03-29");
    expect(addDays("2026-10-24", 2)).toBe("2026-10-26");
    expect(daysBetween("2026-03-01", "2026-04-01")).toBe(31);
  });

  it("are each other's inverse", () => {
    expect(daysBetween("2026-11-20", addDays("2026-11-20", 45))).toBe(45);
    expect(daysBetween("2026-11-20", "2026-11-13")).toBe(-7);
  });

  it("refuse what isn't a date or a whole number of days", () => {
    expect(() => addDays("2026-02-30", 1)).toThrow(RangeError);
    expect(() => addDays("2026-11-20", 0.5)).toThrow(RangeError);
    expect(() => daysBetween("today", "2026-11-20")).toThrow(RangeError);
  });
});

describe("isoWeekday", () => {
  it("numbers Monday 1 to Sunday 7", () => {
    expect(isoWeekday("2026-11-16")).toBe(1);
    expect(isoWeekday("2026-11-20")).toBe(5);
    expect(isoWeekday("2026-11-21")).toBe(6);
    expect(isoWeekday("2026-11-22")).toBe(7);
  });

  it("marks Saturday and Sunday as the weekend", () => {
    expect(isWeekend("2026-11-20")).toBe(false);
    expect(isWeekend("2026-11-21")).toBe(true);
    expect(isWeekend("2026-11-22")).toBe(true);
  });
});
