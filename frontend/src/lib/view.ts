/**
 * What the app shows (SPEC §3.3): the server's last snapshot, with the unsent commands replayed on
 * top by core's reducer, the same one the server runs. Before any snapshot (a first launch
 * offline), the state is core's initial one.
 */
import {
  type Catalog,
  type Command,
  type ContentBundle,
  type Snapshot,
  type State,
  applyCommand,
  initialState,
} from "@teatime/core";
import { useMemo } from "react";
import { contentWith } from "./content";
import { kept, useStore } from "./store";

export interface View {
  readonly state: State;
  readonly content: ContentBundle;
  readonly catalog: Catalog;
  readonly snapshot: Snapshot | null;
  readonly outbox: readonly Command[];
}

/** The snapshot's state with the outbox replayed on it, in order. */
export function replay(state: State, outbox: readonly Command[], catalog: Catalog, now: number): State {
  return outbox.reduce((current, command) => applyCommand(current, command, catalog, now).state, state);
}

/**
 * The server clamps a command dated more than a day ahead of its clock (SPEC §3.3); the phone replays
 * its own commands at the times its own clock gave them, so its replay never clamps.
 */
const NEVER_CLAMPED = Infinity;

export function viewOf(snapshot: Snapshot | null, outbox: readonly Command[], now = NEVER_CLAMPED): View {
  const { content, catalog } = contentWith(snapshot?.content);
  const state = replay(snapshot?.state ?? initialState(), outbox, catalog, now);
  return { state, content, catalog, snapshot, outbox };
}

/** The view, recomputed when the snapshot or the outbox changes. */
export function useView(): View {
  const { snapshot, outbox } = useStore(kept);
  return useMemo(() => viewOf(snapshot, outbox), [snapshot, outbox]);
}

/** The current view, outside React. */
export function currentView(): View {
  const { snapshot, outbox } = kept.get();
  return viewOf(snapshot, outbox);
}
