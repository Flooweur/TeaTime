import { randomUUID } from "node:crypto";
import type { PickRecord } from "@teatime/core";
import { describe, expect, it } from "vitest";
import type { Snapshot } from "../src/state/snapshot.js";
import { at, command, have, testApp } from "./helpers.js";

// 2026-11-22 is a Sunday; Monday 23, Tuesday 24 and Thursday 26 are office days by default.
const SUNDAY_EVENING = at("2026-11-22", "18:00");

/** An app on Sunday at 18:00 whose pantry makes the two black-tea safe blends, #005 and #006. */
async function sundayEvening() {
  const t = await testApp({ now: SUNDAY_EVENING });
  await t.commands(have("earl-grey", SUNDAY_EVENING - 3_600_000, 300), have("assam", SUNDAY_EVENING - 3_600_000, 300));
  return t;
}

const pickOf = (body: unknown, date: string) => (body as Snapshot).state.picks[date] as PickRecord;

describe("POST picks/:date/draw (SPEC §3.4)", () => {
  it("draws tomorrow's office kit from 17:00, and answers the same pick when asked again", async () => {
    const t = await sundayEvening();
    const first = await t.call("POST", "/api/picks/2026-11-23/draw");
    expect(first.status).toBe(200);
    const pick = pickOf(first.body, "2026-11-23");
    expect(pick).toMatchObject({ type: "office", status: "pending", source: "draw" });
    expect(["005", "006"]).toContain(pick.tea.kind === "blend" ? pick.tea.code : null);
    const again = await t.call("POST", "/api/picks/2026-11-23/draw");
    expect(pickOf(again.body, "2026-11-23")).toEqual(pick);
    expect((again.body as unknown as Snapshot).revision).toBe((first.body as unknown as Snapshot).revision);
  });

  it("refuses, changing nothing: too early, a home day before the evening, a past date, a weekend, a bad date", async () => {
    const t = await testApp({ now: at("2026-11-22", "16:00") });
    expect((await t.call("POST", "/api/picks/2026-11-23/draw")).body).toMatchObject({ code: "too_early" });
    t.clock.set(at("2026-11-24", "18:00"));
    // Wednesday 25 is a home day: drawn at the evening time, not before.
    expect((await t.call("POST", "/api/picks/2026-11-25/draw")).body).toMatchObject({ code: "not_office" });
    expect((await t.call("POST", "/api/picks/2026-11-23/draw")).body).toMatchObject({ code: "past_date" });
    t.clock.set(at("2026-11-27", "21:00"));
    expect((await t.call("POST", "/api/picks/2026-11-28/draw")).body).toMatchObject({ code: "not_a_tea_day" });
    const bad = await t.call("POST", "/api/picks/tomorrow/draw");
    expect(bad.status).toBe(400);
    expect((await t.snapshot()).revision).toBe(0);
  });
});

describe("POST picks/:date/swap (SPEC §2.4)", () => {
  it("swaps once; a retry after a lost answer gets the current pick back; a second swap is refused", async () => {
    const t = await sundayEvening();
    const drawn = pickOf((await t.call("POST", "/api/picks/2026-11-23/draw")).body, "2026-11-23");
    const swap = await t.call("POST", "/api/picks/2026-11-23/swap", { current: drawn.tea });
    expect(swap.status).toBe(200);
    const swapped = pickOf(swap.body, "2026-11-23");
    expect(swapped.tea).not.toEqual(drawn.tea);
    expect(swapped.swappedFrom).toBe(drawn.tea.kind === "blend" ? drawn.tea.code : null);

    const retry = await t.call("POST", "/api/picks/2026-11-23/swap", { current: drawn.tea });
    expect(retry.status).toBe(200);
    expect(pickOf(retry.body, "2026-11-23")).toEqual(swapped);

    const second = await t.call("POST", "/api/picks/2026-11-23/swap", { current: swapped.tea });
    expect(second.status).toBe(409);
    expect(second.body).toMatchObject({ code: "swap_used" });
  });

  it("refuses a malformed tea, and a date with no pick", async () => {
    const t = await sundayEvening();
    expect((await t.call("POST", "/api/picks/2026-11-23/swap", { current: { kind: "blend" } })).status).toBe(400);
    const none = await t.call("POST", "/api/picks/2026-11-23/swap", { current: { kind: "none" } });
    expect(none.status).toBe(404);
    expect(none.body).toMatchObject({ code: "no_pick" });
  });
});

describe("PUT settings, PUT overrides/:date, POST|DELETE away (SPEC §3.3)", () => {
  it("takes a patch, and names every problem of a bad one", async () => {
    const t = await testApp();
    const ok = await t.call("PUT", "/api/settings", { cooldownDays: 14, morningTime: "07:30" });
    expect(ok.status).toBe(200);
    expect((ok.body as unknown as Snapshot).state.settings).toMatchObject({ cooldownDays: 14, morningTime: "07:30" });
    const bad = await t.call("PUT", "/api/settings", { cooldownDays: -1, colour: "red" });
    expect(bad.status).toBe(400);
    expect(bad.body).toMatchObject({ code: "invalid", problems: expect.arrayContaining(["colour: not a setting"]) });
    expect((await t.snapshot()).state.settings.cooldownDays).toBe(14);
  });

  it("draws again a pending pick whose day type an override changes, and clears the override with null", async () => {
    const t = await sundayEvening();
    await t.call("POST", "/api/picks/2026-11-23/draw");
    const home = await t.call("PUT", "/api/overrides/2026-11-23", { type: "home" });
    expect(home.status).toBe(200);
    const snapshot = home.body as unknown as Snapshot;
    expect(snapshot.state.overrides).toEqual({ "2026-11-23": "home" });
    expect(snapshot.state.picks["2026-11-23"]).toMatchObject({ type: "home", attempt: 1 });
    const cleared = (await t.call("PUT", "/api/overrides/2026-11-23", { type: null })).body as unknown as Snapshot;
    expect(cleared.state.overrides).toEqual({});
    expect(cleared.state.picks["2026-11-23"]?.type).toBe("office");
  });

  it("asks before throwing a packed kit away, and goes on with confirm", async () => {
    const t = await sundayEvening();
    await t.call("POST", "/api/picks/2026-11-23/draw");
    await t.commands(command("pick.packed", { date: "2026-11-23", cups: 2 }, SUNDAY_EVENING));
    const asked = await t.call("PUT", "/api/overrides/2026-11-23", { type: "home" });
    expect(asked.status).toBe(409);
    expect(asked.body).toMatchObject({ code: "packed_kits", dates: ["2026-11-23"] });
    expect((await t.snapshot()).state.overrides).toEqual({});
    const confirmed = await t.call("PUT", "/api/overrides/2026-11-23?confirm=true", { type: "home" });
    expect(confirmed.status).toBe(200);
  });

  it("adds an away period, answers its resend unchanged, cancels its picks, and removes it", async () => {
    const t = await sundayEvening();
    await t.call("POST", "/api/picks/2026-11-23/draw");
    const period = { id: randomUUID(), from: "2026-11-23", to: "2026-11-25" };
    const added = await t.call("POST", "/api/away", period);
    expect(added.status).toBe(200);
    const snapshot = added.body as unknown as Snapshot;
    expect(snapshot.state.away).toEqual([period]);
    expect(snapshot.state.picks["2026-11-23"]?.status).toBe("cancelled");

    const resent = await t.call("POST", "/api/away", period);
    expect(resent.status).toBe(200);
    expect((resent.body as unknown as Snapshot).revision).toBe(snapshot.revision);

    const clash = await t.call("POST", "/api/away", { ...period, to: "2026-11-27" });
    expect(clash.status).toBe(400);

    const removed = await t.call("DELETE", `/api/away/${period.id}`);
    expect(removed.status).toBe(200);
    expect((removed.body as unknown as Snapshot).state.away).toEqual([]);
    expect((await t.call("DELETE", `/api/away/${period.id}`)).body).toMatchObject({ code: "unknown_away" });
  });
});

describe("the self-review of phase 5", () => {
  it("swaps a plain-tea fallback for a blend, as its free redraw", async () => {
    // Only Ceylon, which no safe blend uses: Monday's office kit falls back to it plain.
    const t = await testApp({ now: SUNDAY_EVENING });
    await t.commands(have("ceylon-black", SUNDAY_EVENING - 3_600_000, 300));
    const drawn = pickOf((await t.call("POST", "/api/picks/2026-11-23/draw")).body, "2026-11-23");
    expect(drawn.tea).toEqual({ kind: "plain", tea: "ceylon-black" });
    await t.commands(have("earl-grey", SUNDAY_EVENING - 60_000, 300));
    const swap = await t.call("POST", "/api/picks/2026-11-23/swap", { current: drawn.tea });
    expect(swap.status).toBe(200);
    expect(pickOf(swap.body, "2026-11-23").tea).toEqual({ kind: "blend", code: "005" });
  });

  it("refuses a value of the wrong type instead of coercing it", async () => {
    const t = await testApp();
    const res = await t.call("PUT", "/api/overrides/2026-11-26", { type: "" });
    expect(res.status).toBe(400);
    const extra = await t.call("PUT", "/api/overrides/2026-11-26", { type: "home", note: "x" });
    expect(extra.status).toBe(400);
  });
});

describe("gear through the server (SPEC §2.3, §2.6)", () => {
  it("draws the gongfu oolong on a home day only once the gaiwan is in the pantry", async () => {
    // Tuesday 21:00: Wednesday, a home day, can be drawn.
    const evening = at("2026-11-24", "21:00");
    const without = await testApp({ now: evening });
    await without.commands(have("high-mountain-oolong", evening - 3_600_000, 100));
    const plain = pickOf((await without.call("POST", "/api/picks/2026-11-25/draw")).body, "2026-11-25");
    expect(plain).toMatchObject({ type: "home", source: "fallback", unlock: "gaiwan" });

    const t = await testApp({ now: evening });
    await t.commands(
      have("high-mountain-oolong", evening - 3_600_000, 100),
      command("pantry.set", { ingredient: "gaiwan", have: true }, evening - 3_600_000),
    );
    const drawn = pickOf((await t.call("POST", "/api/picks/2026-11-25/draw")).body, "2026-11-25");
    expect(drawn.tea).toEqual({ kind: "blend", code: "009" });
    const snapshot = (await t.snapshot()).content;
    expect(snapshot.gear.map((g) => g.id)).toEqual(["gaiwan"]);
  });
});
