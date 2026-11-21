/**
 * This build's version (SPEC §4.1; ported from EagleEye): the one integer in app-version.json at
 * the repo root, which the app reads too, so the server and the app it serves say the same number.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** The repo's root (the image's /app): the folder above this file with app-version.json in it. */
export function repoRoot(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  while (!existsSync(path.join(dir, "app-version.json"))) {
    const up = path.dirname(dir);
    if (up === dir) throw new Error("app-version.json not found above backend/");
    dir = up;
  }
  return dir;
}

function readAppVersion(): number {
  const file = path.join(repoRoot(), "app-version.json");
  const { version } = JSON.parse(readFileSync(file, "utf8")) as { version?: unknown };
  if (!Number.isInteger(version) || (version as number) < 1) {
    throw new Error(`${file}: "version" must be an integer from 1, got ${JSON.stringify(version)}`);
  }
  return version as number;
}

export const APP_VERSION = readAppVersion();
