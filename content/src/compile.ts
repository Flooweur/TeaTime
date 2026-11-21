/**
 * The content build (SPEC §5): the files parsed, checked against their schemas and against each
 * other, and put together into one bundle. Pure: the scripts and the tests pass the files in, and
 * the scripts add the hash (scripts/content.ts).
 *
 * Besides the schemas, it refuses:
 * - a file whose name isn't its id (`blends/017-moroccan-mint.yaml`, `ingredients/<id>.yaml`,
 *   `gear/<id>.yaml`), and an id, code or slug used twice;
 * - a blend with no primary source, or a source with neither a URL nor a reference;
 * - an ingredient no ingredient file defines (or a retired one, in a blend still in use), a
 *   quantity in another unit than its ingredient's, an ingredient twice in a blend, or a blend
 *   whose every ingredient is optional;
 * - the same for gear: gear no gear file defines (or retired, in a blend in use), or twice in a
 *   blend; a blend made in a gaiwan, kyusu or chawan that doesn't need it as gear; and a piece of
 *   gear with an ingredient's id, since the pantry holds both by id;
 * - `per-cup` without `serves` or with `session_max`, and `per-session` the other way round;
 * - `prep: evening` without an evening step, an evening step without it, or an evening step after
 *   a step of the day;
 * - anything but exactly one infusions step, or a step with both `infusions` and `timer_s`;
 * - a temperature outside its own range;
 * - a guide link to no guide or chapter;
 * - a safe blend that breaks the safe rules (SPEC §5.3): a vessel other than a mug, teapot, glass,
 *   jar or bottle, gear that isn't optional, a step of the day without its office text, or more
 *   than 5 minutes on the day;
 * - an ingredient or gear no blend in use uses, a shop neither uses, a shop of theirs that isn't in
 *   shops.yaml or is named twice, a Lyon shop without an address, an online one without a URL;
 * - a `tea` ingredient without a tea type, another with one, and a tea type tea-types.yaml lacks;
 * - `plain` or `plain_brew` on anything but a tea counted in grams, both on one tea, and a
 *   `plain_brew` whose temperature is outside its range or whose source can't be found.
 */
import {
  type Blend,
  type Citation,
  CONTENT_FORMAT,
  type ContentBundle,
  GEAR_VESSELS,
  type Gear,
  type Guide,
  type Ingredient,
  type PlainBrew,
  type Range,
  SAFE_DAY_SECONDS,
  SAFE_VESSELS,
  type Shop,
  type ShopRef,
  TEA_TYPES,
  type TeaType,
  compareText,
} from "@teatime/core";
import type { TSchema } from "typebox";
import { Value } from "typebox/value";
import { parse } from "yaml";
import type { ContentFile, ContentFiles, Problem } from "./files.js";
import { compileGuide } from "./guides.js";
import {
  BlendFile,
  GearFile,
  IngredientFile,
  type PlainBrewFile,
  SLUG_PATTERN,
  type ShopFile,
  type ShopRefFile,
  ShopsFile,
  type SourceFile,
  TeaTypesFile,
} from "./schema.js";

/** The bundle before its hash, which the scripts compute (node:crypto). */
export type UnhashedBundle = Omit<ContentBundle, "hash">;

export interface Compiled {
  /** Null when there's any problem. */
  readonly bundle: UnhashedBundle | null;
  readonly problems: readonly Problem[];
}

const SLUG = SLUG_PATTERN.slice(1, -1);
const BLEND_PATH = new RegExp(`^blends/([0-9]{3})-(${SLUG})\\.yaml$`);
const INGREDIENT_PATH = new RegExp(`^ingredients/(${SLUG})\\.yaml$`);
const GEAR_PATH = new RegExp(`^gear/(${SLUG})\\.yaml$`);

/** `/steps/0/office` → `steps[0].office`. */
function readablePath(pointer: string): string {
  let out = "";
  for (const part of pointer.split("/").slice(1)) out += /^\d+$/.test(part) ? `[${part}]` : out ? `.${part}` : part;
  return out || "(the whole file)";
}

/** The value at a JSON pointer: `/steps/0/text`. */
function valueAt(value: unknown, pointer: string): unknown {
  return pointer
    .split("/")
    .slice(1)
    .reduce<unknown>((v, key) => (v && typeof v === "object" ? (v as Record<string, unknown>)[key] : undefined), value);
}

/** What a schema says is wrong with `value`, said for a person (ported from EagleEye's compile.ts). */
export function schemaProblems(file: string, schema: TSchema, value: unknown): Problem[] {
  if (Value.Check(schema, value)) return [];
  const messages = new Set<string>();
  for (const error of Value.Errors(schema, value)) {
    const at = readablePath(error.instancePath);
    const params = error.params as Record<string, unknown>;
    // A union's branches each fail; its own error says it once.
    if (error.schemaPath.includes("/anyOf/") || error.keyword === "boolean") continue;
    if (
      (error.keyword === "minLength" && params.limit === 1) ||
      (error.keyword === "pattern" && params.pattern === "\\S")
    ) {
      messages.add(`${at}: empty`);
      continue;
    }
    switch (error.keyword) {
      case "required":
        for (const key of params.requiredProperties as string[]) {
          messages.add(`${at === "(the whole file)" ? key : `${at}.${key}`}: missing`);
        }
        break;
      case "additionalProperties":
        messages.add(`${at}: unknown key ${(params.additionalProperties as string[]).map((k) => `"${k}"`).join(", ")}`);
        break;
      case "enum":
        messages.add(`${at}: must be one of ${(params.allowedValues as unknown[]).join(", ")}`);
        break;
      case "anyOf":
        messages.add(`${at}: ${JSON.stringify(valueAt(value, error.instancePath))} isn't any of the forms it can take`);
        break;
      default:
        messages.add(`${at}: ${error.message}`);
    }
  }
  return [...messages].map((message) => ({ file, message }));
}

/** A YAML file's data, or its parse error as a problem. */
function parseYaml(file: ContentFile, problems: Problem[]): unknown {
  try {
    // YAML 1.2: "no", "on" and dates stay strings; a key twice is an error.
    return parse(file.text, { prettyErrors: true, uniqueKeys: true });
  } catch (err) {
    problems.push({ file: file.path, message: `not valid YAML: ${(err as Error).message.split("\n")[0]}` });
    return undefined;
  }
}

/** The data of a file whose schema passes, or null (its problems added). */
function load<T>(file: ContentFile, schema: TSchema, problems: Problem[]): T | null {
  const data = parseYaml(file, problems);
  if (data === undefined) return null;
  const found = schemaProblems(file.path, schema, data);
  problems.push(...found);
  return found.length ? null : (data as T);
}

const range = (pair: readonly [number, number] | undefined): { tempRange?: Range } =>
  pair ? { tempRange: { min: pair[0], max: pair[1] } } : {};

function citation(source: SourceFile): Citation {
  return {
    title: source.title,
    ...(source.author !== undefined ? { author: source.author } : {}),
    ...(source.url !== undefined ? { url: source.url } : {}),
    ...(source.ref !== undefined ? { ref: source.ref } : {}),
    lang: source.lang,
    primary: source.primary ?? false,
    supports: source.supports,
    ...(source.note !== undefined ? { note: source.note } : {}),
  };
}

/** A source names where to find it: a URL, a reference, or both. */
function sourceProblems(file: string, sources: readonly SourceFile[], at: string): Problem[] {
  return sources.flatMap((source, i) =>
    source.url === undefined && source.ref === undefined
      ? [{ file, message: `${at}[${i}]: a source needs a url, a ref (a book and its pages), or both` }]
      : [],
  );
}

/** A temperature inside its own range, the range the right way round. */
function rangeProblems(file: string, at: string, tempC: number, pair: readonly [number, number] | undefined) {
  if (!pair) return [];
  const [min, max] = pair;
  if (min > max) return [{ file, message: `${at}.temp_range: [${min}, ${max}] is the wrong way round` }];
  if (tempC < min || tempC > max) {
    return [{ file, message: `${at}.temp_c: ${tempC} °C is outside its temp_range [${min}, ${max}]` }];
  }
  return [];
}

/** The shops by id, or null when shops.yaml can't be read (its problems added). */
function compileShops(file: ContentFile, problems: Problem[]): Map<string, Shop> | null {
  const shops = new Map<string, Shop>();
  const data = load<ShopsFile>(file, ShopsFile, problems);
  if (!data) return null;
  for (const [i, shop] of data.shops.entries()) {
    const at = `shops[${i}]`;
    if (shops.has(shop.id))
      problems.push({ file: file.path, message: `${at}: the shop id "${shop.id}" is used twice` });
    if (shop.kind === "lyon" && shop.address === undefined) {
      problems.push({ file: file.path, message: `${at}: a Lyon shop needs its address` });
    }
    if (shop.kind === "online" && shop.url === undefined) {
      problems.push({ file: file.path, message: `${at}: an online shop needs its url` });
    }
    shops.set(shop.id, shopFromFile(shop));
  }
  return shops;
}

function shopFromFile(shop: ShopFile): Shop {
  return {
    id: shop.id,
    name: shop.name,
    kind: shop.kind,
    ...(shop.url !== undefined ? { url: shop.url } : {}),
    ...(shop.address !== undefined ? { address: shop.address } : {}),
    ...(shop.notes !== undefined ? { notes: shop.notes } : {}),
  };
}

/** A plain brew's temperature inside its range, and its sources each findable: a tea type's, or a tea's own. */
function plainBrewProblems(file: string, at: string, brew: PlainBrewFile): Problem[] {
  return [
    ...rangeProblems(file, at, brew.temp_c, brew.temp_range),
    ...sourceProblems(file, brew.sources, `${at}.sources`),
  ];
}

/** The tea types by type, or null when tea-types.yaml can't be read (its problems added). */
function compileTeaTypes(file: ContentFile, problems: Problem[]): Map<string, TeaType> | null {
  const types = new Map<string, TeaType>();
  const data = load<TeaTypesFile>(file, TeaTypesFile, problems);
  if (!data) return null;
  for (const [i, type] of data.tea_types.entries()) {
    const at = `tea_types[${i}]`;
    if (types.has(type.type))
      problems.push({ file: file.path, message: `${at}: the tea type "${type.type}" is twice` });
    problems.push(...plainBrewProblems(file.path, at, type));
    types.set(type.type, { type: type.type, name: type.name, ...plainBrewFromFile(type) });
  }
  return types;
}

function plainBrewFromFile(brew: PlainBrewFile): PlainBrew {
  return {
    tempC: brew.temp_c,
    ...range(brew.temp_range),
    ratioGPer100ml: brew.ratio_g_per_100ml,
    waterMl: brew.water_ml,
    infusionsS: brew.infusions_s,
    office: { tempC: brew.office.temp_c, method: brew.office.method, infusionsS: brew.office.infusions_s },
    ...(brew.notes !== undefined ? { notes: brew.notes } : {}),
    sources: brew.sources.map(citation),
  };
}

function compileIngredients(
  files: readonly ContentFile[],
  /** Null when shops.yaml can't be read: the references then go unchecked, so its problem isn't repeated. */
  shops: ReadonlyMap<string, Shop> | null,
  problems: Problem[],
): { ingredients: Map<string, Ingredient>; unreadable: Set<string> } {
  const ingredients = new Map<string, Ingredient>();
  const unreadable = new Set<string>();
  for (const file of files) {
    const add = (message: string) => problems.push({ file: file.path, message });
    const fileId = INGREDIENT_PATH.exec(file.path)?.[1];
    if (!fileId) add("an ingredient is ingredients/<id>.yaml, with a kebab-case id");
    const data = load<IngredientFile>(file, IngredientFile, problems);
    if (!data) {
      if (fileId) unreadable.add(fileId);
      continue;
    }
    if (fileId && data.id !== fileId) add(`its id "${data.id}" isn't its file's name "${fileId}"`);
    if (ingredients.has(data.id)) add(`the ingredient id "${data.id}" is used twice`);
    if (data.category === "tea" && data.tea_type === undefined) add("a tea needs its tea_type");
    if (data.category !== "tea" && data.tea_type !== undefined) add("only a tea has a tea_type");
    if ((data.plain !== undefined || data.plain_brew !== undefined) && (data.category !== "tea" || data.unit !== "g")) {
      add("plain, plain_brew: only a tea counted in grams is ever brewed plain");
    }
    if (data.plain === false && data.plain_brew !== undefined) {
      add("plain_brew: a tea marked plain: false is never brewed plain");
    }
    if (data.plain_brew) problems.push(...plainBrewProblems(file.path, "plain_brew", data.plain_brew));
    shopRefProblems(data.shops, shops, add);
    ingredients.set(data.id, {
      id: data.id,
      name: data.name,
      category: data.category,
      unit: data.unit,
      ...(data.tea_type !== undefined ? { teaType: data.tea_type } : {}),
      ...(data.plain === false ? { plain: false } : {}),
      ...(data.plain_brew !== undefined ? { plainBrew: plainBrewFromFile(data.plain_brew) } : {}),
      perishable: data.perishable,
      shelfLifeDays: data.shelf_life_days,
      storage: data.storage,
      quality: data.quality,
      shops: data.shops.map(shopRefFromFile),
      retired: data.retired ?? false,
    });
  }
  return { ingredients, unreadable };
}

/** An ingredient's or a piece of gear's shops: each one in shops.yaml, and named once. */
function shopRefProblems(
  refs: readonly ShopRefFile[],
  /** Null when shops.yaml can't be read: the references then go unchecked. */
  shops: ReadonlyMap<string, Shop> | null,
  add: (message: string) => void,
): void {
  const named = new Set<string>();
  for (const [i, ref] of refs.entries()) {
    if (shops && !shops.has(ref.shop)) add(`shops[${i}]: no shop "${ref.shop}" in shops.yaml`);
    if (named.has(ref.shop)) add(`shops[${i}]: the shop "${ref.shop}" is named twice`);
    named.add(ref.shop);
  }
}

function shopRefFromFile(ref: ShopRefFile): ShopRef {
  return {
    shop: ref.shop,
    why: ref.why,
    price: ref.price,
    ...(ref.url !== undefined ? { url: ref.url } : {}),
    checked: ref.checked,
  };
}

/** The gear by id, as compileIngredients does the ingredients. */
function compileGear(
  files: readonly ContentFile[],
  shops: ReadonlyMap<string, Shop> | null,
  problems: Problem[],
): { gear: Map<string, Gear>; unreadable: Set<string> } {
  const gear = new Map<string, Gear>();
  const unreadable = new Set<string>();
  for (const file of files) {
    const add = (message: string) => problems.push({ file: file.path, message });
    const fileId = GEAR_PATH.exec(file.path)?.[1];
    if (!fileId) add("a piece of gear is gear/<id>.yaml, with a kebab-case id");
    const data = load<GearFile>(file, GearFile, problems);
    if (!data) {
      if (fileId) unreadable.add(fileId);
      continue;
    }
    if (fileId && data.id !== fileId) add(`its id "${data.id}" isn't its file's name "${fileId}"`);
    if (gear.has(data.id)) add(`the gear id "${data.id}" is used twice`);
    shopRefProblems(data.shops, shops, add);
    gear.set(data.id, {
      id: data.id,
      name: data.name,
      quality: data.quality,
      shops: data.shops.map(shopRefFromFile),
      retired: data.retired ?? false,
    });
  }
  return { gear, unreadable };
}

interface BlendContext {
  readonly ingredients: ReadonlyMap<string, Ingredient>;
  readonly unreadable: ReadonlySet<string>;
  readonly gear: ReadonlyMap<string, Gear>;
  readonly unreadableGear: ReadonlySet<string>;
  readonly guides: ReadonlyMap<string, Guide>;
  readonly guidesReadable: boolean;
}

/** Everything about one blend that its schema can't say. */
function blendProblems(file: string, data: BlendFile, context: BlendContext): Problem[] {
  const problems: Problem[] = [];
  const add = (message: string) => problems.push({ file, message });

  if (!data.sources.some((source) => source.primary)) {
    add("sources: at least one primary source (a tea house's own text, a chef's book, a named family recipe…)");
  }
  problems.push(...sourceProblems(file, data.sources, "sources"));

  const used = new Set<string>();
  for (const [i, item] of data.ingredients.entries()) {
    const at = `ingredients[${i}]`;
    if (used.has(item.id)) add(`${at}: "${item.id}" is in the blend twice`);
    used.add(item.id);
    if (context.unreadable.has(item.id)) continue;
    const ingredient = context.ingredients.get(item.id);
    if (!ingredient) {
      add(`${at}: no ingredient "${item.id}" (ingredients/${item.id}.yaml)`);
      continue;
    }
    if (ingredient.retired && !data.retired) add(`${at}: "${item.id}" is retired`);
    if (item.unit !== ingredient.unit) add(`${at}: "${item.id}" is counted in ${ingredient.unit}, not ${item.unit}`);
  }
  if (data.ingredients.every((item) => item.optional)) add("ingredients: at least one isn't optional");

  const gearUsed = new Set<string>();
  for (const [i, item] of (data.gear ?? []).entries()) {
    const at = `gear[${i}]`;
    if (gearUsed.has(item.id)) add(`${at}: "${item.id}" is in the blend twice`);
    gearUsed.add(item.id);
    if (context.unreadableGear.has(item.id)) continue;
    const piece = context.gear.get(item.id);
    if (!piece) add(`${at}: no gear "${item.id}" (gear/${item.id}.yaml)`);
    else if (piece.retired && !data.retired) add(`${at}: "${item.id}" is retired`);
  }
  const vessel = data.brew.vessel;
  if (
    (GEAR_VESSELS as readonly string[]).includes(vessel) &&
    !(data.gear ?? []).some((item) => item.id === vessel && !item.optional)
  ) {
    add(`gear: a blend made in a ${vessel} needs it as gear: { id: ${vessel} }`);
  }

  if (data.scaling === "per-cup") {
    if (data.serves === undefined) add("serves: a per-cup blend says how many cups the recipe makes");
    if (data.session_max !== undefined) add("session_max: only a per-session blend has one");
  } else {
    if (data.session_max === undefined) add("session_max: a per-session blend says how many people share a session");
    if (data.serves !== undefined) add("serves: a per-session blend has session_max instead");
  }

  const prep = data.prep ?? "none";
  const stages = data.steps.map((step) => step.stage ?? "day");
  if (prep === "evening" && !stages.includes("evening")) add("steps: a blend with prep: evening has an evening step");
  if (prep === "none" && stages.includes("evening")) add("steps: an evening step needs prep: evening");
  const firstDay = stages.indexOf("day");
  if (firstDay >= 0 && stages.lastIndexOf("evening") > firstDay) add("steps: the evening steps come first");

  const infusionSteps = data.steps.filter((step) => step.infusions);
  if (infusionSteps.length !== 1) add(`steps: exactly one step has infusions: true (${infusionSteps.length} here)`);
  for (const [i, step] of data.steps.entries()) {
    if (step.infusions && step.timer_s !== undefined) add(`steps[${i}]: the infusions step takes its times from brew`);
  }

  problems.push(...rangeProblems(file, "brew", data.brew.temp_c, data.brew.temp_range));

  if (context.guidesReadable) {
    for (const link of data.guides ?? []) {
      const [guideId, chapterId] = link.split("#") as [string, string];
      const guide = context.guides.get(guideId);
      if (!guide) add(`guides: no guide "${guideId}" (guides/${guideId}.md)`);
      else if (!guide.chapters.some((chapter) => chapter.id === chapterId)) {
        add(`guides: the guide "${guideId}" has no chapter {#${chapterId}}`);
      }
    }
  }

  if (data.mode === "safe") problems.push(...safeRuleProblems(file, data));
  return problems;
}

/** The safe rules (SPEC §5.3): a kettle, no special equipment, under 5 minutes on the day. */
function safeRuleProblems(file: string, data: BlendFile): Problem[] {
  const problems: Problem[] = [];
  const add = (message: string) => problems.push({ file, message });
  if (!(SAFE_VESSELS as readonly string[]).includes(data.brew.vessel)) {
    add(`brew.vessel: a safe blend is made in a ${SAFE_VESSELS.join(", ")}, not a ${data.brew.vessel}`);
  }
  for (const [i, item] of (data.gear ?? []).entries()) {
    if (!item.optional) add(`gear[${i}]: a safe blend needs no special equipment; "${item.id}" can only be optional`);
  }
  // An evening step happens at home: only the day's steps are done at the office.
  for (const [i, step] of data.steps.entries()) {
    if ((step.stage ?? "day") === "day" && step.office === undefined) {
      add(`steps[${i}]: every step of a safe blend on the day has its office text`);
    }
  }
  const daySeconds = data.steps
    .filter((step) => (step.stage ?? "day") === "day")
    .reduce(
      (sum, step) =>
        sum + (step.timer_s ?? 0) + (step.infusions ? data.brew.infusions_s.reduce((a, b) => a + b, 0) : 0),
      0,
    );
  if (daySeconds > SAFE_DAY_SECONDS) {
    add(`steps: ${daySeconds} s of waiting on the day; a safe blend takes ${SAFE_DAY_SECONDS} s at most`);
  }
  return problems;
}

function blendFromFile(data: BlendFile): Blend {
  return {
    code: data.code,
    slug: data.slug,
    name: data.name,
    mode: data.mode,
    family: data.family,
    trust: data.trust,
    sourceType: data.source_type,
    origin: data.origin,
    story: data.story.trim(),
    difficulty: data.difficulty as 1 | 2 | 3,
    seasons: data.seasons ?? [],
    flavours: data.flavours,
    caffeine: data.caffeine,
    scaling:
      data.scaling === "per-cup"
        ? { kind: "per-cup", serves: data.serves ?? 1 }
        : { kind: "per-session", sessionMax: data.session_max ?? 1 },
    prep: data.prep ?? "none",
    guides: (data.guides ?? []).map((link) => {
      const [guide, chapter] = link.split("#") as [string, string];
      return { guide, chapter };
    }),
    retired: data.retired ?? false,
    sources: data.sources.map(citation),
    ingredients: data.ingredients.map((item) => ({
      id: item.id,
      qty: item.qty,
      unit: item.unit,
      optional: item.optional ?? false,
      role: item.role,
    })),
    gear: (data.gear ?? []).map((item) => ({ id: item.id, optional: item.optional ?? false })),
    brew: {
      water: data.brew.water,
      tempC: data.brew.temp_c,
      ...range(data.brew.temp_range),
      ...(data.brew.ratio_g_per_100ml !== undefined ? { ratioGPer100ml: data.brew.ratio_g_per_100ml } : {}),
      waterMl: data.brew.water_ml,
      vessel: data.brew.vessel,
      preheat: data.brew.preheat,
      infusionsS: data.brew.infusions_s,
    },
    steps: data.steps.map((step) => ({
      text: step.text,
      ...(step.office !== undefined ? { office: step.office } : {}),
      ...(step.timer_s !== undefined ? { timerS: step.timer_s } : {}),
      infusions: step.infusions ?? false,
      stage: step.stage ?? "day",
    })),
  };
}

/** The content put together: its bundle when nothing is wrong. */
export function compileContent(files: ContentFiles): Compiled {
  const problems: Problem[] = [];

  const shops = compileShops(files.shops, problems);
  const teaTypes = compileTeaTypes(files.teaTypes, problems);
  const { ingredients, unreadable } = compileIngredients(files.ingredients, shops, problems);
  const { gear, unreadable: unreadableGear } = compileGear(files.gear, shops, problems);
  // The pantry holds ingredients and gear under one id each (SPEC §3.6): they can't share one.
  for (const id of gear.keys()) {
    if (ingredients.has(id) || unreadable.has(id)) {
      problems.push({ file: `gear/${id}.yaml`, message: `the id "${id}" is already an ingredient's` });
    }
  }

  const guides = new Map<string, Guide>();
  let guidesReadable = true;
  for (const file of files.guides) {
    const built = compileGuide(file);
    problems.push(...built.problems);
    if (built.guide) {
      if (guides.has(built.guide.id))
        problems.push({ file: file.path, message: `the guide "${built.guide.id}" is twice` });
      guides.set(built.guide.id, built.guide);
    } else guidesReadable = false;
  }

  const blends = new Map<string, Blend>();
  const slugs = new Set<string>();
  let blendsReadable = true;
  for (const file of files.blends) {
    const named = BLEND_PATH.exec(file.path);
    if (!named) problems.push({ file: file.path, message: "a blend is blends/NNN-slug.yaml: its code, then its slug" });
    const data = load<BlendFile>(file, BlendFile, problems);
    if (!data) {
      blendsReadable = false;
      continue;
    }
    const add = (message: string) => problems.push({ file: file.path, message });
    if (named && (named[1] !== data.code || named[2] !== data.slug)) {
      add(`its code and slug (${data.code}-${data.slug}) aren't its file's name (${named[1]}-${named[2]})`);
    }
    if (blends.has(data.code)) add(`the code ${data.code} is used twice`);
    if (slugs.has(data.slug)) add(`the slug "${data.slug}" is used twice`);
    slugs.add(data.slug);
    problems.push(
      ...blendProblems(file.path, data, { ingredients, unreadable, gear, unreadableGear, guides, guidesReadable }),
    );
    blends.set(data.code, blendFromFile(data));
  }

  // What nothing uses: only said when every blend could be read, or it would be said wrongly.
  const inUse = [...blends.values()].filter((b) => !b.retired);
  const unused = (folder: string, items: Iterable<{ id: string; retired: boolean }>, used: Set<string>) => {
    for (const item of items) {
      if (!item.retired && !used.has(item.id)) {
        problems.push({
          file: `${folder}/${item.id}.yaml`,
          message: "no blend uses it: remove it, or retire it if it was published (SPEC §5.2)",
        });
      }
    }
  };
  if (blendsReadable && !unreadable.size) {
    unused("ingredients", ingredients.values(), new Set(inUse.flatMap((b) => b.ingredients.map((i) => i.id))));
  }
  if (blendsReadable && !unreadableGear.size) {
    unused("gear", gear.values(), new Set(inUse.flatMap((b) => b.gear.map((g) => g.id))));
  }
  // A shop is in use if an ingredient or a piece of gear names it: every one of them must be read.
  if (blendsReadable && !unreadable.size && !unreadableGear.size) {
    const shopsInUse = new Set(
      [...ingredients.values(), ...gear.values()].flatMap((item) => item.shops.map((s) => s.shop)),
    );
    for (const shop of shops?.values() ?? []) {
      if (!shopsInUse.has(shop.id)) {
        problems.push({ file: files.shops.path, message: `no ingredient or gear names the shop "${shop.id}"` });
      }
    }
  }
  for (const ingredient of ingredients.values()) {
    if (teaTypes && ingredient.teaType !== undefined && !teaTypes.has(ingredient.teaType)) {
      problems.push({
        file: `ingredients/${ingredient.id}.yaml`,
        message: `tea_type: tea-types.yaml has no "${ingredient.teaType}" (the plain-tea fallback brews by it)`,
      });
    }
  }

  if (problems.length || !shops || !teaTypes) return { bundle: null, problems };
  const byText =
    <T>(key: (item: T) => string) =>
    (a: T, b: T) =>
      compareText(key(a), key(b));
  return {
    bundle: {
      format: CONTENT_FORMAT,
      blends: [...blends.values()].sort(byText((b) => b.code)),
      ingredients: [...ingredients.values()].sort(byText((i) => i.id)),
      gear: [...gear.values()].sort(byText((g) => g.id)),
      shops: [...shops.values()].sort(byText((s) => s.id)),
      teaTypes: TEA_TYPES.flatMap((type) => teaTypes.get(type) ?? []),
      guides: [...guides.values()].sort(byText((g) => g.id)),
    },
    problems: [],
  };
}
