# @teatime/core

Pure TypeScript, zero I/O (SPEC §4.2): the code both the app and the server run, so the rules are written once.
- **The compiler** sees no DOM and no Node (`lib: ["ES2023"]`, `types: []`).
- **ESLint** refuses Node imports, `Date.now()`, an argument-less `new Date()`, `Date()` and `Math.random()` in `src/`. Time comes in as a `Clock` or as values; randomness comes in as a seed.

## What's here
| File | What |
|---|---|
| `src/time/clock.ts` | `Clock`, the injected time source, and `epochMs` |
| `src/time/dates.ts` | Calendar dates as `YYYY-MM-DD`, counted at UTC midnight: `isDate`, `addDays`, `daysBetween`, `isoWeekday`, `isWeekend` |
| `src/time/zone.ts` | Wall clocks in an IANA time zone. `wallClockAt` gives the date and minutes at an instant; `instantAt` gives the instant of a wall time, reading a skipped time as the one it becomes and a repeated time as its first occurrence. Plus `"HH:MM"` ↔ minutes |
| `src/rng.ts` | `randomFrom(seed)` (mulberry32, ported from EagleEye), `randomInt`, `pickOne` |
| `src/json.ts` | `canonicalJson` (RFC 8785's rules), which the content's hash rests on; `compareText` |
| `src/content.ts` | The content's vocabulary (pools, families, trust levels, units…) and the bundle's model, which `content/` compiles its YAML into |

Phase 3 adds the rules of SPEC §2: the day types, the draw, recipes and the pantry, notifications, and the state's commands.

## Tests
`test/` uses Node and Vitest, under its own tsconfig. `zone.test.ts` pins the clock changes of 2026 in Europe/Paris, and a fast-check property round-trips every minute of 2025–2030 through `wallClockAt` and `instantAt`.
