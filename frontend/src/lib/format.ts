/** How quantities, water and temperatures read on the screens. */
import type { Brew, PlainBrew, Unit, Water } from "@teatime/core";

/** "7.5 g", "240 ml", "×2". */
export function qtyText(qty: number, unit: Unit): string {
  if (unit === "pieces") return `×${qty}`;
  return `${qty} ${unit}`;
}

const WATERS: Record<Water, string> = {
  tap: "tap water",
  "soft-bottled": "soft bottled water",
  filtered: "filtered water",
};

export const waterText = (water: Water): string => WATERS[water];

/** "80 °C" or "80 °C (75–85)". */
export function tempText(brew: Pick<Brew, "tempC" | "tempRange">): string {
  return brew.tempRange ? `${brew.tempC} °C (${brew.tempRange.min}–${brew.tempRange.max})` : `${brew.tempC} °C`;
}

/** A plain tea's temperature and times, at home or with an office kettle (SPEC §2.5). */
export function plainTiming(brew: PlainBrew, office: boolean): { tempC: number; infusionsS: readonly number[] } {
  return office ? brew.office : { tempC: brew.tempC, infusionsS: brew.infusionsS };
}

/** "1 min", "30 s", for a timer's button. */
export { spoken as durationText } from "./timer";
