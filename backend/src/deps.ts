/** What every route and job is built from (app.ts): a test passes its own database, clock and content. */
import type { Catalog, ContentBundle } from "@teatime/core";
import type { Db } from "./db/client.js";
import type { Clock } from "./lib/clock.js";

export interface Deps {
  readonly db: Db;
  /** The bundle the server was built with (`@teatime/content/bundle`), or a test's. */
  readonly content: ContentBundle;
  /** `catalogOf(content)`: what core's rules read. */
  readonly catalog: Catalog;
  readonly clock: Clock;
  /** Told of a stored value that no longer holds (state/rows.ts). */
  readonly warn: (message: string) => void;
}
