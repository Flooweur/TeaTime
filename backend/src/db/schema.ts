/**
 * The tables (SPEC §3.6). The owner's state is stored as rows, one per key of core's `State`, so a
 * command writes only what it touched (state/rows.ts). Times are Unix milliseconds; dates are
 * `YYYY-MM-DD` text. A field merged last-writer-wins has its own `…_at` column. The CHECK
 * constraints hold what core's types promise, so a bug can't store what the reducer can't read.
 *
 * A change here needs a migration: `npm run db:generate -w backend` (drizzle.config.ts).
 */
import { sql } from "drizzle-orm";
import { type AnySQLiteColumn, check, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** Counters: the state's `revision`, and the next away period's place in the list. */
export const meta = sqliteTable("meta", {
  key: text().primaryKey(),
  value: integer().notNull(),
});

/** One row per setting of core's `Settings`, its value as JSON. A missing row is the default. */
export const settings = sqliteTable("settings", {
  key: text().primaryKey(),
  value: text().notNull(),
});

export const dayOverrides = sqliteTable(
  "day_overrides",
  {
    date: text().primaryKey(),
    type: text().notNull(),
  },
  (t) => [check("day_overrides_type", sql`${t.type} in ('office', 'home')`)],
);

export const awayPeriods = sqliteTable(
  "away_periods",
  {
    id: text().primaryKey(),
    /** Its place in the list: the state keeps the periods in the order they were added. */
    seq: integer().notNull(),
    from: text("from_date").notNull(),
    to: text("to_date").notNull(),
  },
  (t) => [check("away_periods_range", sql`${t.from} <= ${t.to}`)],
);

/** One row per ingredient (or piece of gear) the owner has set anything for. */
export const pantry = sqliteTable(
  "pantry",
  {
    id: text().primaryKey(),
    have: integer({ mode: "boolean" }).notNull(),
    haveAt: integer("have_at").notNull(),
    /** What is left, in the ingredient's unit; null when it isn't tracked. */
    amount: real(),
    amountAt: integer("amount_at").notNull(),
    openedOn: text("opened_on"),
    openedOnAt: integer("opened_on_at").notNull(),
    atOffice: integer("at_office", { mode: "boolean" }).notNull(),
    atOfficeAt: integer("at_office_at").notNull(),
  },
  (t) => [check("pantry_amount", sql`${t.amount} is null or ${t.amount} >= 0`)],
);

/** A blend, a plain tea, or nothing: exactly the columns its kind needs. */
const TEA_KINDS = (kind: AnySQLiteColumn, blend: AnySQLiteColumn, plainTea: AnySQLiteColumn, withNone: boolean) =>
  withNone
    ? sql`(${kind} = 'blend' and ${blend} is not null and ${plainTea} is null)
       or (${kind} = 'plain' and ${plainTea} is not null and ${blend} is null)
       or (${kind} = 'none' and ${blend} is null and ${plainTea} is null)`
    : sql`(${kind} = 'blend' and ${blend} is not null and ${plainTea} is null)
       or (${kind} = 'plain' and ${plainTea} is not null and ${blend} is null)`;

/** One pick per tea day (SPEC §2.4). */
export const picks = sqliteTable(
  "picks",
  {
    date: text().primaryKey(),
    type: text().notNull(),
    teaKind: text("tea_kind").notNull(),
    blend: text(),
    plainTea: text("plain_tea"),
    source: text().notNull(),
    unlock: text(),
    attempt: integer().notNull(),
    drawnAt: integer("drawn_at").notNull(),
    swappedFrom: text("swapped_from"),
    swappedAt: integer("swapped_at"),
    status: text().notNull(),
    statusAt: integer("status_at").notNull(),
    packedAt: integer("packed_at"),
    packedCups: integer("packed_cups"),
    brew: text(),
  },
  (t) => [
    check("picks_type", sql`${t.type} in ('office', 'home')`),
    check("picks_tea", TEA_KINDS(t.teaKind, t.blend, t.plainTea, true)),
    check("picks_source", sql`${t.source} in ('draw', 'fallback', 'no-kit')`),
    check("picks_status", sql`${t.status} in ('pending', 'made', 'skipped', 'cancelled')`),
    check("picks_attempt", sql`${t.attempt} >= 0`),
    check("picks_packed", sql`(${t.packedAt} is null) = (${t.packedCups} is null)`),
  ],
);

/** Each cup made (SPEC §2.4). `takes` is what it took off the pantry, as JSON, so an undo puts back exactly that. */
export const brews = sqliteTable(
  "brews",
  {
    id: text().primaryKey(),
    date: text().notNull(),
    at: integer().notNull(),
    teaKind: text("tea_kind").notNull(),
    blend: text(),
    plainTea: text("plain_tea"),
    cups: integer().notNull(),
    /** The date of the pick it made; null for I made this. A pick is made by one brew at most. */
    pick: text().unique(),
    office: integer({ mode: "boolean" }).notNull(),
    rating: integer(),
    ratingAt: integer("rating_at").notNull(),
    colleagueRating: integer("colleague_rating"),
    colleagueRatingAt: integer("colleague_rating_at").notNull(),
    takes: text().notNull(),
  },
  (t) => [
    check("brews_tea", TEA_KINDS(t.teaKind, t.blend, t.plainTea, false)),
    check("brews_cups", sql`${t.cups} >= 1`),
    check("brews_rating", sql`${t.rating} is null or ${t.rating} between 1 and 5`),
    check("brews_colleague_rating", sql`${t.colleagueRating} is null or ${t.colleagueRating} between 1 and 5`),
  ],
);

/** ★, make again and Not for me, by blend code. */
export const blendMarks = sqliteTable("blend_marks", {
  code: text().primaryKey(),
  favourite: integer({ mode: "boolean" }).notNull(),
  favouriteAt: integer("favourite_at").notNull(),
  makeAgain: integer("make_again", { mode: "boolean" }).notNull(),
  makeAgainAt: integer("make_again_at").notNull(),
  notForMe: integer("not_for_me", { mode: "boolean" }).notNull(),
  notForMeAt: integer("not_for_me_at").notNull(),
});

/** Every command the server has decided (SPEC §3.3): a resend gets the same result and changes nothing. */
export const appliedCommands = sqliteTable("applied_commands", {
  id: text().primaryKey(),
  type: text().notNull(),
  /** The server's time when it arrived. */
  receivedAt: integer("received_at").notNull(),
  /** Core's `CommandResult`, as JSON. */
  result: text().notNull(),
});

/** The devices' push subscriptions (EagleEye's shape): on until their push service says they're gone. */
export const pushSubscriptions = sqliteTable(
  "push_subscriptions",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    endpoint: text().notNull().unique(),
    p256dh: text().notNull(),
    auth: text().notNull(),
    createdAt: integer("created_at").notNull(),
    lastSuccessAt: integer("last_success_at"),
    /** Sends that failed in a row, without the service saying the subscription is gone. */
    failures: integer().notNull().default(0),
    disabledAt: integer("disabled_at"),
  },
  (t) => [check("push_subscriptions_failures", sql`${t.failures} >= 0`)],
);

/** One row per push kind and date (SPEC §2.7): whether it went, so each is sent once. */
export const notifications = sqliteTable(
  "notifications",
  {
    kind: text().notNull(),
    date: text().notNull(),
    status: text().notNull(),
    attempts: integer().notNull(),
    updatedAt: integer("updated_at").notNull(),
    sentAt: integer("sent_at"),
  },
  (t) => [
    primaryKey({ columns: [t.kind, t.date] }),
    check("notifications_kind", sql`${t.kind} in ('evening', 'morning', 'review')`),
    check("notifications_status", sql`${t.status} in ('sending', 'sent', 'failed')`),
  ],
);
