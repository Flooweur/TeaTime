/**
 * The time the screens show: the device's clock, read in the owner's time zone (a setting) through
 * core, so "today" is the owner's date wherever the phone thinks it is.
 */
import { type WallClock, wallClockAt } from "@teatime/core";
import { useEffect, useState } from "react";

/** The owner's date and minutes at `now`. */
export const localAt = (now: number, timeZone: string): WallClock => wallClockAt(now, timeZone);

/**
 * The time now, re-rendered every `everyMs` and whenever the app comes back to the front (a phone
 * woken in the morning shows the morning at once).
 */
export function useNow(everyMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, everyMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [everyMs]);
  return now;
}

const WEEKDAY = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MONTH = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "Monday 23 November", for a `YYYY-MM-DD` date. */
export function longDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  const weekday = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
  return `${WEEKDAY[weekday]} ${d} ${MONTH[m - 1]}`;
}

/** "Monday", for a `YYYY-MM-DD` date. */
export function weekdayOf(date: string): string {
  return longDate(date).split(" ")[0] as string;
}
