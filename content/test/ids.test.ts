import { describe, expect, it } from "vitest";
import { checkIds, compileContent } from "../src/index.js";
import { filesOf, fixture } from "./fixtures.js";

const bundle = () => compileContent(filesOf(fixture())).bundle!;
const lock = (text: string) => ({ path: "ids.yaml", text });

describe("checkIds", () => {
  it("adds what's new, sorted, and starts from an empty or missing file", () => {
    const result = checkIds(lock(""), bundle());
    expect(result.problems).toEqual([]);
    expect(result.added).toEqual([
      "001 test-grey",
      "002 test-oolong",
      "ceylon-black",
      "dried-bergamot",
      "high-mountain-oolong",
    ]);
    expect(result.text).toContain(
      'blends:\n  - "001 test-grey"\n  - "002 test-oolong"\ningredients:\n  - ceylon-black\n',
    );
  });

  it("writes a file it then reads back with nothing to add", () => {
    const first = checkIds(lock(""), bundle());
    const second = checkIds(lock(first.text), bundle());
    expect(second.problems).toEqual([]);
    expect(second.added).toEqual([]);
    expect(second.text).toBe(first.text);
  });

  it("refuses a published blend that's gone, or whose code now names another blend", () => {
    const text = 'blends:\n  - "001 test-grey"\n  - "002 another-name"\n  - "003 gone"\ningredients: []\n';
    const messages = checkIds(lock(text), bundle()).problems.map((p) => p.message);
    expect(messages).toContain(
      'blend 002 was published as "another-name": a code is never given to another blend (now "test-oolong")',
    );
    expect(messages).toContain(
      "blend 003 (gone) was published: keep its file and set retired: true instead of removing it",
    );
  });

  it("refuses a published ingredient that's gone", () => {
    const messages = checkIds(lock("blends: []\ningredients:\n  - old-leaf\n"), bundle()).problems.map(
      (p) => p.message,
    );
    expect(messages).toEqual([
      'the ingredient "old-leaf" was published: keep its file and set retired: true instead of removing it',
    ]);
  });

  it("refuses a lock file that isn't one", () => {
    const messages = checkIds(lock("blends:\n  - 17 moroccan\n"), bundle()).problems.map((p) => p.message);
    expect(messages.length).toBeGreaterThan(0);
  });
});
