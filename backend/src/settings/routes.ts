/**
 * The week's online routes (SPEC §3.3, §3.4): settings, per-date overrides and away periods. Each
 * re-checks the pending picks it touches in the same transaction (core's online.ts). A change
 * that would throw away a packed kit is refused with `packed_kits` and its dates; the app asks the
 * owner, then sends it again with `?confirm=true`.
 * - `PUT settings`: a patch of some settings;
 * - `PUT overrides/:date`, `{ type: "office" | "home" | null }`: null follows the office days again;
 * - `POST away`, `{ id, from, to }`: the id is the app's, so a resend of the same period answers
 *   the snapshot instead of a clash;
 * - `DELETE away/:id`.
 */
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { DATE_PATTERN, NOTHING_TOUCHED, addAway, removeAway, setOverride, updateSettings } from "@teatime/core";
import { Type } from "typebox";
import type { Deps } from "../deps.js";
import { runOnline } from "../state/service.js";

/** `?confirm=true`, as text: nothing is coerced (app.ts). */
const Confirm = Type.Object(
  { confirm: Type.Optional(Type.Union([Type.Literal("true"), Type.Literal("false")])) },
  { additionalProperties: false },
);

export const settingsRoutes: FastifyPluginAsyncTypebox<{ deps: Deps }> = async (app, { deps }) => {
  // Core's parseSettingsPatch checks the body, naming every problem.
  app.put("/settings", { schema: { querystring: Confirm, body: Type.Unknown() } }, async (req) =>
    runOnline(deps, (state, now) => updateSettings(state, deps.catalog, now, req.body, req.query.confirm === "true")),
  );

  app.put(
    "/overrides/:date",
    {
      schema: {
        params: Type.Object({ date: Type.String({ pattern: DATE_PATTERN }) }),
        querystring: Confirm,
        body: Type.Object(
          { type: Type.Union([Type.Literal("office"), Type.Literal("home"), Type.Null()]) },
          { additionalProperties: false },
        ),
      },
    },
    async (req) =>
      runOnline(deps, (state, now) =>
        setOverride(state, deps.catalog, now, req.params.date, req.body.type, req.query.confirm === "true"),
      ),
  );

  // Core's addAway checks the body.
  app.post("/away", { schema: { querystring: Confirm, body: Type.Unknown() } }, async (req) =>
    runOnline(deps, (state, now) => {
      const body = req.body as { id?: unknown; from?: unknown; to?: unknown } | null;
      const same = state.away.find((p) => p.id === body?.id && p.from === body?.from && p.to === body?.to);
      if (same && Object.keys(body ?? {}).length === 3) return { ok: true, state, touched: NOTHING_TOUCHED };
      return addAway(state, deps.catalog, now, req.body, req.query.confirm === "true");
    }),
  );

  app.delete(
    "/away/:id",
    { schema: { params: Type.Object({ id: Type.String({ minLength: 1, maxLength: 64 }) }) } },
    async (req) => runOnline(deps, (state, now) => removeAway(state, deps.catalog, now, req.params.id)),
  );
};
