/**
 * Pushes on this device (SPEC §2.7, §3.8; after EagleEye's lib/push.ts): whether they can come
 * here, turning them on from a tap and off, and the test push.
 *
 * - **Where:** an iPhone gets pushes only in the installed app (Add to Home Screen). The PC's
 *   browser can too, but SPEC §1.2 has the iPhone as the one device that gets them.
 * - **On:** permission granted, a subscription made with the server's VAPID key, and the server
 *   holding it on. A subscription made with another key, or one the server turned off after its push
 *   service said it's gone, is replaced when pushes are turned on.
 */
import { api } from "./api";
import { createStore, useStore } from "./store";

export interface PushState {
  /** Pushes can come here; or not until the app is installed (an iPhone's Safari); or never. */
  readonly support: "ok" | "install" | "unsupported";
  readonly permission: NotificationPermission | "unsupported";
  /** The server's VAPID public key: null when its pushes are off; undefined until asked. */
  readonly key: string | null | undefined;
  /** On here; undefined until known. */
  readonly on: boolean | undefined;
}

const push = createStore<PushState>({
  support: "unsupported",
  permission: "unsupported",
  key: undefined,
  on: undefined,
});

export const usePushState = (): PushState => useStore(push);

const appleMobile = () =>
  /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const installed = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

function supportOf(): PushState["support"] {
  if ("serviceWorker" in navigator && "PushManager" in window && "Notification" in window) return "ok";
  return appleMobile() && !installed() ? "install" : "unsupported";
}

/** A VAPID key (URL-safe base64) as the bytes `subscribe` takes. */
export function keyBytes(key: string): Uint8Array<ArrayBuffer> {
  const base64 = (key + "=".repeat((4 - (key.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/** Whether a subscription was made with this key. */
export function madeWith(subscription: PushSubscription, key: string): boolean {
  const used = subscription.options.applicationServerKey;
  if (!used) return false;
  const a = new Uint8Array(used);
  const b = keyBytes(key);
  return a.length === b.length && a.every((byte, i) => byte === b[i]);
}

async function subscriptionHere(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.getRegistration();
  return (await registration?.pushManager.getSubscription()) ?? null;
}

/** Reads this device's pushes again. Offline, what was known stays. */
export async function refreshPush(): Promise<void> {
  const support = supportOf();
  if (support !== "ok") return push.set({ support, permission: "unsupported", key: null, on: false });
  const permission = Notification.permission;
  let key = push.get().key;
  try {
    key = (await api<{ publicKey: string | null }>("GET", "push/key")).publicKey;
  } catch {
    // Offline: the key known before.
  }
  const here = await subscriptionHere().catch(() => null);
  let on = false;
  if (here && key && permission === "granted" && madeWith(here, key)) {
    try {
      on = (await api<{ on: boolean }>("POST", "push/check", { endpoint: here.endpoint })).on;
    } catch {
      on = push.get().on ?? true;
    }
  }
  push.set({ support, permission, key, on });
}

export class PushProblem extends Error {
  constructor(readonly reason: "denied" | "dismissed" | "off" | "unsupported") {
    super(`Pushes not on: ${reason}`);
    this.name = "PushProblem";
  }
}

/** Turns pushes on here. Call it straight from a tap: iOS asks for permission only then. */
export async function turnPushOn(): Promise<void> {
  if (supportOf() !== "ok") throw new PushProblem("unsupported");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    await refreshPush();
    throw new PushProblem(permission === "denied" ? "denied" : "dismissed");
  }
  const { publicKey } = await api<{ publicKey: string | null }>("GET", "push/key");
  if (!publicKey) throw new PushProblem("off");
  const registration = await navigator.serviceWorker.ready;
  // One made with another key, or turned off by the server: replaced.
  const old = await registration.pushManager.getSubscription();
  if (old) await old.unsubscribe().catch(() => false);
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: keyBytes(publicKey),
  });
  await api("POST", "push/subscriptions", subscription.toJSON());
  await refreshPush();
}

export async function turnPushOff(): Promise<void> {
  const here = await subscriptionHere();
  if (here) {
    await api("DELETE", "push/subscriptions", { endpoint: here.endpoint });
    await here.unsubscribe();
  }
  await refreshPush();
}

/** A test push to every device on. */
export const testPush = () => api<{ sent: number; failed: number; gone: number }>("POST", "push/test");
