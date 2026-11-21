import { describe, expect, it } from "vitest";
import { pushSubscriptions } from "../src/db/schema.js";
import { MAX_SUBSCRIPTIONS } from "../src/push/service.js";
import { payloadOf } from "../src/push/sender.js";
import { ORIGIN, testApp } from "./helpers.js";

const APPLE = "https://web.push.apple.com/QGuQyavXutnMH7xPvIfjBzR2";
const keys = {
  p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
  auth: "tBHItJI5svbpez7KI4CCXg",
};

describe("the push routes (SPEC §3.4, §3.8)", () => {
  it("gives the VAPID key only when pushes are on", async () => {
    expect((await (await testApp()).call("GET", "/api/push/key")).body).toEqual({ publicKey: "test-public-key" });
    expect((await (await testApp({ push: null })).call("GET", "/api/push/key")).body).toEqual({ publicKey: null });
  });

  it("stores a push service's subscription, takes new keys for the same endpoint, and forgets it", async () => {
    const t = await testApp();
    expect(
      (await t.call("POST", "/api/push/subscriptions", { endpoint: APPLE, keys, expirationTime: null })).status,
    ).toBe(204);
    expect(
      (await t.call("POST", "/api/push/subscriptions", { endpoint: APPLE, keys: { ...keys, auth: "new" } })).status,
    ).toBe(204);
    const rows = t.db.select().from(pushSubscriptions).all();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.auth).toBe("new");
    expect((await t.call("DELETE", "/api/push/subscriptions", { endpoint: APPLE })).status).toBe(204);
    expect(t.db.select().from(pushSubscriptions).all()).toHaveLength(0);
  });

  it("refuses an endpoint that isn't a push service's (against SSRF)", async () => {
    const t = await testApp();
    for (const endpoint of [
      "http://web.push.apple.com/x",
      "https://example.com/push",
      "https://push.apple.com.evil.example/x",
      "nope",
    ]) {
      const res = await t.call("POST", "/api/push/subscriptions", { endpoint, keys });
      expect(res.body, endpoint).toMatchObject({ code: "invalid_endpoint" });
    }
  });

  it(`keeps at most ${MAX_SUBSCRIPTIONS} subscriptions on`, async () => {
    const t = await testApp();
    for (let i = 0; i < MAX_SUBSCRIPTIONS; i++) {
      expect((await t.call("POST", "/api/push/subscriptions", { endpoint: `${APPLE}${i}`, keys })).status).toBe(204);
    }
    const over = await t.call("POST", "/api/push/subscriptions", { endpoint: `${APPLE}x`, keys });
    expect(over.body).toMatchObject({ code: "too_many_subscriptions" });
  });

  it("sends a test push to every device; one whose service says it's gone is turned off, and comes back by subscribing", async () => {
    const t = await testApp();
    await t.call("POST", "/api/push/subscriptions", { endpoint: APPLE, keys });
    const test = await t.call("POST", "/api/push/test");
    expect(test.body).toEqual({ sent: 1, failed: 0, gone: 0 });
    expect(t.push?.sent[0]?.message).toEqual({
      title: "TeaTime",
      body: "A test push: notifications work.",
      navigate: `${ORIGIN}/settings?from=push`,
      tag: "test",
    });

    t.push!.control.failWith = 503;
    expect((await t.call("POST", "/api/push/test")).body).toEqual({ sent: 0, failed: 1, gone: 0 });
    expect(t.db.select().from(pushSubscriptions).get()?.failures).toBe(1);

    t.push!.control.failWith = 410;
    expect((await t.call("POST", "/api/push/test")).body).toEqual({ sent: 0, failed: 0, gone: 1 });
    expect(t.db.select().from(pushSubscriptions).get()?.disabledAt).not.toBeNull();
    expect((await t.call("POST", "/api/push/test")).body).toEqual({ sent: 0, failed: 0, gone: 0 });

    t.push!.control.failWith = null;
    await t.call("POST", "/api/push/subscriptions", { endpoint: APPLE, keys });
    expect(t.db.select().from(pushSubscriptions).get()).toMatchObject({ disabledAt: null, failures: 0 });
    expect((await t.call("POST", "/api/push/test")).body).toEqual({ sent: 1, failed: 0, gone: 0 });
  });

  it("answers push_off for a test push without VAPID keys", async () => {
    const t = await testApp({ push: null });
    const res = await t.call("POST", "/api/push/test");
    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({ code: "push_off" });
  });

  it("sends the declarative format, without mutable", () => {
    expect(
      JSON.parse(payloadOf({ title: "T", body: "B", navigate: `${ORIGIN}/today`, tag: "morning:2026-11-23" })),
    ).toEqual({
      web_push: 8030,
      notification: { title: "T", body: "B", navigate: `${ORIGIN}/today`, tag: "morning:2026-11-23" },
    });
  });
});
