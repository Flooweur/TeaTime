/**
 * What the app keeps on the device (SPEC §3.3), in IndexedDB through Dexie: the server's last
 * snapshot, the outbox of commands not sent yet, and the commands the server refused, until the
 * owner has seen them. Dexie's transactions keep them consistent across tabs.
 */
import type { Command, Snapshot } from "@teatime/core";
import Dexie, { type EntityTable } from "dexie";

export interface Kept {
  readonly key: "current";
  readonly snapshot: Snapshot;
}

/** A command waiting to be sent, in the order it was made. */
export interface Queued {
  readonly seq?: number;
  readonly command: Command;
}

/** A command the server refused: shown until the owner dismisses it. */
export interface Refused {
  readonly id: string;
  readonly command: Command;
  readonly code: string;
  readonly problem: string | null;
  /** When the answer came, in Unix milliseconds. */
  readonly at: number;
}

export class TeaDb extends Dexie {
  snapshot!: EntityTable<Kept, "key">;
  outbox!: EntityTable<Queued, "seq">;
  refused!: EntityTable<Refused, "id">;

  constructor(name = "teatime") {
    super(name);
    this.version(1).stores({ snapshot: "key", outbox: "++seq, command.id", refused: "id, at" });
  }
}

let current: TeaDb | null = null;

/** The app's database, opened on first use. */
export function teaDb(): TeaDb {
  current ??= new TeaDb();
  return current;
}

/** For the tests: a fresh database each time. */
export function setDbForTests(db: TeaDb): void {
  current = db;
}
