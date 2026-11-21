# @teatime/frontend

TeaTime's PWA (SPEC §7): React 19, Vite 8, Tailwind 4, TanStack Router, and vite-plugin-pwa with its own service worker. It shows the server's last snapshot with its own unsent commands replayed on top, through core's reducer, the same one the server runs (SPEC §3.3). It never writes a rule itself.

## Commands
```powershell
npm run dev -w backend
```
```powershell
npm run dev -w frontend
```
The app on `http://localhost:5180`, sending `/api` to the backend on 3200. Open it at `localhost`, not `127.0.0.1`: the backend takes writes from the app's origin only.

```powershell
npm run build -w frontend
```
```powershell
npm run preview -w frontend
```
The production build, with its service worker, on `http://localhost:5181`: the way to see it open offline.

```powershell
npm run icons -w frontend
```
Draws the app icons into `public/` (no dependencies).

## What's here
| Folder | What |
|---|---|
| `src/main.tsx`, `src/router.tsx` | The start (storage followed, sync started, storage kept) and the screens as routes |
| `src/index.css` | The Warm journal tokens (docs/design/README.md) as Tailwind's `@theme`, dark by the switch or by the device, and the journal's motifs |
| `src/lib/` | `api.ts` (JSON calls, `{error, code}`), `db.ts` (Dexie: snapshot, outbox, refused), `store.ts` (small stores, and the storage followed across tabs), `view.ts` (the snapshot with the outbox replayed), `commands.ts` (a change made offline), `sync.ts` (the outbox sent, the snapshot kept, the online operations), `timer.ts`, `chime.ts`, `wakeLock.ts`, `push.ts` (this device's pushes: on from a tap, off, the test), `theme.ts`, `time.ts`, `format.ts`, `content.ts`, `pantryView.ts` |
| `src/today/` | `model.ts` (which card Today shows, from the state and the time alone), the cards, the actions (Made it, the ratings, Skip, Swap, Not for me, Undo), the evening's kit |
| `src/screens/` | Library, a blend's page, the Pantry and an item's page, Guides (an outline later), Settings: Notifications, and `settings/` (the week, the times and brewing, the export) |
| `src/components/` | The frame and its tab bar, the banners, the update toast, the recipe with its timers, the small pieces |
| `src/sw/` | The service worker: the shell precached, every page address opening it offline; on the PC, a push shown and its tap opening the app (`push.ts`) |
| `scripts/make-icons.mjs` | The icons |

## Notes
- **Offline:** the service worker precaches the shell and the fonts' latin and latin-ext files (the others load when a page needs them). The state comes from IndexedDB, and changes wait in the outbox.
- **Index.html's one inline script** applies the light / dark choice before the first paint. The server's CSP allows it by its hash, read from the built file (backend/src/http/static.ts).
- **Push links** open `/today?date=…&from=push`: a route of its own, besides `/`.

## Tests
`src/**/*.test.ts(x)`, in node with an in-memory IndexedDB, and in happy-dom for the screens (`src/test/` holds the setup, a fake server that applies commands with core's reducer, and a stand-in for the PWA plugin's module).
- `today/model.test.ts`: for any date, time, week and pantry, Today's card is a valid one (a property test); the teaser, the evening and the weekend.
- `today/Today.test.tsx`: Today rendered: Made it, the ratings and Undo; Peek; a push's link; the weekend; Packed; the missed kit; nothing to make; no card before the storage answers; the different-teas toast.
- `lib/sync.test.ts`: the outbox, a lost answer never counting twice, refusals, undecided commands, offline (a proxy's 500 included), an older snapshot ignored, a change made mid-sync sent at once.
- `screens/settings/Settings.test.tsx`: office days through the server, a packed kit asked about before it's thrown away, away periods, one day different, the exports.
- `lib/timer.test.ts`: the timers' arithmetic.
- `lib/push.dom.test.tsx`: pushes on the iPhone only, a replaced subscription forgotten at the server, the pushes-off banner.
- `lib/push.test.ts`, `sw/push.test.ts`: the VAPID key's bytes and the subscription's key; what a push shows on the PC, and the links it may open.
