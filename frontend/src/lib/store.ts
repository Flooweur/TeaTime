/**
 * A small external store (no library: SPEC §3.1), read with `useSyncExternalStore`, and the app's
 * own: what the device keeps (db.ts), as a liveQuery follows it across tabs, and how sync is doing.
 */
import type { Command, Snapshot } from "@teatime/core";
import { liveQuery } from "dexie";
import { useSyncExternalStore } from "react";
import { type Refused, teaDb } from "./db";

export interface Store<T> {
  get(): T;
  set(next: T): void;
  update(change: (current: T) => T): void;
  subscribe(listener: () => void): () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  const set = (next: T) => {
    if (Object.is(next, value)) return;
    value = next;
    for (const listener of listeners) listener();
  };
  return {
    get: () => value,
    set,
    update: (change) => set(change(value)),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

/** What the device keeps, as last read. `loaded` turns true once IndexedDB has answered. */
export interface Kept {
  readonly loaded: boolean;
  readonly snapshot: Snapshot | null;
  readonly outbox: readonly Command[];
  readonly refused: readonly Refused[];
  /** A write or read of the device's storage that failed: shown in a banner, never swallowed (SPEC §3.3). */
  readonly storageError: string | null;
}

export const kept = createStore<Kept>({ loaded: false, snapshot: null, outbox: [], refused: [], storageError: null });

export interface SyncStatus {
  readonly running: boolean;
  /** The server answered the last sync. */
  readonly lastSyncedAt: number | null;
  /** Why the last sync failed: `offline` when the server couldn't be reached. */
  readonly error: { readonly code: string; readonly message: string } | null;
}

export const syncStatus = createStore<SyncStatus>({ running: false, lastSyncedAt: null, error: null });

/** Follows the device's storage into `kept`, across tabs. Returns its stop. */
export function followKept(): () => void {
  const db = teaDb();
  const subscription = liveQuery(async () => {
    const [current, outbox, refused] = await Promise.all([
      db.snapshot.get("current"),
      db.outbox.orderBy("seq").toArray(),
      db.refused.orderBy("at").toArray(),
    ]);
    return { snapshot: current?.snapshot ?? null, outbox: outbox.map((q) => q.command), refused };
  }).subscribe({
    next: (read) => kept.update((k) => ({ ...k, ...read, loaded: true })),
    error: (err: unknown) => storageFailed(err),
  });
  return () => subscription.unsubscribe();
}

/** A storage failure: the banner says so. */
export function storageFailed(err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  kept.update((k) => ({ ...k, loaded: true, storageError: message }));
}
