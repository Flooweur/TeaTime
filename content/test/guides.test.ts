import { describe, expect, it } from "vitest";
import { compileGuide } from "../src/index.js";

const guide = (text: string, path = "guides/earl-grey.md") => compileGuide({ path, text });
const messages = (text: string) => guide(text).problems.map((p) => p.message);

describe("compileGuide", () => {
  it("renders the Markdown with the chapters' ids as anchors, and takes the ids off the text", () => {
    const { guide: built, problems } = guide(
      "# The Earl Grey guide\n\nIntro with **bold**.\n\n## The legend and the facts {#legend}\n\nText.\n\n### A detail\n\nMore.\n",
    );
    expect(problems).toEqual([]);
    expect(built!.id).toBe("earl-grey");
    expect(built!.title).toBe("The Earl Grey guide");
    expect(built!.chapters).toEqual([{ id: "legend", title: "The legend and the facts" }]);
    expect(built!.html).toContain('<h2 id="legend">The legend and the facts</h2>');
    expect(built!.html).toContain("<h3>A detail</h3>");
    expect(built!.html).toContain("<strong>bold</strong>");
    expect(built!.html).not.toContain("{#");
  });

  it("escapes text: the Markdown is the only thing that writes HTML", () => {
    const { guide: built } = guide("# Title\n\n## Milk {#milk}\n\nTea & milk: 1 < 2.\n");
    expect(built!.html).toContain("Tea &amp; milk: 1 &lt; 2.");
  });

  it("refuses raw HTML, block or inline, and images", () => {
    const found = messages(
      "# Title\n\n<div>block</div>\n\nSome <span>inline</span>.\n\n![a cup](https://x.example/cup.png)\n",
    );
    expect(found.filter((m) => m.startsWith("raw HTML isn't allowed")).length).toBe(3);
    expect(found.some((m) => m.startsWith("images aren't allowed"))).toBe(true);
  });

  it("needs one # title, first, and an id on every chapter", () => {
    expect(messages("Intro.\n\n# Title\n")).toContain("the guide's # title comes first");
    expect(messages("## Only a chapter {#only}\n")).toContain("a guide starts with its # title");
    expect(messages("# One\n\n# Two\n")).toContain('a guide has one # title: "Two" is a second');
    expect(messages("# Title\n\n## Water\n")).toContain(
      'the chapter "Water" needs a kebab-case id at its end: ## Water {#its-id}',
    );
    expect(messages("# Title\n\n## Water {#water}\n\n## Again {#water}\n")).toContain(
      'the chapter id "water" is used twice',
    );
    expect(messages("# Title\n\n### Deep {#deep}\n")).toContain('only chapters (##) take an {#id}: "Deep {#deep}"');
  });

  it("checks links: https, or a chapter of the same guide", () => {
    expect(messages("# T\n\n## A {#a}\n\nSee [b](#b), [x](http://x.example) and [y](https://y.example).\n")).toEqual([
      "the link #b names no chapter of this guide",
      'a link is https:// or #a-chapter, not "http://x.example"',
    ]);
  });

  it("refuses a file name that isn't a kebab-case id", () => {
    expect(guide("# T\n", "guides/Earl Grey.md").problems.map((p) => p.message)).toContain(
      "a guide is guides/<id>.md, with a kebab-case id",
    );
  });
});
