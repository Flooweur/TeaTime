# TeaTime — roadmap

The rules and the architecture are in [SPEC.md](SPEC.md). This file holds the phases, what each is done with, and the dated decisions behind the SPEC.

## Phases
Each phase is a branch and a pull request, merged only after the owner's yes. Each ends with something that works.

| # | Phase | Done when | Status |
|---|---|---|---|
| 0 | **Design directions:** three static Today mockups in `docs/design/`; the owner picks one, which becomes the Tailwind tokens | The owner has picked, and `docs/design/README.md` records it | Done: A · Warm journal |
| 1 | **Foundation:** workspaces, tooling, CI, these docs, the content's schemas, check and build | `npm run check` is green in CI | Done |
| 2 | **Push spike** (`spikes/001-push-8443`): iOS home-screen push on the `:8443` origin | The owner's iPhone has shown a test push (or the failure is written up with the fallback: a Tailscale container with its own name) | Proposed as its own session |
| 3 | **Core domain:** every rule of SPEC §2, with unit and property tests (a simulated year in Europe/Paris, the draw's invariants, the status table, the reducer's order-independence, rounding). The saving-and-loading round trip of the state is phase 5's, with the rows; the Saturday review's lists are phase 8's, built on core's unlock counts and freshness | The tests are green | Done |
| 4 | **Content batch 1:** 10 blends (about 6 safe and 4 experimental, at least one cold brew, across the families), their ingredients, Lyon and online shops, and the tea types. The owner approves the list before the research | `content:check` is green, and the owner has reviewed the batch | Done |
| 5 | **Backend:** the state's persistence, the commands, draw and swap, settings and overrides, export, backup and restore, diagnostics | The route and job tests are green (in-memory SQLite, a test clock, a fake push) | Done |
| 6 | **Frontend core:** the shell, Today with its timers, the library, the blend page, the pantry, the offline store, outbox and sync, and the update toast | For any date and pantry, Today shows a valid card, and the app opens offline | In review |
| 7 | **Phone and notifications:** the install flow, push on, off and test, the notifier, the Docker image and compose file, `tailscale serve`, the backups, and `docs/runbook.md` | The owner's iPhone has had a week of 8:00 pushes | In review; running since 2026-11-21 (deployed from its branch, on the owner's yes) |
| 8 | **Review, settings and export** | The owner has done one real Saturday review | — |
| 9 | **Polish:** the guides screen and outline, accessibility (44 px taps, contrast, safe areas), diagnostics, the chime's audio session, a full final review | The owner would show it to their colleague without apologising | — |

Phase 4 depends only on phase 1, so it can run alongside phases 3, 5 and 6. Later content batches (the other 80 blends, then the two guides) follow the same review, in batches of 15.

**Gear** (decision of 2026-11-20) is in the content from batch 1. Core's pantry and draw learned it in a small PR after phase 3 was merged: a blend whose required gear is missing isn't drawn, and gear counts among the purchases that unlock the most.

## Decisions log
Asked of the owner and answered, newest first. The SPEC states each as a rule.

### 2026-11-21: the app (phase 6)
The owner took the five recommendations:
- **Light or dark:** until the switch is first set, the app follows the device's own setting. Each device keeps its own switch; it isn't synced.
- **Made it and the rating:** Made it logs the cup at once, then offers the 1–5 rating, and the colleague's on office days. A rating left for later can be given in the Saturday review.
- **Undo:** after Made it or Skip, Today offers Undo for about 10 seconds.
- **On the PC:** the phone's layout, in a centred column.
- **Weekends:** Today says there's no tea today, shows the next tea day (Monday's kit on Sunday evening), and links to the Library for I made this.
- **The cups selector** is a stepper, "− 2 cups +", rather than the design's row of circles (asked after the PR's self-review).

### 2026-11-21: the backend (phase 5)
- **No command counts twice** without the snapshot listing the ids it holds, a list that would only grow: a phone with unsent commands syncs by sending them, and the answer has a result for each, a resend's included (SPEC §3.3).
- **The CSV export:** one row per cup made, oldest first, with `date`, `time`, `tea`, `name`, `cups`, `place`, `rating` and `colleague_rating` (SPEC §3.4).

### 2026-11-21: gear in core
- **What gear can't hold is refused, not ignored:** `pantry.set` for a piece of gear with an amount, an opened date or *kept at the office* is refused with `gear_have_only`. Restating `null` or `false` is accepted (SPEC §3.3).

### 2026-11-21: content batch 1 (phase 4)
- **The list** (approved on 2026-11-20), coded 001–010 in this order, forever:
  - safe: 001 Moroccan mint tea, 002 Sencha brewed right, 003 Mizudashi (the cold brew, started the evening before), 004 First-flush Darjeeling, 005 Earl Grey the classic, 006 Russian zavarka;
  - experimental: 007 Masala chai, 008 Hong Kong milk tea, 009 High-mountain oolong gongfu style, 010 Tibetan butter tea.
- **No replacement:** the zavarka stays safe. Pokhlebkin, its primary source, steeps good black tea 3.5–4 minutes, under the 5-minute limit.
- **At the office** there is a kettle with temperature settings, a teapot, mugs, a fridge and milk. The office steps use them.
- **A cup** is a 250 ml mug for the Western-style teas. Sencha and the gongfu oolong keep their small traditional cups.
- **Sugar** is written at the sources' amount, and optional.
- **Lemon** is counted in slices (about 8 to a lemon).

### 2026-11-20: gear (phase 4)
- **What the owner has:** no gaiwan, kitchen thermometer, blender or milk frother at home. They will buy what the blends need, from a list in the app.
- **Gear counts like an ingredient:** each blend names the gear it needs; the pantry holds it as *have* or *don't have*, with 2+ shops each. A blend whose gear is missing isn't drawn, and a piece of gear can be the purchase that unlocks the most (SPEC §2.3, §2.6, §5.2).
- **When:** the content model, its checks and the SPEC now (content batch 1); core's draw and pantry after phase 3 is merged.
- **The thermometer** is optional, never required: every step says how to reach its temperature without one.

### 2026-11-20: the core rules (phase 3)
- **Office days:** Monday, Tuesday and Thursday, the default in Settings.
- **★ against a low rating:** a blend last rated 1–2 stays out of the draw even when starred; only *make again* brings it back.
- **The evening push when away:** it still goes the evening before a tea day, even when that evening is away (coming back on Sunday for a Monday office day).
- **Rounding:** a needed quantity never rounds to nothing: at least 0.1 g, 5 ml or one piece.

### 2026-11-20: the look (phase 0)
- **Direction:** of three Today mockups (A · Warm journal, B · Calm minimal, C · Ink & washi), the owner picked **A · Warm journal**, as shown, with nothing mixed in from B or C: cream paper and tea-brown ink, Alegreya for the names and stories, Alegreya Sans for the rest, amber for the running timer.
- **Tokens:** its colours in both modes, fonts, type scale, radii and spacing are in [docs/design/README.md](docs/design/README.md), ready to become the Tailwind 4 `@theme` in phase 6.
- **Light / dark:** a switch in Settings chooses. What it starts on, before the owner first sets it, was asked in phase 6: the device's own setting.

### 2026-11-20: the build plan (Q&A before phase 1)
**Platform and hosting**
- **Hosting:** the owner's PC, like EagleEye: a Docker stack beside it, reached through Tailscale. This replaces the original plan's Vercel + Supabase.
- **Address:** port 8443 on the PC's Tailscale name (`tailscale serve --bg --https=8443 …`). A spike checks iOS push there first.
- **Database:** SQLite, not Postgres.
- **Login:** none; Tailscale is the gate.
- **Devices:** the iPhone (home-screen app) and the PC's browser. Pushes on the iPhone only.
- **Uptime:** the PC is always on, and Docker Desktop starts at login.
- **Language:** the app is in English. Recipes may come from sources in any language, if they meet the quality standards.
- **Name:** the home-screen app is **TeaTime**.

**The week and the draw**
- **Office days** are fixed weekdays in Settings, with a per-date override for exceptions.
- **Days off:** away periods in Settings. Public holidays are not handled on their own.
- **Draw timing:** every weekday's blend is drawn the evening before, Sunday evening included for a Monday. The 20:30 push is sent only when the evening needs the owner (an office kit, or an overnight prep).
- **Early kit:** an office kit can be drawn early, from 17:00.
- **Home reveal:** the home-day blend is a surprise until 8:00, with a Peek button.
- **Missed kit:** when the evening draw was missed before an office day, the card says the kit wasn't packed, and offers a plain tea from the teas marked as kept at the office.
- **Nothing makeable:** a plain tea from the pantry, brewed by its tea type, plus the purchase that would unlock the most.
- **Cooldown:** when every makeable blend is in cooldown, the one made longest ago comes back (favourites first), rather than a plain tea.
- **Seasons** are a preference, in this order: never-made in season → favourites in season → never-made out of season → favourites out of season.
- **Repeats:** never-made blends first; then favourites (rated 4–5, ★ or *make again*), least recently made first. Rated 1–2 never return unless *make again*. The cooldown is a setting, 21 days by default.
- **Not for me** removes a blend from the draw, reversibly. A skipped blend rests 7 days.
- **Swap:** one per pick; on office days, only until the kit is packed.

**Brewing and the pantry**
- **Cups:** a selector before brewing (2 at the office and 1 at home by default); quantities scale with it. A gongfu session shares its leaves.
- **Made it** takes the quantities off the pantry; reaching 0 sets the ingredient to *don't have*.
- **Extra teas:** I made this, from any blend page, weekends included, is logged and deducted like a pick's brew.
- **Colleague:** the owner enters their ratings.
- **Journal:** no page-number field; the blend's code is the link to the notebook.
- **Timers:** the screen stays awake, and a chime plays at the end. No push at a timer's end.

**The week's rhythm**
- **Saturday review:** "next week's office kits" is a preview; nothing is drawn ahead.
- **Late pushes:** each is sent within its window (8:00 until 10:00, 20:30 until 23:00, Saturday 10:00 until 13:00), then skipped.
- **Offline:** reading works offline, and writes sync later.

**Content and how we work**
- **Content:** compiled into the app, not seeded into the database.
- **This build:** the app plus the first 10 real, sourced blends. The guides come with a later content batch; this build has their outline.
- **Design:** 2–3 directions for Today are shown first.
- **Workflow:** EagleEye's (a branch and PR per phase, a self-review, merges and deploys only after the owner's yes).
