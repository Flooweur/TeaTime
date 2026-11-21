/**
 * Making a change offline (SPEC §3.3): a command, checked by core's parseCommand, tried on the
 * state the app shows, and queued in the outbox when it holds. A command the app's own state
 * refuses isn't queued: the server, which holds at least as much, would refuse it too.
 */
import {
  COMMAND_VERSION,
  type Command,
  type CommandResult,
  type CommandType,
  applyCommand,
  parseCommand,
} from "@teatime/core";
import { teaDb } from "./db";
import { kept, storageFailed } from "./store";
import { syncSoon } from "./sync";
import { currentView } from "./view";

type PayloadOf<T extends CommandType> = Extract<Command, { type: T }>["payload"];

export interface Sent {
  readonly command: Command;
  readonly result: CommandResult;
}

/** Queues a command made now, unless the app's state refuses it; either way, its result. */
export async function send<T extends CommandType>(type: T, payload: PayloadOf<T>): Promise<Sent> {
  const raw = { id: crypto.randomUUID(), v: COMMAND_VERSION, at: Date.now(), type, payload };
  const parsed = parseCommand(raw);
  // The screens build their commands: one that doesn't parse is the app's bug.
  if (!parsed.ok) throw new Error(`${type}: ${parsed.problem}`);
  const { state, catalog } = currentView();
  const { result } = applyCommand(state, parsed.command, catalog, Date.now());
  if (result.ok) {
    try {
      await teaDb().outbox.add({ command: parsed.command });
      // Shown at once, and the next command checked against it: the liveQuery follows with the same.
      kept.update((k) =>
        k.outbox.some((c) => c.id === parsed.command.id) ? k : { ...k, outbox: [...k.outbox, parsed.command] },
      );
    } catch (err) {
      storageFailed(err);
      throw err;
    }
    syncSoon();
  }
  return { command: parsed.command, result };
}

/** A new UUID, for a brew's id. */
export const newId = (): string => crypto.randomUUID();
