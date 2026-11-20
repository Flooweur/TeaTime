import { describe, expect, it } from "vitest";
import { compileContent } from "../src/index.js";
import { type Fixture, filesOf, fixture } from "./fixtures.js";

/** The problems' messages, after `change` was made to a valid fixture. */
function problemsAfter(change: (f: Fixture) => void): string[] {
  const f = fixture();
  change(f);
  return compileContent(filesOf(f)).problems.map((p) => `${p.file}: ${p.message}`);
}

const blend = (f: Fixture, i: number) => f.blends[i] as Record<string, unknown>;
const field = <T>(object: unknown, key: string) => (object as Record<string, T>)[key] as T;

describe("compileContent on valid content", () => {
  it("builds the bundle in camelCase, sorted, with defaults filled in", () => {
    const { bundle, problems } = compileContent(filesOf(fixture()));
    expect(problems).toEqual([]);
    expect(bundle).not.toBeNull();
    const [grey, oolong] = bundle!.blends;
    expect(grey).toMatchObject({
      code: "001",
      sourceType: "tea-house",
      seasons: [],
      prep: "none",
      retired: false,
      scaling: { kind: "per-cup", serves: 1 },
      guides: [{ guide: "general", chapter: "water" }],
      brew: { tempC: 95, waterMl: 250, infusionsS: [180] },
    });
    expect(grey!.ingredients[1]).toEqual({ id: "dried-bergamot", qty: 0.5, unit: "g", optional: true, role: "accent" });
    expect(grey!.steps[1]).toEqual({ text: "Infuse.", office: "Infuse in the mug.", infusions: true, stage: "day" });
    expect(grey!.sources[0]!.primary).toBe(true);
    expect(grey!.sources[1]!.primary).toBe(false);
    expect(oolong!.scaling).toEqual({ kind: "per-session", sessionMax: 3 });
    expect(grey!.gear).toEqual([{ id: "thermometer", optional: true }]);
    expect(oolong!.gear).toEqual([
      { id: "gaiwan", optional: false },
      { id: "thermometer", optional: true },
    ]);
    expect(bundle!.ingredients.map((i) => i.id)).toEqual(["ceylon-black", "dried-bergamot", "high-mountain-oolong"]);
    expect(bundle!.gear.map((g) => g.id)).toEqual(["gaiwan", "thermometer"]);
    expect(bundle!.gear[0]).toMatchObject({ name: "Gaiwan", retired: false });
    expect(bundle!.gear[0]!.shops[0]).toEqual({
      shop: "online-tea",
      why: "Fresh stock",
      price: "€8 / 100 g",
      checked: "2026-11-20",
    });
    expect(bundle!.teaTypes.map((t) => t.type)).toEqual(["oolong", "black"]);
    expect(bundle!.teaTypes[1]!.tempRange).toEqual({ min: 90, max: 100 });
    expect(bundle!.guides[0]!.chapters).toEqual([
      { id: "water", title: "Water" },
      { id: "temperature", title: "Temperature" },
    ]);
  });

  it("leaves optional fields out rather than setting them undefined", () => {
    const { bundle } = compileContent(filesOf(fixture()));
    const ingredient = bundle!.ingredients.find((i) => i.id === "dried-bergamot")!;
    expect("teaType" in ingredient).toBe(false);
    expect("tempRange" in bundle!.blends[0]!.brew).toBe(false);
  });

  it("gives a blend that names no gear an empty list", () => {
    const f = fixture();
    // Without its thermometer, which nothing else needs.
    delete blend(f, 0).gear;
    blend(f, 1).gear = [{ id: "gaiwan" }];
    f.gear.splice(1, 1);
    const { bundle, problems } = compileContent(filesOf(f));
    expect(problems).toEqual([]);
    expect(bundle!.blends[0]!.gear).toEqual([]);
  });

  it("accepts empty content", () => {
    const empty: Fixture = { blends: [], ingredients: [], gear: [], shops: [], teaTypes: [], guides: {} };
    expect(compileContent(filesOf(empty)).problems).toEqual([]);
  });
});

describe("compileContent refuses", () => {
  it("a misspelt key, a wrong enum value and an empty text", () => {
    const found = problemsAfter((f) => {
      blend(f, 0).tempreature = 90;
      blend(f, 0).mode = "office";
      blend(f, 0).name = " ";
    });
    expect(found).toContain('blends/001-test-grey.yaml: (the whole file): unknown key "tempreature"');
    expect(found).toContain("blends/001-test-grey.yaml: mode: must be one of safe, experimental");
    expect(found).toContain("blends/001-test-grey.yaml: name: empty");
  });

  it("invalid YAML and a key twice", () => {
    const files = filesOf(fixture());
    const broken = { ...files, shops: { path: "shops.yaml", text: "shops:\n  - id: a\n    id: b\n" } };
    const found = compileContent(broken).problems.map((p) => p.message);
    expect(found.some((m) => m.startsWith("not valid YAML"))).toBe(true);
  });

  it("a file whose name isn't its code and slug", () => {
    const files = filesOf(fixture());
    const renamed = { ...files, blends: [{ ...files.blends[0]!, path: "blends/009-other.yaml" }, files.blends[1]!] };
    expect(compileContent(renamed).problems.map((p) => p.message)).toContain(
      "its code and slug (001-test-grey) aren't its file's name (009-other)",
    );
  });

  it("a code or a slug used twice", () => {
    const found = problemsAfter((f) => {
      f.blends.push({ ...blend(f, 0), slug: "test-grey-two" });
      f.blends.push({ ...blend(f, 1), code: "003" });
    });
    expect(found).toContain("blends/001-test-grey-two.yaml: the code 001 is used twice");
    expect(found).toContain('blends/003-test-oolong.yaml: the slug "test-oolong" is used twice');
  });

  it("fewer than 2 sources, no primary one, and a source with neither url nor ref", () => {
    expect(problemsAfter((f) => (blend(f, 0).sources = [field<unknown[]>(blend(f, 0), "sources")[0]]))).toContain(
      "blends/001-test-grey.yaml: sources: must not have fewer than 2 items",
    );
    const found = problemsAfter((f) => {
      const sources = field<Record<string, unknown>[]>(blend(f, 0), "sources");
      delete sources[0]!.primary;
      delete sources[1]!.url;
    });
    expect(found.some((m) => m.includes("at least one primary source"))).toBe(true);
    expect(found).toContain(
      "blends/001-test-grey.yaml: sources[1]: a source needs a url, a ref (a book and its pages), or both",
    );
  });

  it("an unknown ingredient, a unit that isn't the ingredient's, an ingredient twice, all optional", () => {
    const found = problemsAfter((f) => {
      const items = field<Record<string, unknown>[]>(blend(f, 0), "ingredients");
      items.push({ id: "unicorn-tea", qty: 1, unit: "g", role: "base" });
      items.push({ id: "ceylon-black", qty: 1, unit: "g", role: "base" });
      items[1]!.unit = "pieces";
    });
    expect(found).toContain(
      'blends/001-test-grey.yaml: ingredients[2]: no ingredient "unicorn-tea" (ingredients/unicorn-tea.yaml)',
    );
    expect(found).toContain('blends/001-test-grey.yaml: ingredients[3]: "ceylon-black" is in the blend twice');
    expect(found).toContain('blends/001-test-grey.yaml: ingredients[1]: "dried-bergamot" is counted in g, not pieces');
    const allOptional = problemsAfter((f) => {
      for (const item of field<Record<string, unknown>[]>(blend(f, 0), "ingredients")) item.optional = true;
    });
    expect(allOptional).toContain("blends/001-test-grey.yaml: ingredients: at least one isn't optional");
  });

  it("unknown gear, gear twice, retired gear, and a gaiwan blend that doesn't need its gaiwan", () => {
    const found = problemsAfter((f) => {
      const gear = field<Record<string, unknown>[]>(blend(f, 1), "gear");
      gear.push({ id: "tea-sock" }, { id: "thermometer" });
      gear[0]!.optional = true;
      f.gear[1]!.retired = true;
    });
    expect(found).toContain('blends/002-test-oolong.yaml: gear[2]: no gear "tea-sock" (gear/tea-sock.yaml)');
    expect(found).toContain('blends/002-test-oolong.yaml: gear[3]: "thermometer" is in the blend twice');
    expect(found).toContain('blends/001-test-grey.yaml: gear[0]: "thermometer" is retired');
    expect(found).toContain(
      "blends/002-test-oolong.yaml: gear: a blend made in a gaiwan needs it as gear: { id: gaiwan }",
    );
  });

  it("a piece of gear with an ingredient's id (the self-review of phase 4)", () => {
    const found = problemsAfter((f) => f.gear.push({ ...(f.gear[0] as object), id: "ceylon-black" }));
    expect(found).toContain('gear/ceylon-black.yaml: the id "ceylon-black" is already an ingredient\'s');
  });

  it("an unused ingredient even when a gear file can't be read (the self-review of phase 4)", () => {
    const files = filesOf(fixture());
    const spare = {
      path: "ingredients/spare-peel.yaml",
      text: files.ingredients[1]!.text.replace(/^id: .*$/m, "id: spare-peel"),
    };
    const broken = { path: "gear/thermometer.yaml", text: "id: thermometer\n" };
    const found = compileContent({
      ...files,
      ingredients: [...files.ingredients, spare],
      gear: [files.gear[0]!, broken],
    }).problems.map((p) => `${p.file}: ${p.message}`);
    expect(found).toContain(
      "ingredients/spare-peel.yaml: no blend uses it: remove it, or retire it if it was published (SPEC §5.2)",
    );
    expect(found.some((m) => m.startsWith("shops.yaml"))).toBe(false);
  });

  it("a safe blend that needs gear (optional gear is fine)", () => {
    expect(
      problemsAfter((f) => (field<Record<string, unknown>[]>(blend(f, 0), "gear")[0]!.optional = false)),
    ).toContain(
      'blends/001-test-grey.yaml: gear[0]: a safe blend needs no special equipment; "thermometer" can only be optional',
    );
  });

  it("gear with fewer than 2 shops, a shop not in shops.yaml, or an id that isn't its file's name", () => {
    const found = problemsAfter((f) => {
      f.gear[0]!.shops = [field<unknown[]>(f.gear[0], "shops")[0]];
      field<Record<string, unknown>[]>(f.gear[1], "shops")[1]!.shop = "ghost";
    });
    expect(found).toContain("gear/gaiwan.yaml: shops: must not have fewer than 2 items");
    expect(found).toContain('gear/thermometer.yaml: shops[1]: no shop "ghost" in shops.yaml');
    const files = filesOf(fixture());
    const moved = { ...files, gear: [{ ...files.gear[0]!, path: "gear/pot.yaml" }, files.gear[1]!] };
    expect(compileContent(moved).problems.map((p) => `${p.file}: ${p.message}`)).toContain(
      `gear/pot.yaml: its id "gaiwan" isn't its file's name "pot"`,
    );
  });

  it("scaling without its number, or with the other one", () => {
    expect(problemsAfter((f) => delete blend(f, 0).serves)).toContain(
      "blends/001-test-grey.yaml: serves: a per-cup blend says how many cups the recipe makes",
    );
    expect(problemsAfter((f) => (blend(f, 1).serves = 2))).toContain(
      "blends/002-test-oolong.yaml: serves: a per-session blend has session_max instead",
    );
  });

  it("evening steps that don't match prep, or come after the day's", () => {
    const steps = (f: Fixture) => field<Record<string, unknown>[]>(blend(f, 1), "steps");
    expect(problemsAfter((f) => (blend(f, 1).prep = "evening"))).toContain(
      "blends/002-test-oolong.yaml: steps: a blend with prep: evening has an evening step",
    );
    expect(problemsAfter((f) => (steps(f)[0]!.stage = "evening"))).toContain(
      "blends/002-test-oolong.yaml: steps: an evening step needs prep: evening",
    );
    const late = problemsAfter((f) => {
      blend(f, 1).prep = "evening";
      steps(f).push({ text: "Strain into a bottle.", stage: "evening" });
    });
    expect(late).toContain("blends/002-test-oolong.yaml: steps: the evening steps come first");
  });

  it("not exactly one infusions step, and an infusions step with its own timer", () => {
    expect(problemsAfter((f) => delete field<Record<string, unknown>[]>(blend(f, 1), "steps")[0]!.infusions)).toContain(
      "blends/002-test-oolong.yaml: steps: exactly one step has infusions: true (0 here)",
    );
    expect(problemsAfter((f) => (field<Record<string, unknown>[]>(blend(f, 1), "steps")[0]!.timer_s = 30))).toContain(
      "blends/002-test-oolong.yaml: steps[0]: the infusions step takes its times from brew",
    );
  });

  it("a temperature outside its own range", () => {
    expect(problemsAfter((f) => (field<Record<string, unknown>>(blend(f, 0), "brew").temp_range = [70, 80]))).toContain(
      "blends/001-test-grey.yaml: brew.temp_c: 95 °C is outside its temp_range [70, 80]",
    );
  });

  it("a guide link to no guide or no chapter", () => {
    const found = problemsAfter((f) => (blend(f, 0).guides = ["earl-grey#bergamot", "general#milk"]));
    expect(found).toContain('blends/001-test-grey.yaml: guides: no guide "earl-grey" (guides/earl-grey.md)');
    expect(found).toContain('blends/001-test-grey.yaml: guides: the guide "general" has no chapter {#milk}');
  });

  it("a safe blend in a gaiwan, without office texts, or longer than 5 minutes on the day", () => {
    const found = problemsAfter((f) => {
      const grey = blend(f, 0);
      field<Record<string, unknown>>(grey, "brew").vessel = "gaiwan";
      field<Record<string, unknown>>(grey, "brew").infusions_s = [240];
      const steps = field<Record<string, unknown>[]>(grey, "steps");
      delete steps[0]!.office;
      steps[0]!.timer_s = 90;
    });
    expect(found).toContain(
      "blends/001-test-grey.yaml: brew.vessel: a safe blend is made in a mug, teapot, glass, jar, bottle, not a gaiwan",
    );
    expect(found).toContain(
      "blends/001-test-grey.yaml: steps[0]: every step of a safe blend on the day has its office text",
    );
    expect(found).toContain(
      "blends/001-test-grey.yaml: steps: 330 s of waiting on the day; a safe blend takes 300 s at most",
    );
  });

  it("counts only the day's waiting for a safe overnight blend, and asks no office text of its evening steps", () => {
    // The evening steps happen at home (the self-review of phase 1).
    const found = problemsAfter((f) => {
      const grey = blend(f, 0);
      grey.prep = "evening";
      field<Record<string, unknown>>(grey, "brew").infusions_s = [36_000];
      field<Record<string, unknown>>(grey, "brew").vessel = "bottle";
      const steps = field<Record<string, unknown>[]>(grey, "steps");
      for (const step of steps) {
        step.stage = "evening";
        delete step.office;
      }
      steps.push({ text: "Pour over ice.", office: "Pour into a glass." });
    });
    expect(found).toEqual([]);
  });

  it("an unreadable shops.yaml or tea-types.yaml once, without the references it would have checked", () => {
    // Its references aren't reported as missing too (the self-review of phase 1).
    const files = filesOf(fixture());
    const found = compileContent({
      ...files,
      shops: { path: "shops.yaml", text: "shops: [" },
      teaTypes: { path: "tea-types.yaml", text: "tea_types: nope\n" },
    });
    expect(found.bundle).toBeNull();
    expect(found.problems.map((p) => p.file)).toEqual(["shops.yaml", "tea-types.yaml"]);
  });

  it("an unused ingredient, unused gear and an unused shop", () => {
    const found = problemsAfter((f) => {
      f.ingredients.push({ ...(f.ingredients[1] as object), id: "spare-peel" });
      f.gear.push({ ...(f.gear[0] as object), id: "spare-pot" });
      f.gear.push({ ...(f.gear[0] as object), id: "old-pot", retired: true });
      f.shops.push({ id: "nobody", name: "Nobody", kind: "online", url: "https://example.com/n" });
    });
    expect(found).toContain(
      "ingredients/spare-peel.yaml: no blend uses it: remove it, or retire it if it was published (SPEC §5.2)",
    );
    expect(found).toContain(
      "gear/spare-pot.yaml: no blend uses it: remove it, or retire it if it was published (SPEC §5.2)",
    );
    expect(found.some((m) => m.startsWith("gear/old-pot.yaml"))).toBe(false);
    expect(found).toContain('shops.yaml: no ingredient or gear names the shop "nobody"');
  });

  it("counts a shop that only gear names as in use", () => {
    const found = problemsAfter((f) => {
      f.shops.push({ id: "pottery", name: "Pottery", kind: "online", url: "https://example.com/p" });
      field<Record<string, unknown>[]>(f.gear[0], "shops")[1]!.shop = "pottery";
    });
    expect(found).toEqual([]);
  });

  it("a retired ingredient in a blend still in use, but not an unused retired one", () => {
    expect(problemsAfter((f) => ((f.ingredients[1] as Record<string, unknown>).retired = true))).toContain(
      'blends/001-test-grey.yaml: ingredients[1]: "dried-bergamot" is retired',
    );
    const unused = problemsAfter((f) =>
      f.ingredients.push({ ...(f.ingredients[1] as object), id: "old-peel", retired: true }),
    );
    expect(unused).toEqual([]);
  });

  it("shops the ingredients name that don't exist, or twice; Lyon without address, online without url", () => {
    const found = problemsAfter((f) => {
      const shops = field<Record<string, unknown>[]>(f.ingredients[0], "shops");
      shops.push({ ...shops[0]! });
      shops.push({ ...shops[0]!, shop: "ghost" });
      delete f.shops[1]!.address;
      delete f.shops[0]!.url;
    });
    expect(found).toContain('ingredients/ceylon-black.yaml: shops[2]: the shop "online-tea" is named twice');
    expect(found).toContain('ingredients/ceylon-black.yaml: shops[3]: no shop "ghost" in shops.yaml');
    expect(found).toContain("shops.yaml: shops[1]: a Lyon shop needs its address");
    expect(found).toContain("shops.yaml: shops[0]: an online shop needs its url");
  });

  it("fewer than 2 shops for an ingredient", () => {
    expect(
      problemsAfter((f) => (f.ingredients[0]!.shops = [field<unknown[]>(f.ingredients[0], "shops")[0]])),
    ).toContain("ingredients/ceylon-black.yaml: shops: must not have fewer than 2 items");
  });

  it("tea types that don't fit the category, or that tea-types.yaml lacks", () => {
    const found = problemsAfter((f) => {
      delete f.ingredients[0]!.tea_type;
      f.ingredients[1]!.tea_type = "green";
      f.teaTypes.splice(1, 1);
    });
    expect(found).toContain("ingredients/ceylon-black.yaml: a tea needs its tea_type");
    expect(found).toContain("ingredients/dried-bergamot.yaml: only a tea has a tea_type");
    expect(found).toContain(
      'ingredients/high-mountain-oolong.yaml: tea_type: tea-types.yaml has no "oolong" (the plain-tea fallback brews by it)',
    );
  });

  it("an ingredient whose id isn't its file's name", () => {
    const files = filesOf(fixture());
    const moved = {
      ...files,
      ingredients: [{ ...files.ingredients[0]!, path: "ingredients/assam.yaml" }, ...files.ingredients.slice(1)],
    };
    const found = compileContent(moved).problems.map((p) => `${p.file}: ${p.message}`);
    expect(found).toContain(`ingredients/assam.yaml: its id "ceylon-black" isn't its file's name "assam"`);
  });

  it("all four seasons (leave them out for all year)", () => {
    expect(problemsAfter((f) => (blend(f, 1).seasons = ["spring", "summer", "autumn", "winter"]))).toContain(
      "blends/002-test-oolong.yaml: seasons: must not have more than 3 items",
    );
  });
});
