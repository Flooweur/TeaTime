/**
 * The backup job (SPEC §3.5): checked every hour, it writes the day's backup once, dated in the
 * owner's time zone (db/backup.ts).
 */
import { wallClockAt } from "@teatime/core";
import { type BackupOutcome, writeBackup } from "../db/backup.js";
import type { Deps } from "../deps.js";
import { loadState } from "../state/rows.js";

export const BACKUP_EVERY_MS = 60 * 60_000;

export function backup(deps: Deps, dir: string): BackupOutcome {
  const { timeZone } = loadState(deps.db, deps.warn).settings;
  const { date } = wallClockAt(deps.clock().getTime(), timeZone);
  return writeBackup(deps.db.$client, dir, date);
}
