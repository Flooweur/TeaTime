# TeaTime — roadmap

The rules and the architecture are in [SPEC.md](SPEC.md). This file holds the phases, what each is done with, and the dated decisions behind the SPEC.

## Phases
Each phase is a branch and a pull request, merged only after the owner's yes. Each ends with something that works.

| # | Phase | Done when | Status |
|---|---|---|---|
| 0 | **Design directions:** three static Today mockups in `docs/design/`; the owner picks one, which becomes the Tailwind tokens | The owner has picked, and `docs/design/README.md` records it | Done: A · Warm journal |
| 1 | **Foundation:** workspaces, tooling, CI, these docs, the content's schemas, check and build | `npm run check` is green in CI | Done |
| 2 | **Push spike** (`spikes/001-push-8443`): iOS home-screen push on the `:8443` origin | The owner's iPhone has shown a test push (or the failure is written up with the fallback: a Tailscale container with its own name) | Proposed as its own session |
| 3 | **Core domain:** every rule of SPEC §2, with unit and property tests (a simulated year in Europe/Paris, the draw's invariants, the status table, the reducer's round trip, rounding) | The tests are green | — |
| 4 | **Content batch 1:** 10 blends (about 6 safe and 4 experimental, at least one cold brew, across the families), their ingredients, Lyon and online shops, and the tea types. The owner approves the list before the research | `content:check` is green, and the owner has reviewed the batch | — |
| 5 | **Backend:** the state's persistence, the commands, draw and swap, settings and overrides, export, backup and restore, diagnostics | The route and job tests are green (in-memory SQLite, a test clock, a fake push) | — |
| 6 | **Frontend core:** the shell, Today with its timers, the library, the blend page, the pantry, the offline store, outbox and sync, and the update toast | For any date and pantry, Today shows a valid card, and the app opens offline | — |
| 7 | **Phone and notifications:** the install flow, push on, off and test, the notifier, the Docker image and compose file, `tailscale serve`, the backups, and `docs/runbook.md` | The owner's iPhone has had a week of 8:00 pushes | — |
| 8 | **Review, settings and export** | The owner has done one real Saturday review | — |
| 9 | **Polish:** the guides screen and outline, accessibility (44 px taps, contrast, safe areas), diagnostics, the chime's audio session, a full final review | The owner would show it to their colleague without apologising | — |

Phase 4 depends only on phase 1, so it can run alongside phases 3, 5 and 6. Later content batches (the other 80 blends, then the two guides) follow the same review, in batches of 15.

## Decisions log
Asked of the owner and answered, newest first. The SPEC states each as a rule.

### 2026-11-20: the look (phase 0)
- **Direction:** of three Today mockups (A · Warm journal, B · Calm minimal, C · Ink & washi), the owner picked **A · Warm journal**, as shown, with nothing mixed in from B or C: cream paper and tea-brown ink, Alegreya for the names and stories, Alegreya Sans for the rest, amber for the running timer.
- **Tokens:** its colours in both modes, fonts, type scale, radii and spacing are in [docs/design/README.md](docs/design/README.md), ready to become the Tailwind 4 `@theme` in phase 6.
- **Light / dark:** a switch in Settings chooses. What it starts on, before the owner first sets it, is still to be asked (phase 6).

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
