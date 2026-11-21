import { describe, expect, it } from "vitest";
import { notifications } from "../src/db/schema.js";
import { STALE_SENDING_MS, notifier } from "../src/jobs/notifier.js";
import { ORIGIN, at, have, testApp, type TestApp } from "./helpers.js";

const APPLE = "https://web.push.apple.com/device";
const keys = { p256dh: "p256dh-key", auth: "auth-key" };

const pass = (t: TestApp) => notifier({ ...t.deps, send: t.push?.send ?? null, publicOrigin: ORIGIN });

/** Sunday before Monday's office day, with a device subscribed and #005 and #006 makeable. */
async function sunday(time: string, options: { subscribe?: boolean } = {}) {
  const t = await testApp({ now: at("2026-11-22", time) });
  await t.commands(have("earl-grey", at("2026-11-22", "08:00"), 300), have("assam", at("2026-11-22", "08:00"), 300));
  if (options.subscribe ?? true) await t.call("POST", "/api/push/subscriptions", { endpoint: APPLE, keys });
  return t;
}

describe("the notifier (SPEC §2.7, §3.5)", () => {
  it("draws Monday at Sunday's evening time and sends the evening push once", async () => {
    const t = await sunday("20:29");
    expect(await pass(t)).toEqual({ drawn: [], pushes: [] });
    t.clock.set(at("2026-11-22", "20:30"));
    const first = await pass(t);
    expect(first.drawn).toEqual(["2026-11-23"]);
    expect(first.pushes).toEqual([{ tag: "evening:2026-11-23", sent: 1, failed: 0 }]);
    const [push] = t.push!.sent;
    expect(push?.message.title).toMatch(/^Tomorrow at the office: #00[56] /);
    expect(push?.message.navigate).toMatch(new RegExp(`^${ORIGIN}/today\\?date=2026-11-23&blend=00[56]&from=push$`));
    // Its TTL is what is left of the 2 h 30 window.
    expect(push?.ttlS).toBe(150 * 60);

    t.clock.advance(30_000);
    expect(await pass(t)).toEqual({ drawn: [], pushes: [] });
    expect(t.push!.sent).toHaveLength(1);
  });

  it("draws even with no device to tell, and claims no push", async () => {
    const t = await sunday("20:31", { subscribe: false });
    expect(await pass(t)).toEqual({ drawn: ["2026-11-23"], pushes: [] });
    expect(t.db.select().from(notifications).all()).toEqual([]);
  });

  it("draws with notifications off, and sends nothing", async () => {
    const t = await sunday("20:00");
    await t.call("PUT", "/api/settings", { notifications: false });
    t.clock.set(at("2026-11-22", "20:31"));
    expect(await pass(t)).toEqual({ drawn: ["2026-11-23"], pushes: [] });
  });

  it("sends nothing in the evening once the kit is packed early", async () => {
    const t = await sunday("18:00");
    await t.call("POST", "/api/picks/2026-11-23/draw");
    await t.commands({
      id: crypto.randomUUID(),
      v: 1,
      at: at("2026-11-22", "18:05"),
      type: "pick.packed",
      payload: { date: "2026-11-23", cups: 2 },
    });
    t.clock.set(at("2026-11-22", "20:31"));
    expect(await pass(t)).toEqual({ drawn: [], pushes: [] });
  });

  it("tries a failed push again on the next pass, until its window ends", async () => {
    const t = await sunday("20:30");
    t.push!.control.failWith = "unreachable";
    expect((await pass(t)).pushes).toEqual([{ tag: "evening:2026-11-23", sent: 0, failed: 1 }]);
    t.clock.advance(30_000);
    t.push!.control.failWith = null;
    expect((await pass(t)).pushes).toEqual([{ tag: "evening:2026-11-23", sent: 1, failed: 0 }]);
    expect(t.db.select().from(notifications).get()).toMatchObject({ status: "sent", attempts: 2 });

    // Past the window (2 h 30 after 20:30), a push that failed is let go.
    const late = await sunday("20:30");
    late.push!.control.failWith = 500;
    await pass(late);
    late.push!.control.failWith = null;
    late.clock.set(at("2026-11-22", "23:00"));
    expect((await pass(late)).pushes).toEqual([]);
  });

  it("takes over a push left sending by a crash, once it is 2 minutes old", async () => {
    const t = await sunday("20:30");
    await pass(t);
    // As if the pass had died between its claim and its send.
    t.db.update(notifications).set({ status: "sending", sentAt: null }).run();
    t.clock.advance(STALE_SENDING_MS - 1);
    expect((await pass(t)).pushes).toEqual([]);
    t.clock.advance(1);
    expect((await pass(t)).pushes).toEqual([{ tag: "evening:2026-11-23", sent: 1, failed: 0 }]);
  });

  it("sends Monday's morning push at 08:00, and the Saturday review at 10:00", async () => {
    const t = await sunday("20:30");
    await pass(t);
    t.clock.set(at("2026-11-23", "08:00"));
    expect((await pass(t)).pushes.map((p) => p.tag)).toEqual(["morning:2026-11-23"]);
    t.clock.set(at("2026-11-28", "10:00"));
    expect((await pass(t)).pushes.map((p) => p.tag)).toContain("review:2026-11-28");
  });
});
