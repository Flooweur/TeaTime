/**
 * One timer (SPEC §3.8; docs/design/README.md, Steps): a dashed button waiting for a tap, then the
 * running digits in an amber box with a progress bar and Pause, and a chime at the end. It counts
 * from the wall clock (lib/timer.ts), so it is where it should be after a reload.
 */
import { useEffect } from "react";
import { chime, primeChime } from "../lib/chime";
import { useNow } from "../lib/time";
import {
  clock,
  finishTimer,
  newTimer,
  pauseTimer,
  remainingOf,
  setTimer,
  spoken,
  startTimer,
  statusOf,
  useTimers,
} from "../lib/timer";
import { Button } from "./ui";

export function Countdown({ timerKey, seconds, label }: { timerKey: string; seconds: number; label: string }) {
  const timers = useTimers();
  const timer = timers[timerKey];
  const running = timer?.startedAt !== null && timer !== undefined;
  const now = useNow(running ? 250 : 30_000);
  const status = statusOf(timer, now);

  // It ran out while the page was open: done, with the chime, once.
  useEffect(() => {
    if (timer && timer.startedAt !== null && remainingOf(timer, now) === 0) {
      setTimer(timerKey, finishTimer(timer, now));
      chime();
    }
  }, [timer, now, timerKey]);

  const start = () => {
    primeChime();
    const at = Date.now();
    setTimer(timerKey, startTimer(timer ?? newTimer(seconds * 1000, at), at));
  };

  if (status === "idle") {
    return (
      <Button variant="dashed" onClick={start} className="w-full">
        {label} · {spoken(seconds)}
      </Button>
    );
  }

  if (status === "done") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-well bg-sunk px-4 py-2">
        <span className="text-muted">
          {label}: <span className="font-bold text-fg">done</span>
        </span>
        <Button variant="quiet" onClick={() => setTimer(timerKey, null)}>
          Again
        </Button>
      </div>
    );
  }

  const left = timer ? remainingOf(timer, now) : seconds * 1000;
  const share = 1 - left / (seconds * 1000);
  return (
    <div className="rounded-well border-[1.5px] border-highlight bg-surface px-4 py-3" role="timer" aria-label={label}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-muted">{label}</div>
          <div className="nums text-2xl font-bold" aria-live="off">
            {clock(left)}
          </div>
        </div>
        {status === "running" ? (
          <Button onClick={() => timer && setTimer(timerKey, pauseTimer(timer, Date.now()))}>Pause</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="quiet" onClick={() => setTimer(timerKey, null)}>
              Reset
            </Button>
            <Button onClick={start}>Resume</Button>
          </div>
        )}
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-line" aria-hidden>
        <div className="h-1.5 rounded-full bg-highlight" style={{ width: `${Math.min(100, share * 100)}%` }} />
      </div>
    </div>
  );
}
