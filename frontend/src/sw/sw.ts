/*
 * TeaTime's service worker (SPEC §3.8): it precaches the app shell, so the app opens offline.
 * vite-plugin-pwa compiles it to /sw.js, with the list of files to cache injected as
 * `self.__WB_MANIFEST`. Pushes join it in phase 7.
 */
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import appVersion from "../../../app-version.json";

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
