import { describe, expect, it } from "vitest";
import { canonicalJson, compareText, pickOne, randomFrom, randomInt } from "../src/index.js";

describe("randomFrom", () => {
  it("gives the same sequence for the same seed, and another for another seed", () => {
    const a = randomFrom("2026-11-23:0");
    const b = randomFrom("2026-11-23:0");
    const c = randomFrom("2026-11-23:1");
    const first = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(first);
    expect([c(), c(), c()]).not.toEqual(first);
  });

  it("stays in [0, 1)", () => {
    const random = randomFrom("range");
    for (let i = 0; i < 10_000; i++) {
      const x = random();
      expect(x >= 0 && x < 1).toBe(true);
    }
  });
});

describe("randomInt and pickOne", () => {
  it("covers both ends of the range", () => {
    const random = randomFrom("ends");
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) seen.add(randomInt(random, 1, 3));
    expect([...seen].sort()).toEqual([1, 2, 3]);
  });

  it("refuses a range that isn't one", () => {
    expect(() => randomInt(randomFrom("x"), 3, 1)).toThrow(RangeError);
    expect(() => randomInt(randomFrom("x"), 0, 1.5)).toThrow(RangeError);
    expect(() => pickOne(randomFrom("x"), [])).toThrow(RangeError);
  });
});

describe("canonicalJson", () => {
  it("sorts keys and drops undefined, whatever the input order", () => {
    expect(canonicalJson({ b: 1, a: [true, null, "x"], c: undefined })).toBe('{"a":[true,null,"x"],"b":1}');
    expect(canonicalJson({ a: 1, b: 2 })).toBe(canonicalJson({ b: 2, a: 1 }));
  });

  it("refuses what isn't JSON data", () => {
    expect(() => canonicalJson({ at: new Date(0) })).toThrow(TypeError);
    expect(() => canonicalJson(Number.NaN)).toThrow(TypeError);
    expect(() => canonicalJson(() => 1)).toThrow(TypeError);
  });
});

describe("compareText", () => {
  it("orders by code unit, never by locale", () => {
    expect(["b", "B", "a", "é"].sort(compareText)).toEqual(["B", "a", "b", "é"]);
  });
});
