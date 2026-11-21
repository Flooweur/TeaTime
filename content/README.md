# content

The blends, their ingredients and gear, the shops, the tea types and the guides: data, checked and compiled into one bundle that the app and the server both import (`@teatime/content/bundle`). The rules behind the content are SPEC §5 (sourcing, trust, gear, ids, safe blends) and §6 (guides).

```
blends/NNN-slug.yaml       one file per blend: blends/017-moroccan-mint.yaml
ingredients/<id>.yaml      one file per ingredient: ingredients/gunpowder-green.yaml
gear/<id>.yaml             one file per piece of gear a kitchen may lack: gear/gaiwan.yaml
shops.yaml                 the shops the ingredients and gear name
tea-types.yaml             a plain tea of each type, brewed well: the plain-tea fallback (SPEC §2.5)
guides/<id>.md             the guides (SPEC §6)
ids.yaml                   every blend, ingredient and piece of gear ever published (written by the build)
src/                       the schemas (schema.ts), the compiler and its checks, the generated bundle.ts
scripts/                   content:build and content:check
```

## Workflow
1. Change or add files.
2. Run `npm run content:build`. It checks everything and, only if nothing is wrong, writes `src/bundle.ts` and `ids.yaml`.
3. Commit the content with both generated files. `npm run content:check` (part of `npm run check`) fails when they're out of date.

## A blend
The values below show the format only.

```yaml
code: "017"                 # three digits, forever this blend's; the file is blends/017-moroccan-mint.yaml
slug: moroccan-mint
name: Moroccan mint tea
mode: safe                  # safe (office days) | experimental (home days)
family: household           # household | tea-master | chef | court | earl-grey | seasonal
trust: attested             # documented | attested | legend
source_type: grandmother    # grandmother | tea-master | chef | tea-house | ceremony | royal-state
origin: Morocco
story: >                    # 3–4 lines, at most 700 characters
  Where the recipe comes from, and who says so.
difficulty: 1               # 1–3
seasons: [winter]           # optional: left out for all year (never all four)
flavours: [minty, sweet]
caffeine: medium            # none | low | medium | high
scaling: per-cup            # per-cup (with serves) | per-session (with session_max: a gaiwan's leaves shared)
serves: 2                   # the cups the quantities below make
prep: none                  # none | evening (started the evening before: a cold brew)
guides: [general#water]     # optional: chapters of the guides this blend draws on
sources:                    # 2 or more, at least one primary; each with a url, a ref, or both
  - title: "…"
    author: "…"             # optional
    url: https://…          # https only
    ref: "Book, pages 12–14"  # for a source without a url
    lang: fr                # ISO 639: a source may be in any language
    primary: true
    supports: [recipe, parameters]   # recipe | story | parameters
    note: "…"               # optional
ingredients:
  - { id: gunpowder-green, qty: 6, unit: g, role: base }       # unit = the ingredient's own unit
  - { id: fresh-spearmint, qty: 8, unit: g, role: base }
  - { id: sugar, qty: 10, unit: g, role: accent, optional: true }
gear:                       # optional: what a kitchen may lack; left out when a kettle is enough
  - { id: thermometer, optional: true }   # optional gear helps, and is never needed for the draw
brew:
  water: soft-bottled       # tap | soft-bottled | filtered
  temp_c: 90
  temp_range: [85, 95]      # optional: what the sources give, temp_c being the value chosen
  ratio_g_per_100ml: 1.2    # optional
  water_ml: 500             # for the recipe as written (serves cups, or one session)
  vessel: teapot            # mug | teapot | glass | jar | bottle | gaiwan | kyusu | chawan | saucepan
  preheat: true
  infusions_s: [180]        # each infusion, in order
steps:
  - text: "Rinse the tea with a little hot water and pour it away."
    office: "Rinse the tea in the mug and pour the water away."    # every day step of a safe blend has one
  - text: "Add the mint and sugar, pour, infuse."
    office: "Add the mint, pour from the kettle, infuse."
    infusions: true         # exactly one step: where the infusions' timers run
  - text: "Pour from high to make a foam."
    timer_s: 30             # optional: a wait that isn't an infusion
    stage: day              # day (default) | evening (only with prep: evening; evening steps come first)
retired: false              # optional: a retired blend stays for the history, never drawn
```

## An ingredient
```yaml
id: gunpowder-green
name: Gunpowder green tea
category: tea               # tea | herb | spice | citrus | flower | sweetener | dairy | other
unit: g                     # g | ml | pieces: every quantity of it is in this unit
tea_type: green             # exactly for category tea: white | green | yellow | oolong | black | dark
perishable: false           # fresh mint, milk: past its shelf life it counts as missing
shelf_life_days: 365        # once opened (or bought, when fresh)
storage: "Airtight tin, away from light and smells."
quality: "Tightly rolled pellets; avoid dusty, broken ones."
shops:                      # 2 or more, a Lyon shop wherever one exists
  - shop: some-lyon-shop    # an id from shops.yaml
    why: "…"
    price: "€8 / 100 g"
    url: https://…          # optional: the product's own page
    checked: 2026-11-20     # when the price and page were last checked
retired: false              # optional
```

## A piece of gear
Bought once, then *have* or *don't have* in the pantry, never an amount. A blend that needs it isn't drawn until the owner has it, unless it is optional (SPEC §5.2).

```yaml
id: gaiwan                  # a gaiwan, kyusu or chawan takes the vessel's own name
name: Gaiwan
quality: "Thin white porcelain, 100–150 ml, with a saucer."
shops:                      # 2 or more, a Lyon shop wherever one exists, as for an ingredient
  - { shop: some-lyon-shop, why: "…", price: "€25", checked: 2026-11-21 }
retired: false              # optional
```

## shops.yaml and tea-types.yaml
```yaml
shops:
  - { id: some-lyon-shop, name: "…", kind: lyon, address: "…, 69002 Lyon", notes: "…" }   # lyon: an address
  - { id: some-online-shop, name: "…", kind: online, url: https://… }                       # online: a url
```

```yaml
tea_types:
  - type: green
    name: Green tea
    temp_c: 75
    temp_range: [70, 80]
    ratio_g_per_100ml: 1
    water_ml: 250           # one cup
    infusions_s: [120]
    office: { temp_c: 80, method: "Boil, then add a quarter of cold water.", infusions_s: [120] }
    sources: [ … ]          # 1 or more, as a blend's
```

## A guide
```markdown
# The Earl Grey guide

## The legend and the facts {#legend}

Text, with [links](https://…) or [to a chapter](#bergamot).

## Bergamot {#bergamot}
```

## What the check refuses
**Format** (the schemas, `src/schema.ts`):
- an unknown or misspelt key, and a missing one;
- a value outside its list, and an empty text;
- a URL that isn't `https://`;
- invalid YAML, or a key twice (YAML 1.2, so `no` and `on` stay strings).

**Blends** (`src/compile.ts`):
- a file name that isn't the blend's code and slug, or a code or slug used twice;
- no primary source, or a source with neither a URL nor a reference;
- an ingredient that doesn't exist (or is retired, in a blend still in use), a quantity in another unit than its ingredient's, an ingredient twice, or every ingredient optional;
- gear that doesn't exist (or is retired, in a blend still in use), or twice; a blend made in a gaiwan, kyusu or chawan that doesn't need it as gear; a piece of gear with an ingredient's id (the pantry holds both by id);
- `per-cup` without `serves` or with `session_max`, and `per-session` the other way round;
- `prep: evening` without an evening step, an evening step without it, or an evening step after one of the day;
- anything but exactly one infusions step, or a timer on it (its times are `brew.infusions_s`);
- a temperature outside its own `temp_range`;
- a guide link to no guide or chapter;
- **a safe blend that breaks the safe rules** (SPEC §5.3): a vessel other than a mug, teapot, glass, jar or bottle, gear that isn't optional, a step of the day without its office text (evening steps happen at home), or more than 300 s of waiting on the day.

**Ingredients, gear and shops:**
- an ingredient or a piece of gear whose id isn't its file's name;
- an ingredient or a piece of gear no blend in use uses;
- fewer than 2 shops for an ingredient or a piece of gear, a shop not in `shops.yaml` or named twice, or a shop neither names;
- a Lyon shop without an address, or an online one without a URL;
- a tea without a tea type, another category with one, or a tea type `tea-types.yaml` lacks.

**Guides** (`src/guides.ts`). Until a guide is written, the app shows its chapter outline from docs/original-plan.md, copied in `frontend/src/screens/Guides.tsx` (`OUTLINES`): the batch that writes a guide checks its chapters against it, then removes its outline there.
- no `# Title` first, or a second one;
- a chapter without its `{#id}`, or an id twice;
- raw HTML, an image, or a link that is neither `https://` nor `#a-chapter` of the same guide.

**Ids** (`src/ids.ts`): a published blend, ingredient or piece of gear removed, or a code given to another slug. Retire it instead.

**The output:** a bundle or `ids.yaml` that isn't what the build would write.
