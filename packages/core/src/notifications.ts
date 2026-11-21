/**
 * Notifications (SPEC §2.7): which pushes are due now, rebuilt from the state at each pass of the
 * notifier, never stored ahead of time. The server records what it sent; this says what should go.
 */
import type { Catalog } from "./catalog.js";
import { isAway, teaDayType } from "./calendar.js";
import { pickCups } from "./draw.js";
import { type PickRecord, type State, weekOf } from "./state/types.js";
import { addDays, isoWeekday } from "./time/dates.js";
import { instantAt, minutesOf, wallClockAt } from "./time/zone.js";

export const NOTIFICATION_KINDS = ["evening", "morning", "review"] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

/** How long after its time a push may still go: past it, it is skipped (SPEC §2.7). */
export const GRACE_MS: { readonly [K in NotificationKind]: number } = {
  evening: 150 * 60_000,
  morning: 120 * 60_000,
  review: 180 * 60_000,
};

export interface DueNotification {
  readonly kind: NotificationKind;
  /** The tea day it is about (for the evening push, the day after it is sent), or the review's Saturday. */
  readonly date: string;
  /** `kind:date`: a duplicate replaces the first push instead of showing twice. */
  readonly tag: string;
  readonly dueAt: number;
  /** The end of its grace window: the push's TTL is what's left until then. */
  readonly until: number;
  readonly title: string;
  readonly body: string;
  /** Where a tap opens the app: the date and blend travel with it, so it works offline (SPEC §2.7). */
  readonly url: string;
}

const SATURDAY = 6;

const cupsText = (cups: number) => (cups === 1 ? "1 cup" : `${cups} cups`);

function teaLabel(pick: PickRecord, catalog: Catalog): string {
  if (pick.tea.kind === "blend") {
    const blend = catalog.blendByCode.get(pick.tea.code);
    return blend ? `#${blend.code} ${blend.name}` : `#${pick.tea.code}`;
  }
  if (pick.tea.kind === "plain") return `Plain tea: ${catalog.ingredientById.get(pick.tea.tea)?.name ?? pick.tea.tea}`;
  return "No tea";
}

function todayUrl(pick: PickRecord): string {
  const blend = pick.tea.kind === "blend" ? `&blend=${pick.tea.code}` : "";
  return `/today?date=${pick.date}${blend}&from=push`;
}

/** A blend that has to be started the evening before (a cold brew). */
function startsTheEveningBefore(pick: PickRecord, catalog: Catalog): boolean {
  return pick.tea.kind === "blend" && catalog.blendByCode.get(pick.tea.code)?.prep === "evening";
}

/** An office kit still to pack: a tea from the pantry, drawn but not marked Packed. */
function kitToPack(pick: PickRecord): boolean {
  return pick.type === "office" && pick.tea.kind !== "none" && pick.source !== "no-kit" && pick.packedAt === null;
}

/** The evening push for tea day `date`, sent the calendar day before: only when that evening needs the owner. */
function evening(state: State, catalog: Catalog, date: string) {
  const pick = state.picks[date];
  if (!pick || pick.status !== "pending" || teaDayType(date, weekOf(state)) === null) return null;
  const pack = kitToPack(pick);
  const start = startsTheEveningBefore(pick, catalog);
  if (!pack && !start) return null;
  const label = teaLabel(pick, catalog);
  const cups = cupsText(pickCups(pick, state.settings));
  return {
    title: pack ? `Tomorrow at the office: ${label}` : `Start tonight: ${label}`,
    body: pack
      ? start
        ? `Start it tonight, and pack the kit for ${cups}.`
        : `Pack the kit for ${cups}.`
      : "Tomorrow's tea steeps overnight.",
    url: todayUrl(pick),
    at: [addDays(date, -1), state.settings.eveningTime] as const,
  };
}

/** The morning push for tea day `date`, unless its pick is already made, skipped or cancelled. */
function morning(state: State, catalog: Catalog, date: string) {
  const pick = state.picks[date];
  if (!pick || pick.status !== "pending") return null;
  const at = [date, state.settings.morningTime] as const;
  if (pick.source === "no-kit") {
    const tea = pick.tea.kind === "plain" ? catalog.ingredientById.get(pick.tea.tea)?.name : undefined;
    return {
      title: "No kit today",
      body: tea ? `Brew a plain ${tea} from the office's shelf.` : "There's no tea kept at the office.",
      url: todayUrl(pick),
      at,
    };
  }
  if (pick.tea.kind === "none")
    return { title: "No tea to make today", body: "See what to buy.", url: todayUrl(pick), at };
  return {
    title: teaLabel(pick, catalog),
    body:
      pick.type === "office"
        ? `Today's office tea, for ${cupsText(pickCups(pick, state.settings))}.`
        : "Today's tea is ready.",
    url: todayUrl(pick),
    at,
  };
}

/** The Saturday review's push, unless the owner is away. */
function review(state: State, date: string) {
  if (isoWeekday(date) !== SATURDAY || isAway(date, state)) return null;
  return {
    title: "The week's review",
    body: "Rate the week's teas, and see what to restock.",
    url: `/review?date=${date}&from=push`,
    at: [date, state.settings.reviewTime] as const,
  };
}

/**
 * The pushes due at `now`: past their time and within their grace window, for a pick in the state
 * that still needs them. Nothing when notifications are off; the draws happen anyway (drawDue).
 */
export function dueNotifications(state: State, catalog: Catalog, now: number): DueNotification[] {
  if (!state.settings.notifications) return [];
  const { timeZone } = state.settings;
  const today = wallClockAt(now, timeZone).date;
  const due: DueNotification[] = [];
  // A window can start the evening before and run past midnight: yesterday and tomorrow are looked at too.
  for (const date of [addDays(today, -1), today, addDays(today, 1)]) {
    const plans = {
      evening: evening(state, catalog, date),
      morning: morning(state, catalog, date),
      review: review(state, date),
    };
    for (const kind of NOTIFICATION_KINDS) {
      const plan = plans[kind];
      if (!plan) continue;
      const [day, time] = plan.at;
      const dueAt = instantAt(day, minutesOf(time), timeZone);
      const until = dueAt + GRACE_MS[kind];
      if (now < dueAt || now >= until) continue;
      due.push({ kind, date, tag: `${kind}:${date}`, dueAt, until, title: plan.title, body: plan.body, url: plan.url });
    }
  }
  return due.sort((a, b) => a.dueAt - b.dueAt);
}

/**
 * When a pick's tea may be shown (SPEC §2.2): a home-day blend is a surprise until the morning
 * time, unless it has to be started the evening before. Null: it shows at once. Opening the app
 * from the day's push shows it whatever the time; that is the app's to know.
 */
export function revealsAt(pick: PickRecord, state: State, catalog: Catalog): number | null {
  if (pick.type !== "home" || pick.tea.kind !== "blend" || startsTheEveningBefore(pick, catalog)) return null;
  return instantAt(pick.date, minutesOf(state.settings.morningTime), state.settings.timeZone);
}
