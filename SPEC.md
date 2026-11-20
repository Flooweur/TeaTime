# TeaTime — specification

**This file is the source of truth** for TeaTime's rules, architecture, content and conventions. A change to any of them updates this file in the same commit. The plan of work and the dated decisions are in [ROADMAP.md](ROADMAP.md). The spec this project started from, written on claude.ai, is kept as [docs/original-plan.md](docs/original-plan.md); where the two differ, this file wins.

Contents: [1 Product](#1-product) · [2 Rules](#2-rules) · [3 Architecture](#3-architecture) · [4 Conventions](#4-conventions) · [5 Content](#5-content) · [6 Guides](#6-guides) · [7 Screens](#7-screens)

---

## 1. Product

### 1.1 What TeaTime is
A personal tea app for one person, its owner, who lives in Lyon. Every weekday it gives one blend they can make with the ingredients they have. It gives:
- the full method: water, temperature, quantities scaled to the cups, the steps, and timers for the infusions;
- a short story of where the recipe comes from, with how far that story can be trusted.

The owner writes their notes in a paper journal under the blend's number (`#042`). The app keeps the rest:
- what was made, when and for how many;
- a 1–5 rating, and the colleague's for office teas;
- the pantry.

### 1.2 Constraints
| Constraint | Consequence |
|---|---|
| One user. Devices: an iPhone (home-screen app) and a Windows PC (browser) | An installable PWA. Pushes go to the iPhone only (decision of 2026-11-20) |
| The owner's PC is always on, and Docker Desktop starts at login | The server is a Docker container on that PC, reached through Tailscale HTTPS, beside the owner's other app, EagleEye (§3.7) |
| No login | Tailscale is the gate: only the owner's devices reach the app. Writes still need the app's own origin and a JSON body (§3.4) |
| Office days happen at the office, where Tailscale may not connect | Reading works offline; what the owner does waits on the phone and syncs later (§3.3) |
| English | The app is in English. A recipe's sources may be in any language, as long as they meet the sourcing rules (§5.2) |
| €0 a month | No paid service |

---

## 2. Rules

### 2.1 The week
Each date has a **day type**, decided in this order:
1. A **Saturday or Sunday** has no tea of the day. Saturday holds the weekly review (§2.8); Sunday is free. The pantry and the library stay open.
2. A date inside an **away period** (Settings: "away from … to …") has no tea and no notification.
3. Otherwise a per-date **override** ("tomorrow I'm home", "tomorrow I'm at the office") decides.
4. Otherwise the weekday is an **office day** if it is one of the owner's office days (a setting, 3 by default), and a **home day** if not.

A weekday that isn't away is a **tea day**.

### 2.2 Pools, and when a tea is drawn
- An office day draws from the **safe** blends, sized for 2 cups: the owner and their colleague. A home day draws from the **experimental** blends.
- **Every tea day's blend is drawn the evening before**, at the evening time (20:30 by default), Sunday evening included:
  - an office kit has to be packed while its ingredients are still at home;
  - an overnight blend (a cold brew) has to be started that evening.
- **An office kit can be drawn early**, from 17:00, with "Draw tomorrow's tea now", so the owner can pack before going out.
- **The evening notification** is sent only when the evening needs the owner: an office kit not packed yet, or a blend to start tonight.
- **A home-day blend stays a surprise** until the morning time (8:00 by default). Before it, Today shows "Tomorrow's tea arrives at 8:00" with a **Peek** button. It shows at once if it has to be started that evening. Opening the app from that day's push reveals it, whatever the phone's clock says.
- **A draw the server missed** (the PC was off at 20:30) happens as soon as it can: at the next pass of the notifier, or when the app asks. Such a same-day draw never picks an overnight blend.

### 2.3 The draw
The draw is a pure, deterministic function of the date, the day type, the content, the pantry and the history (`drawPick` in core). Its randomness is seeded by the date and the attempt number, so a draw can be replayed and tested.

**1. Rules that always hold.** A candidate blend:
- is in the day's pool, and isn't retired;
- isn't marked **Not for me**;
- is **makeable**:
  - every ingredient that isn't optional is *have*;
  - every piece of gear it needs that isn't optional is *have* (§5.2);
  - when its amount is tracked, there is enough for the default cups, once the quantities held by other pending picks are set aside;
  - a perishable ingredient past its shelf life counts as missing;
- isn't held by another pending pick;
- in a same-day draw, doesn't need starting the evening before;
- in a swap, isn't the blend it replaces.

**2. Order.** The candidates fall into groups, taken in this order:
1. never made, in season;
2. favourites, in season;
3. others, in season;
4. the same three, out of season.

In detail:
- **Favourites** are blends last rated 4–5, starred ★, or marked *make again*.
- **Others** are made blends last rated 3, or never rated.
- **A blend last rated 1–2 never comes back**, unless it is marked *make again*.
- **In season** means the date's meteorological season (northern hemisphere: winter is December to February), or a blend with no season tags.

**3. Soft filters, relaxed one level at a time.**
- **The two filters:**
  - *the 7-day rest*: a blend skipped or swapped away rests 7 days;
  - *the cooldown*: a made blend waits a number of days (a setting, 21 by default) before it can come back.
- **The levels**, tried in this order, with the first non-empty group in order winning at each level:
  1. **strict**: both filters apply;
  2. **no rest**: only the cooldown applies;
  3. **no cooldown**: neither applies.
- **Within the winning group**, a never-made blend is drawn at random (seeded). A made blend is the one made longest ago, ties broken by the seed.
- **What the relaxation gives:** when every makeable blend is in cooldown, the one made longest ago comes back, favourites first, rather than a plain tea.

**4. Nothing left after step 1** → the plain-tea fallback (§2.5).

### 2.4 Picks and brews
- **A pick** is the blend (or plain tea) drawn for a date. Its status is *pending*, then *made*, *skipped* or *cancelled*.
  - A pick whose date has passed while still pending is asked about in the Saturday review ("made or skipped?").
  - Only pending picks of today or later hold their blend.
- **A brew** is a cup actually made: a date, a blend or a plain tea, the cups, the deduction from the pantry, a rating, and the colleague's rating for an office brew.
  - **Made it** on Today logs the pick's brew.
  - **I made this** on any blend page logs a brew outside the daily pick, weekends included. It is deducted and counts for repeats like any other.
- **Swap**: one per pick. It draws again from the same pool, and the replaced blend rests 7 days. On an office day it is possible only until the kit is marked **Packed**.
  - A pick that a pantry change made unmakeable gets a free redraw, which isn't counted as its swap.
- **Skip** marks the pick skipped. Its blend rests 7 days, then goes back in the pool.
- **Not for me** (on the card and in the library) takes a blend out of the draw for good, until it is unmarked in the library.
- **Changing a day:**
  - A change of day type (an override, the office days, an away period) re-checks the pending picks it touches: a pick whose pool no longer fits is drawn again; one inside an away period is cancelled.
  - A packed kit is never thrown away without asking.
  - An away period wins over an override.
  - Past dates can't be changed.
- **Cups:**
  - Today has a cups selector, set to 2 on office days and 1 at home by default (settings). Quantities and water scale with it.
  - **Packed** records the cups packed, which Made it then uses by default.
- **Scaling:**
  - A `per-cup` recipe makes `serves` cups and scales in proportion.
  - A `per-session` recipe (a gaiwan, a kyusu) shares one session's leaves among up to `session_max` people; more people make more sessions.
- **Rounding:** one rule per unit, in core, used both for what is shown and for what is deducted:
  - grams to the nearest 0.5 g, or 0.1 g under 2 g;
  - millilitres to the nearest 5 ml;
  - pieces to the nearest whole piece, never fewer than one.
- **Deduction:**
  - Made it takes the shown quantities off the pantry: each ingredient whose amount is tracked, and the optional ones only when they are *have*.
  - An amount never goes below 0; reaching 0 sets the ingredient to *don't have*.
  - The brew records what it took, so undoing it (removing the brew) puts back exactly that.

### 2.5 Fallbacks
- **No blend left after the rules that always hold** → a **plain tea** from the pantry, brewed with its tea type's parameters (`tea-types.yaml`, with office parameters for office days).
  - The tea is chosen deterministically: one to use soon first, then the one with the most left.
  - The card also names **the purchase that would unlock the most blends** of that pool.
  - With no tea in the pantry at all, the card says what to buy.
- **An office day whose kit was never packed** because the evening draw was missed → the card says so, and offers a plain tea from the teas marked **kept at the office** in the pantry, or nothing.

### 2.6 Pantry
- **Each ingredient has:**
  - *have* or *don't have*;
  - an amount left in the ingredient's unit, or untracked;
  - the date it was opened;
  - whether it is **kept at the office**.
- Turning *have* on sets the opened date to today.
- **Freshness** compares the opened date with the ingredient's shelf life: *fresh*, *use soon* (75 % of it gone), or *stale*. A perishable ingredient that is stale counts as missing for the draw.
- **Unlock count:** how many blends that can't be made now would become makeable if this one ingredient were added. An ingredient that is *have* but too low counts as missing. The weekly review lists the 3 purchases with the highest counts.
- **Gear** (§5.2) is *have* or *don't have*, and nothing else: no amount, no opened date, never deducted. A piece of gear the owner lacks counts like a missing ingredient, in the draw and in the unlock count, so a gaiwan can be the purchase that unlocks the most.

### 2.7 Notifications
| Kind | When | Sent when | Grace window |
|---|---|---|---|
| `evening` | the calendar day before each tea day, at the evening time (20:30) | the next day is an office day whose kit isn't packed yet, or its blend needs starting that evening | 2 h 30 |
| `morning` | each tea day, at the morning time (8:00) | the pick isn't made, skipped or cancelled yet | 2 h |
| `review` | Saturday, at the review time (10:00) | always | 3 h |

- **Settings:** the three times, set between 05:00 and 22:00, so none falls in the hour a clock change skips or repeats (02:00–03:00 in Paris), and notifications on or off.
  - With notifications off, the draws still happen.
- **Time:** times are wall-clock times in the owner's time zone (Europe/Paris), turned into instants with daylight saving time handled (`instantAt` in core).
  - The evening before a date is that date's calendar day before, never "24 hours earlier".
- **Grace windows** are offsets from each time. A push the server couldn't send in its window (the PC was off) is skipped; the draws happen anyway.
- **Planning:** what is due is rebuilt from the current state at every pass of the notifier (every 30 s), never stored ahead of time.
- **Sending is at least once:**
  - A send that went stale (`sending` for more than 2 minutes), or `failed`, is retried until its window closes.
  - Each push carries the tag `kind:date`, so a duplicate replaces the first instead of showing twice.
  - Each push's TTL is what's left of its window.
- **What a push says:** its title and text name the blend (`#017 Moroccan mint`). Its link carries the date and the blend (`/today?date=…&blend=…&from=push`), so a tap opens the right recipe even offline.

### 2.8 Weekly review (Saturday)
- **The week's teas**, side by side, with their ratings.
  - Pending picks of past days are asked about: made or skipped.
  - Ratings can still be given or changed.
- **Marks:** ★ favourite and *make again* on any blend, and the colleague's ratings for the office teas.
- **Three lists:**
  1. ingredients running low or going stale;
  2. the 3 purchases that would unlock the most blends;
  3. next week's office preview: the office days ahead, how many safe blends could be drawn from the pantry as it is, and what to restock so none runs short.
- **The preview draws nothing:** each blend is still drawn the evening before, from the pantry as it is then.

---

## 3. Architecture

### 3.1 Stack
| Layer | Choice |
|---|---|
| Repo | npm workspaces: `packages/core`, `content`, then `backend` and `frontend`. Packages resolve to their TypeScript sources in development (the `source` export condition: [packages/README.md](packages/README.md)) and to `dist/` in production builds |
| Client | React 19, Vite 8, Tailwind 4, TanStack Router (routes in code). `vite-plugin-pwa` in injectManifest mode, with TeaTime's own TypeScript service worker. Dexie (IndexedDB) holds the cached state and the outbox. Small `useSyncExternalStore` stores; no query library |
| Server | Node 22, Fastify 5 + TypeBox (`typebox` 1.4.4), Drizzle + better-sqlite3 (synchronous transactions), `web-push` 3.6.7 with VAPID. Fastify also serves the built app: one container |
| Jobs | In-process, with `startEvery` (ported from EagleEye): the notifier every 30 s, the backup checked hourly and written once a day |
| Content | YAML and Markdown in `content/`, compiled into a bundle that the app and the server both import (§5.4) |
| Tooling | TypeScript strict, ESLint, Prettier, Vitest with fast-check, GitHub Actions |

### 3.2 Layout and boundaries
```
packages/core/  pure TypeScript, zero I/O: time (dates, time zones), the content's model, the rules of §2
content/        blends/, ingredients/, gear/, shops.yaml, tea-types.yaml, guides/, ids.yaml; src/ (schemas, compiler, checks),
                scripts/ (build, check), and the generated src/bundle.ts
backend/        Fastify, Drizzle and SQLite, the jobs (phase 5)
frontend/       the PWA (phase 6)
docs/           original-plan.md, design/, spikes/, runbook.md
```
- **`packages/core` has zero I/O.** It compiles with `lib: ["ES2023"]` and `types: []` (no DOM, no Node), and ESLint refuses Node imports there.
- **Time and randomness come in as arguments** (§4.2).
- **The content's file format** (snake_case YAML) lives in `content/src/schema.ts`. Its model (camelCase), which everything else reads, lives in `packages/core/src/content.ts`.

### 3.3 State and sync
The owner's state is tiny: the pantry, picks, brews, marks and settings. So the server always answers with **the whole state** and its `revision`, a counter.

**Every change the owner makes is a command:** `{id (a UUID made by the device), v, at, type, payload}`. Core's `applyCommand(state, command, content)` is pure. It returns the new state and the keys it touched, and both sides use it:
- **On the phone:** what it shows is the server's last snapshot, with its unsent commands replayed on top. The snapshot lists the ids it already holds, so no command counts twice. A snapshot older than the one the phone has is ignored.
- **On the server:** a batch is applied one command at a time, inside one SQLite transaction with a savepoint each.
  - Each command is accepted or refused with a `code`, and recorded in `applied_commands`, so a resend changes nothing.
  - The answer gives a result per command, and the new snapshot.
  - A refused command is shown on the phone; it never blocks the queue.

**Offline commands:**
- `brew.logged` (Made it, I made this), `brew.rated`, `brew.removed` (undo);
- `pick.skipped`, `pick.unskipped`, `pick.packed`;
- `pantry.set`;
- `blend.marked` (★, *make again*, Not for me).

**What needs the server:**
- drawing a pick, and swapping one;
- settings, overrides and away periods. These re-check the pending picks they touch (§2.4) in the same transaction.

**Rules:**
- **The status table** in core lists every allowed change of a pick and a brew. Logging a brew for a pick already made answers `already_made`. A brew for a pending pick is accepted whatever its blend, since the real cup wins, and the pick records the blend it replaced.
- **`pantry.set` and `blend.marked` are last-writer-wins, field by field,** by the command's time against each field's last change.
- **A deduction** applies only to amounts last changed before the brew's time: a later measurement already includes it.
- **An undo** puts amounts back only where nothing changed them since; it says so where it can't.
- **A command time more than a day ahead of the server's clock** is taken as the server's time.
- **App updates:** commands carry a version `v`, and the server upgrades old ones, so an app update never loses what is queued.
- **The snapshot carries the full content of every pending pick's blend,** and the content's hash. The phone can always show what was drawn, and a hash it doesn't have shows the update toast.
- **Sync runs:**
  - at launch, when the app comes back to the front, and on `online`;
  - 2 s after a write, and every 60 s while visible;
  - one run at a time across tabs (Web Locks).
- **Storage:** Dexie's transactions keep the snapshot and the outbox consistent. The app asks for persistent storage. A failed write shows a banner, never fails silently.

### 3.4 API
All routes are under `/api`, and bodies are JSON only. A write must come from the app's origin (`PUBLIC_ORIGIN`), and errors are `{error, code}`.
- `GET health`, `GET state`, `POST commands`
- `POST picks/:date/draw`: idempotent; only for today, or for the next tea day from 17:00.
- `POST picks/:date/swap`: carries the current blend, so a retry after a lost answer returns the current pick.
- `PUT settings`, `PUT overrides/:date`, `POST|DELETE away`
- `GET push/key`, `POST|DELETE push/subscriptions`, `POST push/test`
- `GET export.json`, `GET export.csv`, `GET diag`, `POST jobs/:name/run`

### 3.5 Jobs
| Job | Every | Does |
|---|---|---|
| `notifier` | 30 s | Draws what is due (§2.2), then sends what is due (§2.7) |
| `backup` | 1 h, written once a day | A copy of the database into `BACKUP_DIR`, 30 kept (§3.7) |

### 3.6 Database (SQLite)
The database is a file in a named Docker volume, opened with `journal_mode=WAL`, `foreign_keys=ON`, `busy_timeout=5000` and `synchronous=NORMAL`. Drizzle migrations run at startup.

| Table | Holds |
|---|---|
| `settings` | Every setting by key, as JSON, checked against a registry of schemas and defaults |
| `day_overrides`, `away_periods` | §2.1 |
| `pantry` | One row per ingredient or piece of gear: have, amount left (nullable; always null for gear), opened on, kept at the office, a change time per field |
| `picks` | One per date: the day type, the blend or plain tea, how it was drawn, what it was swapped from and when, the status, packed at and packed cups, the brew |
| `brews` | Each cup made: id, date, time, the blend or plain tea, cups, ratings, the deduction, and its pick's date, unique when set |
| `blend_marks` | ★, *make again*, Not for me |
| `push_subscriptions` | EagleEye's shape: endpoint (unique), keys, last success, failures, disabled at |
| `notifications` | One row per kind and date: its status and attempts |
| `applied_commands` | Every command's id and result |
| `meta` | The state's revision |

CHECK constraints keep ratings within 1–5, a pick or brew to exactly one of a blend or a plain tea, and statuses to their lists.

### 3.7 Environments, hosting and backups
| Environment | What | Where |
|---|---|---|
| dev | The backend on :3200, Vite on :5180 (`vite preview` on :5181) | The PC |
| daily | The Docker container on `127.0.0.1:8081`, published by `tailscale serve --bg --https=8443 http://127.0.0.1:8081` at `https://desktop-obf71rf.taild9afa4.ts.net:8443`, in its own compose project (`name: teatime`) | The PC + Tailscale |

- **Coexisting with EagleEye:** EagleEye has 443 on the same Tailscale name, and its own ports (5433, 3100, 5174/5175, 8080). TeaTime never touches them, nor EagleEye's compose project or Tailscale setting.
- **The container runs with `TZ=UTC`:** the owner's time zone is a setting.
- **The database lives only in its named volume,** never on the Windows drive, where SQLite's locking isn't reliable.
- **The daily backup:**
  - is the database serialized to a `.part` file in the bind-mounted `D:/TeaTime-backups`, synced to disk, then renamed;
  - keeps 30;
  - is brought back by a `restore` script, which has a `--dry-run`.
- **The ports** are clear of EagleEye's and WikiWar's.

### 3.8 Platform and iOS rules
(Ported from EagleEye's spike and SPEC §3.12; the push spike on port 8443 confirms them for TeaTime.)
- **Installing:** from Safari → Add to Home Screen. Push only works in the installed app, and permission is asked from a tap.
- **The app's installed name is TeaTime,** which iOS prints above each push and keeps from the first install.
- **Every push displays.** Payloads use the declarative format `{"web_push": 8030, "notification": {title, body, navigate, tag}}`, without `mutable`. iOS shows them itself, without running the service worker; Chromium's service worker shows the same JSON.
- **A subscription is replaced when needed:** one made with another VAPID key, or one the server disabled after its push service said it's gone (404/410).
- **Caching:** only `/assets/*` (hashed files) is cached as immutable. `index.html`, the manifest and the service worker are `no-cache`; the API answers `no-store`. A missing asset is a 404, never the app's HTML.
- **Updates:** an update toast appears when a new service worker is waiting. The app looks for one when it comes back to the front, and every hour.
- **Timers:**
  - they count from wall-clock time, and resume after a reload or a push tap;
  - a Wake Lock keeps the screen on while one runs;
  - a chime plays at the end, through `navigator.audioSession.type = "playback"` so the silent switch doesn't mute it.
- **Taps and screens:** taps reach 44 px, a control's border has 3:1 contrast against its surface, the layout keeps clear of the safe areas, and inputs are 16 px so iOS doesn't zoom.
- **Security headers** (EagleEye's Caddy headers, as a Fastify hook): CSP, `nosniff`, `Referrer-Policy: no-referrer`, `frame-ancestors 'none'`.
- **Diagnostics:** a server clock more than 60 s off the device's is flagged, and so is when the jobs last ran.

---

## 4. Conventions

### 4.1 Code
- **Style:** TypeScript strict, with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. ESLint and Prettier (120 columns), LF line endings.
- **Bug fixes:** every one gets a regression test that fails without it.
- **Versions:** each PR that changes the app or the server bumps the integer in `app-version.json`.
- **Privacy:** no secret, and none of the owner's personal details (their email included), in the repo, a log, a push or a request to an outside service. The VAPID subject is a placeholder: `mailto:teatime@example.com`.

### 4.2 Core is pure: time and randomness are injected
- **No I/O:** `packages/core` reads no file, network, clock or randomness.
- **Time** comes in as a `Clock` (a function returning a `Date`) or as values.
- **Randomness** comes in as a seed (`randomFrom(seed)`), so the same inputs always give the same result.
- **ESLint refuses** `Date.now()`, an argument-less `new Date()`, `Date()` and `Math.random()` in `packages/core/src`.
- **Dates are `YYYY-MM-DD` strings** counted at UTC midnight. Wall-clock times are turned into instants only through `instantAt`.

### 4.3 Docs and delivery
- **Docs:** a change to a rule or to the architecture updates this SPEC in the same commit. Every source folder has a README, or its parent's covers it.
- **Branches:** one branch and PR per phase or topic, with `npm run check` green. A pushed branch is never rewritten; a fix is a new commit.
- **Before a PR:** review the whole diff (the code-review skill, then a read of everything, docs included), fix what holds up, and run the check again. The PR then gets a **Self-review** section.
- **Merging and deploying need the owner's yes, every time.** Nobody pushes `main` directly.

---

## 5. Content

### 5.1 Families and the 90-blend plan
The 90 blends are spread over six families and split 54 safe / 36 experimental. With 3 office days and 2 home days, both pools run out together after about 18 weeks of new teas, if every ingredient is owned.

| Family (`family`) | What's in it | Blends | Safe | Experimental |
|---|---|---|---|---|
| Household traditions (`household`) | Grandmother-style recipes: Moroccan mint, masala chai, Turkish çay, Russian zavarka, Hong Kong milk tea, Kashmiri noon chai, Tibetan butter tea | 20 | 13 | 7 |
| Tea-master classics (`tea-master`) | Single teas brewed perfectly: gyokuro, sencha, matcha, first-flush Darjeeling, high-mountain oolong, Da Hong Pao, silver needle, aged pu-erh | 20 | 8 | 12 |
| Chef & pâtissier creations (`chef`) | Blends and infusions from named chefs, pâtissiers and tea houses | 15 | 9 | 6 |
| Courts, presidents & historic houses (`court`) | Teas tied to royal households, heads of state and historic tea rooms | 10 | 6 | 4 |
| Earl Grey family (`earl-grey`) | Classic, fresh bergamot, Lady Grey, London Fog, cornflower, lavender, vanilla, Earl Grey on oolong or green | 15 | 10 | 5 |
| Seasonal & cold (`seasonal`) | Cold brews, iced teas, winter spice blends | 10 | 8 | 2 |

The content comes in batches, each reviewed by the owner before it goes in. The first is 10 blends; the owner approves its list before the research starts.

### 5.2 Sourcing rules, trust, and ids
- **Sources:** at least 2 independent sources per blend, at least one of them **primary**: a tea house's own publication, a chef's book or interview, a tea institute, or a named family recipe.
  - Each source has a URL or a reference (a book and its pages), and its language.
  - Sources may be in any language.
- **Trust level:** every blend has one.
  - *documented*: a written source;
  - *attested*: a chef, a tea master or a tea house;
  - *legend*: a good story that can't be proven. "The king drank this" without a source is a legend, and the app says so.
- **Brewing parameters** are checked against a tea-master reference for that type of tea. When sources disagree, the blend stores the range and the value chosen.
- **A cup** is a 250 ml mug for Western-style teas; sencha and gongfu teas keep their small traditional cups (decision of 2026-11-21). A quantity the sources give only in spoons or cups is converted to the ingredient's unit, and the step gives the spoon measure too.
- **Shops:** at least 2 per ingredient and per piece of gear, with a Lyon shop wherever one exists. No ingredient or gear is listed that no blend uses.
- **Gear** is what a kitchen may lack: a gaiwan, a cloth filter, a blender, a thermometer (decision of 2026-11-20).
  - A blend lists the gear it needs. Gear it needs that the owner lacks keeps it out of the draw (§2.3); optional gear never does.
  - A blend made in a gaiwan, kyusu or chawan needs it as gear, under the vessel's name. A kettle, mugs, a teapot, a saucepan and a sieve are taken as owned.
  - A thermometer is always optional: every step says how to reach its temperature without one.
- **Ids are forever:**
  - a blend's code (`017`) always names the same blend;
  - a published blend, ingredient or piece of gear is never removed, only retired (`retired: true`);
  - `ids.yaml` lists every one ever published, and the check refuses a removal or a rename.

### 5.3 What makes a blend safe
- It works with a plain boiling kettle, or with a simple way to cool the water.
- It needs no special equipment: it is made in a mug, teapot, glass, jar or bottle, never a gaiwan, kyusu, chawan or saucepan, and needs no gear (optional gear, such as a thermometer, is fine).
- It takes at most 5 minutes of waiting on the day. An overnight cold brew's night doesn't count, since it happens at home the evening before.
- Its dry ingredients can be packed the night before. Every step of the day has its office text: the same step with an office kettle and mugs. An overnight blend's evening steps happen at home and need none.
- Most people would enjoy it.

Experimental blends can use a gaiwan, precise temperatures, butter or salt, unusual spices and longer rituals.

### 5.4 The build and the check
- **The format:** [content/README.md](content/README.md) holds the file format, with an example, and every check.
- **The workflow:** after any change in `content/`, run `npm run content:build`. It writes `content/src/bundle.ts` (the bundle, with the SHA-256 of its canonical JSON) and `ids.yaml`, and writes nothing when anything is wrong.
- **The check:** `npm run content:check` (part of `npm run check`) refuses anything wrong, and a bundle or `ids.yaml` that is out of date.

---

## 6. Guides
- **The two guides** are Markdown files in `content/guides/`, written with the same sourcing rules as the blends: the general tea guide (`general.md`) and the Earl Grey guide (`earl-grey.md`). Their chapter outline is in [docs/original-plan.md](docs/original-plan.md#guides).
- **The format:**
  - a guide has one `# Title`, first;
  - its chapters are `## Heading {#id}`, whose ids are its anchors and what blends link to (`guides: [earl-grey#bergamot]`);
  - links are `https://` or `#a-chapter`;
  - raw HTML and images are refused.
- **Rendering:** the guides are rendered to HTML at build time, so the app shows them offline with no Markdown library.

---

## 7. Screens
**The look** is *A · Warm journal* (decision of 2026-11-20): cream paper, tea-brown ink, Alegreya and Alegreya Sans. Its colours in both modes, fonts, type scale, radii and spacing are in [docs/design/README.md](docs/design/README.md), and become the app's Tailwind `@theme`.

On the phone, a bottom tab bar holds **Today · Pantry · Library · Guides · Settings**; **Review** joins it on weekends.

**Today**
- **The blend card:**
  - its number and name, the origin story (3–4 lines) and the trust level;
  - the cups selector, then the ingredients and water scaled to it;
  - the water type, temperature, ratio, preheat and vessel;
  - the steps, with the infusions' timers chained: each one moves on to the next, which starts with a tap.
- **The actions:** Made it with a 1–5 rating, Skip, Swap, Not for me, and the journal code to copy.
- **On office days**, the card shows the office version of the steps.
- **In the evening:**
  - the next office day's kit, as a checklist of what to weigh and pack for its cups, with **Packed**;
  - Draw tomorrow's tea now, from 17:00;
  - an overnight blend to start.
- **Before 8:00 on a home day:** the teaser and Peek.
- **When there's no blend:** the plain-tea, what-to-buy and no-kit cards.

**Weekly review:** §2.8.

**Pantry**
- **Each ingredient:** have or don't have, the amount left, freshness, and kept at the office.
- **Opening one** shows its 2+ shops (online or in Lyon), how many blends use it, and how many it would unlock.
- **Gear:** have or don't have, with the same page: its shops, the blends that need it, and how many it would unlock. It is the shopping list for what the owner doesn't have yet.

**Library**
- **All the blends**, filtered by pool, made or not yet, can make now, origin, flavour and caffeine.
- **A blend you can't make yet** is greyed out and shows what's missing.
- **A blend's page** has its recipe and **I made this**.

**Guides:** the two guides, readable offline.

**Settings**
- Office days, overrides and away periods.
- The notification times, notifications on or off, and a test push.
- The cooldown and the default cups.
- Light or dark: a switch (decision of 2026-11-20).
- Export (JSON and CSV).

**Diagnostics**
- The app's and the server's versions, the service worker, push.
- The outbox and refused commands.
- The jobs and the recent notifications.
- The clock check.
