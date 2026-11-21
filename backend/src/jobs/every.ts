/**
 * The in-process job runner (SPEC §3.5; ported from EagleEye's jobs/every.ts). server.ts starts
 * each job with `startEvery` and keeps its stop function.
 */
import type { FastifyBaseLogger } from "fastify";
import { safeError, safeMessage } from "../lib/errors.js";

/** A job as the diagnostics show it (`GET diag`). */
export interface JobView {
  name: string;
  everyMs: number;
  running: boolean;
  runs: number;
  lastStartedAt: string | null;
  lastEndedAt: string | null;
  /** The last run's error; null when it went fine. */
  lastError: string | null;
  lastMs: number | null;
  /** Runs that failed one after another, up to now (0: the last one went fine). */
  failingRuns: number;
}

const jobs = new Map<string, { view: JobView; run: () => Promise<void> }>();

/** The jobs running in this process. */
export const allJobs = (): JobView[] => [...jobs.values()].map((job) => ({ ...job.view }));

/** Runs a job now, between its turns (a run under way is left to finish). False for an unknown name. */
export function runJobNow(name: string): boolean {
  const job = jobs.get(name);
  if (!job) return false;
  void job.run();
  return true;
}

/**
 * Runs `task` every `everyMs` (and at once with `runNow`). A run never overlaps the previous one,
 * an error is logged and the timer keeps going, and the timer doesn't keep the process alive. Its
 * stop function ends the timer and waits for the run under way, so a deploy's SIGTERM lets the
 * notifier finish its pass.
 *
 * The run's own times use the machine's clock: they are for the diagnostics, not for any rule.
 */
export function startEvery(
  name: string,
  everyMs: number,
  task: () => Promise<void>,
  log: Pick<FastifyBaseLogger, "error">,
  { runNow = false }: { runNow?: boolean } = {},
): () => Promise<void> {
  const view: JobView = {
    name,
    everyMs,
    running: false,
    runs: 0,
    lastStartedAt: null,
    lastEndedAt: null,
    lastError: null,
    lastMs: null,
    failingRuns: 0,
  };
  let stopped = false;
  /** The run under way, which stop waits for. */
  let current: Promise<void> | undefined;
  const once = async () => {
    view.running = true;
    const started = Date.now();
    view.lastStartedAt = new Date(started).toISOString();
    try {
      await task();
      view.lastError = null;
      view.failingRuns = 0;
    } catch (err) {
      view.lastError = safeMessage(err);
      view.failingRuns++;
      log.error({ err: safeError(err) }, `${name} failed`);
    } finally {
      view.running = false;
      view.runs++;
      view.lastMs = Date.now() - started;
      view.lastEndedAt = new Date().toISOString();
    }
  };
  const run = (): Promise<void> => {
    if (view.running || stopped) return current ?? Promise.resolve();
    current = once();
    return current;
  };
  jobs.set(name, { view, run });
  if (runNow) void run();
  let timer: NodeJS.Timeout;
  const schedule = () => {
    timer = setTimeout(() => {
      schedule();
      void run();
    }, everyMs);
    timer.unref();
  };
  schedule();
  return async () => {
    stopped = true;
    clearTimeout(timer);
    jobs.delete(name);
    await current;
  };
}
