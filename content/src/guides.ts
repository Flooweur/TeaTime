/**
 * The guides (SPEC §6): Markdown in content/guides/, rendered to HTML at build time so the app
 * shows them offline with no Markdown library. A guide has one `# Title`, first; its chapters are
 * the `## Heading {#id}` headings, whose ids blends link to (`earl-grey#bergamot`) and which are
 * kept as the HTML's anchors. Raw HTML and images are refused: the app inserts the HTML as it is,
 * so the Markdown is the only thing that writes it.
 */
import type { Guide, GuideChapter } from "@teatime/core";
import { Marked, type Token, type Tokens } from "marked";
import type { ContentFile, Problem } from "./files.js";
import { SLUG_PATTERN } from "./schema.js";

const GUIDE_PATH = new RegExp(`^guides/(${SLUG_PATTERN.slice(1, -1)})\\.md$`);
/** A heading's id at its end: `## Bergamot {#bergamot}`. */
const ANCHOR = /\s*\{#([a-z0-9]+(?:-[a-z0-9]+)*)\}\s*$/;
const ANY_ANCHOR = /\{#[^}]*\}\s*$/;

/** A heading token, with the chapter id the check took off its text. */
type ChapterHeading = Tokens.Heading & { chapterId?: string };

export interface GuideBuild {
  /** Null when there's any problem. */
  readonly guide: Guide | null;
  readonly problems: readonly Problem[];
}

/** Takes `{#id}` off a heading's text and off its last inline token, so it isn't shown. */
function stripAnchor(heading: Tokens.Heading): boolean {
  const last = heading.tokens.at(-1);
  if (!last || last.type !== "text") return false;
  const text = last as Tokens.Text;
  text.text = text.text.replace(ANCHOR, "");
  text.raw = text.raw.replace(ANCHOR, "");
  heading.text = heading.text.replace(ANCHOR, "");
  return true;
}

/** One guide, checked and rendered. */
export function compileGuide(file: ContentFile): GuideBuild {
  const problems: Problem[] = [];
  const add = (message: string) => problems.push({ file: file.path, message });

  const id = GUIDE_PATH.exec(file.path)?.[1];
  if (!id) add("a guide is guides/<id>.md, with a kebab-case id");

  const marked = new Marked({ gfm: true });
  const tokens = marked.lexer(file.text);
  const firstBlock = tokens.find((token) => token.type !== "space");

  const headings: ChapterHeading[] = [];
  const links: string[] = [];
  marked.walkTokens(tokens, (token: Token) => {
    if (token.type === "html") {
      add(`raw HTML isn't allowed, write it in Markdown: ${JSON.stringify(token.raw.trim().slice(0, 40))}`);
    } else if (token.type === "image") {
      add(`images aren't allowed (the guides open offline): ${JSON.stringify(token.raw)}`);
    } else if (token.type === "link") {
      links.push((token as Tokens.Link).href);
    } else if (token.type === "heading") {
      headings.push(token as ChapterHeading);
    }
  });

  let title: string | null = null;
  const chapters: GuideChapter[] = [];
  for (const heading of headings) {
    if (heading.depth === 1) {
      if (title !== null) add(`a guide has one # title: "${heading.text}" is a second`);
      else if (heading !== firstBlock) add("the guide's # title comes first");
      if (ANY_ANCHOR.test(heading.text)) add("the # title takes no {#id}");
      title ??= heading.text.trim();
      continue;
    }
    if (heading.depth > 2) {
      if (ANY_ANCHOR.test(heading.text)) add(`only chapters (##) take an {#id}: "${heading.text}"`);
      continue;
    }
    const chapterId = ANCHOR.exec(heading.text)?.[1];
    if (!chapterId) {
      add(`the chapter "${heading.text}" needs a kebab-case id at its end: ## ${heading.text} {#its-id}`);
      continue;
    }
    if (!stripAnchor(heading)) {
      add(`the chapter "${heading.text}" has its {#${chapterId}} after formatting: put it after plain text`);
      continue;
    }
    if (chapters.some((chapter) => chapter.id === chapterId)) add(`the chapter id "${chapterId}" is used twice`);
    heading.chapterId = chapterId;
    chapters.push({ id: chapterId, title: heading.text.trim() });
  }

  if (title === null) add("a guide starts with its # title");
  for (const href of links) {
    if (href.startsWith("https://")) continue;
    if (href.startsWith("#")) {
      if (!chapters.some((chapter) => `#${chapter.id}` === href))
        add(`the link ${href} names no chapter of this guide`);
      continue;
    }
    add(`a link is https:// or #a-chapter, not ${JSON.stringify(href)}`);
  }

  if (problems.length || !id || title === null) return { guide: null, problems };

  marked.use({
    renderer: {
      heading(token) {
        const anchor = (token as ChapterHeading).chapterId;
        const inner = this.parser.parseInline(token.tokens);
        return `<h${token.depth}${anchor ? ` id="${anchor}"` : ""}>${inner}</h${token.depth}>\n`;
      },
    },
  });
  const html = marked.parser(tokens);
  return { guide: { id, title, chapters, html }, problems };
}
