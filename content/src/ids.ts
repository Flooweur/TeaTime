/**
 * Ids are forever (SPEC §5.2): the owner's picks and brews name blends by code, and the pantry
 * names ingredients by id, so a published code always means the same blend, and no published
 * blend or ingredient disappears (it is retired instead). ids.yaml lists every one ever published;
 * the build adds the new ones, and the check refuses a removal or a rename.
 */
import { compareText } from "@teatime/core";
import { parse } from "yaml";
import { type UnhashedBundle, schemaProblems } from "./compile.js";
import type { ContentFile, Problem } from "./files.js";
import { IdsFile } from "./schema.js";

export interface IdsCheck {
  readonly problems: readonly Problem[];
  /** "017 moroccan-mint" and ingredient ids, new since ids.yaml was last written. */
  readonly added: readonly string[];
  /** ids.yaml as the build writes it. */
  readonly text: string;
}

const EMPTY: IdsFile = { blends: [], ingredients: [] };

function readLock(file: ContentFile, problems: Problem[]): IdsFile {
  let data: unknown;
  try {
    data = parse(file.text, { uniqueKeys: true }) ?? EMPTY;
  } catch (err) {
    problems.push({ file: file.path, message: `not valid YAML: ${(err as Error).message.split("\n")[0]}` });
    return EMPTY;
  }
  const found = schemaProblems(file.path, IdsFile, data);
  problems.push(...found);
  return found.length ? EMPTY : (data as IdsFile);
}

/** ids.yaml against the bundle, and the text the build writes. */
export function checkIds(file: ContentFile, bundle: UnhashedBundle): IdsCheck {
  const problems: Problem[] = [];
  const lock = readLock(file, problems);

  const blendCodes = new Map(bundle.blends.map((blend) => [blend.code, blend.slug]));
  const lockedCodes = new Set<string>();
  for (const entry of lock.blends) {
    const [code, slug] = entry.split(" ") as [string, string];
    lockedCodes.add(code);
    const now = blendCodes.get(code);
    if (now === undefined) {
      problems.push({
        file: file.path,
        message: `blend ${code} (${slug}) was published: keep its file and set retired: true instead of removing it`,
      });
    } else if (now !== slug) {
      problems.push({
        file: file.path,
        message: `blend ${code} was published as "${slug}": a code is never given to another blend (now "${now}")`,
      });
    }
  }
  const ingredientIds = new Set(bundle.ingredients.map((ingredient) => ingredient.id));
  for (const id of lock.ingredients) {
    if (!ingredientIds.has(id)) {
      problems.push({
        file: file.path,
        message: `the ingredient "${id}" was published: keep its file and set retired: true instead of removing it`,
      });
    }
  }

  const blends = [...new Set([...lock.blends, ...bundle.blends.map((blend) => `${blend.code} ${blend.slug}`)])].sort(
    compareText,
  );
  const ingredients = [...new Set([...lock.ingredients, ...ingredientIds])].sort(compareText);
  const added = [
    ...bundle.blends.filter((blend) => !lockedCodes.has(blend.code)).map((blend) => `${blend.code} ${blend.slug}`),
    ...[...ingredientIds].filter((id) => !lock.ingredients.includes(id)),
  ];
  return { problems, added, text: lockText({ blends, ingredients }) };
}

function lockText(lock: IdsFile): string {
  const list = (items: readonly string[], quote: boolean) =>
    items.length ? items.map((item) => `  - ${quote ? `"${item}"` : item}`).join("\n") : "  []";
  return [
    "# Every blend and ingredient ever published (SPEC §5.2): ids are forever. Written by",
    "# npm run content:build; content:check refuses a removal or a rename. Never edit by hand.",
    `blends:${lock.blends.length ? "" : " []"}`,
    ...(lock.blends.length ? [list(lock.blends, true)] : []),
    `ingredients:${lock.ingredients.length ? "" : " []"}`,
    ...(lock.ingredients.length ? [list(lock.ingredients, false)] : []),
    "",
  ].join("\n");
}
