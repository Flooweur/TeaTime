/**
 * What the service worker does with a push on Chromium (the PC's browser; ported from EagleEye's
 * sw/push.ts): iOS shows the declarative ones itself and never runs this. Pure, so it's tested.
 */

/** The declarative format the server sends (SPEC §3.8): `{ "web_push": 8030, "notification": {…} }`. */
export interface Declarative {
  web_push?: number;
  notification?: { title?: string; body?: string; navigate?: string; tag?: string };
}

/** What a push shows: the server's words, or the app's name alone. Its tag replaces an earlier one. */
export function notificationOf(data: unknown): { title: string; options: NotificationOptions } {
  const n = (data as Declarative | null | undefined)?.notification ?? {};
  return {
    title: n.title || "TeaTime",
    options: {
      body: n.body ?? "",
      ...(n.tag ? { tag: n.tag } : {}),
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: n.navigate ?? "/" },
    },
  };
}

/** A push's link, kept to the app's own origin: anything else opens the app's start. */
export function pushTarget(url: unknown, origin: string): string {
  if (typeof url !== "string") return "/";
  try {
    const target = new URL(url, origin);
    return target.origin === origin ? `${target.pathname}${target.search}` : "/";
  } catch {
    return "/";
  }
}
