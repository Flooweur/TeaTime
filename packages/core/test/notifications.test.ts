import { describe, expect, it } from "vitest";
import {
  type BrewLogged,
  type DueNotification,
  type State,
  addDays,
  applyCommand,
  drawDue,
  dueNotifications,
  isWeekend,
  poolOf,
  revealsAt,
  teaDayType,
  weekOf,
} from "../src/index.js";
import { at, blend, catalog, command, have, pick, state, uuid } from "./fixtures.js";

const SUNDAY = "2026-11-22";
const MONDAY = "2026-11-23";
const THURSDAY = "2026-11-26";
const SATURDAY = "2026-11-28";

const content = catalog([
  blend("001", { name: "Moroccan mint" }),
  blend("031", { name: "Cold brew", prep: "evening", mode: "experimental" }),
  blend("101", { name: "Gongfu", mode: "experimental" }),
]);

const kinds = (due: DueNotification[]) => due.map((n) => n.tag);

describe("the evening push (SPEC §2.7)", () => {
  const officeKit = state({ picks: { [MONDAY]: pick(MONDAY) } });

  it("goes the evening before an office day whose kit isn't packed, until its window closes", () => {
    expect(dueNotifications(officeKit, content, at(SUNDAY, "20:29"))).toEqual([]);
    const [due] = dueNotifications(officeKit, content, at(SUNDAY, "20:30"));
    expect(due).toEqual({
      kind: "evening",
      date: MONDAY,
      tag: `evening:${MONDAY}`,
      dueAt: at(SUNDAY, "20:30"),
      until: at(SUNDAY, "23:00"),
      title: "Tomorrow at the office: #001 Moroccan mint",
      body: "Pack the kit for 2 cups.",
      url: `/today?date=${MONDAY}&blend=001&from=push`,
    });
    expect(kinds(dueNotifications(officeKit, content, at(SUNDAY, "22:59")))).toEqual([`evening:${MONDAY}`]);
    expect(dueNotifications(officeKit, content, at(SUNDAY, "23:00"))).toEqual([]);
  });

  it("isn't sent once the kit is packed, nor for a home day that needs nothing that evening", () => {
    const packed = state({ picks: { [MONDAY]: pick(MONDAY, { packedAt: 5, packedCups: 3 }) } });
    expect(dueNotifications(packed, content, at(SUNDAY, "21:00"))).toEqual([]);
    const home = state({
      picks: { [THURSDAY]: pick(THURSDAY, { type: "home", tea: { kind: "blend", code: "101" } }) },
    });
    expect(dueNotifications(home, content, at("2026-11-25", "21:00"))).toEqual([]);
  });

  it("is sent for a blend to start that evening, home day or not", () => {
    const overnight = state({
      picks: { [THURSDAY]: pick(THURSDAY, { type: "home", tea: { kind: "blend", code: "031" } }) },
    });
    expect(dueNotifications(overnight, content, at("2026-11-25", "21:00"))).toMatchObject([
      { tag: `evening:${THURSDAY}`, title: "Start tonight: #031 Cold brew", body: "Tomorrow's tea steeps overnight." },
    ]);
  });

  it("runs past midnight when the evening time is late", () => {
    const late = {
      ...state({ picks: { [MONDAY]: pick(MONDAY) } }),
      settings: { ...state().settings, eveningTime: "22:00" },
    };
    expect(kinds(dueNotifications(late, content, at(MONDAY, "00:29")))).toEqual([`evening:${MONDAY}`]);
    expect(dueNotifications(late, content, at(MONDAY, "00:30"))).toEqual([]);
  });
});

describe("the morning push", () => {
  it("goes at 8:00 for a pending pick, for 2 hours", () => {
    const s = state({ picks: { [THURSDAY]: pick(THURSDAY, { type: "home", tea: { kind: "blend", code: "101" } }) } });
    expect(dueNotifications(s, content, at(THURSDAY, "07:59"))).toEqual([]);
    expect(dueNotifications(s, content, at(THURSDAY, "08:00"))).toMatchObject([
      { tag: `morning:${THURSDAY}`, title: "#101 Gongfu", body: "Today's tea is ready.", until: at(THURSDAY, "10:00") },
    ]);
    expect(dueNotifications(s, content, at(THURSDAY, "10:00"))).toEqual([]);
  });

  it("isn't sent for a pick made, skipped or cancelled", () => {
    for (const status of ["made", "skipped", "cancelled"] as const) {
      const s = state({ picks: { [MONDAY]: pick(MONDAY, { status }) } });
      expect(dueNotifications(s, content, at(MONDAY, "08:30")), status).toEqual([]);
    }
  });

  it("says when there is no kit, or nothing to make", () => {
    const noKit = state({
      picks: { [MONDAY]: pick(MONDAY, { source: "no-kit", tea: { kind: "plain", tea: "green-tea" } }) },
    });
    expect(dueNotifications(noKit, content, at(MONDAY, "08:00"))).toMatchObject([
      {
        title: "No kit today",
        body: "Brew a plain Green tea from the office's shelf.",
        url: `/today?date=${MONDAY}&from=push`,
      },
    ]);
    const nothing = state({ picks: { [MONDAY]: pick(MONDAY, { source: "fallback", tea: { kind: "none" } }) } });
    expect(dueNotifications(nothing, content, at(MONDAY, "08:00"))).toMatchObject([{ title: "No tea to make today" }]);
  });
});

describe("the review push", () => {
  it("goes on Saturday at 10:00 for 3 hours, unless the owner is away", () => {
    expect(dueNotifications(state(), content, at(SATURDAY, "10:00"))).toMatchObject([
      { tag: `review:${SATURDAY}`, url: `/review?date=${SATURDAY}&from=push`, until: at(SATURDAY, "13:00") },
    ]);
    expect(dueNotifications(state(), content, at(SATURDAY, "13:00"))).toEqual([]);
    expect(dueNotifications(state(), content, at("2026-11-27", "10:00"))).toEqual([]);
    const away = { ...state(), away: [{ id: "trip", from: SATURDAY, to: SATURDAY }] };
    expect(dueNotifications(away, content, at(SATURDAY, "10:00"))).toEqual([]);
  });
});

describe("notifications off", () => {
  it("sends nothing, while the draws still happen", () => {
    const off = state({ settings: { notifications: false }, pantry: { "black-tea": have() } });
    expect(dueNotifications({ ...off, picks: { [MONDAY]: pick(MONDAY) } }, content, at(SUNDAY, "20:30"))).toEqual([]);
    expect(drawDue(off, content, at(SUNDAY, "20:30")).state.picks[MONDAY]).toBeDefined();
  });
});

describe("the clock changes in Paris", () => {
  it("keeps the wall-clock times on both sides of each change", () => {
    // Spring: Sunday 2026-03-29 loses 02:00–03:00. Autumn: Sunday 2026-10-25 repeats it.
    const spring = state({ picks: { "2026-03-30": pick("2026-03-30") } });
    expect(dueNotifications(spring, content, Date.parse("2026-03-29T18:30:00Z"))).toMatchObject([
      { tag: "evening:2026-03-30" },
    ]);
    expect(dueNotifications(spring, content, Date.parse("2026-03-30T06:00:00Z"))).toMatchObject([
      { tag: "morning:2026-03-30" },
    ]);
    const autumn = state({ picks: { "2026-10-26": pick("2026-10-26") } });
    expect(dueNotifications(autumn, content, Date.parse("2026-10-25T19:30:00Z"))).toMatchObject([
      { tag: "evening:2026-10-26" },
    ]);
    expect(dueNotifications(autumn, content, Date.parse("2026-10-25T19:29:00Z"))).toEqual([]);
    expect(dueNotifications(autumn, content, Date.parse("2026-10-26T07:00:00Z"))).toMatchObject([
      { tag: "morning:2026-10-26" },
    ]);
  });
});

describe("revealsAt (SPEC §2.2)", () => {
  const s = state();
  it("keeps a home-day blend a surprise until the morning time, unless it starts the evening before", () => {
    expect(revealsAt(pick(THURSDAY, { type: "home", tea: { kind: "blend", code: "101" } }), s, content)).toBe(
      at(THURSDAY, "08:00"),
    );
    expect(revealsAt(pick(THURSDAY, { type: "home", tea: { kind: "blend", code: "031" } }), s, content)).toBeNull();
    expect(revealsAt(pick(MONDAY), s, content)).toBeNull();
  });
});

describe("a simulated year in Europe/Paris", () => {
  it("draws every tea day the evening before, pushes each at its wall-clock time, and keeps the draw's rules", () => {
    const year = catalog([
      ...["001", "002", "003", "004", "005", "006"].map((code) => blend(code)),
      ...["101", "102", "103", "104"].map((code) => blend(code, { mode: "experimental" })),
      blend("105", { mode: "experimental", prep: "evening" }),
    ]);
    let s: State = state({
      pantry: { "black-tea": have() },
      away: [{ id: "summer", from: "2026-08-03", to: "2026-08-14" }],
      overrides: { "2026-05-06": "home", "2026-05-07": "office" },
    });
    let brewNumber = 0;
    for (let date = "2026-01-01"; date <= "2026-12-31"; date = addDays(date, 1)) {
      const type = teaDayType(date, weekOf(s));
      // Morning: like the notifier, draw what is due (only 1 January, the first day, was missed), then
      // push for the tea day at 08:00 Paris time, whatever the season.
      if (type !== null) {
        s = drawDue(s, year, at(date, "08:00")).state;
        const due = dueNotifications(s, year, at(date, "08:00"));
        expect(kinds(due), date).toContain(`morning:${date}`);
        expect(due.find((n) => n.kind === "morning")?.dueAt).toBe(at(date, "08:00"));
        // Noon: Made it, rated 3 to 5, so no blend leaves for good: with 5 home blends and a 21-day
        // cooldown, the home draws have to relax the cooldown.
        const tea = s.picks[date]!.tea;
        if (tea.kind === "blend") {
          brewNumber++;
          const made = command<BrewLogged>(
            "brew.logged",
            { brew: uuid(brewNumber), tea, cups: 1, date, pick: date, rating: (3 + (brewNumber % 3)) as 3 },
            at(date, "12:00"),
          );
          const applied = applyCommand(s, made, year, at(date, "12:00"));
          expect(applied.result.ok, date).toBe(true);
          s = applied.state;
        }
      }
      // Evening: the draw for the next tea day, and the push when it needs the owner.
      const next = addDays(date, 1);
      s = drawDue(s, year, at(date, "20:30")).state;
      const nextType = teaDayType(next, weekOf(s));
      if (nextType === null) {
        expect(s.picks[next], next).toBeUndefined();
        continue;
      }
      const nextPick = s.picks[next]!;
      expect(nextPick, next).toMatchObject({ type: nextType, drawnAt: at(date, "20:30"), source: "draw" });
      if (nextPick.tea.kind === "blend") expect(year.blendByCode.get(nextPick.tea.code)!.mode).toBe(poolOf(nextType));
      const evening = dueNotifications(s, year, at(date, "20:30")).filter((n) => n.kind === "evening");
      const needsEvening =
        nextType === "office" ||
        (nextPick.tea.kind === "blend" && year.blendByCode.get(nextPick.tea.code)!.prep === "evening");
      expect(evening.length, next).toBe(needsEvening ? 1 : 0);
    }
    // Every tea day of the year was drawn and made, and New Year's Day 2027 drawn on the last evening.
    // The weekends and the away days have no pick.
    const picks = Object.values(s.picks).filter((p) => p.date < "2027-01-01");
    expect(picks.filter((p) => p.status !== "made").map((p) => `${p.date} ${p.source} ${p.tea.kind}`)).toEqual([]);
    expect(s.picks["2027-01-01"]?.status).toBe("pending");
    expect(picks.some((p) => isWeekend(p.date) || (p.date >= "2026-08-03" && p.date <= "2026-08-14"))).toBe(false);
    expect(s.picks["2026-05-06"]?.type).toBe("home");
    expect(s.picks["2026-05-07"]?.type).toBe("office");
    expect(Object.keys(s.brews)).toHaveLength(picks.length);
  });
});
