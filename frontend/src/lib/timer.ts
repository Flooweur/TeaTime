/**
 * The infusion timers (SPEC §3.8): they count from the wall clock, so they resume after a reload or
 * a tap on a push, and each is kept on the device by its key (the day, the tea, the step, the
 * infusion). The arithmetic is pure; the store keeps them in localStorage.
 */
import { createStore, useStore } from "./store";

export interface Timer {
  readonly durationMs: number;
  /** When it last started running, in Unix milliseconds; null while stopped. */
  readonly startedAt: number | null;
  /** The time it ran before its last start. */
  readonly elapsedMs: number;
  /** When it reached zero, once the app saw it: the chime plays once. */
  readonly doneAt: number | null;
  /** When it was last touched: old ones are dropped. */
  readonly touchedAt: number;
}

export type TimerStatus = "idle" | "running" | "paused" | "done";

export const newTimer = (durationMs: number, now: number): Timer => ({
  durationMs,
  startedAt: null,
  elapsedMs: 0,
  doneAt: null,
  touchedAt: now,
});

export function elapsedOf(timer: Timer, now: number): number {
  return timer.elapsedMs + (timer.startedAt === null ? 0 : Math.max(0, now - timer.startedAt));
}

export function remainingOf(timer: Timer, now: number): number {
  return Math.max(0, timer.durationMs - elapsedOf(timer, now));
}

export function statusOf(timer: Timer | undefined, now: number): TimerStatus {
  if (!timer) return "idle";
  if (timer.doneAt !== null || remainingOf(timer, now) === 0) return "done";
  if (timer.startedAt !== null) return "running";
  return timer.elapsedMs > 0 ? "paused" : "idle";
}

export const startTimer = (timer: Timer, now: number): Timer =>
  timer.startedAt !== null || statusOf(timer, now) === "done" ? timer : { ...timer, startedAt: now, touchedAt: now };

export const pauseTimer = (timer: Timer, now: number): Timer =>
  timer.startedAt === null ? timer : { ...timer, startedAt: null, elapsedMs: elapsedOf(timer, now), touchedAt: now };

/** Marks it done, once it has run out. */
export const finishTimer = (timer: Timer, now: number): Timer =>
  timer.doneAt !== null
    ? timer
    : { ...timer, startedAt: null, elapsedMs: timer.durationMs, doneAt: now, touchedAt: now };

/** "3:05", "0:42", rounding up so it never shows 0:00 while time is left. */
export function clock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** A duration in words for a button: "3 min", "45 s", "1 min 30 s", "9 h". */
export function spoken(seconds: number): string {
  if (seconds >= 3600 && seconds % 3600 === 0) return `${seconds / 3600} h`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} s`;
  return s === 0 ? `${m} min` : `${m} min ${s} s`;
}

const KEY = "teatime.timers";
/** A timer untouched for two days is dropped. */
const KEEP_MS = 2 * 86_400_000;

function load(now: number): Record<string, Timer> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, Timer>;
    return Object.fromEntries(Object.entries(raw).filter(([, t]) => now - t.touchedAt < KEEP_MS));
  } catch {
    return {};
  }
}

const timers = createStore<Readonly<Record<string, Timer>>>(
  typeof localStorage === "undefined" ? {} : load(Date.now()),
);

function save(next: Readonly<Record<string, Timer>>) {
  timers.set(next);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage refused: the timers run until the page is closed.
  }
}

export function setTimer(key: string, timer: Timer | null): void {
  const next = { ...timers.get() };
  if (timer) next[key] = timer;
  else delete next[key];
  save(next);
}

export const useTimers = (): Readonly<Record<string, Timer>> => useStore(timers);

/** Whether any timer is running: the screen stays on meanwhile. */
export const anyRunning = (all: Readonly<Record<string, Timer>>, now: number): boolean =>
  Object.values(all).some((t) => statusOf(t, now) === "running");
