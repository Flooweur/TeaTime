import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { allJobs, startEvery } from "../src/jobs/every.js";
import { at, command, testApp } from "./helpers.js";

const stops: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const stop of stops.splice(0)) await stop();
});

describe("health and diagnostics (SPEC §3.4, §3.8)", () => {
  it("is up, with its version", async () => {
    const t = await testApp();
    const { body } = await t.call("GET", "/api/health");
    expect(body).toMatchObject({ ok: true, environment: "test" });
    expect(Number.isInteger(body?.version)).toBe(true);
  });

  it("shows the clock, the counts, the subscriptions' services only, and the refused commands", async () => {
    const t = await testApp({ now: at("2026-11-23", "09:00") });
    await t.call("POST", "/api/push/subscriptions", {
      endpoint: "https://web.push.apple.com/secret-device-token",
      keys: { p256dh: "key", auth: "auth" },
    });
    await t.commands(command("brew.rated", { brew: randomUUID(), rating: 4 }, at("2026-11-23", "08:59")));
    const { body } = await t.call("GET", "/api/diag");
    expect(body).toMatchObject({
      serverTime: at("2026-11-23", "09:00"),
      timeZone: "Europe/Paris",
      counts: { picks: 0, brews: 0, pantry: 0, commands: 1 },
      push: { on: true, subscriptions: [{ service: "web.push.apple.com", failures: 0 }] },
      refused: [{ type: "brew.rated", code: "not_found" }],
      backups: { on: false, count: 0, latest: null },
    });
    expect(JSON.stringify(body)).not.toContain("secret-device-token");
  });

  it("runs a job by its name now, and refuses an unknown one", async () => {
    const t = await testApp();
    const task = vi.fn(async () => {});
    stops.push(startEvery("probe", 3_600_000, task, { error: () => {} }));
    expect((await t.call("POST", "/api/jobs/probe/run")).status).toBe(202);
    await vi.waitFor(() => expect(task).toHaveBeenCalledTimes(1));
    expect(allJobs().find((job) => job.name === "probe")).toMatchObject({ runs: 1, lastError: null });
    expect((await t.call("POST", "/api/jobs/nothing/run")).body).toMatchObject({ code: "unknown_job" });
  });
});

describe("startEvery (SPEC §3.5)", () => {
  it("never overlaps a run, keeps going after an error, and waits for the run under way when stopped", async () => {
    let release: () => void = () => {};
    let calls = 0;
    const errors: unknown[] = [];
    const stop = startEvery(
      "slow",
      10,
      async () => {
        calls++;
        if (calls === 1) throw new Error("first run fails");
        await new Promise<void>((resolve) => (release = resolve));
      },
      { error: (obj: unknown) => errors.push(obj) },
      { runNow: true },
    );
    await vi.waitFor(() => expect(calls).toBe(2));
    expect(errors).toHaveLength(1);
    expect(allJobs().find((job) => job.name === "slow")).toMatchObject({ failingRuns: 1, running: true });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(calls).toBe(2);
    let stopped = false;
    const stopping = stop().then(() => (stopped = true));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(stopped).toBe(false);
    release();
    await stopping;
    expect(allJobs().find((job) => job.name === "slow")).toBeUndefined();
  });
});
