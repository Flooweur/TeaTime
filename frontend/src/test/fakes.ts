/**
 * The tests' server and device: a fresh IndexedDB per test, and a fake `/api` that answers like the
 * backend, applying commands with core's reducer.
 */
import {
  type Command,
  type CommandOutcome,
  type DayType,
  type OnlineResult,
  type Snapshot,
  type State,
  addAway,
  applyCommand,
  drawNow,
  initialState,
  parseCommand,
  removeAway,
  setOverride,
  updateSettings,
} from "@teatime/core";
import { setFetch } from "../lib/api";
import { baseCatalog, bundle } from "../lib/content";
import { TeaDb, setDbForTests } from "../lib/db";
import { kept } from "../lib/store";

let n = 0;

/** A fresh device: its own IndexedDB, and the store emptied. */
export function freshDevice(): TeaDb {
  const db = new TeaDb(`teatime-test-${++n}`);
  setDbForTests(db);
  kept.set({ loaded: true, snapshot: null, outbox: [], refused: [], storageError: null });
  return db;
}

export const snapshotOf = (state: State, revision: number): Snapshot => ({
  revision,
  contentHash: bundle.hash,
  serverTime: Date.now(),
  state,
  content: { blends: [], ingredients: [], gear: [], shops: [], teaTypes: [] },
});

/** A server holding a state, deciding commands as the backend does; `down` makes it unreachable. */
export function fakeServer(start: State = initialState()) {
  const server = {
    state: start,
    revision: 0,
    decided: new Map<string, CommandOutcome>(),
    down: false,
    /** Forces this code on the next commands, as a server bug or an older server would. */
    answerWith: null as "server_error" | "unsupported_version" | null,
    /** The next answer is lost on its way back, after the server applied the commands. */
    loseNextAnswer: false,
    /** While set, each request waits for it: a slow network. */
    hold: null as Promise<void> | null,
    requests: [] as { method: string; path: string; body: unknown }[],
  };
  setFetch(async (input, init) => {
    if (server.down) throw new TypeError("Failed to fetch");
    if (server.hold) await server.hold;
    const path = input.replace(/^\/api\//, "");
    const method = init?.method ?? "GET";
    const body = init?.body ? (JSON.parse(String(init.body)) as unknown) : undefined;
    server.requests.push({ method, path, body });
    const json = (data: unknown) => new Response(JSON.stringify(data), { status: 200 });
    if (method === "GET" && path === "state") return json(snapshotOf(server.state, server.revision));
    if (method === "POST" && path === "commands") {
      const results = (body as { commands: Command[] }).commands.map((raw): CommandOutcome => {
        const done = server.decided.get(raw.id);
        if (done) return { ...done, repeat: true };
        if (server.answerWith) {
          return server.answerWith === "server_error"
            ? { id: raw.id, ok: false, code: "server_error" }
            : { id: raw.id, ok: false, code: "unsupported_version", problem: "newer" };
        }
        const parsed = parseCommand(raw);
        if (!parsed.ok) return { id: raw.id, ...parsed };
        const applied = applyCommand(server.state, parsed.command, baseCatalog, Date.now());
        server.state = applied.state;
        const outcome = { id: raw.id, ...applied.result };
        server.decided.set(raw.id, outcome);
        return outcome;
      });
      server.revision++;
      if (server.loseNextAnswer) {
        server.loseNextAnswer = false;
        throw new TypeError("The network dropped the answer");
      }
      return json({ results, snapshot: snapshotOf(server.state, server.revision) });
    }
    // The online operations, with core's own functions, as the backend runs them.
    const [route = "", query = ""] = path.split("?");
    const confirm = query.includes("confirm=true");
    const now = Date.now();
    let result: OnlineResult | null = null;
    if (method === "PUT" && route === "settings")
      result = updateSettings(server.state, baseCatalog, now, body, confirm);
    if (method === "PUT" && route.startsWith("overrides/")) {
      const type = (body as { type: DayType | null }).type;
      result = setOverride(server.state, baseCatalog, now, route.slice("overrides/".length), type, confirm);
    }
    if (method === "POST" && route === "away") result = addAway(server.state, baseCatalog, now, body, confirm);
    if (method === "DELETE" && route.startsWith("away/"))
      result = removeAway(server.state, baseCatalog, now, route.slice(5));
    if (method === "POST" && /^picks\/[\d-]+\/draw$/.test(route))
      result = drawNow(server.state, baseCatalog, now, route.split("/")[1]!);
    if (result?.ok) {
      server.state = result.state;
      server.revision++;
      return json(snapshotOf(server.state, server.revision));
    }
    if (result)
      return new Response(JSON.stringify({ ...result, error: result.code }), {
        status: result.code === "invalid" ? 400 : 409,
      });
    return new Response(JSON.stringify({ error: "Not found.", code: "not_found" }), { status: 404 });
  });
  return server;
}
