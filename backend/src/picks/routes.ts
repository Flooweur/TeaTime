/**
 * The picks' online routes (SPEC §3.4), each core's rule in one transaction (state/service.ts):
 * - `POST picks/:date/draw`: draws a date that has no pick yet. Idempotent: a drawn date answers
 *   the snapshot as it is. Only today, and tomorrow from the evening (an office kit from 17:00).
 * - `POST picks/:date/swap`, `{ current }`: the pick's tea as the phone shows it. A retry after a
 *   lost answer no longer matches it, and gets the current pick back, unswapped.
 */
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { DATE_PATTERN, drawNow, swapPick } from "@teatime/core";
import { Type } from "typebox";
import type { Deps } from "../deps.js";
import { runOnline } from "../state/service.js";

const DateParams = Type.Object({ date: Type.String({ pattern: DATE_PATTERN }) });

const Code = Type.String({ minLength: 1, maxLength: 64 });
const PickTea = Type.Union([
  Type.Object({ kind: Type.Literal("blend"), code: Code }, { additionalProperties: false }),
  Type.Object({ kind: Type.Literal("plain"), tea: Code }, { additionalProperties: false }),
  Type.Object({ kind: Type.Literal("none") }, { additionalProperties: false }),
]);

export const pickRoutes: FastifyPluginAsyncTypebox<{ deps: Deps }> = async (app, { deps }) => {
  app.post("/picks/:date/draw", { schema: { params: DateParams } }, async (req) =>
    runOnline(deps, (state, now) => drawNow(state, deps.catalog, now, req.params.date)),
  );

  app.post(
    "/picks/:date/swap",
    { schema: { params: DateParams, body: Type.Object({ current: PickTea }, { additionalProperties: false }) } },
    async (req) =>
      runOnline(deps, (state, now) => swapPick(state, deps.catalog, now, req.params.date, req.body.current)),
  );
};
