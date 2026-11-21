/**
 * The Fastify app (SPEC §3.4; its hardening ported from EagleEye's app.ts): every route under
 * `/api`, not yet listening. Everything with a side effect comes in as a dependency, so a test
 * passes an in-memory database, a clock it moves, its own content and a push sender that records.
 *
 * - **No login:** Tailscale is the gate (SPEC §1.2).
 * - **Same origin:** a write (any method but GET and HEAD) that says where it comes from must come
 *   from one of the app's origins, or it is refused with `cross_origin`. Browsers always send
 *   `Origin` on a write, so one without it isn't a page on another site (a script on the PC).
 * - **JSON only:** a body of any other type is refused (415), so no HTML form can post one.
 * - **No HTTP cache** keeps an API answer: `no-store`, unless a route sets its own.
 * - **Errors** are `{ error, code }`: the app checks the code, never the words.
 */
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { BUNDLE } from "@teatime/content/bundle";
import { type ContentBundle, catalogOf } from "@teatime/core";
import Fastify, { type FastifyError } from "fastify";
import { config } from "./config.js";
import type { Db } from "./db/client.js";
import type { Deps } from "./deps.js";
import { diagRoutes } from "./diag/routes.js";
import { exportRoutes } from "./export/routes.js";
import { type Clock, systemClock } from "./lib/clock.js";
import { HttpError, safeError } from "./lib/errors.js";
import { pickRoutes } from "./picks/routes.js";
import { pushRoutes } from "./push/routes.js";
import type { PushSender } from "./push/sender.js";
import { settingsRoutes } from "./settings/routes.js";
import { stateRoutes } from "./state/routes.js";

export interface AppDeps {
  readonly db: Db;
  readonly clock?: Clock;
  /** The content: the built bundle unless a test passes its own. */
  readonly content?: ContentBundle;
  /** The origins writes may come from: config's unless a test passes its own. */
  readonly origins?: readonly string[];
  /** The base of push links. */
  readonly publicOrigin?: string;
  /** Sends a push: the real sender, a test's fake, or none (pushes off). */
  readonly push?: PushSender | null;
  /** The VAPID public key `GET push/key` gives the app. */
  readonly pushKey?: string | null;
  readonly backupDir?: string | null;
  readonly environment?: string;
  /** Logs on (the default outside tests), off, or into a stream a test reads. */
  readonly logger?: boolean | { stream: { write(line: string): void } };
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export async function buildApp(appDeps: AppDeps) {
  const content = appDeps.content ?? BUNDLE;
  const origins = appDeps.origins ?? config.origins;
  const logger = appDeps.logger ?? !config.isTest;
  const serializers = { err: (err: unknown) => safeError(err) as { type: string; message: string; stack: string } };
  const app = Fastify({
    logger: logger === false ? false : { ...(logger === true ? {} : logger), serializers },
    // A body with a field it shouldn't have is refused, never trimmed, and no value is coerced to another type.
    ajv: { customOptions: { removeAdditional: false, coerceTypes: false } },
  }).withTypeProvider<TypeBoxTypeProvider>();

  const deps: Deps = {
    db: appDeps.db,
    content,
    catalog: catalogOf(content),
    clock: appDeps.clock ?? systemClock,
    warn: (message) => app.log.warn(message),
  };

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof HttpError) {
      return reply.code(err.statusCode).send({ ...err.details, error: err.message, code: err.code });
    }
    // Fastify's own: a request that fails its schema, a body too large, a type that isn't JSON.
    const e = (err ?? {}) as Partial<FastifyError>;
    if (e.validation) return reply.code(400).send({ error: e.message, code: "invalid_request" });
    const status = e.statusCode ?? 500;
    if (status >= 400 && status < 500) {
      return reply.code(status).send({ error: e.message, code: e.code?.toLowerCase() ?? "bad_request" });
    }
    req.log.error({ err }, "request failed");
    return reply.code(500).send({ error: "Something went wrong on the server.", code: "server_error" });
  });
  app.setNotFoundHandler((_req, reply) => reply.code(404).send({ error: "Not found.", code: "not_found" }));
  app.addHook("onSend", async (_req, reply, payload) => {
    if (!reply.hasHeader("cache-control")) reply.header("cache-control", "no-store");
    return payload;
  });
  app.addHook("onRequest", async (req) => {
    if (SAFE_METHODS.has(req.method)) return;
    const { origin } = req.headers;
    if (origin !== undefined && !origins.includes(origin)) {
      throw new HttpError(403, "This request comes from another site.", "cross_origin");
    }
  });
  app.removeContentTypeParser("text/plain");

  await app.register(
    async (api) => {
      await api.register(stateRoutes, { deps });
      await api.register(pickRoutes, { deps });
      await api.register(settingsRoutes, { deps });
      await api.register(pushRoutes, {
        deps,
        send: appDeps.push ?? null,
        publicKey: appDeps.pushKey ?? null,
        publicOrigin: appDeps.publicOrigin ?? config.publicOrigin,
      });
      await api.register(exportRoutes, { deps });
      await api.register(diagRoutes, {
        deps,
        environment: appDeps.environment ?? config.environment,
        pushOn: (appDeps.push ?? null) !== null,
        backupDir: appDeps.backupDir ?? null,
      });
    },
    { prefix: "/api" },
  );

  return { app, deps };
}
