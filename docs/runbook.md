# Runbook: TeaTime on the PC

How the daily app runs, and what to do when. The architecture is SPEC §3.7; this is the how.

## What runs where
| What | Where |
|---|---|
| **The container** (`teatime`, one service, `app`): the server, the jobs, and the built app | Docker Desktop on the PC, `127.0.0.1:8081` only |
| **The database** | The named volume `teatime_data`, never on the Windows drive |
| **The backups** | `D:/TeaTime-backups` (or `BACKUP_DIR` in the repo-root `.env`), one a day, 30 kept |
| **The address** | `https://desktop-obf71rf.taild9afa4.ts.net:8443`, through `tailscale serve` |
| **Secrets** (the VAPID keys) | The repo-root `.env`, which git ignores |

EagleEye shares the PC and the Tailscale name: its project is `eagleeye`, with 443, 8080, 3100 and 5433. TeaTime never touches any of them.

## The first time
1. **Docker Desktop** starts at login (it already does, for EagleEye).
2. **The push keys**, once. This writes the VAPID keys into the repo-root `.env` and prints only the public one:
   ```powershell
   npm run daily:vapid
   ```
   Keep `.env` safe: new keys mean every phone subscribes again.
3. **Build and start:**
   ```powershell
   npm run daily:up
   ```
4. **Check it's up:**
   ```powershell
   curl.exe http://127.0.0.1:8081/api/health
   ```
5. **Publish it on the tailnet**, on port 8443:
   ```powershell
   tailscale serve --bg --https=8443 http://127.0.0.1:8081
   ```
   Then check that EagleEye's 443 is still there:
   ```powershell
   tailscale serve status
   ```
6. **On the iPhone:**
   - open the address in Safari, then Share → Add to Home Screen;
   - open TeaTime from the Home Screen;
   - Settings → Turn on pushes, allow them, then Send a test.

## Every day
Nothing to do. The notifier draws each tea day the evening before, and sends the pushes at 20:30 (when the evening needs you), 8:00 and Saturday 10:00. The backup is written at the first hourly check of each day.

## Updating
After a merge to main, on the PC:
```powershell
git pull
```
```powershell
npm run daily:up
```
The image is rebuilt and the container replaced; the migrations run as it starts. The phone shows "A new version is ready" next time it opens: Reload.

## Looking at it
- **The log:**
  ```powershell
  npm run daily:logs
  ```
- **The diagnostics:** `https://desktop-obf71rf.taild9afa4.ts.net:8443/api/diag` shows the jobs' last runs, the push subscriptions, the recent pushes and refused commands, and the backups.
- **Running a job now:**
  ```powershell
  curl.exe -X POST http://127.0.0.1:8081/api/jobs/backup/run
  ```

## Restoring a backup
1. Stop the server, so nothing has the database open:
   ```powershell
   docker compose stop app
   ```
2. Check the backup first (nothing changes):
   ```powershell
   npm run daily:restore -- /backups/teatime-2026-11-23.sqlite --dry-run
   ```
3. Restore it. The database it replaces is moved aside in the volume, never deleted, and the restored state counts past its revision, so the phones take it:
   ```powershell
   npm run daily:restore -- /backups/teatime-2026-11-23.sqlite
   ```
4. Start the server again:
   ```powershell
   docker compose start app
   ```

Changes made after the backup's day are gone; a phone's unsent changes still go through when it syncs.

## When something's wrong
- **No push came:**
  - Diagnostics' `notifications` say whether it was sent, and `push.subscriptions` whether the phone's subscription is still on.
  - A subscription the push service dropped is off: Settings on the phone → Turn on pushes again.
- **The phone says the server can't be reached:**
  - Is the container up (`docker compose ps`)?
  - Is `tailscale serve status` still showing 8443?
  - Is the phone on Tailscale?
- **A change wasn't kept:** the phone shows which and why. The server refused it (an already-made pick, a day since cancelled), and the state it shows is the server's.
