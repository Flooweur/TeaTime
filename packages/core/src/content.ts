/**
 * The content's vocabulary and the shape of the compiled bundle (SPEC §5): what the content
 * package builds from its YAML and Markdown, and what the draw, the app and the server read. The
 * file format (snake_case YAML) lives in content/src/schema.ts; this is the model, in camelCase.
 *
 * Every list below is part of the file format: a value is added, never renamed or removed, since
 * published blends and the owner's history name them.
 */

/** Office days draw from the safe pool, home days from the experimental one (SPEC §2.2). */
export const MODES = ["safe", "experimental"] as const;
export type Mode = (typeof MODES)[number];

/** The six families of the 90 blends (SPEC §5.1). */
export const FAMILIES = ["household", "tea-master", "chef", "court", "earl-grey", "seasonal"] as const;
export type Family = (typeof FAMILIES)[number];

/**
 * How far a blend's story can be trusted (SPEC §5.2): a written source, a chef, tea master or tea
 * house's word, or a good story that can't be proven.
 */
export const TRUST_LEVELS = ["documented", "attested", "legend"] as const;
export type TrustLevel = (typeof TRUST_LEVELS)[number];

/** Who the recipe comes from. */
export const SOURCE_TYPES = ["grandmother", "tea-master", "chef", "tea-house", "ceremony", "royal-state"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

/** Meteorological seasons in the northern hemisphere: winter is December to February. */
export const SEASONS = ["spring", "summer", "autumn", "winter"] as const;
export type Season = (typeof SEASONS)[number];

export const CAFFEINE_LEVELS = ["none", "low", "medium", "high"] as const;
export type CaffeineLevel = (typeof CAFFEINE_LEVELS)[number];

/** Whether the blend must be started the evening before (a cold brew), or is made on the day. */
export const PREPS = ["none", "evening"] as const;
export type Prep = (typeof PREPS)[number];

/** When a step happens: the evening before (a blend with `prep: evening`), or on the day. */
export const STAGES = ["evening", "day"] as const;
export type Stage = (typeof STAGES)[number];

/** What a source backs up. */
export const SOURCE_SUPPORTS = ["recipe", "story", "parameters"] as const;
export type SourceSupport = (typeof SOURCE_SUPPORTS)[number];

export const WATERS = ["tap", "soft-bottled", "filtered"] as const;
export type Water = (typeof WATERS)[number];

export const VESSELS = ["mug", "teapot", "glass", "jar", "bottle", "gaiwan", "kyusu", "chawan", "saucepan"] as const;
export type Vessel = (typeof VESSELS)[number];

/** What a safe blend may be made in: a plain kettle's world, no special equipment (SPEC §5.3). */
export const SAFE_VESSELS = ["mug", "teapot", "glass", "jar", "bottle"] as const satisfies readonly Vessel[];

/**
 * The vessels a kitchen may lack: a blend made in one lists it as gear, under the same id, so it
 * isn't drawn before the owner has one (SPEC §5.2).
 */
export const GEAR_VESSELS = ["gaiwan", "kyusu", "chawan"] as const satisfies readonly Vessel[];

/** The most a safe blend may take on the day, in seconds: under 5 minutes (SPEC §5.3). */
export const SAFE_DAY_SECONDS = 300;

export const ROLES = ["base", "accent", "garnish"] as const;
export type Role = (typeof ROLES)[number];

/** An ingredient's unit: every quantity of it, in every blend, is in this unit. */
export const UNITS = ["g", "ml", "pieces"] as const;
export type Unit = (typeof UNITS)[number];

export const CATEGORIES = ["tea", "herb", "spice", "citrus", "flower", "sweetener", "dairy", "other"] as const;
export type Category = (typeof CATEGORIES)[number];

/** The tea families of the guide (SPEC §6): only a `tea` ingredient has one. */
export const TEA_TYPES = ["white", "green", "yellow", "oolong", "black", "dark"] as const;
export type TeaTypeName = (typeof TEA_TYPES)[number];

/** An online shop, or one in Lyon to walk to. */
export const SHOP_KINDS = ["online", "lyon"] as const;
export type ShopKind = (typeof SHOP_KINDS)[number];

/** A citation. A source has a URL, a reference (a book and its pages), or both. */
export interface Citation {
  readonly title: string;
  readonly author?: string;
  readonly url?: string;
  readonly ref?: string;
  /** Its language, ISO 639: a source may be in any language (decision of 2026-11-20). */
  readonly lang: string;
  /** A tea house's own publication, a chef's book or interview, a tea institute, a named family recipe. */
  readonly primary: boolean;
  readonly supports: readonly SourceSupport[];
  readonly note?: string;
}

/** Both ends included. */
export interface Range {
  readonly min: number;
  readonly max: number;
}

export interface BlendIngredient {
  /** An ingredient's id. */
  readonly id: string;
  /** In the ingredient's unit, for the recipe as written (see `Scaling`). */
  readonly qty: number;
  readonly unit: Unit;
  /** An optional ingredient is used when you have it and never stops the blend being drawn. */
  readonly optional: boolean;
  readonly role: Role;
}

/** A piece of gear a blend needs, by id. */
export interface BlendGear {
  readonly id: string;
  /** Optional gear helps (a thermometer) but is never needed: the blend is drawn without it. */
  readonly optional: boolean;
}

/**
 * How quantities follow the number of cups. `per-cup`: the recipe makes `serves` cups, and scales
 * in proportion. `per-session`: one session's leaves (a gaiwan, a kyusu) are shared by up to
 * `sessionMax` people; more people make more sessions.
 */
export type Scaling =
  { readonly kind: "per-cup"; readonly serves: number } | { readonly kind: "per-session"; readonly sessionMax: number };

export interface Brew {
  readonly water: Water;
  readonly tempC: number;
  /** When the sources disagree: the range they give, `tempC` being the value chosen (SPEC §5.2). */
  readonly tempRange?: Range;
  readonly ratioGPer100ml?: number;
  /** For the recipe as written: `serves` cups, or one session. */
  readonly waterMl: number;
  readonly vessel: Vessel;
  readonly preheat: boolean;
  /** Each infusion's time, in order: one for a Western brew, several for gongfu. */
  readonly infusionsS: readonly number[];
}

export interface Step {
  readonly text: string;
  /** The same step with an office kettle and mugs (every step of a safe blend has one). */
  readonly office?: string;
  /** A wait that isn't an infusion: cooling the water, simmering. */
  readonly timerS?: number;
  /** The step where the infusions' timers run (exactly one per blend). */
  readonly infusions: boolean;
  readonly stage: Stage;
}

export interface GuideLink {
  readonly guide: string;
  readonly chapter: string;
}

export interface Blend {
  /** "017": permanent, shown as #017 and written in the paper journal. */
  readonly code: string;
  readonly slug: string;
  readonly name: string;
  readonly mode: Mode;
  readonly family: Family;
  readonly trust: TrustLevel;
  readonly sourceType: SourceType;
  readonly origin: string;
  readonly story: string;
  readonly difficulty: 1 | 2 | 3;
  /** Empty: all year. */
  readonly seasons: readonly Season[];
  readonly flavours: readonly string[];
  readonly caffeine: CaffeineLevel;
  readonly scaling: Scaling;
  readonly prep: Prep;
  readonly guides: readonly GuideLink[];
  /** A retired blend stays for the history, but is never drawn or listed. */
  readonly retired: boolean;
  readonly sources: readonly Citation[];
  readonly ingredients: readonly BlendIngredient[];
  /** Empty: a kettle and a kitchen's usual things are enough. */
  readonly gear: readonly BlendGear[];
  readonly brew: Brew;
  readonly steps: readonly Step[];
}

export interface ShopRef {
  readonly shop: string;
  readonly why: string;
  /** As found, e.g. "€9.50 / 100 g". */
  readonly price: string;
  /** The product's own page, when there is one. */
  readonly url?: string;
  /** When the price and the page were last checked. */
  readonly checked: string;
}

export interface Ingredient {
  readonly id: string;
  readonly name: string;
  readonly category: Category;
  readonly unit: Unit;
  /** Set exactly when the category is `tea`. */
  readonly teaType?: TeaTypeName;
  /** A tea never brewed plain, whatever its type: matcha is whisked, not steeped (SPEC §2.5). */
  readonly plain?: false;
  /** A tea brewed plain its own way rather than by its type's defaults: genmaicha takes boiling water. */
  readonly plainBrew?: PlainBrew;
  /** Fresh mint, milk, a lemon: past its shelf life it counts as missing. */
  readonly perishable: boolean;
  /** How long it keeps once opened (or bought, when fresh). */
  readonly shelfLifeDays: number;
  readonly storage: string;
  readonly quality: string;
  readonly shops: readonly ShopRef[];
  readonly retired: boolean;
}

/**
 * Equipment a kitchen may lack: a gaiwan, a cloth filter, a thermometer. It is bought once, and the
 * pantry holds it as *have* or *don't have*, never an amount (decision of 2026-11-20).
 */
export interface Gear {
  readonly id: string;
  readonly name: string;
  /** What to look for when buying it. */
  readonly quality: string;
  readonly shops: readonly ShopRef[];
  readonly retired: boolean;
}

export interface Shop {
  readonly id: string;
  readonly name: string;
  readonly kind: ShopKind;
  readonly url?: string;
  /** Set for a shop in Lyon. */
  readonly address?: string;
  readonly notes?: string;
}

/** How a tea is brewed plain, for one cup (SPEC §2.5's fallback): its type's defaults, or its own. */
export interface PlainBrew {
  readonly tempC: number;
  readonly tempRange?: Range;
  readonly ratioGPer100ml: number;
  /** For one cup. */
  readonly waterMl: number;
  readonly infusionsS: readonly number[];
  /** With an office kettle and a mug: how to reach the temperature, and the times. */
  readonly office: { readonly tempC: number; readonly method: string; readonly infusionsS: readonly number[] };
  readonly notes?: string;
  readonly sources: readonly Citation[];
}

/** A tea type's sourced defaults: how a plain tea of that type is brewed, unless it has its own. */
export interface TeaType extends PlainBrew {
  readonly type: TeaTypeName;
  readonly name: string;
}

export interface GuideChapter {
  readonly id: string;
  readonly title: string;
}

export interface Guide {
  readonly id: string;
  readonly title: string;
  readonly chapters: readonly GuideChapter[];
  /** Rendered from the guide's Markdown at build time; the Markdown holds no raw HTML. */
  readonly html: string;
}

/** The bundle's format: raised when its shape changes (2: gear; 3: a tea's own plain brew). */
export const CONTENT_FORMAT = 3;

export interface ContentBundle {
  readonly format: typeof CONTENT_FORMAT;
  /** SHA-256 of the canonical JSON of everything else: the app and the server compare it. */
  readonly hash: string;
  /** By code. */
  readonly blends: readonly Blend[];
  /** By id. */
  readonly ingredients: readonly Ingredient[];
  /** By id. */
  readonly gear: readonly Gear[];
  /** By id. */
  readonly shops: readonly Shop[];
  /** In TEA_TYPES' order. */
  readonly teaTypes: readonly TeaType[];
  /** By id. */
  readonly guides: readonly Guide[];
}
