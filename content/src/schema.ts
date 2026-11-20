/**
 * The content's file format, as TypeBox schemas (SPEC §5; content/README.md). Every object is
 * closed, so a misspelt key fails the check instead of being ignored. The YAML is snake_case;
 * compile.ts turns it into core's camelCase model (packages/core/src/content.ts).
 */
import {
  CAFFEINE_LEVELS,
  CATEGORIES,
  DATE_PATTERN,
  FAMILIES,
  MODES,
  PREPS,
  ROLES,
  SEASONS,
  SHOP_KINDS,
  SOURCE_SUPPORTS,
  SOURCE_TYPES,
  STAGES,
  TEA_TYPES,
  TRUST_LEVELS,
  UNITS,
  VESSELS,
  WATERS,
} from "@teatime/core";
import { type Static, Type } from "typebox";

const closed = { additionalProperties: false } as const;
/** A pattern's body, to build a bigger one from it. */
const bare = (pattern: string) => pattern.replace(/^\^/, "").replace(/\$$/, "");

/** Words: a string with something in it besides spaces. */
const Words = Type.String({ minLength: 1, pattern: "\\S" });

/** Kebab-case: `moroccan-mint`, `gunpowder-green`. */
export const SLUG_PATTERN = "^[a-z0-9]+(?:-[a-z0-9]+)*$";
/** Three digits: `017`. */
export const BLEND_CODE_PATTERN = "^[0-9]{3}$";
/** A guide's chapter: `earl-grey#bergamot`. */
export const GUIDE_LINK_PATTERN = `^${bare(SLUG_PATTERN)}#${bare(SLUG_PATTERN)}$`;

const Slug = Type.String({ pattern: SLUG_PATTERN });
const HttpsUrl = Type.String({ pattern: "^https://[^\\s]+$" });
const IsoDate = Type.String({ pattern: DATE_PATTERN });
/** ISO 639-1 or 639-3: `en`, `fr`, `ja`, `zh`. */
const Lang = Type.String({ pattern: "^[a-z]{2,3}$" });
const Celsius = Type.Integer({ minimum: 0, maximum: 100 });
/** A time in seconds, up to a day (a cold brew's night). */
const Seconds = Type.Integer({ minimum: 1, maximum: 86_400 });
/** `[min, max]`, both included. */
const CelsiusRange = Type.Tuple([Celsius, Celsius]);

export const SourceFile = Type.Object(
  {
    title: Words,
    author: Type.Optional(Words),
    url: Type.Optional(HttpsUrl),
    /** A book and its pages, an archive's reference: for a source without a URL. */
    ref: Type.Optional(Words),
    lang: Lang,
    primary: Type.Optional(Type.Boolean()),
    supports: Type.Array(Type.Enum(SOURCE_SUPPORTS), { minItems: 1, uniqueItems: true }),
    note: Type.Optional(Words),
  },
  closed,
);
export type SourceFile = Static<typeof SourceFile>;

export const BlendIngredientFile = Type.Object(
  {
    id: Slug,
    qty: Type.Number({ exclusiveMinimum: 0, maximum: 10_000 }),
    unit: Type.Enum(UNITS),
    optional: Type.Optional(Type.Boolean()),
    role: Type.Enum(ROLES),
  },
  closed,
);

export const BrewFile = Type.Object(
  {
    water: Type.Enum(WATERS),
    temp_c: Celsius,
    temp_range: Type.Optional(CelsiusRange),
    ratio_g_per_100ml: Type.Optional(Type.Number({ exclusiveMinimum: 0, maximum: 50 })),
    water_ml: Type.Integer({ minimum: 1, maximum: 5000 }),
    vessel: Type.Enum(VESSELS),
    preheat: Type.Boolean(),
    infusions_s: Type.Array(Seconds, { minItems: 1, maxItems: 20 }),
  },
  closed,
);

export const StepFile = Type.Object(
  {
    text: Words,
    office: Type.Optional(Words),
    timer_s: Type.Optional(Seconds),
    infusions: Type.Optional(Type.Literal(true)),
    stage: Type.Optional(Type.Enum(STAGES)),
  },
  closed,
);

export const BlendFile = Type.Object(
  {
    code: Type.String({ pattern: BLEND_CODE_PATTERN }),
    slug: Slug,
    name: Words,
    mode: Type.Enum(MODES),
    family: Type.Enum(FAMILIES),
    trust: Type.Enum(TRUST_LEVELS),
    source_type: Type.Enum(SOURCE_TYPES),
    origin: Words,
    /** Three or four lines on where the recipe comes from. */
    story: Type.String({ minLength: 1, maxLength: 700, pattern: "\\S" }),
    difficulty: Type.Integer({ minimum: 1, maximum: 3 }),
    /** Left out for a blend of all year: four seasons are refused. */
    seasons: Type.Optional(Type.Array(Type.Enum(SEASONS), { minItems: 1, maxItems: 3, uniqueItems: true })),
    flavours: Type.Array(Slug, { minItems: 1, uniqueItems: true }),
    caffeine: Type.Enum(CAFFEINE_LEVELS),
    scaling: Type.Enum(["per-cup", "per-session"] as const),
    /** `per-cup`: the cups the recipe makes as written. */
    serves: Type.Optional(Type.Integer({ minimum: 1, maximum: 12 })),
    /** `per-session`: how many people share one session's leaves. */
    session_max: Type.Optional(Type.Integer({ minimum: 1, maximum: 12 })),
    prep: Type.Optional(Type.Enum(PREPS)),
    guides: Type.Optional(Type.Array(Type.String({ pattern: GUIDE_LINK_PATTERN }), { minItems: 1, uniqueItems: true })),
    retired: Type.Optional(Type.Boolean()),
    sources: Type.Array(SourceFile, { minItems: 2 }),
    ingredients: Type.Array(BlendIngredientFile, { minItems: 1 }),
    brew: BrewFile,
    steps: Type.Array(StepFile, { minItems: 1 }),
  },
  closed,
);
export type BlendFile = Static<typeof BlendFile>;

export const ShopRefFile = Type.Object(
  {
    shop: Slug,
    why: Words,
    price: Words,
    url: Type.Optional(HttpsUrl),
    checked: IsoDate,
  },
  closed,
);

export const IngredientFile = Type.Object(
  {
    id: Slug,
    name: Words,
    category: Type.Enum(CATEGORIES),
    unit: Type.Enum(UNITS),
    tea_type: Type.Optional(Type.Enum(TEA_TYPES)),
    perishable: Type.Boolean(),
    shelf_life_days: Type.Integer({ minimum: 1, maximum: 3650 }),
    storage: Words,
    quality: Words,
    /** At least 2, with a Lyon shop wherever one exists (SPEC §5.2). */
    shops: Type.Array(ShopRefFile, { minItems: 2 }),
    retired: Type.Optional(Type.Boolean()),
  },
  closed,
);
export type IngredientFile = Static<typeof IngredientFile>;

export const ShopFile = Type.Object(
  {
    id: Slug,
    name: Words,
    kind: Type.Enum(SHOP_KINDS),
    url: Type.Optional(HttpsUrl),
    address: Type.Optional(Words),
    notes: Type.Optional(Words),
  },
  closed,
);
export type ShopFile = Static<typeof ShopFile>;

export const ShopsFile = Type.Object({ shops: Type.Array(ShopFile) }, closed);
export type ShopsFile = Static<typeof ShopsFile>;

export const TeaTypeFile = Type.Object(
  {
    type: Type.Enum(TEA_TYPES),
    name: Words,
    temp_c: Celsius,
    temp_range: Type.Optional(CelsiusRange),
    ratio_g_per_100ml: Type.Number({ exclusiveMinimum: 0, maximum: 50 }),
    /** For one cup. */
    water_ml: Type.Integer({ minimum: 1, maximum: 1000 }),
    infusions_s: Type.Array(Seconds, { minItems: 1, maxItems: 20 }),
    office: Type.Object(
      {
        temp_c: Celsius,
        method: Words,
        infusions_s: Type.Array(Seconds, { minItems: 1, maxItems: 20 }),
      },
      closed,
    ),
    notes: Type.Optional(Words),
    sources: Type.Array(SourceFile, { minItems: 1 }),
  },
  closed,
);
export type TeaTypeFile = Static<typeof TeaTypeFile>;

export const TeaTypesFile = Type.Object({ tea_types: Type.Array(TeaTypeFile) }, closed);
export type TeaTypesFile = Static<typeof TeaTypesFile>;

/** `017 moroccan-mint`: a blend's code and slug, as ids.yaml keeps them. */
export const ID_LOCK_BLEND_PATTERN = `^${bare(BLEND_CODE_PATTERN)} ${bare(SLUG_PATTERN)}$`;

/** ids.yaml: every blend and ingredient ever published, which are never renamed or reused. */
export const IdsFile = Type.Object(
  {
    blends: Type.Array(Type.String({ pattern: ID_LOCK_BLEND_PATTERN }), { uniqueItems: true }),
    ingredients: Type.Array(Slug, { uniqueItems: true }),
  },
  closed,
);
export type IdsFile = Static<typeof IdsFile>;
