import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runContent, staleFiles } from "../scripts/content.js";
import { filesOf, fixture } from "./fixtures.js";

let folder: string | null = null;
afterEach(() => {
  if (folder) rmSync(folder, { recursive: true, force: true });
  folder = null;
});

/** The fixture written to a temporary copy of content/. */
function writeFolder(): string {
  folder = mkdtempSync(path.join(tmpdir(), "teatime-content-"));
  const files = filesOf(fixture());
  for (const file of [...files.blends, ...files.ingredients, files.shops, files.teaTypes, ...files.guides]) {
    const target = path.join(folder, file.path);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, file.text);
  }
  mkdirSync(path.join(folder, "src"));
  return folder;
}

describe("runContent and staleFiles", () => {
  it("finds the bundle and ids.yaml stale until the build has written them, then nothing", () => {
    const dir = writeFolder();
    const run = runContent(dir);
    expect(run.problems).toEqual([]);
    expect(run.bundle!.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(staleFiles(run).map((w) => w.label)).toEqual(["src/bundle.ts", "ids.yaml"]);
    for (const write of run.writes) writeFileSync(write.path, write.text);
    expect(staleFiles(runContent(dir))).toEqual([]);
  });

  it("gives the same hash for the same content, and another when anything changes", () => {
    const dir = writeFolder();
    const before = runContent(dir).bundle!.hash;
    expect(runContent(dir).bundle!.hash).toBe(before);
    writeFileSync(
      path.join(dir, "guides", "general.md"),
      "# The general tea guide\n\n## Water {#water}\n\nHard water.\n\n## Temperature {#temperature}\n\nBy type.\n",
    );
    const after = runContent(dir);
    expect(after.problems).toEqual([]);
    expect(after.bundle!.hash).not.toBe(before);
  });

  it("writes nothing when there's a problem", () => {
    const dir = writeFolder();
    writeFileSync(path.join(dir, "shops.yaml"), "shops: nope\n");
    const run = runContent(dir);
    expect(run.bundle).toBeNull();
    expect(run.writes).toEqual([]);
  });
});
