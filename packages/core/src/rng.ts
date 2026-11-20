/**
 * Seeded randomness (SPEC §4.2): the same seed always gives the same sequence, so a draw for a
 * date can be replayed and tested. Not for anything secret.
 */

/** A number in [0, 1). */
export type Random = () => number;

/**
 * The same sequence every time for the same `seed`: a hash of the seed into mulberry32 (ported
 * from EagleEye's `rng.ts`). Fast and well spread.
 */
export function randomFrom(seed: string): Random {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** An integer in [min, max], both included. */
export function randomInt(random: Random, min: number, max: number): number {
  if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
    throw new RangeError(`randomInt needs integers with min ≤ max, got ${min} and ${max}`);
  }
  return min + Math.floor(random() * (max - min + 1));
}

/** One of `items`, each as likely. An empty list throws a RangeError. */
export function pickOne<T>(random: Random, items: readonly T[]): T {
  if (items.length === 0) throw new RangeError("pickOne needs at least one item");
  return items[randomInt(random, 0, items.length - 1)] as T;
}
