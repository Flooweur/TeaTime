/**
 * `npm run restore -w backend -- <backup file> [--dry-run]`: brings a backup back over the
 * database at DATABASE_PATH (src/db/restore.ts says how). Stop the server first.
 */
import { config } from "../src/config.js";
import { RestoreError, restoreBackup } from "../src/db/restore.js";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const files = args.filter((arg) => arg !== "--dry-run");
if (files.length !== 1) {
  console.error("Usage: npm run restore -w backend -- <backup file> [--dry-run]");
  process.exit(1);
}
const [backup] = files as [string];

try {
  const { report, movedAside } = restoreBackup({ backup, database: config.databasePath, dryRun, now: new Date() });
  const { picks, brews, pantry } = report.counts;
  console.log(
    `${backup}: whole, revision ${report.revision}, ${report.migrations} migrations, ${picks} picks, ${brews} brews, ${pantry} pantry rows.`,
  );
  if (dryRun) console.log("Dry run: nothing changed.");
  else {
    console.log(`Restored to ${config.databasePath}.`);
    if (movedAside) console.log(`The database it replaced is at ${movedAside}.`);
  }
} catch (err) {
  if (!(err instanceof RestoreError)) throw err;
  console.error(`Not restored: ${err.message}`);
  process.exit(1);
}
