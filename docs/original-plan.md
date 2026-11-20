# Tea of the Day — App Build Plan

Nov 20, 2026 · @Hello Claude, My name is Sam

## What the app does

Every weekday at 8:00, a notification on your phone opens one blend you can make with the ingredients you have. You get the full method: water, temperature, quantity, infusion times, and a short story about where the recipe comes from. You write your notes in your paper journal under the blend's number (#042). The app only keeps a 1–5 rating and the date.

The core rules:

- **90 sourced blends**, each with a trust level: *documented* (written source), *attested* (chef, tea master or tea house), or *legend* (a good story that can't be proven).
- **Office days** draw from *safe* blends, sized for two cups (you and your colleague) and prepared at home the evening before.
- **Home days** draw from *experimental* blends.
- **Weekends have no tea of the day.** They are for reviewing the week's teas.
- **Only teas you can make.** A blend is suggested only when you have all its required ingredients. The pantry also shows which purchases would unlock the most new blends.
- **Two guides:** a general tea guide and the Earl Grey guide.

## The weekly rhythm

The week has three kinds of day. Your 3 office days are a setting, so the plan doesn't depend on which ones they are.

| Day type | Notification | What you get | Blend pool |
| --- | --- | --- | --- |
| Evening before an office day | 20:30 | "Pack tomorrow's kit": the blend is picked tonight, with what to weigh and pack for 2 cups | Safe |
| Office day | 8:00 | The method, adapted to an office kettle and mugs, with a timer | Safe |
| Home day | 8:00 | The full ritual: exact temperature, teapot or gaiwan, several infusions | Experimental |
| Saturday | 10:00 | Weekly review (see Screens) | None |
| Sunday | None | Free day; the pantry and the library stay open | None |

Why office blends are picked the evening before: you need the ingredients at work, so the choice has to be made while they're still at home.

With 3 office days and 2 home days, a **54 safe / 36 experimental** split runs both pools out together: 18 weeks of new teas if you own every ingredient, about mid-April from a December start. After that, the app mixes favourites back in with blends you haven't made yet.

## Tech stack

The whole stack runs on free plans, so the app costs €0 a month. It's a web app installed on your phone's home screen (a PWA). That avoids the App Store, and the same app opens on your computer.

| Layer | Choice | Why | Cost |
| --- | --- | --- | --- |
| App | Next.js + TypeScript + Tailwind, as a PWA | One codebase for phone and computer; widely used, so tools and Claude Code know it well | Free |
| Hosting | Vercel (Hobby plan) | Deploys from GitHub on every push | Free |
| Database + login | Supabase (Free plan): Postgres + magic-link email login | Real database, simple access rules for you (and later your colleague) | Free |
| 8:00 scheduler | Supabase Cron (pg\_cron) calling an Edge Function | Fires on the minute you set | Free |
| Notifications | Web Push with VAPID keys (`web-push` library) | Standard browser push, no third-party service | Free |
| Content | One YAML file per blend in the Git repo, loaded into the database by a seed script | Easy to research, review and correct; full history | Free |
| Building it | Claude Code on your computer, with this doc as the spec | You steer, it writes most of the code | Your Claude plan |

Three constraints shaped these choices:

- **iPhone push only works from the home screen.** iOS 16.4+ sends web push only to a web app added through Safari → Share → Add to Home Screen, after you tap a button to allow it ([WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados), [MobiLoud](https://www.mobiloud.com/blog/pwa-push-notifications)). Android works from Chrome as well.
- **Vercel's free cron is too loose for 8:00.** On Hobby it runs at most once a day and can fire anywhere in the scheduled hour ([Vercel docs](https://vercel.com/docs/cron-jobs/usage-and-pricing)). That's why the scheduler lives in Supabase.
- **Supabase Free pauses idle projects.** It pauses after a week of low database activity, but keeps the data; a few requests a day usually keeps it awake ([Supabase docs](https://supabase.com/docs/guides/platform/free-project-pausing)). Your daily use should be enough. A weekly export of your ratings is a cheap safety net.

**Daylight saving time:** pg\_cron runs in UTC, and Lyon is UTC+1 in winter and UTC+2 in summer. Schedule the job at both 06:00 and 07:00 UTC, and let the function send only when it's 8:00 in Europe/Paris.

**If push becomes a headache,** the first version can send the 8:00 message through the free ntfy app (one HTTP call) and switch to real push later.

## How it fits together

&#91;embedded content: how the app fits together · 9 parts\]

Your phone and computer only talk to the app. At 8:00, Supabase Cron starts the Edge Function: it picks a blend you can make from your pantry, saves it, and sends the notification.

## Data model

Ten tables cover everything. Blends and ingredients come from the YAML files. Pantry, picks and reviews are what you create by using the app.

| Table | Key fields | Filled by |
| --- | --- | --- |
| `blends` | code (#001–#090), name, story, mode (safe / experimental), trust level, source type (grandmother, chef, tea house, ceremony, royal/state), difficulty, season tags, flavour tags, caffeine (none / low / medium / high), cups (2 for safe blends) | YAML |
| `blend_sources` | blend, title, author or house, url or book reference, what it supports (recipe, story, parameters) | YAML |
| `blend_ingredients` | blend, ingredient, quantity, unit (g / ml / pieces), optional (yes / no), role (base, accent, garnish) | YAML |
| `brew_params` | blend, water (tap / soft bottled / filtered), temperature °C, ratio g per 100 ml, vessel, preheat (yes / no), infusions as a list of seconds (e.g. 20, 25, 35) | YAML |
| `blend_steps` | blend, order, text, timer seconds, office variant of the text | YAML |
| `ingredients` | name, category (tea, herb, spice, citrus, flower, sweetener, dairy, other), quality notes, storage, shelf life after opening (days) | YAML |
| `ingredient_sources` | ingredient, shop name, online or in person (Lyon), url or address, why it's good, rough price, last checked | YAML (at least 2 per ingredient) |
| `pantry` | ingredient, have (yes / no), grams left, opened on | You |
| `picks` | date, blend, day type, status (made / skipped), rating 1–5, colleague rating, journal page | App + you |
| `settings` | office days, notification times, push subscription, repeat cooldown (days) | You |

Two values are computed rather than stored. **Unlock count** is how many blends an ingredient would make possible if you bought it. **Freshness** compares the opening date with the shelf life and warns you when a tea is going stale.

## How the tea of the day is chosen

&#91;embedded content: daily pick logic · 5 steps, 1 decision\]

The pick is a small pure function (date, day type, pantry, history → blend), so it can be fully tested before any notification exists. The repeat cooldown is a setting; whether the fallback should suggest a plain tea instead is listed under Open decisions.

## Screens

Six screens, reached from a bottom tab bar on the phone.

1. **Today.** The blend card: number and name, the origin story (3–4 lines) and the trust level. Then the ingredients with exact grams and the water and temperature, followed by the steps. Each infusion has a timer that moves on to the next one by itself. At the bottom: "Made it" with a 1–5 rating, a "Skip" button, and the journal code to copy into your notebook. On office days the card shows the office version of the steps.
2. **Weekly review (Saturday).** The 5 teas of the week side by side with their ratings. You can mark a favourite, flag a blend to make again, and add your colleague's ratings for the office teas. Then three lists: ingredients running low or going stale, the top 3 purchases that would unlock new blends, and next week's office kits.
3. **Pantry.** Every ingredient with a have/don't-have toggle, grams left and freshness. Each one opens its 2+ sources (online or in Lyon), how many blends it's used in, and how many it would unlock.
4. **Library.** All 90 blends, filtered by safe/experimental, made/not made yet, can make now, origin, flavour and caffeine. Blends you can't make yet are greyed out and show what's missing.
5. **Guides.** The general tea guide and the Earl Grey guide, readable offline.
6. **Settings.** Office days, notification times, notifications on or off, and data export.

## Building the 90-blend database

The 90 blends are spread over six families and split 54 safe / 36 experimental, matching your 3 office days and 2 home days.

| Family | What's in it | Blends | Safe | Experimental |
| --- | --- | --- | --- | --- |
| Household traditions | Grandmother-style recipes: Moroccan mint, masala chai, Turkish çay, Russian zavarka, Hong Kong milk tea, Kashmiri noon chai, Tibetan butter tea | 20 | 13 | 7 |
| Tea-master classics | Single teas brewed perfectly: gyokuro, sencha, matcha, first-flush Darjeeling, high-mountain oolong, Da Hong Pao, silver needle, aged pu-erh | 20 | 8 | 12 |
| Chef & pâtissier creations | Blends and infusions from named chefs, pâtissiers and tea houses | 15 | 9 | 6 |
| Courts, presidents & historic houses | Teas tied to royal households, heads of state and historic tea rooms, each with its trust level | 10 | 6 | 4 |
| Earl Grey family | Classic, fresh bergamot, Lady Grey, London Fog, cornflower, lavender, vanilla, Earl Grey on oolong or green | 15 | 10 | 5 |
| Seasonal & cold | Cold brews, iced teas, winter spice blends | 10 | 8 | 2 |
| **Total** |  | **90** | **54** | **36** |

**Sourcing rules**

- At least 2 independent sources per blend, one of them primary: a tea house's own publication, a chef's book or interview, a tea institute, or a named family recipe.
- Brewing parameters are checked against a tea-master reference for that type of tea. When sources disagree, store the range and the value you choose.
- Every blend gets a trust level. "The king drank this" without a source counts as *legend*, and the app says so.
- At least 2 sources per ingredient for buying it, with a Lyon shop wherever one exists.

**What makes a blend "safe"**

- It works with a plain boiling kettle, or with a simple way to cool the water.
- It needs no special equipment, takes under 5 minutes, and the dry ingredients can be packed the night before.
- Most people would enjoy it.

Experimental blends can use a gaiwan, precise temperatures, butter or salt, unusual spices and longer rituals.

**File format:** one file per blend, for example `content/blends/017-moroccan-mint.yaml`. The values below show the format only; the real ones come from research.

```yaml
code: "017"
name: Moroccan mint tea
mode: safe
family: household
trust: attested
story: >
  Two or three lines on where this recipe comes from.
sources:
  - { title: "...", url: "...", supports: [recipe, parameters] }
  - { title: "...", url: "...", supports: [story] }
ingredients:
  - { id: gunpowder-green, qty: 0, unit: g }
  - { id: fresh-spearmint, qty: 0, unit: g }
  - { id: sugar, qty: 0, unit: g, optional: true }
brew:
  water: soft-bottled
  temp_c: 0
  vessel: teapot
  infusions_s: [0]
steps:
  - { text: "...", timer_s: 0, office: "..." }
```

**How we produce it:** I research and write the blends in batches of 15, with sources. You review each batch before it goes into the app. The ingredient list and its shop sources are built from the blends, so no ingredient is listed that no blend uses.

## Guides

Both guides are Markdown files in `content/guides/`. They're written with the same sourcing rules as the blends, and blends link to the guide chapter they draw on.

**General tea guide**

1. The tea families: white, green, yellow, oolong, black, dark/pu-erh, and herbal infusions.
2. Water: hardness, Lyon tap water vs. soft bottled water, filtering, never reboiling.
3. Temperature by tea type, and how to get it without a variable kettle.
4. Ratio and time: Western style vs. gongfu, and multiple infusions.
5. Equipment: teapot, gaiwan, kyusu, scale, thermometer, and what's actually worth buying.
6. Storage and freshness.
7. Additions: milk, sugar, honey, citrus, spices, flowers, and when each works.
8. Tasting: how to describe a tea, plus a template for your journal page.
9. Making tea at the office.

**The Earl Grey guide**

1. The legend and the facts.
2. Choosing the base tea: Ceylon, Keemun, Darjeeling, Chinese black, or oolong and green.
3. Bergamot: oil vs. fresh zest, dried peel, and the Calabrian season (winter).
4. Making your own Earl Grey from scratch, step by step.
5. Brewing it perfectly: water, temperature, time, with or without milk.
6. Additions: cornflower, lavender, vanilla, rose, orange peel (Lady Grey).
7. Earl Grey drinks: London Fog, iced Earl Grey, Earl Grey cold brew.
8. Food pairings: shortbread, madeleines, scones, lemon cake, dark chocolate, a Lyon tarte aux pralines.
9. A tasting session comparing 3 Earl Greys side by side, for a weekend.

## Build roadmap

The build has seven phases. Each one ends with something that works, so you can use the app well before the content is finished.

1. **Setup.** Install the tools, create the accounts and the repo (next section).
   - Done when: an empty Next.js app is live on a Vercel URL.
2. **Data foundation.** Database schema, the YAML format, a seed script, and 10 test blends.
   - Done when: `npm run seed` loads the 10 blends and their ingredients into Supabase.
3. **Core app.** Today, Library and Pantry screens, plus the pick logic with automated tests.
   - Done when: for any date and any pantry, Today shows a valid blend or the "missing ingredient" card.
4. **Phone + notifications.** PWA manifest, service worker, push permission button, the Edge Function, and the scheduled jobs (8:00, 20:30, Saturday 10:00).
   - Done when: your phone has buzzed at 8:00 every weekday for a week.
5. **Weekly review + ratings.** The Saturday screen, the colleague rating, and the export.
   - Done when: you've done one full review on a Saturday.
6. **Content.** All 90 blends in 6 batches of 15, then the two guides.
   - Done when: 90 files pass validation, each with 2+ sources and a trust level.
7. **Polish.** Offline reading, the visual design, timer sounds, and optional colleague access.
   - Done when: you'd show it to your colleague without apologising.

Phases 2–5 and phase 6 can run in parallel: you build while I research the blends.

## Your first evening on the computer

This takes about two hours and gets you to the end of phase 1.

- [ ] Install Node.js (LTS version) and Git.
- [ ] Install Claude Code, following the instructions at [claude.com/claude-code](https://claude.com/claude-code). A code editor like VS Code helps too.
- [ ] Create a GitHub account and an empty private repo called `tea-of-the-day`.
- [ ] Create a Supabase account and a project in an EU region close to Lyon. Keep the project URL and keys somewhere safe.
- [ ] Create a Vercel account and connect it to GitHub.
- [ ] Clone the repo, export this doc as Markdown, and save it in the repo as `docs/PLAN.md`.
- [ ] Open a terminal in the repo folder, start Claude Code, and paste the prompt below.

```text
Read docs/PLAN.md: it's the spec for a personal tea app. We're doing phase 1 (Setup) only.
Create a Next.js app with TypeScript and Tailwind, set it up as a PWA (manifest + service worker,
no push yet), add a .env.example for the Supabase keys, and write a README with how to run it.
Explain each step briefly as you go, because I'm learning. Stop when it runs locally,
then help me deploy it to Vercel.
```

For phase 2, the next prompt asks for the schema from the Data model section and the seed script. I can send you the first 10 blend files to test it with.

## Open decisions

- [ ] Which 3 days are office days? Is that fixed, or does it change from week to week? (If it changes, add a "tomorrow I'm at the office" toggle.)
- [ ] iPhone or Android?
- [ ] Should your colleague get their own login to rate the office teas, or will you enter their rating?
- [ ] Is 10:00 on Saturday right for the weekly review?
- [ ] When an office day comes but you're missing ingredients for every safe blend: fall back to a plain tea from the pantry, or skip the day?

## Sources

- [WebKit: Web Push for Web Apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados)
- [MobiLoud: How to set up push notifications for your PWA](https://www.mobiloud.com/blog/pwa-push-notifications)
- [Vercel: Cron jobs usage and pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing)
- [Supabase: Project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
