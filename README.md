# TeaTime

**One sourced tea blend every weekday, made from what's in your pantry.**

At 8:00 a notification on the phone opens the day's blend:
- the full method: water, temperature, quantities scaled to the cups, the steps, and timers for the infusions;
- a short story of where the recipe comes from, with how far it can be trusted (*documented*, *attested* or *legend*).

The rest of the week works like this:
- **Office days** draw a simple *safe* blend for two cups, picked the evening before so the kit can be packed.
- **Home days** draw an *experimental* one.
- **Saturday** is for reviewing the week; **Sunday** is free.
- **Notes** go in a paper journal under the blend's number (`#017`); the app keeps the rating, the pantry and the history.

It is a personal app: a PWA installed on an iPhone, served from a PC at home through Tailscale.

## Status
**Phases 0 and 1 are done:** the look (*A · Warm journal*, with its tokens) and the foundation (the workspaces, the tooling and CI, the docs, and the content's schemas, checks and build). See [ROADMAP.md](ROADMAP.md) for what comes next.

## Read next
| Document | What |
|---|---|
| [SPEC.md](SPEC.md) | The rules, the architecture, the content and the conventions (the source of truth) |
| [ROADMAP.md](ROADMAP.md) | The phases, and the decisions log |
| [content/README.md](content/README.md) | The content's format and its checks |
| [docs/design/README.md](docs/design/README.md) | The look, and its tokens in both modes |
| [SERVICES.md](SERVICES.md) | Outside services, and what they learn |
| [docs/original-plan.md](docs/original-plan.md) | The plan this project started from |

## Development
Node 22 (`.nvmrc`), then:

```powershell
npm install
```

```powershell
npm run check
```
