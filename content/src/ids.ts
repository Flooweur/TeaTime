/**
 * Ids are forever (SPEC §5.2): the owner's picks and brews name blends by code, and the pantry
 * names ingredients and gear by id, so a published code always means the same blend, and no
 * published blend, ingredient or piece of gear disappears (it is retired instead). ids.yaml lists
 * every one ever published; the build adds the new ones, and the check refuses a removal or a
 * rename.
 */
import { compareText } from "@teatime/core";
import { parse } from "yaml";
import { type UnhashedBundle, schemaProblems } from "./compile.js";
import type { ContentFile, Problem } from "./files.js";
import { IdsFile } from "./schema.js";

export interface IdsCheck {
  readonly problems: readonly Problem[];
  /** "017 moroccan-mint", ingredient ids and gear ids, new since ids.yaml was last written. */
  readonly added: readonly string[];
  /** ids.yaml as the build writes it. */
  readonly text: string;
}

const EMPTY: IdsFile = { blends: [], ingredients: [], gear: [] };

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
  const gearIds = new Set(bundle.gear.map((piece) => piece.id));
  const lockedGear = lock.gear ?? [];
  const gone = (published: readonly string[], now: ReadonlySet<string>, what: string) => {
    for (const id of published) {
      if (!now.has(id)) {
        problems.push({
          file: file.path,
          message: `${what} "${id}" was published: keep its file and set retired: true instead of removing it`,
        });
      }
    }
  };
  gone(lock.ingredients, ingredientIds, "the ingredient");
  gone(lockedGear, gearIds, "the gear");

  const blends = [...new Set([...lock.blends, ...bundle.blends.map((blend) => `${blend.code} ${blend.slug}`)])].sort(
    compareText,
  );
  const ingredients = [...new Set([...lock.ingredients, ...ingredientIds])].sort(compareText);
  const gear = [...new Set([...lockedGear, ...gearIds])].sort(compareText);
  const added = [
    ...bundle.blends.filter((blend) => !lockedCodes.has(blend.code)).map((blend) => `${blend.code} ${blend.slug}`),
    ...[...ingredientIds].filter((id) => !lock.ingredients.includes(id)),
    ...[...gearIds].filter((id) => !lockedGear.includes(id)),
  ];
  return { problems, added, text: lockText({ blends, ingredients, gear }) };
}

function lockText(lock: Required<IdsFile>): string {
  const section = (key: string, items: readonly string[], quote: boolean) =>
    items.length ? [`${key}:`, ...items.map((item) => `  - ${quote ? `"${item}"` : item}`)] : [`${key}: []`];
  return [
    "# Every blend, ingredient and piece of gear ever published (SPEC §5.2): ids are forever. Written",
    "# by npm run content:build; content:check refuses a removal or a rename. Never edit by hand.",
    ...section("blends", lock.blends, true),
    ...section("ingredients", lock.ingredients, false),
    ...section("gear", lock.gear, false),
    "",
  ].join("\n");
}
