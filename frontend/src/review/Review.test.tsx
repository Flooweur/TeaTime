// @vitest-environment happy-dom
import { type PantryEntry, type State, drawDue, initialState, instantAt, minutesOf } from "@teatime/core";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { baseCatalog as catalog } from "../lib/content";
import { followKept, kept } from "../lib/store";
import { createAppRouter } from "../router";
import { fakeServer, freshDevice, snapshotOf } from "../test/fakes";
import { mondayOf, reviewModel } from "./model";

const at = (date: string, time: string) => instantAt(date, minutesOf(time), "Europe/Paris");
const entry = (amount: number | null, openedOn: string | null = null): PantryEntry => ({
  have: { value: true, at: 1 },
  amount: { value: amount, at: 1 },
  openedOn: { value: openedOn, at: 1 },
  atOffice: { value: false, at: 0 },
});

/** The week of 23 November drawn day by day, from a pantry that makes #005 and #006. */
function drawnWeek(): State {
  let state: State = { ...initialState(), pantry: { "earl-grey": entry(300), assam: entry(300) } };
  for (const day of ["2026-11-23", "2026-11-24", "2026-11-25", "2026-11-26", "2026-11-27"]) {
    state = drawDue(state, catalog, at(day, "07:00")).state;
  }
  return state;
}

const stops: (() => void)[] = [];
afterEach(() => {
  for (const stop of stops.splice(0)) stop();
  vi.useRealTimers();
});

async function open(state: State, now: number, url: string) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(now);
  freshDevice();
  fakeServer(state);
  kept.set({ loaded: true, snapshot: snapshotOf(state, 1), outbox: [], refused: [], storageError: null });
  stops.push(followKept());
  render(<RouterProvider router={createAppRouter(createMemoryHistory({ initialEntries: [url] }))} />);
}

describe("the review's model (SPEC §2.8)", () => {
  it("reviews Monday to Friday of the week just past, on a weekend", () => {
    expect(mondayOf("2026-11-28")).toBe("2026-11-23");
    expect(mondayOf("2026-11-29")).toBe("2026-11-23");
    const model = reviewModel(drawnWeek(), catalog, "2026-11-28", "2026-11-28");
    expect(model.days.map((d) => d.date)).toEqual([
      "2026-11-23",
      "2026-11-24",
      "2026-11-25",
      "2026-11-26",
      "2026-11-27",
    ]);
    expect(model.days.every((d) => d.pick !== null)).toBe(true);
  });

  it("lists what is going stale, what unlocks the most, and next week's office days", () => {
    const state: State = {
      ...initialState(),
      // Milk opened 5 days ago keeps 3 days: past its shelf life.
      pantry: { "whole-milk": entry(500, "2026-11-23"), "earl-grey": entry(300) },
    };
    const model = reviewModel(state, catalog, "2026-11-28", "2026-11-28");
    expect(model.going).toEqual([expect.objectContaining({ freshness: "stale" })]);
    expect(model.going[0]?.ingredient.id).toBe("whole-milk");
    expect(model.unlocks.length).toBeGreaterThan(0);
    expect(model.preview.officeDays).toEqual(["2026-11-30", "2026-12-01", "2026-12-03"]);
    expect(model.preview.safeMakeable).toBe(1);
  });
});

describe("the review's screen (SPEC §7)", () => {
  it("joins the tabs on the weekend only", async () => {
    await open(initialState(), at("2026-11-25", "10:00"), "/");
    await screen.findByRole("navigation", { name: "Screens" });
    expect(screen.queryByRole("link", { name: /Review/ })).toBeNull();
  });

  it("opens from Saturday's push, and a tea still waiting can be marked skipped", async () => {
    const state = drawnWeek();
    await open(state, at("2026-11-28", "10:05"), "/review?date=2026-11-28&from=push");
    expect(await screen.findByText("Week of Monday 23 November")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Review/ })).toBeTruthy();
    const waiting = screen.getAllByRole("button", { name: "Skipped" });
    expect(waiting).toHaveLength(5);
    fireEvent.click(waiting[0]!);
    await waitFor(() => expect(screen.getAllByRole("button", { name: "Skipped" })).toHaveLength(4));
  });
});
