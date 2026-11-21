# @teatime/backend

TeaTime's server (SPEC §3): Fastify 5, SQLite through Drizzle and better-sqlite3, and the in-process jobs. It stores the owner's state as rows and changes it only through core's rules, the same ones the phone runs (SPEC §3.3). It never writes a rule itself.

## Commands
```powershell
npm run dev -w backend
```
The server on `127.0.0.1:3200`, restarting on a change. The database is `data/teatime.sqlite` at the repo root; the migrations run at startup.

```powershell
npm run vapid -w backend -- .env
```
Writes the VAPID keys into `backend/.env` once, printing the public key only. Without them, pushes are off and the draws still happen.

```powershell
npm run restore -w backend -- D:/TeaTime-backups/teatime-2026-11-23.sqlite --dry-run
```
Checks a backup; without `--dry-run`, puts it in the database's place, moving the current one aside. Stop the server first.

```powershell
npm run db:generate -w backend
```
Writes a migration into `drizzle/` after a change to `src/db/schema.ts`. A merged migration is never edited.

`backend/.env.example` lists the environment variables.

## What's here
| Folder | What |
|---|---|
| `src/app.ts` | `buildApp`: every route under `/api`, with the same-origin check, JSON-only bodies, `no-store` and `{error, code}` errors. Its side effects come in as dependencies |
| `src/server.ts`, `src/config.ts`, `src/version.ts` | Starting it: the environment, the database, the jobs, the stop on SIGTERM; `app-version.json`'s version |
| `src/db/` | `schema.ts` (the tables and their CHECKs), `client.ts` (`openDb`: the pragmas and the migrations), `backup.ts`, `restore.ts` |
| `src/state/` | `rows.ts` (core's `State` as rows and back; `saveTouched` writes only what a change touched), `snapshot.ts` (what the server answers), `service.ts` (one transaction per change), `routes.ts` (`GET state`, `POST commands`) |
| `src/commands/` | The batch of offline commands: each decided once, a refusal never blocking the rest |
| `src/picks/`, `src/settings/` | The online routes: draw and swap; settings, overrides and away periods |
| `src/push/` | The VAPID sender, the subscriptions and their routes, `push/check` included (ported from EagleEye) |
| `src/jobs/` | `every.ts` (the job runner, ported from EagleEye), `notifier.ts` (draws, then pushes), `backup.ts` |
| `src/http/static.ts` | Serving the built app (`STATIC_DIR`): immutable assets, `no-cache` pages, the app's page for any page load, and the security headers with the CSP |
| `src/export/`, `src/diag/` | The JSON and CSV exports; health, diagnostics and running a job by hand |
| `src/lib/` | The clock, and errors: `HttpError`, and `safeError`, what the log keeps of one (never a value) |
| `drizzle/` | The migrations, written by drizzle-kit |
| `scripts/` | `vapid.ts`, `restore.ts` |

## Tests
`test/` runs against an in-memory database, migrated, with a clock the test moves, the real content bundle and a push sender that records (`helpers.ts`). CI runs them a second time with `TZ=Pacific/Auckland`.
- `rows.test.ts` holds the round trip: any state, saved then loaded, is the same state.
- `commands.test.ts` covers resends, refusals, a write that fails, the origin check, and that the server ends on the state core's reducer reaches, however the commands are batched.
- `online.test.ts` covers draw, swap, settings, overrides and away periods through their routes.
- `push.test.ts` and `notifier.test.ts` cover subscriptions, the evening, morning and review pushes, retries within the grace window, and a crash mid-send.
- `static.test.ts` covers serving the app: caching, the page fallback, a missing asset, the CSP's hash, compression.
- `backup.test.ts`, `export.test.ts` and `diag.test.ts` cover the rest; a restore counts past the replaced revision.
