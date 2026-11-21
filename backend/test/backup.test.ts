import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { BACKUPS_KEPT, backupName, listBackups, writeBackup } from "../src/db/backup.js";
import { openDb } from "../src/db/client.js";
import { RestoreError, inspectDatabase, restoreBackup } from "../src/db/restore.js";
import { backup } from "../src/jobs/backup.js";
import { loadState } from "../src/state/rows.js";
import { at, have, testApp } from "./helpers.js";

const dirs: string[] = [];
const tempDir = () => {
  const dir = mkdtempSync(path.join(tmpdir(), "teatime-backup-"));
  dirs.push(dir);
  return dir;
};
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** A database file with something in it, in WAL mode, still open. */
function fileDb(dir: string) {
  const file = path.join(dir, "teatime.sqlite");
  return { file, db: openDb(file) };
}

describe("the daily backup (SPEC §3.7)", () => {
  it("writes the day's backup once, dated in the owner's time zone, whole with the WAL's changes", async () => {
    const dir = tempDir();
    // 23:30 UTC on the 22nd is already the 23rd in Paris.
    const t = await testApp({ now: "2026-11-22T23:30:00Z" });
    await t.commands(have("assam", at("2026-11-22", "08:00"), 120));
    const first = backup(t.deps, dir);
    expect(first.written).toBe(path.join(dir, backupName("2026-11-23")));
    expect(backup(t.deps, dir).written).toBeNull();
    expect(listBackups(dir)).toEqual([backupName("2026-11-23")]);

    const copy = openDb(first.written!);
    expect(loadState(copy).pantry.assam?.amount.value).toBe(120);
    copy.$client.close();
  });

  it(`keeps the newest ${BACKUPS_KEPT}, and removes a .part a crash left`, () => {
    const dir = tempDir();
    for (let day = 1; day <= 31; day++)
      writeFileSync(path.join(dir, backupName(`2026-10-${String(day).padStart(2, "0")}`)), "");
    writeFileSync(path.join(dir, `${backupName("2026-11-01")}.part`), "half");
    writeFileSync(path.join(dir, "notes.txt"), "the owner's");
    const { db } = fileDb(tempDir());
    const { written, removed } = writeBackup(db.$client, dir, "2026-11-01");
    expect(written).not.toBeNull();
    expect(removed).toEqual([`${backupName("2026-11-01")}.part`, backupName("2026-10-02"), backupName("2026-10-01")]);
    expect(listBackups(dir)).toHaveLength(BACKUPS_KEPT);
    expect(listBackups(dir)[0]).toBe(backupName("2026-11-01"));
    expect(existsSync(path.join(dir, "notes.txt"))).toBe(true);
    db.$client.close();
  });
});

describe("restore (SPEC §3.7)", () => {
  async function backupWithOneBrew() {
    const dir = tempDir();
    const t = await testApp();
    await t.commands(have("assam", at("2026-11-23", "08:00"), 120));
    const { written } = backup(t.deps, dir);
    return written!;
  }

  it("checks a backup with a dry run, changing nothing", async () => {
    const file = await backupWithOneBrew();
    const { file: database, db } = fileDb(tempDir());
    db.$client.close();
    const before = readdirSync(path.dirname(database)).sort();
    const { report, movedAside } = restoreBackup({ backup: file, database, dryRun: true, now: new Date() });
    expect(report).toMatchObject({ revision: 1, counts: { pantry: 1, brews: 0, picks: 0 } });
    expect(movedAside).toBeNull();
    expect(readdirSync(path.dirname(database)).sort()).toEqual(before);
    const unchanged = openDb(database);
    expect(loadState(unchanged).pantry).toEqual({});
    unchanged.$client.close();
  });

  it("puts the backup in the database's place, and the database it replaces aside", async () => {
    const file = await backupWithOneBrew();
    const { file: database, db } = fileDb(tempDir());
    db.$client.close();
    const { movedAside } = restoreBackup({
      backup: file,
      database,
      dryRun: false,
      now: new Date("2026-11-23T10:00:00Z"),
    });
    expect(movedAside).toBe(`${database}.before-restore-2026-11-23T10-00-00-000Z`);
    expect(existsSync(movedAside!)).toBe(true);
    expect(existsSync(`${database}.restoring`)).toBe(false);
    const restored = openDb(database);
    expect(loadState(restored).pantry.assam?.amount.value).toBe(120);
    restored.$client.close();
  });

  it("refuses what isn't a whole TeaTime database, and leaves the database as it was", () => {
    const dir = tempDir();
    const { file: database, db } = fileDb(dir);
    db.$client.close();
    const notSqlite = path.join(dir, "notes.sqlite");
    writeFileSync(notSqlite, "not a database at all, just text that is long enough to fill a header page");
    expect(() => restoreBackup({ backup: notSqlite, database, dryRun: false, now: new Date() })).toThrow(RestoreError);
    const other = path.join(tempDir(), "other.sqlite");
    const otherDb = openDb(other);
    otherDb.$client.exec("drop table brews");
    otherDb.$client.close();
    expect(() => restoreBackup({ backup: other, database, dryRun: false, now: new Date() })).toThrow(
      /lacks the tables brews/,
    );
    expect(() =>
      restoreBackup({ backup: path.join(dir, "missing.sqlite"), database, dryRun: true, now: new Date() }),
    ).toThrow(RestoreError);
    expect(existsSync(`${database}.restoring`)).toBe(false);
    expect(inspectDatabase(database).revision).toBe(0);
  });
});
