/**
 * The server's settings from its environment, read once at start (backend/.env.example lists
 * them). Development reads backend/.env when there is one; Docker passes real variables. The
 * owner's own settings (office days, times…) are not here: they live in the database.
 */
import path from "node:path";
import { repoRoot } from "./version.js";

try {
  process.loadEnvFile(".env");
} catch {
  // No backend/.env: the real environment and the defaults below.
}

const env = process.env;

/** The contact the push services see in each push's VAPID claims: a placeholder, never the owner's address (SPEC §4.1). */
export const DEFAULT_VAPID_SUBJECT = "mailto:teatime@example.com";

const isTest = env.NODE_ENV === "test" || env.VITEST === "true";

/** A comma-separated list, trimmed, without empty entries. */
const list = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

/** The app's address: Vite's dev server in dev, the Tailscale name with :8443 on the daily stack. */
const publicOrigin = env.PUBLIC_ORIGIN ?? "http://localhost:5180";

export const config = {
  isTest,
  /** 127.0.0.1 in dev, so nothing on the network reaches it; 0.0.0.0 inside the container. */
  host: env.HOST ?? "127.0.0.1",
  port: Number(env.PORT ?? 3200),
  /** The SQLite file. Dev: the repo's data/, which git ignores. The daily stack: its named volume (SPEC §3.7). */
  databasePath: path.resolve(env.DATABASE_PATH ?? path.join(repoRoot(), "data", "teatime.sqlite")),
  /** Which stack this is, for the health route and the diagnostics: "dev" or "daily". */
  environment: env.APP_ENV ?? "dev",
  /** The base of every push's link. */
  publicOrigin,
  /**
   * The origins a write may come from (SPEC §3.4): the app's, and in dev Vite's preview too.
   * `MORE_ORIGINS` replaces the preview's; the daily stack sets it empty.
   */
  origins: [publicOrigin, ...list(env.MORE_ORIGINS ?? "http://localhost:5181")],
  /** The daily backups' folder (SPEC §3.7). Unset (dev, by default), the backup job doesn't run. */
  backupDir: env.BACKUP_DIR ? path.resolve(env.BACKUP_DIR) : null,
  /**
   * Web push: the VAPID keys (`npm run vapid -w backend -- .env` writes them), the private one never
   * logged nor sent to the app. Without both, pushes are off and `GET push/key` answers null.
   */
  push:
    env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY
      ? {
          publicKey: env.VAPID_PUBLIC_KEY,
          privateKey: env.VAPID_PRIVATE_KEY,
          subject: env.VAPID_SUBJECT || DEFAULT_VAPID_SUBJECT,
        }
      : null,
};
