/**
 * The app's files, served by the server itself (SPEC §3.1: one container), and the security
 * headers every answer carries (SPEC §3.8; EagleEye's Caddy headers, as a hook).
 *
 * - **Caching:** only `/assets/*` (hashed build files) is immutable. Everything else (index.html,
 *   the service worker, the manifest, the icons) is `no-cache`, so a new version is seen at once.
 * - **The app's pages:** a page load (GET, wanting HTML) of any other address outside `/api` and
 *   `/assets` gets index.html, for the app's router. A missing `/assets/x.js` is a 404, never the
 *   app's HTML, which a browser would try to run as script.
 * - **CSP:** scripts from the app's origin only, plus index.html's one inline script (the light /
 *   dark choice before the first paint), allowed by its hash, computed from the built file.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import fastifyStatic from "@fastify/static";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

/** The hashes of a page's inline scripts (those without `src`), as CSP sources. */
export function inlineScriptHashes(html: string): string[] {
  const hashes: string[] = [];
  for (const match of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    const body = match[1] ?? "";
    if (body.trim() === "") continue;
    hashes.push(`'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`);
  }
  return hashes;
}

/** The Content-Security-Policy, for these inline script hashes. */
export function contentSecurityPolicy(scriptHashes: readonly string[]): string {
  return [
    "default-src 'self'",
    `script-src 'self'${scriptHashes.map((h) => ` ${h}`).join("")}`,
    // React's style attributes (a timer's progress bar).
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

/** Every answer's security headers; the CSP once the app's files are served. */
export function securityHeaders(app: FastifyInstance, csp: string | null): void {
  app.addHook("onSend", async (_req, reply, payload) => {
    reply.header("x-content-type-options", "nosniff");
    reply.header("referrer-policy", "no-referrer");
    // HTTPS only, for a day: the app is reached through `tailscale serve`'s TLS. Browsers ignore
    // it over plain HTTP (http://127.0.0.1:8081).
    reply.header("strict-transport-security", "max-age=86400");
    reply.header("permissions-policy", "camera=(), microphone=(), geolocation=()");
    if (csp) reply.header("content-security-policy", csp);
    return payload;
  });
}

/** Whether a request is a page load the app's router answers. */
export function isPageLoad(req: FastifyRequest): boolean {
  const pathname = req.url.split("?")[0] ?? "/";
  return (
    (req.method === "GET" || req.method === "HEAD") &&
    !pathname.startsWith("/api/") &&
    pathname !== "/api" &&
    !pathname.startsWith("/assets/") &&
    (req.headers.accept ?? "").includes("text/html")
  );
}

/**
 * Serves the built app from `dir` (frontend/dist), and returns the page-load fallback for the
 * not-found handler. Throws when `dir` has no index.html: a build missing it can't serve the app.
 */
export async function serveApp(
  app: FastifyInstance,
  dir: string,
): Promise<{ csp: string; fallback: (reply: FastifyReply) => FastifyReply }> {
  const index = path.join(dir, "index.html");
  if (!existsSync(index)) throw new Error(`${index} not found: build the app first (npm run build -w frontend)`);
  const csp = contentSecurityPolicy(inlineScriptHashes(readFileSync(index, "utf8")));
  await app.register(fastifyStatic, {
    root: dir,
    // Every answer sets its own cache-control below.
    cacheControl: false,
    setHeaders: (reply, file) => {
      const hashed = path.relative(dir, file).split(path.sep)[0] === "assets";
      reply.header("cache-control", hashed ? "public, max-age=31536000, immutable" : "no-cache");
    },
  });
  return {
    csp,
    fallback: (reply) => reply.header("cache-control", "no-cache").type("text/html").sendFile("index.html"),
  };
}
