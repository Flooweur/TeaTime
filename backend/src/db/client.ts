/**
 * The database (SPEC §3.6): one SQLite file, opened with the SPEC's pragmas, migrated at startup.
 * better-sqlite3 is synchronous, so a transaction never waits on anything else: a request's whole
 * read-apply-write runs without another one in between.
 */
import Database from "better-sqlite3";
import { type BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as schema from "./schema.js";

export type Db = BetterSQLite3Database<typeof schema> & { $client: Database.Database };
/** A transaction's handle: the same queries as `Db`. */
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
/** Either: what reads and writes take. */
export type Conn = Db | Tx;

/** `backend/drizzle`, the migrations: above this file both from src/db (dev) and from dist/src/db (the build). */
function migrationsDir(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  while (!existsSync(path.join(dir, "drizzle", "meta", "_journal.json"))) {
    const up = path.dirname(dir);
    if (up === dir) throw new Error("backend/drizzle not found above the database client");
    dir = up;
  }
  return path.join(dir, "drizzle");
}

export const MIGRATIONS_DIR = migrationsDir();

/**
 * Opens the database at `file` (":memory:" for a test), with WAL, foreign keys, a 5 s busy
 * timeout and `synchronous=NORMAL` (SPEC §3.6), and runs the migrations not yet run.
 */
export function openDb(file: string): Db {
  if (file !== ":memory:") mkdirSync(path.dirname(file), { recursive: true });
  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.pragma("synchronous = NORMAL");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: MIGRATIONS_DIR });
  return db;
}
