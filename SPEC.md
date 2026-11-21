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
4. Otherwise the weekday is an **office day** if it is one of the owner's office days (a setting: Monday, Tuesday and Thursday by default), and a **home day** if not.

A weekday that isn't away is a **tea day**.

### 2.2 Pools, and when a tea is drawn
- An office day draws from the **safe** blends, sized for 2 cups: the owner and their colleague. A home day draws from the **experimental** blends.
- **Every tea day's blend is drawn the evening before**, at the evening time (20:30 by default), Sunday evening included:
  - an office kit has to be packed while its ingredients are still at home;
  - an overnight blend (a cold brew) has to be started that evening.
- **An office kit can be drawn early**, from 17:00 on the calendar day before (or from the evening time, if it is set earlier), with "Draw tomorrow's tea now", so the owner can pack before going out.
- **The evening notification** is sent only when the evening needs the owner: an office kit not packed yet, or a blend to start tonight.
- **A home-day blend stays a surprise** until the morning time (8:00 by default). Before it, Today shows "Tomorrow's tea arrives at 8:00" with a **Peek** button. It shows at once if it has to be started that evening. Opening the app from that day's push reveals it, whatever the phone's clock says.
- **A draw the server missed** (the PC was off at 20:30) happens as soon as it can: at the next pass of the notifier, or when the app asks. Until midnight it is still the evening before; after it, it is a **same-day draw**, which never picks an overnight blend. A first draw of an office day made on the day itself is the missed kit (§2.5).

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
- **The last rating** is the owner's rating on the blend's latest rated brew. Every brew counts, Made it and I made this alike; the colleague's rating never does.
- **Favourites** are blends last rated 4–5, starred ★, or marked *make again*.
- **Others** are made blends last rated 3, or never rated.
- **A blend last rated 1–2 never comes back**, unless it is marked *make again* (a ★ alone doesn't bring it back). It leaves the draw with the rules that always hold.
- **In season** means the date's meteorological season (northern hemisphere: winter is December to February), or a blend with no season tags.

**3. Soft filters, relaxed one level at a time.**
- **The two filters:**
  - *the 7-day rest*: a blend skipped or swapped away rests 7 days, counted from its pick's date: it can't be drawn for that date or the 6 after it;
  - *the cooldown*: a made blend waits a number of days (a setting, 21 by default) before it can come back. Made on the 2nd with 21 days, it can come back on the 23rd.
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
  - A swap lands on another blend, or doesn't happen: it never trades a blend for a plain tea.
  - A pick that a pantry change made unmakeable gets a free redraw, which isn't counted as its swap. So does a fallback (a plain tea, or nothing), once a blend can be made.
- **A brew for a pick:**
  - logged for a pick already made, it is refused (`already_made`): two devices pressed Made it;
  - logged for a pick that is skipped, it makes the pick, since the real cup wins;
  - logged for a pick that was cancelled or is gone, it is kept on its own, like I made this.
- **Skip** marks the pick skipped. Its blend rests 7 days, then goes back in the pool.
- **Not for me** (on the card and in the library) takes a blend out of the draw for good, until it is unmarked in the library.
- **Changing a day:**
  - A change of day type (an override, the office days, an away period) re-checks the pending picks it touches: a pick whose pool no longer fits is drawn again; one inside an away period is cancelled.
  - A packed kit is never thrown away without asking.
  - An away period wins over an override.
  - Past dates can't be changed.
- **Cups:**
  - Today has a cups selector, from 1 to 12, set to 2 on office days and 1 at home by default (settings). Quantities and water scale with it.
  - **Packed** (office picks only) records the cups packed, which Made it then uses by default.
- **Scaling:**
  - A `per-cup` recipe makes `serves` cups and scales in proportion.
  - A `per-session` recipe (a gaiwan, a kyusu) shares one session's leaves among up to `session_max` people; more people make more sessions.
- **Rounding:** one rule per unit, in core, used both for what is shown and for what is deducted:
  - grams to the nearest 0.5 g, or 0.1 g under 2 g;
  - millilitres to the nearest 5 ml;
  - pieces to the nearest whole piece;
  - halves round up, and a needed quantity never rounds to nothing: at least 0.1 g, 5 ml or one piece.
- **Deduction:**
  - Made it takes the shown quantities off the pantry: each ingredient whose amount is tracked, and the optional ones only when they are *have*.
  - An amount never goes below 0; reaching 0 sets the ingredient to *don't have*.
  - The brew records what it took, so undoing it (removing the brew) puts back exactly that.
  - A missed-kit tea (§2.5) is made with the office's tea, so it takes nothing from the pantry.

### 2.5 Fallbacks
- **No blend left after the rules that always hold** → a **plain tea** from the pantry, brewed with its tea type's parameters (`tea-types.yaml`, with office parameters for office days).
  - The tea is chosen deterministically: one to use soon first, then the one with the most left (an untracked amount after every tracked one), then by id. It must have enough for the day's cups.
  - The card also names **the purchase that would unlock the most blends** of that pool.
  - With no tea in the pantry at all, the card says what to buy.
- **An office day whose kit was never packed** because the evening draw was missed → the card says so, and offers a plain tea from the teas marked **kept at the office** in the pantry, or nothing.
  - The office's stock isn't tracked: a tea kept there counts whatever the pantry at home says, unless it is perishable and stale. One to use soon comes first, then by id.
  - Only a first draw makes this card. A pick redrawn on the day, because its day turned into an office day, draws a safe blend as usual.

### 2.6 Pantry
- **Each ingredient has:**
  - *have* or *don't have*;
  - an amount left in the ingredient's unit, or untracked;
  - the date it was opened;
  - whether it is **kept at the office**.
- Turning *have* on sets the opened date to today.
- **Freshness** compares the opened date with the ingredient's shelf life, on the day the tea will be made: *fresh*, *use soon* (75 % of it gone), or *stale* (more days gone than its shelf life). Without an opened date, it can't tell, and never says stale. A perishable ingredient that is stale counts as missing for the draw.
- **Unlock count:** how many blends that can't be made now would become makeable if this one ingredient were added. An ingredient that is *have* but too low counts as missing. The weekly review lists the 3 purchases with the highest counts.
- **Gear** (§5.2) is *have* or *don't have*, and nothing else: no amount, no opened date, never deducted. A piece of gear the owner lacks counts like a missing ingredient, in the draw and in the unlock count, so a gaiwan can be the purchase that unlocks the most.

### 2.7 Notifications
| Kind | When | Sent when | Grace window |
|---|---|---|---|
| `evening` | the calendar day before each tea day, at the evening time (20:30) | the next day is an office day whose kit isn't packed yet, or its blend needs starting that evening. It goes even when that evening is itself away: it is about the next day | 2 h 30 |
| `morning` | each tea day, at the morning time (8:00) | the pick isn't made, skipped or cancelled yet | 2 h |
| `review` | Saturday, at the review time (10:00) | unless that Saturday is away | 3 h |

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
- **What a push says:** its title and text name the blend (`#017 Moroccan mint`), the plain tea, or that there is no kit or nothing to make. Its link carries the date and the blend (`/today?date=…&blend=…&from=push`), so a tap opens the right recipe even offline. The review's opens `/review?date=…&from=push`.
- **In core:** `dueNotifications(state, content, now)` gives what is due now, with its tag, window, text and link; the server records what it sent.

### 2.8 Weekly review (Saturday)
On Saturday and Sunday, the review covers Monday to Friday just past; the Saturday push opens it.
- **The week's teas**, side by side, with their ratings.
  - Pending picks of past days are asked about: made or skipped. **Made** logs the cup on its own day, at the morning time, with the pick's cups, so a pantry measured since isn't counted down twice (§3.3's deduction rule; decision of 2026-11-21).
  - Ratings can still be given or changed.
- **Marks:** ★ favourite and *make again* on any blend, and the colleague's ratings for the office teas.
- **Three lists:**
  1. ingredients running low or going stale. **Running low:** a tracked amount that can't make two more of the blend that takes the most of it, at that blend's default cups. **Going stale:** *use soon* or past its shelf life (§2.6);
  2. the 3 purchases that would unlock the most blends;
  3. next week's office preview: the office days ahead, how many safe blends could be drawn from the pantry as it is, and what to restock so none runs short: each tracked ingredient whose amount is under what those days could take, each day counted as the office blend that takes the most of it, at the office's cups.
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
backend/        Fastify, Drizzle and SQLite, the jobs: src/ (the app, the database, the state's rows, the routes, push,
                the jobs), drizzle/ (the migrations), scripts/ (vapid, restore)
frontend/       the PWA: src/ (lib: the offline store, outbox and sync; today: the model and its cards; screens;
                components; sw: the service worker), scripts/ (icons)
docs/           original-plan.md, design/, runbook.md
```
- **`packages/core` has zero I/O.** It compiles with `lib: ["ES2023"]` and `types: []` (no DOM, no Node), and ESLint refuses Node imports there.
- **Time and randomness come in as arguments** (§4.2).
- **The content's file format** (snake_case YAML) lives in `content/src/schema.ts`. Its model (camelCase), which everything else reads, lives in `packages/core/src/content.ts`.

### 3.3 State and sync
The owner's state is tiny: the pantry, picks, brews, marks and settings. So the server always answers with **the whole state** and its `revision`, a counter.

**Every change the owner makes is a command:** `{id (a UUID made by the device), v, at, type, payload}`. Core's `applyCommand(state, command, content)` is pure. It returns the new state and the keys it touched, and both sides use it:
- **On the phone:** what it shows is the server's last snapshot, with its unsent commands replayed on top. A snapshot older than the one the phone has is ignored.
  - **No command counts twice:** a phone with unsent commands syncs by sending them (`POST commands`), never by `GET state` alone. The answer has a result for every command sent, a resend's included, and the snapshot after them all, so the phone drops exactly those from its outbox and replays the rest.
- **On the server:** a batch is applied one command at a time, inside one SQLite transaction with a savepoint each.
  - Each command is accepted or refused with a `code`, and recorded in `applied_commands`, so a resend changes nothing: it gets the same result, marked `repeat`. The same id twice in one batch is a resend too.
  - Two are not recorded, so a resend tries again: a command from a newer app than the server (`unsupported_version`), and one that couldn't be applied or stored (`server_error`, a bug: its savepoint is rolled back, and the batch goes on).
  - The answer gives a result per command, in order, and the new snapshot. The batch counts one revision, if anything changed.
  - A refused command is shown on the phone; it never blocks the queue.

**Offline commands** (`packages/core/src/state/commands.ts`; `parseCommand` checks one's shape, with no field missing or unknown):

| Command | Payload | Does |
|---|---|---|
| `brew.logged` | `brew` (a new UUID), `tea` (`{kind: "blend", code}` or `{kind: "plain", tea}`), `cups`, `date`, `pick?`, `rating?`, `colleagueRating?` | Made it (with `pick`), or I made this; deducts (§2.4) |
| `brew.rated` | `brew`, `rating?`, `colleagueRating?` (null takes one back) | Last writer wins, per rating |
| `brew.removed` | `brew` | Undo: puts back what it took where it can, and reopens its pick |
| `pick.skipped`, `pick.unskipped` | `date` | pending ⇄ skipped |
| `pick.packed` | `date`, `cups` | An office kit packed for those cups |
| `pantry.set` | `ingredient` (an ingredient's or a piece of gear's id), `have?`, `amount?`, `openedOn?`, `atOffice?` | Last writer wins, per field. `amount` is a measurement: what is left. A piece of gear takes `have` alone (§2.6) |
| `blend.marked` | `blend`, `favourite?`, `makeAgain?`, `notForMe?` | Last writer wins, per mark |

A refusal has a `code`: `duplicate`, `future_date`, `unknown_tea`, `unknown_blend`, `unknown_ingredient` (no ingredient or gear has that id), `gear_have_only` (an amount, an opened date or *kept at the office* for a piece of gear; null and false are fine), `not_found`, `no_pick`, `already_made`, `cancelled`, `not_pending`, `not_office`, `nothing_to_pack`; `parseCommand`'s own are `invalid` and `unsupported_version`, with a `problem`, and the server's is `server_error`. An accepted command may carry notes: `no_change` (a more recent change won, or nothing was to do), `pick_gone`, `different_tea`, `not_restored` (with the ingredient).

**What needs the server** (`packages/core/src/state/online.ts`, pure too):
- `drawDue` (the notifier's draws), `drawNow` (the app's), `swapPick`;
- `updateSettings`, `setOverride`, `addAway`, `removeAway`. These re-check the pending picks they touch (§2.4) in the same transaction, then draw whatever has become due.
- **A packed kit** that a change would throw away refuses the change with `packed_kits` and the dates; the app asks the owner, and sends it again with `confirm`.

**Rules:**
- **The status table** in core (`PICK_MOVES`) lists every allowed change of a pick's status; a brew has none, it is logged once and removed once. Logging a brew for a pick already made answers `already_made`. A brew for a pending pick is accepted whatever its tea, since the real cup wins: the pick keeps the tea it drew, its brew the one made, and the answer notes `different_tea`.
- **`pantry.set`, `blend.marked` and `brew.rated` are last-writer-wins, field by field,** by the command's time against each field's last change.
- **A deduction** applies only to amounts last measured before the brew's time: a later measurement already includes it. A deduction doesn't count as a measurement.
- **A measurement that reaches the server after a brew made later than it** still has that brew's share taken off, so the order things reach the server never changes the result.
- **An undo** puts amounts back only where nothing was measured since; it says so where it can't.
- **The reducer returns the keys it touched,** so the server writes only those rows; a touched key gone from the new state is a row to delete.
- **A command time more than a day ahead of the server's clock** is taken as the server's time.
- **App updates:** commands carry a version `v`, and the server upgrades old ones, so an app update never loses what is queued.
- **The snapshot carries the full content of every pending pick's blend,** and the content's hash. The phone can always show what was drawn, and a hash it doesn't have shows the update toast.
- **Sync runs:**
  - at launch, when the app comes back to the front, and on `online`;
  - 2 s after a write, and every 60 s while visible;
  - one run at a time across tabs (Web Locks).
- **Storage:** Dexie's transactions keep the snapshot and the outbox consistent. The app asks for persistent storage. A failed write shows a banner, never fails silently.

### 3.4 API
All routes are under `/api`, and bodies are JSON only (any other type is refused, 415). A body with an unknown field, or a value of the wrong type, is refused (400), never trimmed or coerced. Errors are `{error, code}`, with any details beside them. Answers are `no-store`.
- **Same origin:** a write (any method but GET and HEAD) that names its `Origin` must name the app's: `PUBLIC_ORIGIN`, and in dev Vite's preview (`MORE_ORIGINS`). Otherwise it is refused, 403 `cross_origin`. Browsers always send `Origin` on a write, so a write without one isn't a page on another site: a script on the PC, which Tailscale already lets in.
- `GET health`, `GET state`, `POST commands` (`{commands: [...]}`, at most 500).
- `POST picks/:date/draw`: idempotent; only for today, for tomorrow's office kit from 17:00 (or the evening time, if earlier), or for any tea day tomorrow once the evening time has come. An early home day is refused (`not_office`).
- `POST picks/:date/swap`, `{current}`: the pick's tea as the app shows it, so a retry after a lost answer returns the current pick.
- `PUT settings` (a patch), `PUT overrides/:date` (`{type: "office" | "home" | null}`), `POST away` (`{id, from, to}`, the id made by the app: a resend of the same period answers the snapshot), `DELETE away/:id`. After `packed_kits`, the app sends the change again with `?confirm=true`.
- **The online routes' refusals** are core's codes (§3.3): 400 `invalid` with its `problems`, 404 `no_pick` and `unknown_away`, 409 for the others, and `packed_kits` with its `dates`. A refusal changes nothing; a success answers the new snapshot.
- `GET push/key` (null while pushes are off), `POST|DELETE push/subscriptions`, `POST push/check` (`{endpoint}` → `{on}`: whether the server still has it on; a POST, so an endpoint never goes in a URL or a log), `POST push/test` (`{sent, failed, gone}`; 503 `push_off` without the VAPID keys). A subscription's endpoint must be a push service's (Apple's, Google's, Mozilla's or Microsoft's), against SSRF, and at most 10 are on at once.
- `GET export.json`: the snapshot, with the app's version. `GET export.csv`: one row per cup made, oldest first: `date`, `time` (the owner's), `tea` (`#code`, or the plain tea's id), `name`, `cups`, `place` (`office`, `home`, or empty for I made this), `rating`, `colleague_rating`. Both download as `teatime-<date>`.
- `GET diag` (§3.8), `POST jobs/:name/run` (`notifier`, `backup`).

### 3.5 Jobs
| Job | Every | Does |
|---|---|---|
| `notifier` | 30 s | Draws what is due (§2.2), then sends what is due (§2.7) |
| `backup` | 1 h, written once a day | A copy of the database into `BACKUP_DIR`, 30 kept (§3.7) |

**Sending a push** is at least once:
- The notifier claims each push due (`sending`) in the transaction that draws, sends it outside it, then settles it: `sent` if a device took it, `failed` otherwise.
- A `failed` push, or one left `sending` for 2 minutes (a crash), is claimed again on a later pass, until its grace window ends. The device shows a duplicate in place of the first (same tag).
- Without the VAPID keys, or with no device subscribed, nothing is claimed; the draws still happen.
- A device whose push service answers 404 or 410 is turned off for good; the app subscribes it afresh.

### 3.6 Database (SQLite)
The database is a file in a named Docker volume, opened with `journal_mode=WAL`, `foreign_keys=ON`, `busy_timeout=5000` and `synchronous=NORMAL`. Drizzle migrations run at startup.

| Table | Holds |
|---|---|
| `settings` | Every setting by key, as JSON, checked by core's rules as it loads: a missing one, or one a later rule refuses, is its default (and the log says so) |
| `day_overrides`, `away_periods` | §2.1 |
| `pantry` | One row per ingredient or piece of gear: have, amount left (nullable; always null for gear), opened on, kept at the office, a change time per field |
| `picks` | One per date: the day type, the blend or plain tea, how it was drawn, what it was swapped from and when, the status, packed at and packed cups, the brew |
| `brews` | Each cup made: id, date, time, the blend or plain tea, cups, ratings, the deduction, and its pick's date, unique when set |
| `blend_marks` | ★, *make again*, Not for me |
| `push_subscriptions` | EagleEye's shape: endpoint (unique), keys, last success, failures, disabled at |
| `notifications` | One row per kind and date: its status (`sending`, `sent`, `failed`), attempts, and when |
| `applied_commands` | Every command decided: its id, type, when it came, and its result |
| `meta` | The state's revision |

Each away period has its place in the list (`seq`), since the state keeps them in the order they were added. A brew's ingredients taken are stored as JSON, so an undo puts back exactly that.

CHECK constraints keep ratings within 1–5, a pick or brew to exactly one of a blend or a plain tea, and statuses to their lists.

### 3.7 Environments, hosting and backups
| Environment | What | Where |
|---|---|---|
| dev | The backend on :3200, Vite on :5180 (`vite preview` on :5181) | The PC |
| daily | The Docker container on `127.0.0.1:8081`, published by `tailscale serve --bg --https=8443 http://127.0.0.1:8081` at `https://desktop-obf71rf.taild9afa4.ts.net:8443`, in its own compose project (`name: teatime`) | The PC + Tailscale |

- **Coexisting with EagleEye:** EagleEye has 443 on the same Tailscale name, and its own ports (5433, 3100, 5174/5175, 8080). TeaTime never touches them, nor EagleEye's compose project or Tailscale setting.
- **The container runs with `TZ=UTC`:** the owner's time zone is a setting.
- **The database lives only in its named volume,** never on the Windows drive, where SQLite's locking isn't reliable.
- **The dev database** is `data/teatime.sqlite` at the repo root, which git ignores (`DATABASE_PATH` moves it).
- **The daily backup:**
  - is the database serialized to a `.part` file in the bind-mounted `D:/TeaTime-backups`, synced to disk, then renamed to `teatime-YYYY-MM-DD.sqlite`, dated in the owner's time zone; a `.part` a crash left is removed by the next run;
  - keeps 30;
  - is brought back by `npm run restore -w backend -- <backup> [--dry-run]` (`npm run daily:restore` in the container), with the server stopped. It copies the backup next to the database and checks the copy: SQLite's integrity check, every table, the migrations. A dry run stops there. Otherwise the copy's revision is set past the replaced database's, so every phone takes the restored state (§3.3), and the database it replaces is moved aside (`<database>.before-restore-<time>`), never deleted.
- **The ports** are clear of EagleEye's and WikiWar's.
- **The image** (`Dockerfile`, `docker-compose.yml`; how to run it: [docs/runbook.md](docs/runbook.md)):
  - a build stage compiles every workspace, the app included;
  - a second installs the server's dependencies only, with the tools better-sqlite3 may need;
  - the image holds those, the compiled code, the migrations and the built app, runs as the `node` user, and listens on 3200.
  - The compose file publishes it on `127.0.0.1:8081` and passes the address, the backups' folder and the VAPID keys, from the repo-root `.env`.
- **The server serves the built app** (`STATIC_DIR`, set in the image); in dev, Vite does.

### 3.8 Platform and iOS rules
(Ported from EagleEye's spike and SPEC §3.12; the owner's iPhone confirmed push on port 8443 with the real app, on 2026-11-21.)
- **Installing:** from Safari → Add to Home Screen. Push only works in the installed app, and permission is asked from a tap. The PC's browser gets no pushes (decision of 2026-11-20): its Settings sends the iPhone a test instead.
- **Pushes off on the iPhone** (never turned on, or dropped by its push service) show a banner on every screen, checked at launch and when the app comes back to the front. Turning pushes on again forgets the old subscription at the server.
- **The app's installed name is TeaTime,** which iOS prints above each push and keeps from the first install.
- **Every push displays.** Payloads use the declarative format `{"web_push": 8030, "notification": {title, body, navigate, tag}}`, without `mutable`. iOS shows them itself, without running the service worker; Chromium's service worker shows the same JSON.
- **A subscription is replaced when needed:** one made with another VAPID key, or one the server disabled after its push service said it's gone (404/410).
- **Caching:** only `/assets/*` (hashed files) is cached as immutable. `index.html`, the manifest and the service worker are `no-cache`; the API answers `no-store`. A missing asset is a 404, never the app's HTML. Any other page load (GET, wanting HTML, outside `/api` and `/assets`) gets index.html, for the app's router. Answers are compressed with brotli or gzip.
- **Push links** open `/today?date=…&from=push` (or `/review`): the app has a route for each. On the PC, the service worker opens one in the app's window, or a new one; it opens only the app's own addresses.
- **Updates:** an update toast appears when a new service worker is waiting. The app looks for one when it comes back to the front, and every hour.
- **Timers:**
  - they count from wall-clock time, and resume after a reload or a push tap;
  - a Wake Lock keeps the screen on while one runs;
  - a chime plays at the end, through `navigator.audioSession.type = "playback"` so the silent switch doesn't mute it.
- **Taps and screens:** taps reach 44 px, a control's border has 3:1 contrast against its surface, the layout keeps clear of the safe areas, and inputs are 16 px so iOS doesn't zoom.
- **Security headers** (EagleEye's Caddy headers, as a Fastify hook), on every answer: `nosniff`, `Referrer-Policy: no-referrer`, a one-day HSTS, a Permissions-Policy with no camera, microphone or location, and, while the server serves the app, a CSP: scripts from the app's origin only, plus index.html's one inline script (the light / dark choice before the first paint) by its hash, computed from the built file at start; `frame-ancestors 'none'`.
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
  - A piece of gear never takes an ingredient's id: the pantry holds both by id.
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

On the phone, a bottom tab bar holds **Today · Pantry · Library · Guides · Settings**; **Review** joins it on weekends. On the PC's browser, the same screens sit in a centred column of the phone's width (decision of 2026-11-21).

**Today**
- **The blend card:**
  - its number and name, the origin story (3–4 lines) and the trust level;
  - the cups selector, then the ingredients and water scaled to it;
  - the water type, temperature, ratio, preheat and vessel;
  - the steps, with the infusions' timers chained: each one moves on to the next, which starts with a tap.
- **The actions:** Made it with a 1–5 rating, Skip, Swap, Not for me, and the journal code to copy.
  - **Made it** logs the cup at once, then offers the rating, and the colleague's on an office day. A rating left for later can be given in the Saturday review (decision of 2026-11-21).
  - **Undo:** after Made it or Skip, Today offers Undo for about 10 seconds.
- **On office days**, the card shows the office version of the steps.
- **In the evening:**
  - the next office day's kit, as a checklist of what to weigh and pack for its cups, with **Packed**;
  - Draw tomorrow's tea now, from 17:00;
  - an overnight blend to start.
- **Before 8:00 on a home day:** the teaser and Peek.
- **When there's no blend:** the plain-tea, what-to-buy and no-kit cards.
- **On a weekend:** no tea today, the next tea day (on Sunday evening, Monday's kit), and the Library, for I made this.

**Weekly review:** §2.8.

**Pantry**
- **Each ingredient:** have or don't have, the amount left, freshness, and kept at the office.
- **Opening one** shows its 2+ shops (online or in Lyon), how many blends use it, and how many it would unlock.
- **Gear:** have or don't have, with the same page: its shops, the blends that need it, and how many it would unlock. It is the shopping list for what the owner doesn't have yet.

**Library**
- **All the blends**, filtered by pool, made or not yet, can make now, origin, flavour and caffeine.
- **A blend you can't make yet** is greyed out and shows what's missing.
- **A blend's page** has its recipe and **I made this**.

**Guides:** the two guides, readable offline. Until a guide is written, its chapter outline (docs/original-plan.md).

**Settings**
- Office days, overrides and away periods.
- The notification times, notifications on or off, and a test push.
- The cooldown and the default cups.
- Light or dark: a switch (decision of 2026-11-20). Until it is first set, the app follows the device's own setting, and the switch can go back to that ("As the device"). Each device keeps its own; it isn't synced (decision of 2026-11-21).
- Export (JSON and CSV).

**Diagnostics** (Settings → Diagnostics, `/diag`)
- The app's and the server's versions, the service worker, push.
- The outbox and refused commands.
- The jobs and the recent notifications.
- The clock check.
