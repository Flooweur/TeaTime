import { describe, expect, it } from "vitest";
import { clock, finishTimer, newTimer, pauseTimer, remainingOf, spoken, startTimer, statusOf } from "./timer";

describe("the timers (SPEC §3.8)", () => {
  it("count from the wall clock: start, pause, resume, run out", () => {
    const t0 = newTimer(60_000, 0);
    expect(statusOf(t0, 0)).toBe("idle");
    const running = startTimer(t0, 1_000);
    expect(statusOf(running, 21_000)).toBe("running");
    expect(remainingOf(running, 21_000)).toBe(40_000);
    const paused = pauseTimer(running, 21_000);
    expect(statusOf(paused, 99_000)).toBe("paused");
    expect(remainingOf(paused, 99_000)).toBe(40_000);
    const resumed = startTimer(paused, 100_000);
    expect(remainingOf(resumed, 130_000)).toBe(10_000);
    expect(statusOf(resumed, 140_000)).toBe("done");
    expect(remainingOf(resumed, 500_000)).toBe(0);
  });

  it("resume where they are after a reload: the state is only times", () => {
    const running = startTimer(newTimer(180_000, 0), 10_000);
    const reloaded = JSON.parse(JSON.stringify(running)) as typeof running;
    expect(remainingOf(reloaded, 70_000)).toBe(120_000);
  });

  it("are done once, and starting a done one changes nothing", () => {
    const done = finishTimer(startTimer(newTimer(1_000, 0), 0), 2_000);
    expect(done.doneAt).toBe(2_000);
    expect(finishTimer(done, 9_000)).toBe(done);
    expect(startTimer(done, 9_000)).toBe(done);
    expect(statusOf(done, 9_000)).toBe("done");
  });

  it("read as a clock that never shows 0:00 while time is left, and in words", () => {
    expect(clock(180_000)).toBe("3:00");
    expect(clock(61_001)).toBe("1:02");
    expect(clock(400)).toBe("0:01");
    expect(clock(0)).toBe("0:00");
    expect(spoken(60)).toBe("1 min");
    expect(spoken(45)).toBe("45 s");
    expect(spoken(90)).toBe("1 min 30 s");
    expect(spoken(32_400)).toBe("9 h");
  });
});
