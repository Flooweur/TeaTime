/**
 * Bringing a backup back (SPEC §3.7; `npm run restore -w backend -- <backup> [--dry-run]`). The
 * server must be stopped first (docs/runbook.md, phase 7): nothing else may have the database open.
 *
 * 1. The backup is copied next to the database, as `<database>.restoring`, and checked there: an
 *    SQLite file whose integrity check passes, with every table and its migrations. The backup
 *    itself is only read.
 * 2. With `--dry-run`, the copy is removed and the report printed: nothing else changes.
 * 3. Otherwise the copy's revision is set past the one of the database it replaces, so the phones,
 *    which ignore a snapshot older than theirs, take the restored state. The current database (with its
 *    `-wal` and `-shm`) is moved aside, to `<database>.before-restore-<time>`, and the copy takes its place.
 */
import Database from "better-sqlite3";
import { copyFileSync, existsSync, renameSync, rmSync } from "node:fs";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import * as schema from "./schema.js";

/** Every table the schema has: a backup without one is not TeaTime's, or not whole. */
const TABLES = Object.values(schema).map((table) => getTableConfig(table).name);

export interface BackupReport {
  readonly revision: number;
  readonly migrations: number;
  readonly counts: { readonly picks: number; readonly brews: number; readonly pantry: number };
}

export class RestoreError extends Error {
  override name = "RestoreError";
}

/** Checks a database file and says what it holds; throws a `RestoreError` when it isn't a whole TeaTime database. */
export function inspectDatabase(file: string): BackupReport {
  let sqlite: Database.Database;
  try {
    sqlite = new Database(file, { fileMustExist: true });
  } catch (err) {
    throw new RestoreError(`${file} can't be opened: ${(err as Error).message}`);
  }
  try {
    let integrity: unknown;
    try {
      integrity = sqlite.pragma("integrity_check", { simple: true });
    } catch (err) {
      throw new RestoreError(`${file} isn't an SQLite database: ${(err as Error).message}`);
    }
    if (integrity !== "ok") throw new RestoreError(`${file} fails SQLite's integrity check: ${String(integrity)}`);
    const names = new Set(
      (sqlite.prepare("select name from sqlite_master where type = 'table'").all() as { name: string }[]).map(
        (row) => row.name,
      ),
    );
    const missing = [...TABLES, "__drizzle_migrations"].filter((name) => !names.has(name));
    if (missing.length) throw new RestoreError(`${file} lacks the tables ${missing.join(", ")}`);
    const count = (table: string) => (sqlite.prepare(`select count(*) as n from ${table}`).get() as { n: number }).n;
    const revision = sqlite.prepare("select value from meta where key = 'revision'").get() as
      { value: number } | undefined;
    return {
      revision: revision?.value ?? 0,
      migrations: count("__drizzle_migrations"),
      counts: { picks: count("picks"), brews: count("brews"), pantry: count("pantry") },
    };
  } finally {
    sqlite.close();
  }
}

/** A database's revision, read without changing it; 0 when it has none or can't be read. */
function revisionOf(file: string): number {
  try {
    const sqlite = new Database(file, { fileMustExist: true });
    try {
      const row = sqlite.prepare("select value from meta where key = 'revision'").get() as
        { value: number } | undefined;
      return row?.value ?? 0;
    } finally {
      sqlite.close();
    }
  } catch {
    return 0;
  }
}

export interface RestoreOutcome {
  readonly report: BackupReport;
  /** Where the database that was replaced went; null for a dry run, or when there was none. */
  readonly movedAside: string | null;
}

export function restoreBackup(options: {
  readonly backup: string;
  readonly database: string;
  readonly dryRun: boolean;
  /** For the name of the copy the current database is moved aside to. */
  readonly now: Date;
}): RestoreOutcome {
  const { backup, database, dryRun, now } = options;
  if (!existsSync(backup)) throw new RestoreError(`${backup} doesn't exist`);
  const copy = `${database}.restoring`;
  for (const leftover of [copy, `${copy}-wal`, `${copy}-shm`]) rmSync(leftover, { force: true });
  copyFileSync(backup, copy);
  let report: BackupReport;
  try {
    report = inspectDatabase(copy);
  } catch (err) {
    for (const file of [copy, `${copy}-wal`, `${copy}-shm`]) rmSync(file, { force: true });
    throw err;
  }
  if (dryRun) {
    for (const file of [copy, `${copy}-wal`, `${copy}-shm`]) rmSync(file, { force: true });
    return { report, movedAside: null };
  }

  // A phone ignores a snapshot older than its own (SPEC §3.3): the restored state counts from past the
  // revision of the database it replaces, so every phone takes it.
  const replaced = existsSync(database) ? revisionOf(database) : 0;
  const revision = Math.max(replaced, report.revision) + 1;
  const sqlite = new Database(copy);
  try {
    sqlite
      .prepare(
        "insert into meta (key, value) values ('revision', ?) on conflict(key) do update set value = excluded.value",
      )
      .run(revision);
  } finally {
    sqlite.close();
  }
  report = { ...report, revision };

  let movedAside: string | null = null;
  if (existsSync(database)) {
    movedAside = `${database}.before-restore-${now.toISOString().replace(/[:.]/g, "-")}`;
    renameSync(database, movedAside);
    for (const suffix of ["-wal", "-shm"]) {
      if (existsSync(`${database}${suffix}`)) renameSync(`${database}${suffix}`, `${movedAside}${suffix}`);
    }
  }
  renameSync(copy, database);
  // Closing the check's connection folded its WAL in: nothing of the copy is left beside it.
  for (const file of [`${copy}-wal`, `${copy}-shm`]) rmSync(file, { force: true });
  return { report, movedAside };
}
