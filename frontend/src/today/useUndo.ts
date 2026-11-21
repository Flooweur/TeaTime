/**
 * Undo, for about 10 seconds after Made it or Skip (decision of 2026-11-21): the last action's
 * undo, offered until its time runs out or another action replaces it.
 */
import { useCallback, useEffect, useState } from "react";

export const UNDO_MS = 10_000;

export interface Undoable {
  readonly label: string;
  readonly run: () => Promise<unknown>;
}

export function useUndo() {
  const [offer, setOffer] = useState<(Undoable & { until: number }) | null>(null);
  useEffect(() => {
    if (!offer) return;
    const timer = setTimeout(() => setOffer(null), Math.max(0, offer.until - Date.now()));
    return () => clearTimeout(timer);
  }, [offer]);
  const offerUndo = useCallback((undo: Undoable) => setOffer({ ...undo, until: Date.now() + UNDO_MS }), []);
  const undo = useCallback(async () => {
    if (!offer) return;
    setOffer(null);
    await offer.run();
  }, [offer]);
  return { offer, offerUndo, undo, dismiss: () => setOffer(null) };
}
