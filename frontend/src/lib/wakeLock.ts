/**
 * Keeping the screen on while a timer runs (SPEC §3.8; ported from EagleEye): the Screen Wake Lock
 * API. The browser drops the lock when the page is hidden; it is taken again when the page shows.
 * Where the API isn't there, the screen may lock, and the timer still counts from the clock.
 */
import { useEffect } from "react";

type Sentinel = { readonly released: boolean; release(): Promise<void> };

export function useWakeLock(active: boolean): void {
  useEffect(() => {
    const wakeLock = (navigator as Navigator & { wakeLock?: { request(type: "screen"): Promise<Sentinel> } }).wakeLock;
    if (!active || !wakeLock) return;
    let lock: Sentinel | undefined;
    let over = false;
    const take = () => {
      if (document.visibilityState !== "visible" || (lock !== undefined && !lock.released)) return;
      void wakeLock
        .request("screen")
        .then((sentinel) => {
          if (over) void sentinel.release();
          else lock = sentinel;
        })
        .catch(() => undefined);
    };
    take();
    document.addEventListener("visibilitychange", take);
    return () => {
      over = true;
      document.removeEventListener("visibilitychange", take);
      if (lock && !lock.released) void lock.release().catch(() => undefined);
    };
  }, [active]);
}
