/**
 * Errors (ported from EagleEye's lib/errors.ts, for SQLite).
 *
 * `HttpError` is an expected failure with an HTTP status: services throw it, and app.ts's error
 * handler sends `{ error, code }`, plus its `details`. The app checks the `code`, never the words.
 *
 * `safeError` is what the log keeps of any other error: its kind, its code, a failed query's SQL
 * text and its stack's frames, never a value it carried (SPEC §4.1: no personal detail in a log).
 */
export class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly code: string,
    readonly details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "HttpError";
  }
}

type Fields = Record<string, unknown>;

/** Drizzle's failed query (`DrizzleQueryError`): its message and `params` hold the values bound to it. */
const isQueryError = (e: Error & Fields) =>
  e.constructor.name === "DrizzleQueryError" || ("query" in e && "params" in e);

/** Its stack's frames, without the first lines, which repeat its message. */
function framesOf(e: Error): string | undefined {
  if (typeof e.stack !== "string") return undefined;
  const header = `${e.name}: ${e.message}`;
  if (!e.stack.startsWith(header)) return undefined;
  const frames = e.stack.slice(header.length).replace(/^\n/, "");
  return frames.length > 0 ? frames : undefined;
}

/** What the log keeps of an error. A value thrown that isn't an Error is logged by its kind alone. */
export function safeError(err: unknown, depth = 0): Fields {
  if (!(err instanceof Error)) return { type: typeof err };
  const e = err as Error & Fields;
  const out: Fields = { type: e.constructor.name || e.name };
  if (isQueryError(e)) {
    out.message = "Failed query";
    // The statement with its placeholders: the values are its parameters, never logged.
    if (typeof e.query === "string") out.query = e.query.slice(0, 2_000);
  } else {
    // SQLite's own messages name a constraint or a column, never a value.
    out.message = e.message.slice(0, 1_000);
    if (typeof e.code === "string" || typeof e.code === "number") out.code = e.code;
    if (typeof e.statusCode === "number") out.statusCode = e.statusCode;
  }
  const frames = framesOf(e) ?? (isQueryError(e) ? undefined : e.stack);
  if (frames !== undefined) out.stack = frames;
  if (e.cause !== undefined && depth < 3) out.cause = safeError(e.cause, depth + 1);
  return out;
}

/** An error in one line, for the diagnostics page: `safeError`'s message, and its cause's. */
export function safeMessage(err: unknown): string {
  const safe = safeError(err);
  const cause = safe.cause as Fields | undefined;
  const own = typeof safe.message === "string" ? safe.message : `A ${String(safe.type)} was thrown`;
  return cause && typeof cause.message === "string" ? `${own}: ${cause.message}` : own;
}
