// @vitest-environment happy-dom
import {
  type PantryEntry,
  type State,
  addDays,
  drawDue,
  initialState,
  instantAt,
  minutesOf,
  wallClockAt,
} from "@teatime/core";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { baseCatalog as catalog } from "../lib/content";
import { kept } from "../lib/store";
import { createAppRouter } from "../router";
import { fakeServer, freshDevice, snapshotOf } from "../test/fakes";

const at = (date: string, time: string) => instantAt(date, minutesOf(time), "Europe/Paris");

const have = (amount: number | null): PantryEntry => ({
  have: { value: true, at: 1 },
  amount: { value: amount, at: 1 },
  openedOn: { value: null, at: 0 },
  atOffice: { value: false, at: 0 },
});

/** The state as the server leaves it at `now`: drawn the evening before, then whatever was due. */
function drawnAt(state: State, now: number): State {
  const { date } = wallClockAt(now, "Europe/Paris");
  const evening = instantAt(addDays(date, -1), minutesOf(state.settings.eveningTime), "Europe/Paris");
  return drawDue(drawDue(state, catalog, evening).state, catalog, now).state;
}

/** Today, at `now`, on a device whose snapshot holds `state`. */
async function openToday(state: State, now: number, url = "/") {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(now);
  const db = freshDevice();
  fakeServer(state);
  kept.set({ loaded: true, snapshot: snapshotOf(state, 1), outbox: [], refused: [], storageError: null });
  render(<RouterProvider router={createAppRouter(createMemoryHistory({ initialEntries: [url] }))} />);
  return db;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Today (SPEC §7)", () => {
  it("shows an office day's blend in its office version; Made it logs it, offers the ratings, and Undo", async () => {
    const now = at("2026-11-23", "09:00");
    const state = drawnAt({ ...initialState(), pantry: { "earl-grey": have(300), assam: have(300) } }, now);
    const pick = state.picks["2026-11-23"]!;
    expect(pick.tea.kind).toBe("blend");
    const db = await openToday(state, now);

    expect(await screen.findByText("At the office")).toBeTruthy();
    expect(screen.getByText("The office version")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Made it" }));

    expect(await screen.findByText("Made, for 2 cups.")).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "Your colleague's rating" })).toBeTruthy();
    const queued = await db.outbox.toArray();
    expect(queued.map((q) => q.command.type)).toEqual(["brew.logged"]);
    expect(queued[0]?.command.payload).toMatchObject({ cups: 2, date: "2026-11-23", pick: "2026-11-23" });

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(await screen.findByRole("button", { name: "Made it" })).toBeTruthy();
    expect((await db.outbox.toArray()).map((q) => q.command.type)).toEqual(["brew.logged", "brew.removed"]);
  });

  it("keeps a home blend sealed before 8:00, and Peek opens it", async () => {
    const now = at("2026-11-25", "07:30");
    const state = drawnAt(
      { ...initialState(), pantry: { "high-mountain-oolong": have(100), gaiwan: have(null) } },
      now,
    );
    await openToday(state, now);
    expect(await screen.findByText("Today's tea arrives at 08:00")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Peek" }));
    expect(await screen.findByText("High-mountain oolong, gongfu style")).toBeTruthy();
  });

  it("opens the day's blend from its push, whatever the time", async () => {
    const now = at("2026-11-25", "07:30");
    const state = drawnAt(
      { ...initialState(), pantry: { "high-mountain-oolong": have(100), gaiwan: have(null) } },
      now,
    );
    // The link the server puts in the morning push (core's notifications.ts).
    await openToday(state, now, "/today?date=2026-11-25&blend=009&from=push");
    expect(await screen.findByText("High-mountain oolong, gongfu style")).toBeTruthy();
  });

  it("has no tea on a weekend, and names the next tea day", async () => {
    await openToday(initialState(), at("2026-11-28", "10:00"));
    expect(await screen.findByText("No tea today")).toBeTruthy();
    expect(screen.getByText("Monday 30 November")).toBeTruthy();
  });

  it("shows Monday's office kit on Sunday evening, and Packed marks it", async () => {
    const now = at("2026-11-22", "20:45");
    const state = drawnAt({ ...initialState(), pantry: { "earl-grey": have(300) } }, now);
    expect(state.picks["2026-11-23"]?.tea).toEqual({ kind: "blend", code: "005" });
    const db = await openToday(state, now);
    expect(await screen.findByText("Tomorrow, Monday 23 November")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Packed" }));
    expect(await screen.findByText("Packed, for 2 cups.")).toBeTruthy();
    expect((await db.outbox.toArray())[0]?.command).toMatchObject({ type: "pick.packed", payload: { cups: 2 } });
  });

  it("offers the tea kept at the office when the evening draw was missed", async () => {
    const now = at("2026-11-23", "09:00");
    const atOffice = { ...have(200), atOffice: { value: true, at: 1 } };
    // The PC was off on Sunday evening: Monday is first drawn on the day itself.
    const state = drawDue({ ...initialState(), pantry: { assam: atOffice } }, catalog, now).state;
    await openToday(state, now);
    expect(await screen.findByText("No kit today")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Assam black tea" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Made it" })).toBeTruthy();
  });

  it("says when no tea can be made, and what to buy", async () => {
    const now = at("2026-11-23", "09:00");
    const state = drawnAt(initialState(), now);
    await openToday(state, now);
    // Drawn the evening before from an empty pantry: nothing to make, and the purchase that unlocks most.
    expect(await screen.findByText("No tea to make today")).toBeTruthy();
    expect(screen.getByText(/The purchase that would unlock the most blends/)).toBeTruthy();
  });
});

describe("the self-review of phase 6", () => {
  it("shows no card before the device's storage has answered", async () => {
    const now = at("2026-11-23", "09:00");
    const state = drawnAt({ ...initialState(), pantry: { "earl-grey": have(300) } }, now);
    await openToday(state, now);
    kept.set({ loaded: false, snapshot: null, outbox: [], refused: [], storageError: null });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.queryByText("Today's tea isn't drawn yet")).toBeNull();
    expect(screen.queryByRole("button", { name: "Made it" })).toBeNull();
    kept.set({ loaded: true, snapshot: snapshotOf(state, 1), outbox: [], refused: [], storageError: null });
    expect(await screen.findByRole("button", { name: "Made it" })).toBeTruthy();
  });

  it("tells when the app's teas differ from the server's, either way, and Later hides it", async () => {
    const now = at("2026-11-28", "10:00");
    await openToday(initialState(), now);
    kept.set({
      loaded: true,
      snapshot: { ...snapshotOf(initialState(), 1), contentHash: "another" },
      outbox: [],
      refused: [],
      storageError: null,
    });
    expect(await screen.findByText(/have different teas/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Later" }));
    expect(screen.queryByText(/have different teas/)).toBeNull();
  });
});
