# Services

Every outside service TeaTime uses: what it's for, where it's set up, and what it learns. Keep this file current: a new service gets a line here.

The accounts belong to the owner. Secrets (the VAPID keys, from phase 7) live in a gitignored `.env` and never go in the repo.

| Service | What for | Where it's set | What it learns | Cost |
|---|---|---|---|---|
| **Tailscale** | Private HTTPS from the iPhone to the PC, which is the server: `tailscale serve --bg --https=8443 http://127.0.0.1:8081` (SPEC §3.7) | The Tailscale admin console; the PC's and the iPhone's apps. Shared with EagleEye, which has port 443 | Device names, IPs and connection metadata (the traffic is end-to-end encrypted) | Free (personal plan) |
| **Web Push services** (Apple's, for the iPhone) | Delivering the 8:00, 20:30 and Saturday notifications (phase 7) | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (a placeholder, `mailto:teatime@example.com`, never the owner's email) | A subscription per device, and when each push is sent. Each payload is encrypted for the device; it names the day's blend | Free |
| **GitHub** | The repo `Flooweur/TeaTime`, CI (GitHub Actions) | github.com | The code and the content | Free |
| **npm** | Packages at install time | `package-lock.json` | Nothing personal | Free |
| **Docker Hub** | The base image of the daily container, pinned (phase 7) | The Dockerfile | Image pulls from the PC and from CI (their IPs) | Free |

## Used for the content, not by the app
- **The web pages and books cited as sources** (SPEC §5.2) are read when researching a batch. The app never calls them; its links open in the browser only when the owner taps them.
- **The shops' sites** are checked for prices and pages when researching. Each ingredient keeps the date its shops were last checked.
