/**
 * The real push sender (SPEC §3.8; ported from EagleEye's push/sender.ts): the `web-push` library
 * with the server's VAPID keys. Every push is the declarative format, without `mutable`, so iOS
 * shows it itself and never runs the service worker; Chromium's worker shows the same JSON. Each
 * lives what is left of its grace window (`TTL`), so a push that can't arrive in time expires at
 * the push service instead of coming late.
 */
import type { config } from "../config.js";

/** How long a push service may take to answer one push. */
const SEND_TIMEOUT_MS = 10_000;

/** A device's subscription, as its push service gave it. */
export interface PushTarget {
  readonly endpoint: string;
  readonly p256dh: string;
  readonly auth: string;
}

/** What a push shows, and the page its tap opens (an absolute URL on the app's origin). */
export interface PushMessage {
  readonly title: string;
  readonly body: string;
  readonly navigate: string;
  /** A later push with the same tag replaces it on the device: a retry never shows twice. */
  readonly tag: string;
}

/**
 * Sends one push to one device. Fails with the push service's `statusCode` when it refuses (404 or
 * 410: the subscription is gone), or without one when the service can't be reached.
 */
export type PushSender = (target: PushTarget, message: PushMessage, ttlS: number) => Promise<void>;

/** What a push carries (SPEC §3.8): `{ web_push: 8030, notification: { title, body, navigate, tag } }`. */
export const payloadOf = ({ title, body, navigate, tag }: PushMessage): string =>
  JSON.stringify({ web_push: 8030, notification: { title, body, navigate, tag } });

/** The sender with the server's VAPID keys, or null when they aren't set (pushes are then off). */
export async function createPushSender(push: (typeof config)["push"]): Promise<PushSender | null> {
  if (!push) return null;
  const webpush = (await import("web-push")).default;
  const vapidDetails = { subject: push.subject, publicKey: push.publicKey, privateKey: push.privateKey };
  return async (target, message, ttlS) => {
    await webpush.sendNotification(
      { endpoint: target.endpoint, keys: { p256dh: target.p256dh, auth: target.auth } },
      payloadOf(message),
      // A push service that never answers must not stall the notifier, whose passes never overlap.
      { TTL: ttlS, urgency: "high", vapidDetails, timeout: SEND_TIMEOUT_MS },
    );
  };
}
