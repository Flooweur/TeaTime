/**
 * What the brews say about each blend: when it was last made, and its last rating. The draw's
 * groups, cooldown and "never comes back" rest on this (SPEC §2.3).
 */
import { compareText } from "./json.js";
import type { BrewRecord, Rating } from "./state/types.js";

export interface BlendHistory {
  /** The latest date it was made on. */
  readonly lastMadeOn: string;
  /** The owner's rating on its latest rated brew; null if it was never rated. */
  readonly lastRating: Rating | null;
}

/** Each made blend's history, by code. Every brew counts, Made it and I made this alike (SPEC §2.4). */
export function blendHistories(brews: Iterable<BrewRecord>): Map<string, BlendHistory> {
  const inOrder = [...brews].sort((a, b) => compareText(a.date, b.date) || a.at - b.at || compareText(a.id, b.id));
  const histories = new Map<string, BlendHistory>();
  for (const brew of inOrder) {
    if (brew.tea.kind !== "blend") continue;
    const earlier = histories.get(brew.tea.code);
    histories.set(brew.tea.code, {
      lastMadeOn: brew.date,
      lastRating: brew.rating.value ?? earlier?.lastRating ?? null,
    });
  }
  return histories;
}
