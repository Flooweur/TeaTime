/**
 * The chime at a timer's end (SPEC §3.8): a soft bell, synthesized, so there's no file to fetch.
 * The audio is unlocked by the tap that starts a timer, as iOS requires, and asks for the
 * `playback` session where the browser has it, so the silent switch doesn't mute it.
 */
let context: AudioContext | null = null;

/** Call from the tap that starts a timer. */
export function primeChime(): void {
  try {
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session) session.type = "playback";
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
  } catch {
    // No Web Audio: the timer still shows it's done.
  }
}

/** Two bell partials, fading over two seconds, played twice. */
export function chime(): void {
  if (!context) return;
  const start = context.currentTime + 0.05;
  for (const at of [start, start + 1.1]) {
    for (const [freq, level] of [
      [659.25, 0.22],
      [1318.5, 0.08],
      [1975.5, 0.04],
    ] as const) {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(level, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 2);
      osc.connect(gain).connect(context.destination);
      osc.start(at);
      osc.stop(at + 2.05);
    }
  }
}
