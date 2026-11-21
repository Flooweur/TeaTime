# @teatime/core

Pure TypeScript, zero I/O (SPEC §4.2): the code both the app and the server run, so the rules are written once.
- **The compiler** sees no DOM and no Node (`lib: ["ES2023"]`, `types: []`).
- **ESLint** refuses Node imports, `Date.now()`, an argument-less `new Date()`, `Date()` and `Math.random()` in `src/`. Time comes in as a `Clock` or as values (`now`, in Unix milliseconds); randomness comes in as a seed.

## What's here
| File | What |
|---|---|
| `src/time/clock.ts` | `Clock`, the injected time source, and `epochMs` |
| `src/time/dates.ts` | Calendar dates as `YYYY-MM-DD`, counted at UTC midnight: `isDate`, `addDays`, `daysBetween`, `isoWeekday`, `isWeekend` |
| `src/time/zone.ts` | Wall clocks in an IANA time zone. `wallClockAt` gives the date and minutes at an instant; `instantAt` gives the instant of a wall time, reading a skipped time as the one it becomes and a repeated time as its first occurrence. Plus `"HH:MM"` ↔ minutes |
| `src/rng.ts` | `randomFrom(seed)` (mulberry32, ported from EagleEye), `randomInt`, `pickOne` |
| `src/json.ts` | `canonicalJson` (RFC 8785's rules), which the content's hash rests on; `compareText` |
| `src/content.ts` | The content's vocabulary (pools, families, trust levels, units…) and the bundle's model, which `content/` compiles its YAML into |
| `src/catalog.ts` | `catalogOf(bundle)`: the content indexed by code and id (blends, ingredients, gear, tea types), which every rule reads |
| `src/calendar.ts` | The week (SPEC §2.1): `dayOf` (weekend, away, override, office days), `poolOf`, and the seasons |
| `src/recipe.ts` | Scaling to the cups and SPEC §2.4's rounding: `scaleRecipe`, `plainTeaRecipe`, `roundQty` |
| `src/pantry.ts` | SPEC §2.6: freshness, `shortfallsOf` (what stops a recipe: an ingredient, or a piece of gear the owner lacks), `plannedTakes` (what Made it deducts, never gear), unlock counts |
| `src/history.ts` | Each blend's last made date and last rating, from the brews |
| `src/draw.ts` | The draw (SPEC §2.3) and its fallbacks (§2.5): `drawPick`, deterministic and seeded by the date and the attempt |
| `src/notifications.ts` | SPEC §2.7: `dueNotifications` (what to push now, with its window and text), and `revealsAt` for the home-day surprise |
| `src/state/types.ts` | The state: settings, overrides, away periods, pantry, picks, brews, marks. Plain JSON |
| `src/state/settings.ts` | The settings, their defaults, and `parseSettingsPatch` |
| `src/state/commands.ts` | The offline commands and `parseCommand`, which checks one as it arrives |
| `src/state/apply.ts` | The reducer, `applyCommand`: one command, a new state, a result, and the keys it touched |
| `src/state/status.ts` | The status table of a pick, `PICK_MOVES` |
| `src/state/online.ts` | What needs the server: `drawDue`, `drawNow`, `swapPick`, `updateSettings`, `setOverride`, `addAway`, `removeAway` |
| `src/wire.ts` | What the server answers, as both sides read it: the snapshot, and each offline command's outcome. Types only |
| `src/state/touched.ts` | The keys a change touched, so the server writes only those rows |

## Tests
`test/` uses Node and Vitest, under its own tsconfig; `fixtures.ts` builds small catalogs and states.
- `zone.test.ts` pins the clock changes of 2026 in Europe/Paris; a fast-check property round-trips every minute of 2025–2030 through `wallClockAt` and `instantAt`.
- `draw.test.ts` covers each rule and fallback, and checks the draw's invariants over random pantries, histories and holds: the right pool, drawable, not held, makeable, and the same twice.
- `apply.test.ts` covers every command and the status table, and checks that a measurement and a brew end the same whichever reaches the server first.
- `notifications.test.ts` runs a simulated year in Paris across both clock changes: every tea day drawn the evening before, each push at its wall-clock time.
- CI runs core's tests a second time with `TZ=Pacific/Auckland`, to catch any slip into the machine's local time.
