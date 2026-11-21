import {
  DEFAULT_SETTINGS,
  type PantryEntry,
  type State,
  addDays,
  dayOf,
  drawDue,
  initialState,
  instantAt,
  minutesOf,
  pickCups,
  plainTeaRecipe,
  recipeOf,
  wallClockAt,
  weekOf,
} from "@teatime/core";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { baseCatalog as catalog } from "../lib/content";
import { todayModel } from "./model";

const PARIS = "Europe/Paris";
const at = (date: string, time: string) => instantAt(date, minutesOf(time), PARIS);

const entry = (amount: number | null, atOffice = false): PantryEntry => ({
  have: { value: true, at: 1 },
  amount: { value: amount, at: 1 },
  openedOn: { value: null, at: 0 },
  atOffice: { value: atOffice, at: 1 },
});

/** The state as the server leaves it at `now`: drawn the evening before, then whatever was due. */
function drawnAt(state: State, now: number): State {
  const { date } = wallClockAt(now, PARIS);
  const evening = instantAt(addDays(date, -1), minutesOf(state.settings.eveningTime), PARIS);
  return drawDue(drawDue(state, catalog, evening).state, catalog, now).state;
}

const ITEMS = [...catalog.ingredients.map((i) => i.id), ...catalog.gear.map((g) => g.id)];

describe("Today's card (SPEC §7)", () => {
  it("is a valid card for any date, time, week and pantry", () => {
    const date = fc
      .integer({ min: Date.UTC(2026, 0, 1), max: Date.UTC(2028, 11, 31) })
      .map((ms) => new Date(Math.floor(ms / 86_400_000) * 86_400_000).toISOString().slice(0, 10));
    fc.assert(
      fc.property(
        date,
        fc.integer({ min: 0, max: 24 * 60 - 1 }),
        fc.subarray([1, 2, 3, 4, 5] as const),
        fc.dictionary(fc.constantFrom(...ITEMS), fc.tuple(fc.option(fc.integer({ min: 0, max: 500 })), fc.boolean())),
        fc.boolean(),
        (day, minute, officeDays, have, peek) => {
          const pantry = Object.fromEntries(
            Object.entries(have).map(([id, [amount, office]]) => [id, entry(amount, office)]),
          );
          const settings = { ...DEFAULT_SETTINGS, officeDays };
          const now = instantAt(day, minute, PARIS);
          const state = drawnAt({ ...initialState(settings), pantry }, now);
          const model = todayModel(state, catalog, now, { peeked: new Set(peek ? [day] : []), fromPush: null });

          expect(model.date).toBe(day);
          const kind = dayOf(day, weekOf(state));
          const card = model.card;
          if (kind.kind === "off") {
            expect(card.kind).toBe("weekend");
          } else {
            expect(["blend", "plain", "nothing", "teaser"]).toContain(card.kind);
          }
          if (card.kind === "blend") {
            const cups = pickCups(card.pick, settings);
            expect(recipeOf(card.pick.tea, cups, catalog)).not.toBeNull();
            if (card.pick.type === "office") {
              expect(card.blend.mode).toBe("safe");
              // The day's steps are made at the office; a cold brew's evening steps, at home.
              for (const step of card.blend.steps.filter((s) => s.stage === "day")) {
                expect(step.office, card.blend.code).toBeTruthy();
              }
            }
          }
          if (card.kind === "plain") {
            expect(card.tea.plain).not.toBe(false);
            expect(() => plainTeaRecipe(card.tea, card.brew, pickCups(card.pick, settings))).not.toThrow();
          }
          if (card.kind === "teaser") {
            expect(card.pick.type).toBe("home");
            expect(peek).toBe(false);
            expect(now).toBeLessThan(card.revealsAt);
          }
          if (model.evening) expect(model.evening.date).toBe(addDays(day, 1));
        },
      ),
      { numRuns: 400 },
    );
  });

  it("keeps a home blend a surprise until 8:00, unless peeked or opened from its push", () => {
    const pantry = { "high-mountain-oolong": entry(100), gaiwan: entry(null) };
    // Wednesday 25 November 2026 is a home day.
    const state = drawnAt({ ...initialState(), pantry }, at("2026-11-25", "07:00"));
    const early = todayModel(state, catalog, at("2026-11-25", "07:59"));
    expect(early.card.kind).toBe("teaser");
    expect(
      todayModel(state, catalog, at("2026-11-25", "07:59"), { peeked: new Set(["2026-11-25"]), fromPush: null }).card
        .kind,
    ).toBe("blend");
    expect(
      todayModel(state, catalog, at("2026-11-25", "07:59"), { peeked: new Set(), fromPush: "2026-11-25" }).card.kind,
    ).toBe("blend");
    expect(todayModel(state, catalog, at("2026-11-25", "08:00")).card.kind).toBe("blend");
  });

  it("shows tomorrow's office kit from 17:00, and a home day's only from the evening time", () => {
    const state = { ...initialState(), pantry: { "earl-grey": entry(200) } };
    // Sunday: Monday is an office day.
    expect(todayModel(state, catalog, at("2026-11-22", "16:59")).evening).toBeNull();
    expect(todayModel(state, catalog, at("2026-11-22", "17:00")).evening).toMatchObject({
      date: "2026-11-23",
      type: "office",
      canDraw: true,
      pick: null,
    });
    // Tuesday: Wednesday is a home day.
    expect(todayModel(state, catalog, at("2026-11-24", "18:00")).evening).toBeNull();
    expect(todayModel(state, catalog, at("2026-11-24", "20:30")).evening).toMatchObject({
      type: "home",
      canDraw: true,
    });
  });

  it("brews a plain genmaicha its own way, and never offers matcha plain (self-review of batch 2)", () => {
    // Wednesday 25 November 2026 is a home day; without the bowl and whisk, no blend can be made.
    const now = at("2026-11-25", "09:00");
    const both = drawnAt({ ...initialState(), pantry: { genmaicha: entry(100), matcha: entry(200) } }, now);
    const card = todayModel(both, catalog, now).card;
    expect(card).toMatchObject({ kind: "plain", tea: { id: "genmaicha" }, brew: { tempC: 100, infusionsS: [30] } });
    const matchaOnly = drawnAt({ ...initialState(), pantry: { matcha: entry(200) } }, now);
    expect(todayModel(matchaOnly, catalog, now).card.kind).toBe("nothing");
  });

  it("names the next tea day on a weekend", () => {
    const model = todayModel(initialState(), catalog, at("2026-11-28", "10:00"));
    expect(model.card).toEqual({ kind: "weekend", next: { date: "2026-11-30", type: "office", pick: null } });
  });
});
