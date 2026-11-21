import { initialState } from "@teatime/core";
import { describe, expect, it } from "vitest";
import { fakeServer, freshDevice, snapshotOf } from "../test/fakes";
import { newId, send } from "./commands";
import { followKept, kept, syncStatus } from "./store";
import { setFetch } from "./api";
import { adopt, syncNow } from "./sync";
import { currentView } from "./view";

const NOW = Date.now();
const brewOf = (code: string) => ({
  brew: newId(),
  tea: { kind: "blend" as const, code },
  cups: 1,
  date: "2026-11-21",
});

describe("the outbox and sync (SPEC §3.3)", () => {
  it("shows a change at once, sends it, and drops it once the server's snapshot holds it", async () => {
    const db = freshDevice();
    const server = fakeServer();
    const { result } = await send("pantry.set", { ingredient: "assam", have: true, amount: 100 });
    expect(result.ok).toBe(true);
    expect(currentView().state.pantry.assam?.amount.value).toBe(100);
    expect(await db.outbox.count()).toBe(1);

    await syncNow();
    expect(await db.outbox.count()).toBe(0);
    const kept = await db.snapshot.get("current");
    expect(kept?.snapshot.state.pantry.assam?.amount.value).toBe(100);
    expect(server.requests.map((r) => `${r.method} ${r.path}`)).toEqual(["POST commands"]);
  });

  it("never counts a change twice: an answer lost on the way back is answered again as a repeat", async () => {
    const db = freshDevice();
    const server = fakeServer();
    await send("brew.logged", brewOf("005"));
    // The server applies it, but its answer never arrives: the command stays in the outbox.
    server.loseNextAnswer = true;
    await syncNow();
    expect(await db.outbox.count()).toBe(1);
    expect(Object.keys(server.state.brews)).toHaveLength(1);

    await syncNow();
    expect(server.requests.at(-1)?.path).toBe("commands");
    expect(await db.outbox.count()).toBe(0);
    expect(Object.keys(server.state.brews)).toHaveLength(1);
    kept.update((k) => ({ ...k, outbox: [] }));
    kept.update((k) => ({ ...k, snapshot: null }));
    const stored = (await db.snapshot.get("current"))!.snapshot;
    expect(Object.keys(stored.state.brews)).toHaveLength(1);
  });

  it("keeps a refused change to show, and the ones after it go through", async () => {
    const db = freshDevice();
    fakeServer();
    // Valid on the device's state, refused by the server's: the server lost the brew (a restore).
    const { command } = await send("brew.logged", brewOf("005"));
    const brew = (command.payload as { brew: string }).brew;
    await syncNow();
    const rated = await send("brew.rated", { brew, rating: 5 });
    await send("blend.marked", { blend: "005", favourite: true });
    // The server forgot the brew meanwhile.
    const server = fakeServer({ ...initialState() });
    await syncNow();
    expect(rated.result.ok).toBe(true);
    expect(await db.outbox.count()).toBe(0);
    const refused = await db.refused.toArray();
    expect(refused.map((r) => [r.command.type, r.code])).toEqual([["brew.rated", "not_found"]]);
    expect(server.state.marks["005"]?.favourite.value).toBe(true);
  });

  it("keeps an undecided change (server_error, unsupported_version) to send again", async () => {
    const db = freshDevice();
    const server = fakeServer();
    server.answerWith = "server_error";
    await send("blend.marked", { blend: "005", favourite: true });
    await syncNow();
    expect(await db.outbox.count()).toBe(1);
    expect(await db.refused.count()).toBe(0);
    server.answerWith = null;
    await syncNow();
    expect(await db.outbox.count()).toBe(0);
  });

  it("keeps everything when the server can't be reached, and says so", async () => {
    const db = freshDevice();
    const server = fakeServer();
    server.down = true;
    await send("blend.marked", { blend: "005", favourite: true });
    await syncNow();
    expect(await db.outbox.count()).toBe(1);
    expect(syncStatus.get().error?.code).toBe("offline");
    server.down = false;
    await syncNow();
    expect(syncStatus.get().error).toBeNull();
    expect(await db.outbox.count()).toBe(0);
  });

  it("ignores a snapshot older than the one kept", async () => {
    const db = freshDevice();
    await db.transaction("rw", db.snapshot, () => adopt(db, snapshotOf(initialState(), 5)));
    expect(await db.transaction("rw", db.snapshot, () => adopt(db, snapshotOf(initialState(), 4)))).toBe(false);
    expect(await db.transaction("rw", db.snapshot, () => adopt(db, snapshotOf(initialState(), 5)))).toBe(true);
    expect((await db.snapshot.get("current"))?.snapshot.revision).toBe(5);
  });

  it("doesn't queue a change the device's own state refuses", async () => {
    const db = freshDevice();
    fakeServer();
    const { result } = await send("brew.rated", { brew: newId(), rating: 4 });
    expect(result).toEqual({ ok: false, code: "not_found" });
    expect(await db.outbox.count()).toBe(0);
  });

  it("follows the device's storage into the store", async () => {
    const db = freshDevice();
    const stop = followKept();
    await db.outbox.add({
      command: { id: newId(), v: 1, at: NOW, type: "blend.marked", payload: { blend: "005", favourite: true } },
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(kept.get().outbox).toHaveLength(1);
    stop();
  });
});

describe("the self-review of phase 6", () => {
  it("sends a change made while a sync was under way, without waiting for the next trigger", async () => {
    const db = freshDevice();
    const server = fakeServer();
    let release: () => void = () => {};
    server.hold = new Promise<void>((resolve) => (release = resolve));
    await send("blend.marked", { blend: "005", favourite: true });
    const first = syncNow();
    await send("blend.marked", { blend: "006", favourite: true });
    // syncSoon's call, 2 s later, finds the first sync still waiting for its answer.
    void syncNow();
    server.hold = null;
    release();
    await first;
    expect(await db.outbox.count()).toBe(0);
    expect(server.state.marks["006"]?.favourite.value).toBe(true);
  });

  it("reads a proxy's 500 without a code as the server out of reach", async () => {
    freshDevice();
    setFetch(async () => new Response("", { status: 500 }));
    await syncNow();
    expect(syncStatus.get().error?.code).toBe("offline");
  });
});
