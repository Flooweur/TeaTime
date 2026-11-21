/**
 * What the server answers, as both sides read it (SPEC §3.3): the snapshot, and each offline
 * command's outcome. Types only: the server builds them (backend/src/state/snapshot.ts,
 * backend/src/commands/service.ts), the app keeps and replays them.
 */
import type { Blend, Gear, Ingredient, Shop, TeaType } from "./content.js";
import type { CommandResult } from "./state/apply.js";
import type { State } from "./state/types.js";

/** The content of the pending picks: their blends, the ingredients, gear and shops those name, and the tea types. */
export interface PickContent {
  readonly blends: readonly Blend[];
  readonly ingredients: readonly Ingredient[];
  readonly gear: readonly Gear[];
  readonly shops: readonly Shop[];
  readonly teaTypes: readonly TeaType[];
}

export interface Snapshot {
  /** One more for each change the server stored: a phone ignores a snapshot older than its own. */
  readonly revision: number;
  /** The server's content: a hash the app doesn't have shows the update toast. */
  readonly contentHash: string;
  /** The server's clock, in Unix milliseconds: the diagnostics flag a device more than 60 s off it (SPEC §3.8). */
  readonly serverTime: number;
  readonly state: State;
  readonly content: PickContent;
}

/** What parseCommand refuses: a command that isn't one, or one from a newer app than the server. */
export interface ParseRefusal {
  readonly ok: false;
  readonly code: "invalid" | "unsupported_version";
  readonly problem: string;
}

/** A command the server decided, as `applied_commands` stores it. */
export type DecidedResult = CommandResult | ParseRefusal;

/**
 * A command's outcome in `POST commands`' answer, in the batch's order. `repeat`: it was decided
 * before (a resend). `server_error` and `unsupported_version` aren't decided: the phone sends them again.
 */
export type CommandOutcome = { readonly id: string | null; readonly repeat?: true } & (
  DecidedResult | { readonly ok: false; readonly code: "server_error" }
);

/** `POST commands`' answer. */
export interface CommandsAnswer {
  readonly results: readonly CommandOutcome[];
  readonly snapshot: Snapshot;
}
