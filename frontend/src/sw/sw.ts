/*
 * TeaTime's service worker (SPEC §3.8): it precaches the app shell, so the app opens offline.
 * vite-plugin-pwa compiles it to /sw.js, with the list of files to cache injected as
 * `self.__WB_MANIFEST`. It shows pushes on the PC, and opens a push's page on a tap.
 */
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import appVersion from "../../../app-version.json";
import { type Declarative, notificationOf, pushTarget } from "./push";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<string | { url: string; revision: string | null }>;
};

// The shell: every built file, versioned by its content.
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Any page address opens the cached shell, so the app starts offline. /api never does: the app
// keeps its own copy of the state (lib/db.ts), and the server answers no-store.
registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html"), { denylist: [/^\/api\//] }));

// A new version waits until the owner taps Reload in the update toast; the diagnostics ask which
// version this worker is (app-version.json at the time it was built).
self.addEventListener("message", (event) => {
  const type = (event.data as { type?: string } | null)?.type;
  if (type === "SKIP_WAITING") void self.skipWaiting();
  if (type === "VERSION") event.ports[0]?.postMessage({ version: appVersion.version });
});

/*
 * Pushes (SPEC §3.8). The server sends the declarative format, which iOS shows itself without
 * running this. Chromium (the PC) has no declarative support, so this shows the same message.
 * Every push must display something.
 */
self.addEventListener("push", (event) => {
  let data: Declarative = {};
  try {
    data = (event.data?.json() as Declarative | undefined) ?? {};
  } catch {
    // Not JSON: the app's name alone.
  }
  const shown = notificationOf(data);
  event.waitUntil(self.registration.showNotification(shown.title, shown.options));
});

// A tap opens the push's page: in a window of the app, brought to the front, or a new one. The page
// loads afresh there; what the app holds is in IndexedDB, and the timers count from the clock.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = pushTarget((event.notification.data as { url?: unknown } | undefined)?.url, self.location.origin);
  event.waitUntil(
    (async () => {
      const [open] = (await self.clients.matchAll({ type: "window", includeUncontrolled: true })) as WindowClient[];
      if (open) {
        await open.focus();
        await open.navigate(target).catch(() => self.clients.openWindow(target));
        return;
      }
      await self.clients.openWindow(target);
    })(),
  );
});
