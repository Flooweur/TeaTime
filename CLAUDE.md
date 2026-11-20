# TeaTime: working notes for Claude

TeaTime is a personal tea PWA: each weekday, one sourced blend the owner can make from their pantry, with its method, timers and story, and a push at 8:00.
- **[SPEC.md](SPEC.md) is the source of truth** for the rules, the architecture, the content and the conventions.
- **[ROADMAP.md](ROADMAP.md)** holds the phases and the dated decisions.
- **[docs/original-plan.md](docs/original-plan.md)** is the claude.ai spec the project started from; the SPEC wins where they differ.

Read the relevant parts before changing anything, and update them in the same commit as your change.

## Map
- `packages/core/`: pure TypeScript, zero I/O. Time (dates, time zones, DST), the content's model and vocabulary (`src/content.ts`), and from phase 3 the rules of SPEC §2. [README](packages/core/README.md).
- `content/`: the blends, ingredients, shops, tea types and guides as YAML and Markdown, their schemas, the compiler and its checks, and the generated `src/bundle.ts`. [README](content/README.md) has the format and every check.
- `backend/` (phase 5) and `frontend/` (phase 6) come later.
- `docs/`: `original-plan.md`, and `design/`: the look (A · Warm journal) and its Tailwind tokens, in both modes, in its [README](docs/design/README.md). `spikes/` (phase 2) and `runbook.md` (phase 7) are still to come.
- [SERVICES.md](SERVICES.md) lists every outside service and what it learns.
- **Project EagleEye** (`D:\Git\Project_EagleEye`) is the owner's other app, and the model for TeaTime's patterns (push, PWA shell, content pipeline, tooling, workflow). Port its code, never import across repos.
  - When reading it, never open `packages/content/assessments/**`, `packages/content/src/bundle.ts` or any `dist/`: they are held out from its owner.

## Commands
- `npm run check`: typecheck, lint, format, the content check and every test. All green before any commit.
- `npm run content:build`: after any change in `content/`. It writes `content/src/bundle.ts` and `ids.yaml`.
- `npm run content:check`: what the build would refuse, and whether its output is up to date.
- `npm run build`: compiles the packages to `dist/`.
- `npm run format`: Prettier on everything it covers. Markdown and the content's YAML keep their hand-written layout.

## Rules that bite
- **Core is pure.** No I/O, no clock, no `Math.random()` in `packages/core/src`: time comes in as a `Clock` or values, randomness as a seed (SPEC §4.2). ESLint and the compiler enforce it.
- **Dates are `YYYY-MM-DD` strings.** A wall-clock time becomes an instant only through `instantAt` (Europe/Paris, DST handled). "The evening before" is the calendar day before, never minus 24 h.
- **Ids are forever.** A blend's code always names the same blend, and a published blend or ingredient is retired, never removed (`ids.yaml`, SPEC §5.2).
- **Content needs sources.** Never present an unsourced claim as fact: a story without a source is a *legend*, and says so. Every blend has 2+ sources, one primary; every ingredient has 2+ shops (SPEC §5.2). Check every source you cite: open it, never cite from memory.
- **The app and the server read the same rules.** Commands are applied by core's pure reducer on both sides (SPEC §3.3). Never write the rules twice.
- **Every bug fix gets a regression test** that fails without it.
- **Versions:** each PR that changes the app or the server bumps `app-version.json`.
- **Privacy:** the owner's email and personal details never go into the repo, a log, a push or a request to an outside service. The VAPID subject is `mailto:teatime@example.com`.
- **EagleEye coupling:** never change EagleEye's compose project, ports, or its Tailscale `serve` setting on 443. Changing TeaTime's own `tailscale serve` setting (8443) needs the owner's yes.

## Working with the owner
- **Never guess.** Ask when a rule or a design choice isn't settled; past answers are in ROADMAP.md's decisions log. The owner wants to be asked.
- **Deliver on a branch,** one commit per topic, with all checks green.
- **Before any PR, review it all yourself:**
  - run the code-review skill on the branch's diff against `main`;
  - read the whole diff, docs included;
  - fix what holds up, and run `npm run check` again.

  Then push the branch and open the PR, with a **Self-review** section saying what you checked and fixed. Never push `main`.
- **Merge and deploy only after asking, every time.** One yes covers one merge or one deploy.
- **Phases end at a checkpoint:** stop for review.
