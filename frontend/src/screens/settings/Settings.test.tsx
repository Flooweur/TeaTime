// @vitest-environment happy-dom
import { type State, addDays, drawDue, initialState, instantAt, minutesOf } from "@teatime/core";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { baseCatalog } from "../../lib/content";
import { followKept, kept } from "../../lib/store";
import { createAppRouter } from "../../router";
import { fakeServer, freshDevice, snapshotOf } from "../../test/fakes";

const at = (date: string, time: string) => instantAt(date, minutesOf(time), "Europe/Paris");

/** Settings at `now`, the server and the device holding `state`. */
async function openSettings(state: State, now: number) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(now);
  freshDevice();
  const server = fakeServer(state);
  kept.set({ loaded: true, snapshot: snapshotOf(state, 0), outbox: [], refused: [], storageError: null });
  // The app follows the device's storage (main.tsx): the server's snapshots reach the screens through it.
  stops.push(followKept());
  render(<RouterProvider router={createAppRouter(createMemoryHistory({ initialEntries: ["/settings"] }))} />);
  await screen.findByText("The week");
  return server;
}

const stops: (() => void)[] = [];

afterEach(() => {
  for (const stop of stops.splice(0)) stop();
  vi.useRealTimers();
});

describe("Settings: the week and the times (SPEC §7)", () => {
  it("turns an office day on, sorted, through the server", async () => {
    const server = await openSettings(initialState(), at("2026-11-21", "10:00"));
    fireEvent.click(screen.getByRole("button", { name: "Wed" }));
    await waitFor(() => expect(server.state.settings.officeDays).toEqual([1, 2, 3, 4]));
    expect(server.requests.at(-1)).toMatchObject({
      method: "PUT",
      path: "settings",
      body: { officeDays: [1, 2, 3, 4] },
    });
    await waitFor(() => expect(screen.getByRole("button", { name: "Wed" }).getAttribute("aria-pressed")).toBe("true"));
  });

  it("asks before throwing a packed kit away, and goes on when told", async () => {
    // Sunday evening: Monday's kit is drawn and packed.
    const now = at("2026-11-22", "21:00");
    const pantry = {
      "earl-grey": {
        have: { value: true, at: 1 },
        amount: { value: 200, at: 1 },
        openedOn: { value: null, at: 0 },
        atOffice: { value: false, at: 0 },
      },
    };
    let state = drawDue({ ...initialState(), pantry }, baseCatalog, now).state;
    const pick = state.picks["2026-11-23"]!;
    state = { ...state, picks: { ...state.picks, "2026-11-23": { ...pick, packedAt: now, packedCups: 2 } } };
    const server = await openSettings(state, now);
    fireEvent.click(screen.getByRole("button", { name: "Mon" }));
    expect(await screen.findByText(/throws away the kit packed for Monday 23 November/)).toBeTruthy();
    expect(server.state.settings.officeDays).toEqual([1, 2, 4]);
    fireEvent.click(screen.getByRole("button", { name: "Go on" }));
    await waitFor(() => expect(server.state.settings.officeDays).toEqual([2, 4]));
    expect(server.requests.at(-1)?.path).toBe("settings?confirm=true");
  });

  it("adds an away period, and removes it", async () => {
    const server = await openSettings(initialState(), at("2026-11-21", "10:00"));
    fireEvent.change(screen.getByLabelText("Away from"), { target: { value: "2026-12-21" } });
    fireEvent.change(screen.getByLabelText("Away to"), { target: { value: "2027-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    await waitFor(() => expect(server.state.away).toHaveLength(1));
    expect(await screen.findByText("Monday 21 December to Friday 1 January")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0]!);
    await waitFor(() => expect(server.state.away).toHaveLength(0));
  });

  it("sets one day different, and says why a past or weekend day can't be", async () => {
    const server = await openSettings(initialState(), at("2026-11-21", "10:00"));
    fireEvent.change(screen.getByLabelText("The day"), { target: { value: addDays("2026-11-21", 5) } });
    fireEvent.click(screen.getByRole("button", { name: "Set" }));
    await waitFor(() => expect(server.state.overrides).toEqual({ "2026-11-26": "home" }));
    // The field clears once the server has answered.
    await waitFor(() => expect((screen.getByLabelText("The day") as HTMLInputElement).value).toBe(""));
    fireEvent.change(screen.getByLabelText("The day"), { target: { value: "2026-11-28" } });
    fireEvent.click(screen.getByRole("button", { name: "Set" }));
    expect(await screen.findByText("That day is a weekend: it has no tea.")).toBeTruthy();
  });

  it("offers both exports as downloads", async () => {
    await openSettings(initialState(), at("2026-11-21", "10:00"));
    expect(screen.getByRole("link", { name: "Everything (JSON)" }).getAttribute("href")).toBe("/api/export.json");
    expect(screen.getByRole("link", { name: "Cups made (CSV)" }).getAttribute("href")).toBe("/api/export.csv");
  });
});
