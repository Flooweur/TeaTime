/**
 * The server: opens the database (migrating it), builds the app, starts the jobs (SPEC §3.5) and
 * listens. SIGINT and SIGTERM stop the jobs (each run under way finishes), then the app, then
 * close the database.
 */
import path from "node:path";
import { buildApp } from "./app.js";
import { config } from "./config.js";
import { openDb } from "./db/client.js";
import { BACKUP_EVERY_MS, backup } from "./jobs/backup.js";
import { startEvery } from "./jobs/every.js";
import { NOTIFIER_EVERY_MS, notifier } from "./jobs/notifier.js";
import { createPushSender } from "./push/sender.js";

const db = openDb(config.databasePath);
const push = await createPushSender(config.push);
const { app, deps } = await buildApp({
  db,
  push,
  pushKey: config.push?.publicKey ?? null,
  backupDir: config.backupDir,
});
if (!push) app.log.warn("No VAPID keys (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY): pushes are off; the draws still happen");

const stops: (() => Promise<void>)[] = [
  startEvery(
    "notifier",
    NOTIFIER_EVERY_MS,
    async () => {
      const { drawn, pushes } = await notifier({ ...deps, send: push, publicOrigin: config.publicOrigin });
      if (drawn.length || pushes.length) app.log.info({ drawn, pushes }, "notifier");
    },
    app.log,
    { runNow: true },
  ),
];

const backupDir = config.backupDir;
if (backupDir) {
  stops.push(
    startEvery(
      "backup",
      BACKUP_EVERY_MS,
      async () => {
        const { written, removed } = backup(deps, backupDir);
        if (written) app.log.info({ backup: path.basename(written), removed }, "backup written");
      },
      app.log,
      { runNow: true },
    ),
  );
} else app.log.warn("No BACKUP_DIR: the daily backup is off");

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, async () => {
    await Promise.allSettled(stops.map((stop) => stop()));
    await app.close();
    db.$client.close();
    process.exit(0);
  });
}

await app.listen({ host: config.host, port: config.port });
