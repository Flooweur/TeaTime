# Design: the look of TeaTime

**TeaTime looks like A · Warm journal,** picked by the owner on 2026-11-20 (ROADMAP's decisions log) from three directions for the Today screen. This file holds its final tokens, which become the app's Tailwind 4 `@theme` in phase 6, and the motifs that make it what it is.

[`today-directions.html`](today-directions.html) is the page the owner chose from: the same Today screen in three directions, each in light and dark. Its journal direction is the visual reference for this file, and B and C stay there as the record.

## The page
- It is the source of the published Artifact (private to the owner): [TeaTime Today Directions](https://claude.ai/artifact/6PCFd4JY7Th9BECokvfoAp).
- It is a page body without `<!doctype>`, `<html>` or `<head>`: the Artifact host wraps it. To view it locally, wrap it in a doctype and serve it over `http://` so the Google Fonts load (a `file://` page renders in quirks mode with fallback fonts).
- On a wide screen (1280 px and up) the three directions sit side by side in 390 px phone frames. Narrower, a switcher shows one at a time, full-bleed on a phone so the screen shows at its real size. `#journal`, `#minimal` and `#ink` link to each. A Light / Dark switch overrides the system setting.
- Each direction draws the same screens: Today at 8:02 on a home day, its trust badges, and the evening-before teaser ("Tomorrow's tea arrives at 8:00" with Peek).
- **The sample content is illustrative.** `#017 Moroccan mint`, its story, its quantities and its steps are placeholders, not sourced content (SPEC §5.2). The story is shown as a *legend*, the way the app must show an unproven story.

## The three directions
| | Direction | Idea | Type |
|---|---|---|---|
| **A** | **Warm journal (picked)** | Cream paper and tea-brown ink, like the owner's notebook: a margin rule, a ribbon, the story written on ruled lines, dotted leaders to the grams | Alegreya (names, stories), Alegreya Sans (the rest) |
| B | Calm minimal | Near-white and near-black, hairlines instead of boxes, lots of space; one leaf green only for what is happening now (the running timer, Made it) | Geist, Geist Mono (numbers, timers) |
| C | Ink & washi | Washi paper and sumi ink after a Japanese tea house: square edges, a red seal for the blend's number, an ensō ring for the running timer, the ingredients as a tray | Shippori Mincho (names, stories), Zen Kaku Gothic New (the rest) |

## Tokens (A · Warm journal)

### Colours
A switch in Settings chooses light or dark (decision of 2026-11-20); the dark values apply under `:root[data-theme="dark"]`. Until the switch is first set, the app follows the device's own setting (decision of 2026-11-21): the dark values then also apply under `@media (prefers-color-scheme: dark)` while `data-theme` is unset. In dark mode the primary action turns from tea brown to amber, since a dark brown button would vanish on the dark page.

| Token | Role | Light | Dark |
|---|---|---|---|
| `--color-bg` | The page: paper | `#f3ebdd` | `#17120d` |
| `--color-surface` | Raised cards (the blend's page, the envelope), the tab bar | `#fbf6ec` | `#211a13` |
| `--color-sunk` | Tinted wells (the water row, the envelope's flap) | `#efe4d1` | `#2b2219` |
| `--color-fg` | Text: ink | `#2a1c12` | `#f2e7d5` |
| `--color-muted` | Secondary text, labels, inactive tabs | `#6b5644` | `#bca88f` |
| `--color-line` | Rules: the story's lines, dividers (decorative) | `#e2d4bd` | `#3a2e22` |
| `--color-control` | Control borders, dotted leaders | `#9a7b5c` | `#8c7458` |
| `--color-accent` | The primary action (Made it), selected cups and rating, the active tab | `#6e3f1e` | `#e2a65a` |
| `--color-on-accent` | Text on `accent` | `#fbf6ec` | `#1e150d` |
| `--color-highlight` | Amber: the running timer, the ribbon, the wax seal | `#b8781c` | `#e2a65a` |
| `--color-on-highlight` | Text on `highlight` | `#2a1c12` | `#1e150d` |
| `--color-highlight-ink` | Amber as text: the blend's code, the water row's icons | `#8a560f` | `#edb872` |
| `--color-documented` | Trust badge: documented | `#3f6b3a` | `#a3c892` |
| `--color-attested` | Trust badge: attested | `#2f5a85` | `#98bce2` |
| `--color-legend` | Trust badge: legend | `#8f5410` | `#e7b068` |
| `--color-margin` | The notebook's margin rule (decorative) | `#dda15e` | `#6b4823` |
| `--color-shadow` | Card shadows | `#5a3a1c2e` | `#00000073` |
| `--color-focus` | The focus ring | `#6e3f1e` | `#edb872` |

**Contrast** (WCAG ratios; SPEC §3.8 asks 3:1 for control borders):

| Pair | Light | Dark |
|---|---|---|
| `fg` on `bg` / on `surface` | 13.9 / 15.3 | 15.2 / 14.0 |
| `muted` on `bg` / on `sunk` | 5.8 / 5.5 | 8.1 / 6.8 |
| `control` on `bg` / on `surface` | 3.3 / 3.6 | 4.2 / 3.9 |
| `on-accent` on `accent` | 8.1 | 8.4 |
| `on-highlight` on `highlight` | 4.5 | 8.4 |
| `highlight` on `surface` (the timer's bar and border; the bar's track is a 2 px rule, so the fill reads against `surface`) | 3.4 | 8.1 |
| `highlight-ink` on `surface` | 5.7 | 9.6 |
| `documented` / `attested` / `legend` on `surface` | 5.8 / 6.7 / 5.7 | 9.2 / 8.7 / 8.8 |

### Fonts
| Token | Family | Used for |
|---|---|---|
| `--font-display` | **Alegreya**, then Georgia, "Times New Roman", serif | The blend's name and code, the story (italic), section heads, step titles, numerals (grams, cups, rating) |
| `--font-sans` | **Alegreya Sans**, then "Segoe UI", system-ui, sans-serif | Everything else: text, labels, buttons, timers, tabs |

- **Weights:** Alegreya 400 italic and 600; Alegreya Sans 400, 500 and 700.
- **Features:** numbers that line up (grams, timers, water) use lining, tabular figures (`font-variant-numeric: lining-nums tabular-nums`). Labels are small capitals (`font-variant-caps: all-small-caps`, `letter-spacing: 0.07em`), in `muted`.
- **Loading:** both families are under the SIL Open Font License (`license: "OFL"` in their `METADATA.pb` in [google/fonts](https://github.com/google/fonts/tree/main/ofl/alegreya), checked 2026-11-20). The app serves them itself, from its hashed `/assets/` (SPEC §3.8), so they work offline and no font request leaves the app. Only the design page loads them from Google Fonts.

### Type scale
| Token | Size / line height | Font, weight | Used for |
|---|---|---|---|
| `--text-tab` | 11 / 1.2 | sans 500 | Tab bar labels |
| `--text-sm` | 14 / 1.4 | sans 400 | Notes, hints, the trust note, the origin line |
| `--text-base` | 16 / 1.5 | sans 400 (buttons 700) | Body, steps, buttons, small-caps labels. Text inputs never go below it, so iOS doesn't zoom (SPEC §3.8) |
| `--text-md` | 18 / 1.4 | sans 700 | Made it |
| `--text-story` | 18 / 28 px | display 400 italic | The origin story, on its ruled lines |
| `--text-lg` | 20 / 1.25 | display 600 | The blend's code, grams, step titles, cups and rating numerals |
| `--text-xl` | 22 / 1.2 | display 600 | Section heads (Ingredients, Method), the journal code |
| `--text-2xl` | 28 / 1.15 | display 600; sans 700 for the timer | The teaser's headline, the running timer's digits |
| `--text-3xl` | 34 / 1.05 | display 600 | The blend's name |

### Radii, spacing and sizes
| Token | Value | Used for |
|---|---|---|
| `--radius-card` | 18 px | The blend's page, the teaser's envelope |
| `--radius-well` | 14 px | The water row, the running timer, Made it, the journal strip |
| `--radius-control` | 12 px | Buttons (Skip, Swap, Pause, Copy, Peek) |
| (full) | 9999 px | Cups and rating circles, step numbers, trust badges |
| `--spacing` | 4 px | Tailwind's base step, unchanged |
| `--spacing-screen` | 20 px | The screen's side padding, at least the safe-area inset |
| `--spacing-section` | 24 px | Between the screen's sections |
| `--spacing-card` | 20 px | A card's padding |
| `--spacing-margin` | 36 px | The blend's page's left padding: its margin rule sits at 22 px |
| `--spacing-tap` | 44 px | The smallest tap target (SPEC §3.8) |
| `--spacing-control` | 48 px | Cups and rating circles; Skip and Swap are 50 px tall, Made it 54 px |
| `--shadow-card` | `0 1px 0 var(--color-line), 0 14px 28px -20px var(--color-shadow)` | Raised cards |

### As Tailwind 4 `@theme`
```css
@import "tailwindcss";

@theme {
  --color-bg: #f3ebdd;
  --color-surface: #fbf6ec;
  --color-sunk: #efe4d1;
  --color-fg: #2a1c12;
  --color-muted: #6b5644;
  --color-line: #e2d4bd;
  --color-control: #9a7b5c;
  --color-accent: #6e3f1e;
  --color-on-accent: #fbf6ec;
  --color-highlight: #b8781c;
  --color-on-highlight: #2a1c12;
  --color-highlight-ink: #8a560f;
  --color-documented: #3f6b3a;
  --color-attested: #2f5a85;
  --color-legend: #8f5410;
  --color-margin: #dda15e;
  --color-shadow: #5a3a1c2e;
  --color-focus: #6e3f1e;

  --font-display: "Alegreya", Georgia, "Times New Roman", serif;
  --font-sans: "Alegreya Sans", "Segoe UI", system-ui, sans-serif;

  --text-tab: 0.6875rem;
  --text-tab--line-height: 1.2;
  --text-sm: 0.875rem;
  --text-sm--line-height: 1.4;
  --text-base: 1rem;
  --text-base--line-height: 1.5;
  --text-md: 1.125rem;
  --text-md--line-height: 1.4;
  --text-story: 1.125rem;
  --text-story--line-height: 1.75rem;
  --text-lg: 1.25rem;
  --text-lg--line-height: 1.25;
  --text-xl: 1.375rem;
  --text-xl--line-height: 1.2;
  --text-2xl: 1.75rem;
  --text-2xl--line-height: 1.15;
  --text-3xl: 2.125rem;
  --text-3xl--line-height: 1.05;

  --radius-card: 18px;
  --radius-well: 14px;
  --radius-control: 12px;

  --spacing-screen: 1.25rem;
  --spacing-section: 1.5rem;
  --spacing-card: 1.25rem;
  --spacing-margin: 2.25rem;
  --spacing-tap: 2.75rem;
  --spacing-control: 3rem;

  --shadow-card: 0 1px 0 var(--color-line), 0 14px 28px -20px var(--color-shadow);
}

/* The light / dark switch in Settings sets data-theme on <html>. */
:root[data-theme="dark"] {
  --color-bg: #17120d;
  --color-surface: #211a13;
  --color-sunk: #2b2219;
  --color-fg: #f2e7d5;
  --color-muted: #bca88f;
  --color-line: #3a2e22;
  --color-control: #8c7458;
  --color-accent: #e2a65a;
  --color-on-accent: #1e150d;
  --color-highlight: #e2a65a;
  --color-on-highlight: #1e150d;
  --color-highlight-ink: #edb872;
  --color-documented: #a3c892;
  --color-attested: #98bce2;
  --color-legend: #e7b068;
  --color-margin: #6b4823;
  --color-shadow: #00000073;
  --color-focus: #edb872;
  color-scheme: dark;
}
```
Tailwind's utilities read these variables, so the dark block switches the whole app without `dark:` variants. Where a `dark:` variant is still wanted, `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));` ties it to the same switch.

## Motifs
What makes the screen a journal, as drawn in the page's `.j-*` styles:
- **The blend's page:** a `surface` card with a 1.5 px `margin` rule 22 px from its left edge, and an amber ribbon (26 × 58 px, notched) hanging from its top right.
- **The story on ruled lines:** Alegreya italic at 18 / 28 px, over a 28 px repeating rule in `line`, drawn 23–24.5 px down each row so the words sit on it.
- **Dotted leaders:** each ingredient runs to its grams along a 2 px dotted rule in `control` at 55 % opacity.
- **Trust badges:** a pill with a 1.5 px border in the level's colour and an icon (a page, a person, a speech bubble). *Legend* is always dashed, so it reads as unproven without colour.
- **Steps:** numbered circles. A done step is muted with a dotted circle; the running one is filled amber, and its timer sits in a `surface` box outlined in amber, with a 6 px progress bar and Pause. The next timer is a dashed button that waits for a tap.
- **The journal strip:** `#017 Moroccan mint` in Alegreya inside a dashed `control` border, with Copy.
- **Rating:** 48 px circles, the chosen one filled with `accent`, as a radio group, so the app gives them arrow keys and a single tab stop (the mockup doesn't).
- **Cups:** a stepper, "− 2 cups +", its two buttons 48 px circles: twelve choices don't fit as circles (the owner kept it in phase 6, decision of 2026-11-21).
- **The teaser:** a sealed envelope (a `sunk` flap and an amber wax seal) holding "Tomorrow's tea arrives at 8:00" and Peek.

## What was checked
- **Contrast:** the table above for A. B and C were checked the same way, in both modes, before the pick.
- **SPEC §3.8:** every tap target is 44 px or more, button text is 16 px (the tab bar's captions aside; Today has no text input), and the screen keeps clear of the safe areas (the status bar and home indicator in the frames; `env(safe-area-inset-*)` on a real phone).
- **Widths:** 360, 390, 1000 and 1400 px, light and dark, with no sideways scroll.
