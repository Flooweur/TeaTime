// @vitest-environment happy-dom
/**
 * Every screen through axe (SPEC §3.8): names, roles, labels, structure. Colour contrast needs a real
 * layout, which happy-dom doesn't do: docs/design/README.md checks the tokens' ratios instead.
 */
import { type PantryEntry, type State, drawDue, initialState, instantAt, minutesOf } from "@teatime/core";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { baseCatalog as catalog } from "../lib/content";
import { kept } from "../lib/store";
import { createAppRouter } from "../router";
import { fakeServer, freshDevice, snapshotOf } from "./fakes";

const at = (date: string, time: string) => instantAt(date, minutesOf(time), "Europe/Paris");
const have = (amount: number): PantryEntry => ({
  have: { value: true, at: 1 },
  amount: { value: amount, at: 1 },
  openedOn: { value: null, at: 0 },
  atOffice: { value: false, at: 0 },
});

/** Monday morning, with Monday's office blend drawn the evening before. */
function monday(): State {
  const state = { ...initialState(), pantry: { "earl-grey": have(300), assam: have(300) } };
  return drawDue(drawDue(state, catalog, at("2026-11-22", "20:30")).state, catalog, at("2026-11-23", "09:00")).state;
}

afterEach(() => {
  vi.useRealTimers();
});

const SCREENS: readonly (readonly [string, string, number])[] = [
  ["/", "Monday 23 November", at("2026-11-23", "09:00")],
  ["/library", "Library", at("2026-11-23", "09:00")],
  ["/blend/005", "#005", at("2026-11-23", "09:00")],
  ["/pantry", "Pantry", at("2026-11-23", "09:00")],
  ["/pantry/earl-grey", "Earl Grey tea", at("2026-11-23", "09:00")],
  ["/guides", "Guides", at("2026-11-23", "09:00")],
  ["/settings", "Settings", at("2026-11-23", "09:00")],
  ["/diag", "Diagnostics", at("2026-11-23", "09:00")],
  ["/review", "Week of Monday 23 November", at("2026-11-28", "10:00")],
];

describe("every screen, through axe (SPEC §3.8)", () => {
  for (const [url, heading, now] of SCREENS) {
    it(`${url} has no violation`, async () => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(now);
      freshDevice();
      const state = monday();
      fakeServer(state);
      kept.set({ loaded: true, snapshot: snapshotOf(state, 1), outbox: [], refused: [], storageError: null });
      render(<RouterProvider router={createAppRouter(createMemoryHistory({ initialEntries: [url] }))} />);
      await screen.findByRole("heading", { level: 1, name: heading });
      const results = await axe.run(document.body, {
        rules: { "color-contrast": { enabled: false } },
        resultTypes: ["violations"],
      });
      const found = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
      expect(found).toEqual([]);
    });
  }
});

describe("the axe check itself", () => {
  it("catches a button without a name", async () => {
    render(<button type="button" />);
    const results = await axe.run(document.body, { rules: { "color-contrast": { enabled: false } } });
    expect(results.violations.map((v) => v.id)).toContain("button-name");
  });
});
