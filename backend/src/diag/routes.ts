/**
 * The server's own routes (SPEC §3.4, §3.8):
 * - `GET health`: up, with its version and environment;
 * - `GET diag`: what the diagnostics screen shows: versions, the clock (the app flags a device
 *   more than 60 s off it), the jobs' last runs, the push subscriptions (their service only, never
 *   an endpoint or key), the recent pushes and refused commands, and the backups;
 * - `POST jobs/:name/run`: runs a job now (the notifier, the backup).
 */
import { desc, sql } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { listBackups } from "../db/backup.js";
import { appliedCommands, notifications, pushSubscriptions } from "../db/schema.js";
import type { Deps } from "../deps.js";
import { allJobs, runJobNow } from "../jobs/every.js";
import { HttpError } from "../lib/errors.js";
import { loadState, readRevision } from "../state/rows.js";
import { APP_VERSION } from "../version.js";

/** How many recent pushes and refused commands the diagnostics list. */
const RECENT = 20;

export const diagRoutes: FastifyPluginAsync<{
  deps: Deps;
  environment: string;
  pushOn: boolean;
  backupDir: string | null;
}> = async (app, { deps, environment, pushOn, backupDir }) => {
  app.get("/health", async () => ({ ok: true, version: APP_VERSION, environment }));

  app.get("/diag", async () => {
    const { db } = deps;
    const state = loadState(db, deps.warn);
    const subscriptions = db
      .select()
      .from(pushSubscriptions)
      .all()
      .map((sub) => ({
        id: sub.id,
        service: new URL(sub.endpoint).hostname,
        createdAt: sub.createdAt,
        lastSuccessAt: sub.lastSuccessAt,
        failures: sub.failures,
        disabledAt: sub.disabledAt,
      }));
    const refused = db
      .select()
      .from(appliedCommands)
      .where(sql`json_extract(${appliedCommands.result}, '$.ok') = 0`)
      .orderBy(desc(appliedCommands.receivedAt))
      .limit(RECENT)
      .all()
      .map((row) => ({
        type: row.type,
        receivedAt: row.receivedAt,
        code: (JSON.parse(row.result) as { code?: string }).code ?? null,
      }));
    const commands =
      db
        .select({ count: sql<number>`count(*)` })
        .from(appliedCommands)
        .get()?.count ?? 0;
    const backups = backupDir ? listBackups(backupDir) : [];
    return {
      version: APP_VERSION,
      environment,
      serverTime: deps.clock().getTime(),
      timeZone: state.settings.timeZone,
      revision: readRevision(db),
      contentHash: deps.content.hash,
      counts: {
        picks: Object.keys(state.picks).length,
        brews: Object.keys(state.brews).length,
        pantry: Object.keys(state.pantry).length,
        commands,
      },
      jobs: allJobs(),
      push: { on: pushOn, subscriptions },
      notifications: db.select().from(notifications).orderBy(desc(notifications.updatedAt)).limit(RECENT).all(),
      refused,
      backups: { on: backupDir !== null, count: backups.length, latest: backups[0] ?? null },
    };
  });

  app.post<{ Params: { name: string } }>("/jobs/:name/run", async (req, reply) => {
    if (!runJobNow(req.params.name)) throw new HttpError(404, "No such job.", "unknown_job");
    return reply.code(202).send({ started: req.params.name });
  });
};
