/**
 * A change that needs the server (SPEC §3.3: settings, overrides, away periods): sent, its snapshot
 * kept, and its refusal said in words. A change that would throw away a packed kit (`packed_kits`)
 * is held until the owner confirms it, then sent again with `?confirm=true`.
 */
import { useState } from "react";
import { ApiError } from "./api";
import { online } from "./sync";
import { longDate } from "./time";

type Method = "POST" | "PUT" | "DELETE";

const WORDS: Record<string, string> = {
  offline: "The server can't be reached: this needs it. Try again later.",
  past_date: "That date is past: it can't be changed.",
  not_a_tea_day: "That day is a weekend: it has no tea.",
  unknown_away: "That away period is already gone.",
};

export interface Held {
  readonly dates: readonly string[];
  readonly send: () => Promise<boolean>;
}

export function useOnline() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [held, setHeld] = useState<Held | null>(null);

  /** Sends the change; true once the server took it. */
  const run = async (method: Method, path: string, body?: unknown, confirm = false): Promise<boolean> => {
    setBusy(true);
    setError(null);
    setHeld(null);
    try {
      await online(method, confirm ? `${path}?confirm=true` : path, body);
      return true;
    } catch (err) {
      if (err instanceof ApiError && err.code === "packed_kits") {
        const dates = (err.details.dates as string[] | undefined) ?? [];
        setHeld({ dates, send: () => run(method, path, body, true) });
      } else if (err instanceof ApiError) {
        const problems = err.details.problems as string[] | undefined;
        setError(WORDS[err.code] ?? (problems?.length ? problems.join("; ") : err.message));
      } else setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setBusy(false);
    }
  };

  /** The question a held change asks. */
  const heldText = held
    ? `This throws away the kit packed for ${held.dates.map(longDate).join(" and ")}. Go on?`
    : null;

  return { busy, error, held, heldText, run, cancel: () => setHeld(null) };
}
