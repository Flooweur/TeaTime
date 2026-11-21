/**
 * The daily backup (SPEC §3.7): the database serialized into `teatime-YYYY-MM-DD.sqlite` in the
 * backup folder (the daily stack's bind mount, `D:/TeaTime-backups`), once a day, 30 kept.
 *
 * It is written to a `.part` file, synced to disk, then renamed, so a backup that exists is whole:
 * a crash leaves only a `.part`, which the next run removes. `serialize()` reads through SQLite's
 * pager, so the copy holds every committed change, the WAL's included.
 */
import type Database from "better-sqlite3";
import { closeSync, fsyncSync, mkdirSync, openSync, readdirSync, renameSync, rmSync, writeSync } from "node:fs";
import path from "node:path";

export const BACKUPS_KEPT = 30;

const BACKUP_RE = /^teatime-\d{4}-\d{2}-\d{2}\.sqlite$/;
const PART_RE = /^teatime-\d{4}-\d{2}-\d{2}\.sqlite\.part$/;

export const backupName = (date: string) => `teatime-${date}.sqlite`;

/** The backups in `dir`, newest first. */
export function listBackups(dir: string): string[] {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  return names
    .filter((name) => BACKUP_RE.test(name))
    .sort()
    .reverse();
}

/** Syncs a folder's entries (the rename) to disk where the platform allows it: Linux does, Windows can't open a folder. */
function syncDir(dir: string) {
  let fd: number | undefined;
  try {
    fd = openSync(dir, "r");
    fsyncSync(fd);
  } catch {
    // Windows (dev): the file itself was synced.
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
}

export interface BackupOutcome {
  /** The backup written, or null when today's was there already. */
  readonly written: string | null;
  /** The old backups and leftover `.part` files removed. */
  readonly removed: readonly string[];
}

/** Writes `date`'s backup unless it exists, then keeps the newest 30. */
export function writeBackup(sqlite: Database.Database, dir: string, date: string): BackupOutcome {
  mkdirSync(dir, { recursive: true });
  const removed: string[] = [];
  // A `.part` is a run a crash cut off: this run is synchronous, so none is being written now.
  for (const name of readdirSync(dir).filter((n) => PART_RE.test(n))) {
    rmSync(path.join(dir, name));
    removed.push(name);
  }

  const name = backupName(date);
  let written: string | null = null;
  if (!listBackups(dir).includes(name)) {
    const file = path.join(dir, name);
    const part = `${file}.part`;
    const bytes = sqlite.serialize();
    const fd = openSync(part, "w");
    try {
      writeSync(fd, bytes);
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    renameSync(part, file);
    syncDir(dir);
    written = file;
  }

  for (const old of listBackups(dir).slice(BACKUPS_KEPT)) {
    rmSync(path.join(dir, old));
    removed.push(old);
  }
  return { written, removed };
}
