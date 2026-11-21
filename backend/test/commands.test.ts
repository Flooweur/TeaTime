import { randomUUID } from "node:crypto";
import { type Command, type State, applyCommand, catalogOf, initialState, parseCommand } from "@teatime/core";
import { BUNDLE } from "@teatime/content/bundle";
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { MAX_BATCH } from "../src/commands/service.js";
import { appliedCommands } from "../src/db/schema.js";
import { ORIGIN, at, command, have, testApp } from "./helpers.js";

const NOW = at("2026-11-23", "09:00");

const logged = (code: string, cups: number, when = NOW, brew: string = randomUUID()) =>
  command("brew.logged", { brew, tea: { kind: "blend", code }, cups, date: "2026-11-23" }, when);

describe("POST commands (SPEC §3.3)", () => {
  it("applies each command, answers a result for each, and counts one revision for the batch", async () => {
    const t = await testApp({ now: NOW });
    const { results, snapshot } = await t.commands(have("earl-grey", NOW - 60_000, 100), logged("005", 2));
    expect(results.map((r) => r.ok)).toEqual([true, true]);
    expect(snapshot.revision).toBe(1);
    // #005 serves 2 from 7.5 g.
    expect(snapshot.state.pantry["earl-grey"]?.amount.value).toBe(92.5);
    expect(Object.values(snapshot.state.brews)).toHaveLength(1);
    expect(snapshot.contentHash).toBe(BUNDLE.hash);
    expect(snapshot.serverTime).toBe(NOW);
  });

  it("answers a resend with the same result, marked repeat, and changes nothing", async () => {
    const t = await testApp({ now: NOW });
    const set = have("earl-grey", NOW - 60_000, 100);
    const brew = logged("005", 2);
    const first = await t.commands(set, brew);
    const again = await t.commands(set, brew);
    expect(again.results).toEqual(first.results.map((r) => ({ ...r, repeat: true })));
    expect(again.snapshot.revision).toBe(first.snapshot.revision);
    expect(again.snapshot.state).toEqual(first.snapshot.state);
  });

  it("treats the same id twice in one batch as a resend", async () => {
    const t = await testApp({ now: NOW });
    const brew = logged("005", 1);
    const { results } = await t.commands(brew, brew);
    expect(results[1]).toEqual({ ...results[0], repeat: true });
  });

  it("refuses a command on its own: the ones after it are applied", async () => {
    const t = await testApp({ now: NOW });
    const { results, snapshot } = await t.commands(
      command("brew.rated", { brew: randomUUID(), rating: 4 }, NOW),
      command("blend.marked", { blend: "005", favourite: true }, NOW),
    );
    expect(results[0]).toMatchObject({ ok: false, code: "not_found" });
    expect(results[1]).toMatchObject({ ok: true });
    expect(snapshot.state.marks["005"]?.favourite.value).toBe(true);
  });

  it("records an invalid command, so its resend is answered the same", async () => {
    const t = await testApp({ now: NOW });
    const bad = command("brew.rated", { brew: randomUUID(), rating: 9 }, NOW);
    const first = await t.commands(bad);
    expect(first.results[0]).toMatchObject({ ok: false, code: "invalid", id: bad.id });
    expect((await t.commands(bad)).results[0]).toMatchObject({ code: "invalid", repeat: true });
    // One without a usable id can't be recorded: it is answered by its place in the batch.
    const noId = await t.commands({ v: 1, at: NOW, type: "blend.marked", payload: {} });
    expect(noId.results[0]).toMatchObject({ id: null, ok: false, code: "invalid" });
  });

  it("leaves a newer app's command undecided, so it is tried again once the server knows it", async () => {
    const t = await testApp({ now: NOW });
    const newer = { ...command("blend.marked", { blend: "005", favourite: true }, NOW), v: 99 };
    for (let i = 0; i < 2; i++) {
      const { results } = await t.commands(newer);
      expect(results[0]).toMatchObject({ ok: false, code: "unsupported_version" });
      expect(results[0]?.repeat).toBeUndefined();
    }
    expect(t.db.select().from(appliedCommands).all()).toHaveLength(0);
  });

  it("rolls back a command whose rows can't be written, answers server_error, and goes on", async () => {
    const t = await testApp({ now: NOW });
    // A bug's stand-in: writing a mark fails.
    t.db.$client.exec("create trigger broken before insert on blend_marks begin select raise(abort, 'broken'); end");
    const mark = command("blend.marked", { blend: "005", favourite: true }, NOW);
    const { results, snapshot } = await t.commands(mark, have("assam", NOW, 50));
    expect(results[0]).toEqual({ id: mark.id, ok: false, code: "server_error" });
    expect(results[1]).toMatchObject({ ok: true });
    expect(snapshot.state.pantry.assam?.amount.value).toBe(50);
    expect(snapshot.state.marks).toEqual({});
    // Not recorded: once fixed, the resend is applied.
    t.db.$client.exec("drop trigger broken");
    const again = await t.commands(mark);
    expect(again.results[0]).toMatchObject({ ok: true });
    expect(again.results[0]?.repeat).toBeUndefined();
    expect(again.snapshot.state.marks["005"]?.favourite.value).toBe(true);
  });

  it("refuses a batch too big, a body that isn't JSON, and a write from another site", async () => {
    const t = await testApp({ now: NOW });
    const many = Array.from({ length: MAX_BATCH + 1 }, () => logged("005", 1));
    expect((await t.call("POST", "/api/commands", { commands: many })).status).toBe(400);

    const text = await t.app.inject({
      method: "POST",
      url: "/api/commands",
      headers: { origin: ORIGIN, "content-type": "text/plain" },
      payload: JSON.stringify({ commands: [] }),
    });
    expect(text.statusCode).toBe(415);

    const other = await t.app.inject({
      method: "POST",
      url: "/api/commands",
      headers: { origin: "https://evil.example" },
      payload: { commands: [] },
    });
    expect(other.statusCode).toBe(403);
    expect(other.json()).toMatchObject({ code: "cross_origin" });

    // No Origin: not a page on another site (a script on the PC).
    const script = await t.app.inject({ method: "POST", url: "/api/commands", payload: { commands: [] } });
    expect(script.statusCode).toBe(200);
  });

  it("carries the content of every pending pick's blend", async () => {
    // Sunday 18:00: Monday's office kit, drawn early.
    const sunday = at("2026-11-22", "18:00");
    const t = await testApp({ now: sunday });
    await t.commands(have("earl-grey", sunday - 3_600_000, 200), have("assam", sunday - 3_600_000, 200));
    const drawn = await t.call("POST", "/api/picks/2026-11-23/draw");
    expect(drawn.status).toBe(200);
    const snapshot = drawn.body as unknown as Awaited<ReturnType<typeof t.snapshot>>;
    const pick = snapshot.state.picks["2026-11-23"];
    expect(pick?.tea.kind).toBe("blend");
    const code = pick?.tea.kind === "blend" ? pick.tea.code : "";
    expect(snapshot.content.blends.map((b) => b.code)).toEqual([code]);
    const blend = BUNDLE.blends.find((b) => b.code === code)!;
    expect(snapshot.content.ingredients.map((i) => i.id).sort()).toEqual(blend.ingredients.map((i) => i.id).sort());
    expect(snapshot.content.shops.length).toBeGreaterThan(0);
  });
});

describe("the server and the phone agree (SPEC §3.3)", () => {
  const catalog = catalogOf(BUNDLE);
  const items = ["earl-grey", "assam", "lemon", "sugar", "sencha"];

  /** A small vocabulary of commands about the same few brews, ingredients and blends. */
  const commands = (brewIds: string[]) =>
    fc.array(
      fc.oneof(
        fc
          .record({
            ingredient: fc.constantFrom(...items),
            have: fc.option(fc.boolean(), { nil: undefined }),
            amount: fc.option(fc.integer({ min: 0, max: 300 }), { nil: undefined }),
          })
          .map(({ ingredient, have: h, amount }) => ({
            type: "pantry.set",
            payload: {
              ingredient,
              ...(h === undefined ? { have: true } : { have: h }),
              ...(amount === undefined ? {} : { amount }),
            },
          })),
        fc
          .record({
            brew: fc.constantFrom(...brewIds),
            code: fc.constantFrom("005", "006", "002"),
            cups: fc.integer({ min: 1, max: 3 }),
          })
          .map(({ brew, code, cups }) => ({
            type: "brew.logged",
            payload: { brew, tea: { kind: "blend", code }, cups, date: "2026-11-23" },
          })),
        fc
          .record({ brew: fc.constantFrom(...brewIds), rating: fc.integer({ min: 1, max: 5 }) })
          .map((payload) => ({ type: "brew.rated", payload })),
        fc.constantFrom(...brewIds).map((brew) => ({ type: "brew.removed", payload: { brew } })),
        fc
          .record({ blend: fc.constantFrom("005", "006"), favourite: fc.boolean() })
          .map((payload) => ({ type: "blend.marked", payload })),
      ),
      { maxLength: 14 },
    );

  it("ends on the state core's reducer reaches, whatever the batches", async () => {
    const run = fc
      .uniqueArray(fc.uuid(), { minLength: 3, maxLength: 3 })
      .chain((ids) => fc.tuple(commands(ids), fc.integer({ min: 1, max: 5 })));
    await fc.assert(
      fc.asyncProperty(run, async ([list, batchSize]) => {
        const sent = list.map((c, i) => command(c.type, c.payload, NOW - (list.length - i) * 60_000));
        let expected: State = initialState();
        for (const raw of sent) {
          const parsed = parseCommand(raw);
          if (parsed.ok) expected = applyCommand(expected, parsed.command as Command, catalog, NOW).state;
        }
        const t = await testApp({ now: NOW });
        let last = await t.snapshot();
        for (let i = 0; i < sent.length; i += batchSize)
          last = (await t.commands(...sent.slice(i, i + batchSize))).snapshot;
        expect(last.state).toEqual(expected);
        expect((await t.snapshot()).state).toEqual(expected);
      }),
      { numRuns: 60 },
    );
  });
});
