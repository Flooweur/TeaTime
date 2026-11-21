/**
 * A small, valid content set for the tests, as data they can change before it's written as YAML.
 * Illustrative only: these are not real recipes or shops.
 */
import { stringify } from "yaml";
import type { ContentFiles } from "../src/index.js";

export interface Fixture {
  blends: Record<string, unknown>[];
  ingredients: Record<string, unknown>[];
  gear: Record<string, unknown>[];
  shops: Record<string, unknown>[];
  teaTypes: Record<string, unknown>[];
  guides: Record<string, string>;
}

const source = (title: string, primary = false) => ({
  title,
  url: `https://example.com/${title.toLowerCase().replaceAll(" ", "-")}`,
  lang: "en",
  ...(primary ? { primary: true } : {}),
  supports: ["recipe", "parameters"],
});

const shopRef = (shop: string) => ({ shop, why: "Fresh stock", price: "€8 / 100 g", checked: "2026-11-20" });

export function fixture(): Fixture {
  return {
    shops: [
      { id: "online-tea", name: "Online Tea", kind: "online", url: "https://example.com/shop" },
      { id: "lyon-tea", name: "Lyon Tea", kind: "lyon", address: "1 rue du Thé, 69002 Lyon" },
    ],
    teaTypes: [
      {
        type: "black",
        name: "Black tea",
        temp_c: 95,
        temp_range: [90, 100],
        ratio_g_per_100ml: 1,
        water_ml: 250,
        infusions_s: [180],
        office: { temp_c: 100, method: "Straight off the boil.", infusions_s: [180] },
        sources: [source("Black tea guide")],
      },
      {
        type: "oolong",
        name: "Oolong",
        temp_c: 95,
        ratio_g_per_100ml: 5,
        water_ml: 100,
        infusions_s: [20, 25, 35],
        office: { temp_c: 95, method: "Boil, then wait a minute.", infusions_s: [120] },
        sources: [source("Oolong guide")],
      },
    ],
    ingredients: [
      {
        id: "ceylon-black",
        name: "Ceylon black tea",
        category: "tea",
        unit: "g",
        tea_type: "black",
        perishable: false,
        shelf_life_days: 365,
        storage: "Airtight tin, away from light.",
        quality: "Whole leaf.",
        shops: [shopRef("online-tea"), shopRef("lyon-tea")],
      },
      {
        id: "dried-bergamot",
        name: "Dried bergamot peel",
        category: "citrus",
        unit: "g",
        perishable: false,
        shelf_life_days: 180,
        storage: "Airtight jar.",
        quality: "Calabrian.",
        shops: [shopRef("online-tea"), shopRef("lyon-tea")],
      },
      {
        id: "high-mountain-oolong",
        name: "High-mountain oolong",
        category: "tea",
        unit: "g",
        tea_type: "oolong",
        perishable: false,
        shelf_life_days: 365,
        storage: "Airtight tin.",
        quality: "Rolled leaf.",
        shops: [shopRef("online-tea"), shopRef("lyon-tea")],
      },
    ],
    gear: [
      {
        id: "gaiwan",
        name: "Gaiwan",
        quality: "Thin porcelain, about 120 ml.",
        shops: [shopRef("online-tea"), shopRef("lyon-tea")],
      },
      {
        id: "thermometer",
        name: "Kitchen thermometer",
        quality: "A probe that reads 0–100 °C.",
        shops: [shopRef("online-tea"), shopRef("lyon-tea")],
      },
    ],
    blends: [
      {
        code: "001",
        slug: "test-grey",
        name: "Test Grey",
        mode: "safe",
        family: "earl-grey",
        trust: "documented",
        source_type: "tea-house",
        origin: "England",
        story: "An illustrative blend for the tests.",
        difficulty: 1,
        flavours: ["citrus"],
        caffeine: "medium",
        scaling: "per-cup",
        serves: 1,
        guides: ["general#water"],
        sources: [source("House text", true), source("Second text")],
        ingredients: [
          { id: "ceylon-black", qty: 2.5, unit: "g", role: "base" },
          { id: "dried-bergamot", qty: 0.5, unit: "g", role: "accent", optional: true },
        ],
        gear: [{ id: "thermometer", optional: true }],
        brew: {
          water: "soft-bottled",
          temp_c: 95,
          water_ml: 250,
          vessel: "mug",
          preheat: true,
          infusions_s: [180],
        },
        steps: [
          { text: "Warm the teapot.", office: "Rinse the mug with hot water." },
          { text: "Infuse.", office: "Infuse in the mug.", infusions: true },
        ],
      },
      {
        code: "002",
        slug: "test-oolong",
        name: "Test Oolong",
        mode: "experimental",
        family: "tea-master",
        trust: "attested",
        source_type: "tea-master",
        origin: "Taiwan",
        story: "Another illustrative blend.",
        difficulty: 3,
        seasons: ["autumn", "winter"],
        flavours: ["floral"],
        caffeine: "medium",
        scaling: "per-session",
        session_max: 3,
        sources: [source("Tea master interview", true), source("Institute notes")],
        ingredients: [{ id: "high-mountain-oolong", qty: 5, unit: "g", role: "base" }],
        gear: [{ id: "gaiwan" }, { id: "thermometer", optional: true }],
        brew: {
          water: "soft-bottled",
          temp_c: 95,
          water_ml: 100,
          vessel: "gaiwan",
          preheat: true,
          infusions_s: [20, 25, 35, 50],
        },
        steps: [{ text: "Rinse the leaves, then infuse.", infusions: true }],
      },
    ],
    guides: {
      general:
        "# The general tea guide\n\n## Water {#water}\n\nSoft water. See [temperature](#temperature).\n\n## Temperature {#temperature}\n\nBy type.\n",
    },
  };
}

/** The fixture as the files the compiler reads. */
export function filesOf(f: Fixture): ContentFiles {
  return {
    blends: f.blends.map((b) => ({ path: `blends/${String(b.code)}-${String(b.slug)}.yaml`, text: stringify(b) })),
    ingredients: f.ingredients.map((i) => ({ path: `ingredients/${String(i.id)}.yaml`, text: stringify(i) })),
    gear: f.gear.map((g) => ({ path: `gear/${String(g.id)}.yaml`, text: stringify(g) })),
    shops: { path: "shops.yaml", text: stringify({ shops: f.shops }) },
    teaTypes: { path: "tea-types.yaml", text: stringify({ tea_types: f.teaTypes }) },
    guides: Object.entries(f.guides).map(([id, text]) => ({ path: `guides/${id}.md`, text })),
  };
}
