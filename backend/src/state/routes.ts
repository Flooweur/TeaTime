/**
 * The state's routes (SPEC §3.3, §3.4):
 * - `GET state`: the snapshot as it stands;
 * - `POST commands`: the phone's offline commands, `{ commands: [...] }`, applied in order; the
 *   answer is a result per command and the snapshot after them (commands/service.ts).
 */
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "typebox";
import { MAX_BATCH, applyBatch } from "../commands/service.js";
import type { Deps } from "../deps.js";
import { currentSnapshot } from "./service.js";

export const stateRoutes: FastifyPluginAsyncTypebox<{ deps: Deps }> = async (app, { deps }) => {
  app.get("/state", async () => currentSnapshot(deps));

  app.post(
    "/commands",
    {
      schema: {
        // Each command is checked by core's parseCommand, so a bad one is refused on its own.
        body: Type.Object({ commands: Type.Array(Type.Unknown(), { maxItems: MAX_BATCH }) }),
      },
    },
    async (req) => applyBatch(deps, req.log, req.body.commands),
  );
};
