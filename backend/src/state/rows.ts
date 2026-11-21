/**
 * Core's `State` as rows, and back (SPEC §3.3, §3.6). `loadState` reads every row into a state;
 * `saveTouched` writes only the keys a change touched: a touched key still in the state is
 * written, one gone from it is deleted. test/rows.test.ts holds the round trip: a state saved then
 * loaded is the same state.
 */
import {
  type AwayPeriod,
  type BrewRecord,
  DEFAULT_SETTINGS,
  type DayType,
  type Marks,
  type PantryEntry,
  type PickRecord,
  type PickSource,
  type PickStatus,
  type PickTea,
  type Rating,
  type Settings,
  type State,
  type Take,
  type Tea,
  type Touched,
  parseSettingsPatch,
} from "@teatime/core";
import { eq, inArray, max } from "drizzle-orm";
import type { Conn } from "../db/client.js";
import * as t from "../db/schema.js";

type PickRow = typeof t.picks.$inferSelect;
type BrewRow = typeof t.brews.$inferSelect;
type PantryRow = typeof t.pantry.$inferSelect;
type MarksRow = typeof t.blendMarks.$inferSelect;

/** A tea as the three columns its kind needs. */
function teaColumns(tea: PickTea) {
  return {
    teaKind: tea.kind,
    blend: tea.kind === "blend" ? tea.code : null,
    plainTea: tea.kind === "plain" ? tea.tea : null,
  };
}

function pickTeaOf(row: { teaKind: string; blend: string | null; plainTea: string | null }): PickTea {
  if (row.teaKind === "blend" && row.blend !== null) return { kind: "blend", code: row.blend };
  if (row.teaKind === "plain" && row.plainTea !== null) return { kind: "plain", tea: row.plainTea };
  if (row.teaKind === "none") return { kind: "none" };
  throw new Error(`A stored tea of kind "${row.teaKind}" lacks its column`);
}

function teaOf(row: BrewRow): Tea {
  const tea = pickTeaOf(row);
  if (tea.kind === "none") throw new Error("A stored brew has no tea");
  return tea;
}

export function pickToRow(pick: PickRecord): PickRow {
  return {
    date: pick.date,
    type: pick.type,
    ...teaColumns(pick.tea),
    source: pick.source,
    unlock: pick.unlock,
    attempt: pick.attempt,
    drawnAt: pick.drawnAt,
    swappedFrom: pick.swappedFrom,
    swappedAt: pick.swappedAt,
    status: pick.status,
    statusAt: pick.statusAt,
    packedAt: pick.packedAt,
    packedCups: pick.packedCups,
    brew: pick.brew,
  };
}

export function pickFromRow(row: PickRow): PickRecord {
  return {
    date: row.date,
    type: row.type as DayType,
    tea: pickTeaOf(row),
    source: row.source as PickSource,
    unlock: row.unlock,
    attempt: row.attempt,
    drawnAt: row.drawnAt,
    swappedFrom: row.swappedFrom,
    swappedAt: row.swappedAt,
    status: row.status as PickStatus,
    statusAt: row.statusAt,
    packedAt: row.packedAt,
    packedCups: row.packedCups,
    brew: row.brew,
  };
}

export function brewToRow(brew: BrewRecord): BrewRow {
  return {
    id: brew.id,
    date: brew.date,
    at: brew.at,
    ...teaColumns(brew.tea),
    cups: brew.cups,
    pick: brew.pick,
    office: brew.office,
    rating: brew.rating.value,
    ratingAt: brew.rating.at,
    colleagueRating: brew.colleagueRating.value,
    colleagueRatingAt: brew.colleagueRating.at,
    takes: JSON.stringify(brew.takes),
  };
}

export function brewFromRow(row: BrewRow): BrewRecord {
  return {
    id: row.id,
    date: row.date,
    at: row.at,
    tea: teaOf(row),
    cups: row.cups,
    pick: row.pick,
    office: row.office,
    rating: { value: row.rating as Rating | null, at: row.ratingAt },
    colleagueRating: { value: row.colleagueRating as Rating | null, at: row.colleagueRatingAt },
    takes: JSON.parse(row.takes) as Take[],
  };
}

export function pantryToRow(id: string, entry: PantryEntry): PantryRow {
  return {
    id,
    have: entry.have.value,
    haveAt: entry.have.at,
    amount: entry.amount.value,
    amountAt: entry.amount.at,
    openedOn: entry.openedOn.value,
    openedOnAt: entry.openedOn.at,
    atOffice: entry.atOffice.value,
    atOfficeAt: entry.atOffice.at,
  };
}

export function pantryFromRow(row: PantryRow): PantryEntry {
  return {
    have: { value: row.have, at: row.haveAt },
    amount: { value: row.amount, at: row.amountAt },
    openedOn: { value: row.openedOn, at: row.openedOnAt },
    atOffice: { value: row.atOffice, at: row.atOfficeAt },
  };
}

export function marksToRow(code: string, marks: Marks): MarksRow {
  return {
    code,
    favourite: marks.favourite.value,
    favouriteAt: marks.favourite.at,
    makeAgain: marks.makeAgain.value,
    makeAgainAt: marks.makeAgain.at,
    notForMe: marks.notForMe.value,
    notForMeAt: marks.notForMe.at,
  };
}

export function marksFromRow(row: MarksRow): Marks {
  return {
    favourite: { value: row.favourite, at: row.favouriteAt },
    makeAgain: { value: row.makeAgain, at: row.makeAgainAt },
    notForMe: { value: row.notForMe, at: row.notForMeAt },
  };
}

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[];

/**
 * The settings from their rows. A missing row is the default; so is a stored value the current
 * rules refuse (a setting whose rule tightened in a later version), which `warn` is told of.
 */
function loadSettings(conn: Conn, warn: (message: string) => void): Settings {
  const stored = new Map(
    conn
      .select()
      .from(t.settings)
      .all()
      .map((row) => [row.key, row.value]),
  );
  const settings: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const key of SETTING_KEYS) {
    const text = stored.get(key);
    if (text === undefined) continue;
    const value: unknown = JSON.parse(text);
    if (parseSettingsPatch({ [key]: value }).ok) settings[key] = value;
    else warn(`The stored setting "${key}" no longer holds: its default is used`);
  }
  return settings as unknown as Settings;
}

/** The whole state, from every row. */
export function loadState(conn: Conn, warn: (message: string) => void = () => {}): State {
  const settings = loadSettings(conn, warn);
  const overrides: Record<string, DayType> = {};
  for (const row of conn.select().from(t.dayOverrides).all()) overrides[row.date] = row.type as DayType;
  const away: AwayPeriod[] = conn
    .select()
    .from(t.awayPeriods)
    .orderBy(t.awayPeriods.seq, t.awayPeriods.id)
    .all()
    .map((row) => ({ id: row.id, from: row.from, to: row.to }));
  const pantry: Record<string, PantryEntry> = {};
  for (const row of conn.select().from(t.pantry).all()) pantry[row.id] = pantryFromRow(row);
  const picks: Record<string, PickRecord> = {};
  for (const row of conn.select().from(t.picks).all()) picks[row.date] = pickFromRow(row);
  const brews: Record<string, BrewRecord> = {};
  for (const row of conn.select().from(t.brews).all()) brews[row.id] = brewFromRow(row);
  const marks: Record<string, Marks> = {};
  for (const row of conn.select().from(t.blendMarks).all()) marks[row.code] = marksFromRow(row);
  return { settings, overrides, away, pantry, picks, brews, marks };
}

/** Every setting, written whole: a settings change is rare and small. */
function saveSettings(conn: Conn, settings: Settings) {
  for (const key of SETTING_KEYS) {
    const value = JSON.stringify(settings[key]);
    conn.insert(t.settings).values({ key, value }).onConflictDoUpdate({ target: t.settings.key, set: { value } }).run();
  }
}

/** The touched keys split into those to write and those gone from the state. */
function split<V>(keys: readonly string[], valueOf: (key: string) => V | undefined) {
  const write: [string, V][] = [];
  const gone: string[] = [];
  for (const key of keys) {
    const value = valueOf(key);
    if (value === undefined) gone.push(key);
    else write.push([key, value]);
  }
  return { write, gone };
}

const own = <V>(record: Readonly<Record<string, V>>, key: string): V | undefined =>
  Object.hasOwn(record, key) ? record[key] : undefined;

/**
 * Writes what a change touched (core's `Touched`). Each table's deletes come before its writes, so
 * a brew removed and another logged for the same pick never meet on the pick's unique column.
 */
export function saveTouched(conn: Conn, state: State, touched: Touched): void {
  if (touched.settings) saveSettings(conn, state.settings);

  const overrides = split(touched.overrides, (date) => own(state.overrides, date));
  if (overrides.gone.length) conn.delete(t.dayOverrides).where(inArray(t.dayOverrides.date, overrides.gone)).run();
  for (const [date, type] of overrides.write) {
    conn
      .insert(t.dayOverrides)
      .values({ date, type })
      .onConflictDoUpdate({ target: t.dayOverrides.date, set: { type } })
      .run();
  }

  const away = split(touched.away, (id) => state.away.find((period) => period.id === id));
  if (away.gone.length) conn.delete(t.awayPeriods).where(inArray(t.awayPeriods.id, away.gone)).run();
  for (const [id, period] of away.write) {
    const existing = conn.select({ seq: t.awayPeriods.seq }).from(t.awayPeriods).where(eq(t.awayPeriods.id, id)).get();
    if (existing) {
      conn.update(t.awayPeriods).set({ from: period.from, to: period.to }).where(eq(t.awayPeriods.id, id)).run();
    } else {
      // A new period goes after every other, as core appends it.
      const last =
        conn
          .select({ seq: max(t.awayPeriods.seq) })
          .from(t.awayPeriods)
          .get()?.seq ?? -1;
      conn
        .insert(t.awayPeriods)
        .values({ id, seq: last + 1, from: period.from, to: period.to })
        .run();
    }
  }

  const pantry = split(touched.pantry, (id) => own(state.pantry, id));
  if (pantry.gone.length) conn.delete(t.pantry).where(inArray(t.pantry.id, pantry.gone)).run();
  for (const [id, entry] of pantry.write) {
    const row = pantryToRow(id, entry);
    conn.insert(t.pantry).values(row).onConflictDoUpdate({ target: t.pantry.id, set: row }).run();
  }

  const picks = split(touched.picks, (date) => own(state.picks, date));
  if (picks.gone.length) conn.delete(t.picks).where(inArray(t.picks.date, picks.gone)).run();
  for (const [, pick] of picks.write) {
    const row = pickToRow(pick);
    conn.insert(t.picks).values(row).onConflictDoUpdate({ target: t.picks.date, set: row }).run();
  }

  const brews = split(touched.brews, (id) => own(state.brews, id));
  if (brews.gone.length) conn.delete(t.brews).where(inArray(t.brews.id, brews.gone)).run();
  for (const [, brew] of brews.write) {
    const row = brewToRow(brew);
    conn.insert(t.brews).values(row).onConflictDoUpdate({ target: t.brews.id, set: row }).run();
  }

  const marks = split(touched.marks, (code) => own(state.marks, code));
  if (marks.gone.length) conn.delete(t.blendMarks).where(inArray(t.blendMarks.code, marks.gone)).run();
  for (const [code, value] of marks.write) {
    const row = marksToRow(code, value);
    conn.insert(t.blendMarks).values(row).onConflictDoUpdate({ target: t.blendMarks.code, set: row }).run();
  }
}

/** The state's revision: one more for each change stored. 0 for a database nothing was stored in. */
export function readRevision(conn: Conn): number {
  return conn.select({ value: t.meta.value }).from(t.meta).where(eq(t.meta.key, "revision")).get()?.value ?? 0;
}

/** Counts one more change, and returns the new revision. */
export function bumpRevision(conn: Conn): number {
  const next = readRevision(conn) + 1;
  conn
    .insert(t.meta)
    .values({ key: "revision", value: next })
    .onConflictDoUpdate({ target: t.meta.key, set: { value: next } })
    .run();
  return next;
}
