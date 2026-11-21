/**
 * The keys a change touched, so the server writes only those rows (SPEC §3.3): a touched key whose
 * value is gone from the new state is deleted.
 */
export interface Touched {
  readonly settings: boolean;
  /** Override dates. */
  readonly overrides: readonly string[];
  /** Away period ids. */
  readonly away: readonly string[];
  /** Ingredient ids. */
  readonly pantry: readonly string[];
  /** Pick dates. */
  readonly picks: readonly string[];
  /** Brew ids. */
  readonly brews: readonly string[];
  /** Blend codes. */
  readonly marks: readonly string[];
}

export const NOTHING_TOUCHED: Touched = {
  settings: false,
  overrides: [],
  away: [],
  pantry: [],
  picks: [],
  brews: [],
  marks: [],
};

type Keys = Exclude<keyof Touched, "settings">;
const KEYS: readonly Keys[] = ["overrides", "away", "pantry", "picks", "brews", "marks"];

/** Some keys touched; the rest untouched. */
export function touched(keys: Partial<Touched>): Touched {
  return { ...NOTHING_TOUCHED, ...keys };
}

/** Everything either touched, each key once, sorted. */
export function mergeTouched(a: Touched, b: Touched): Touched {
  const merged: Record<Keys, readonly string[]> = { ...a };
  for (const key of KEYS) merged[key] = [...new Set([...a[key], ...b[key]])].sort();
  return { ...merged, settings: a.settings || b.settings };
}

export function isUntouched(t: Touched): boolean {
  return !t.settings && KEYS.every((key) => t[key].length === 0);
}
