/**
 * `content:build` and `content:check` (SPEC §5.4), on the files on disk: everything compile.ts and
 * ids.ts check, then what the build writes: `src/bundle.ts` (with the content's hash) and
 * `ids.yaml`. Both scripts run this, and so does a test, on a copy of the folder.
 */
import { createHash } from "node:crypto";
import { type Dirent, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type ContentBundle, canonicalJson } from "@teatime/core";
import { type ContentFile, type ContentFiles, type Problem, checkIds, compileContent } from "../src/index.js";

/** content/ itself. */
export const CONTENT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(folder: string, file: string): ContentFile {
  return { path: file, text: readFileSync(path.join(folder, file), "utf8") };
}

/** A file that may not exist yet (a new folder's ids.yaml): empty then. */
function readOrEmpty(folder: string, file: string): ContentFile {
  try {
    return read(folder, file);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { path: file, text: "" };
    throw err;
  }
}

/** Every file with `extension` under a folder of content/, as `blends/017-moroccan-mint.yaml`. */
function filesUnder(folder: string, under: string, extension: string): ContentFile[] {
  let entries: Dirent[];
  try {
    entries = readdirSync(path.join(folder, under), { recursive: true, withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => path.relative(folder, path.join(entry.parentPath, entry.name)).replaceAll("\\", "/"))
    .sort()
    .map((file) => read(folder, file));
}

/** The files the bundle is made of. */
export function readFiles(folder = CONTENT_DIR): ContentFiles {
  return {
    blends: filesUnder(folder, "blends", ".yaml"),
    ingredients: filesUnder(folder, "ingredients", ".yaml"),
    gear: filesUnder(folder, "gear", ".yaml"),
    shops: read(folder, "shops.yaml"),
    teaTypes: read(folder, "tea-types.yaml"),
    guides: filesUnder(folder, "guides", ".md"),
  };
}

/** The SHA-256 of the bundle's canonical JSON, without its own hash. */
export function hashOf(bundle: Omit<ContentBundle, "hash">): string {
  return createHash("sha256").update(canonicalJson(bundle)).digest("hex");
}

/** The generated module the app and the server import (`@teatime/content/bundle`). */
export function bundleModule(bundle: ContentBundle): string {
  return [
    "// Made by `npm run content:build` from content/'s YAML and Markdown: never by hand.",
    "// `npm run content:check` fails when it's out of date. The app and the server both import it.",
    'import type { ContentBundle } from "@teatime/core";',
    "",
    `export const BUNDLE: ContentBundle = ${JSON.stringify(bundle, null, 2)};`,
    "",
  ].join("\n");
}

/** A file the build writes: its name as the scripts say it, where it is, and its text. */
export interface Write {
  readonly label: string;
  readonly path: string;
  readonly text: string;
}

export interface Run {
  readonly problems: readonly Problem[];
  readonly bundle: ContentBundle | null;
  /** What the build writes: only when there's no problem. */
  readonly writes: readonly Write[];
  /** Ids new since ids.yaml was last written. */
  readonly added: readonly string[];
}

/** Everything checked, and what the build would write. */
export function runContent(folder = CONTENT_DIR): Run {
  const compiled = compileContent(readFiles(folder));
  if (!compiled.bundle) return { problems: compiled.problems, bundle: null, writes: [], added: [] };
  const bundle: ContentBundle = { ...compiled.bundle, hash: hashOf(compiled.bundle) };
  const ids = checkIds(readOrEmpty(folder, "ids.yaml"), compiled.bundle);
  if (ids.problems.length) return { problems: ids.problems, bundle, writes: [], added: ids.added };
  return {
    problems: [],
    bundle,
    writes: [
      { label: "src/bundle.ts", path: path.join(folder, "src", "bundle.ts"), text: bundleModule(bundle) },
      { label: "ids.yaml", path: path.join(folder, "ids.yaml"), text: ids.text },
    ],
    added: ids.added,
  };
}

/** The files the build would write that aren't as it would write them. */
export function staleFiles(run: Run): Write[] {
  return run.writes.filter((write) => {
    try {
      return readFileSync(write.path, "utf8") !== write.text;
    } catch {
      return true;
    }
  });
}

/** The problems, one a line, as the scripts print them. */
export const report = (problems: readonly Problem[]) => problems.map((p) => `  ${p.file}: ${p.message}`).join("\n");

/** "1 problem", "3 problems". */
export const problemCount = (problems: readonly Problem[]) =>
  `${problems.length} ${problems.length === 1 ? "problem" : "problems"}`;

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** "10 blends (6 safe), 24 ingredients, 4 pieces of gear, 9 shops, 6 tea types, 2 guides, hash 3f2a…". */
export function summary(bundle: ContentBundle): string {
  const safe = bundle.blends.filter((blend) => blend.mode === "safe").length;
  return [
    `${plural(bundle.blends.length, "blend")} (${safe} safe)`,
    plural(bundle.ingredients.length, "ingredient"),
    plural(bundle.gear.length, "piece of gear", "pieces of gear"),
    plural(bundle.shops.length, "shop"),
    plural(bundle.teaTypes.length, "tea type"),
    plural(bundle.guides.length, "guide"),
    `hash ${bundle.hash.slice(0, 12)}`,
  ].join(", ");
}
