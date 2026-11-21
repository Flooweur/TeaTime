import { describe, expect, it } from "vitest";
import { CLOCK_SKEW_MS, clockSkew } from "./diagnostics";

describe("the clock check (SPEC §3.8)", () => {
  it("reads the device against the server, the request's time halved out", () => {
    // Sent at 1000, answered at 1400: the server read its clock about 1200.
    expect(clockSkew(1_200, 1_000, 1_400)).toBe(0);
    expect(clockSkew(1_200 - 90_000, 1_000, 1_400)).toBe(90_000);
    expect(clockSkew(1_200 + 30_000, 1_000, 1_400)).toBe(-30_000);
  });

  it("flags a device more than a minute off", () => {
    expect(Math.abs(clockSkew(0, 61_000, 61_000)) > CLOCK_SKEW_MS).toBe(true);
    expect(Math.abs(clockSkew(0, 59_000, 59_000)) > CLOCK_SKEW_MS).toBe(false);
  });
});
