import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { openDb } from "../src/db/client.js";
import { inlineScriptHashes } from "../src/http/static.js";

const THEME = 'document.documentElement.dataset.theme = "dark";';
const INDEX = `<!doctype html><html><head><script>${THEME}</script><script type="module" src="/assets/app.js"></script></head><body></body></html>`;

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A built app: index.html, a hashed script, the service worker. */
function builtApp(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "teatime-dist-"));
  dirs.push(dir);
  mkdirSync(path.join(dir, "assets"));
  writeFileSync(path.join(dir, "index.html"), INDEX);
  writeFileSync(path.join(dir, "assets", "app.js"), `console.log(${JSON.stringify("x".repeat(2000))});`);
  writeFileSync(path.join(dir, "sw.js"), "self.addEventListener('install', () => {});");
  return dir;
}

async function served() {
  const { app } = await buildApp({ db: openDb(":memory:"), staticDir: builtApp(), logger: false, environment: "test" });
  const get = (url: string, accept = "text/html") => app.inject({ method: "GET", url, headers: { accept } });
  return { app, get };
}

describe("serving the app (SPEC §3.8)", () => {
  it("serves index.html no-cache, with a CSP that allows its inline script by hash", async () => {
    const { get } = await served();
    const res = await get("/");
    expect(res.statusCode).toBe(200);
    expect(res.headers["cache-control"]).toBe("no-cache");
    const hash = `'sha256-${createHash("sha256").update(THEME).digest("base64")}'`;
    expect(res.headers["content-security-policy"]).toContain(`script-src 'self' ${hash}`);
    expect(res.headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["referrer-policy"]).toBe("no-referrer");
  });

  it("answers any page address with the app, for its router", async () => {
    const { get } = await served();
    const res = await get("/today?date=2026-11-23&from=push");
    expect(res.statusCode).toBe(200);
    expect(res.body).toContain(THEME);
    expect(res.headers["cache-control"]).toBe("no-cache");
  });

  it("caches the hashed assets for good, and the service worker never", async () => {
    const { get } = await served();
    const asset = await get("/assets/app.js", "*/*");
    expect(asset.statusCode).toBe(200);
    expect(asset.headers["cache-control"]).toBe("public, max-age=31536000, immutable");
    const sw = await get("/sw.js", "*/*");
    expect(sw.headers["cache-control"]).toBe("no-cache");
  });

  it("answers a missing asset and an unknown API address 404, never with the app's page", async () => {
    const { get } = await served();
    const asset = await get("/assets/gone.js");
    expect(asset.statusCode).toBe(404);
    expect(asset.body).not.toContain("<html");
    const api = await get("/api/nothing");
    expect(api.statusCode).toBe(404);
    expect(api.json()).toMatchObject({ code: "not_found" });
    expect(api.headers["cache-control"]).toBe("no-store");
  });

  it("compresses what is worth it", async () => {
    const { app } = await served();
    const res = await app.inject({ method: "GET", url: "/assets/app.js", headers: { "accept-encoding": "gzip" } });
    expect(res.headers["content-encoding"]).toBe("gzip");
  });

  it("refuses to start without a built app", async () => {
    const empty = mkdtempSync(path.join(tmpdir(), "teatime-empty-"));
    dirs.push(empty);
    await expect(buildApp({ db: openDb(":memory:"), staticDir: empty, logger: false })).rejects.toThrow(
      /index\.html not found/,
    );
  });

  it("finds a page's inline scripts, and leaves those with a src", () => {
    expect(inlineScriptHashes(INDEX)).toHaveLength(1);
    expect(inlineScriptHashes('<script src="/a.js"></script><script>\n</script>')).toEqual([]);
  });
});

describe("compression", () => {
  it("uses brotli or gzip only, which every browser reads", async () => {
    const { app } = await served();
    const res = await app.inject({
      method: "GET",
      url: "/assets/app.js",
      headers: { "accept-encoding": "zstd, br, gzip" },
    });
    expect(res.headers["content-encoding"]).toBe("br");
  });
});
