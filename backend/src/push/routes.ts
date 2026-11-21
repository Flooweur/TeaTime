/**
 * The push routes (SPEC §3.4):
 * - `GET push/key`: the VAPID public key the app subscribes with, null when pushes are off;
 * - `POST push/subscriptions`, `{ endpoint, keys: { p256dh, auth } }`: this device's subscription;
 * - `DELETE push/subscriptions`, `{ endpoint }`: forgets it;
 * - `POST push/check`, `{ endpoint }`: whether it is still on, so the app subscribes afresh once
 *   its push service said it's gone (SPEC §3.8). A POST, so an endpoint never goes in a URL or a log;
 * - `POST push/test`: a test push to every device, now.
 */
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "typebox";
import type { Deps } from "../deps.js";
import { HttpError } from "../lib/errors.js";
import type { PushSender } from "./sender.js";
import { isOn, sendToAll, subscribe, unsubscribe } from "./service.js";

const Endpoint = Type.String({ minLength: 1, maxLength: 1000 });

/** A test push lives a minute: it is for now, or never. */
const TEST_TTL_S = 60;

export const pushRoutes: FastifyPluginAsyncTypebox<{
  deps: Deps;
  send: PushSender | null;
  publicKey: string | null;
  publicOrigin: string;
}> = async (app, { deps, send, publicKey, publicOrigin }) => {
  app.get("/push/key", async () => ({ publicKey: send ? publicKey : null }));

  app.post(
    "/push/subscriptions",
    {
      schema: {
        body: Type.Object(
          {
            endpoint: Endpoint,
            keys: Type.Object({
              p256dh: Type.String({ minLength: 1, maxLength: 200 }),
              auth: Type.String({ minLength: 1, maxLength: 100 }),
            }),
            // What PushSubscription.toJSON() gives besides: taken, and ignored.
            expirationTime: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
          },
          { additionalProperties: false },
        ),
      },
    },
    async (req, reply) => {
      subscribe(deps.db, deps.clock, req.body);
      return reply.code(204).send();
    },
  );

  app.delete(
    "/push/subscriptions",
    { schema: { body: Type.Object({ endpoint: Endpoint }, { additionalProperties: false }) } },
    async (req, reply) => {
      unsubscribe(deps.db, req.body.endpoint);
      return reply.code(204).send();
    },
  );

  app.post(
    "/push/check",
    { schema: { body: Type.Object({ endpoint: Endpoint }, { additionalProperties: false }) } },
    async (req) => ({ on: isOn(deps.db, req.body.endpoint) }),
  );

  app.post("/push/test", async () => {
    if (!send) throw new HttpError(503, "Pushes are off: the server has no VAPID keys.", "push_off");
    const message = {
      title: "TeaTime",
      body: "A test push: notifications work.",
      navigate: new URL("/settings?from=push", publicOrigin).href,
      tag: "test",
    };
    const { sent, failed, gone } = await sendToAll(deps.db, deps.clock, send, message, TEST_TTL_S);
    return { sent, failed, gone };
  });
};
