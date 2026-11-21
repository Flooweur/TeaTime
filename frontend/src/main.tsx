/**
 * The app's start: the device's storage followed (lib/store.ts), sync started (lib/sync.ts), the
 * installed app asking to keep its storage, then the screens.
 */
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { refreshPush } from "./lib/push";
import { followKept } from "./lib/store";
import { startSync } from "./lib/sync";
import { router } from "./router";

followKept();
startSync();
// Whether this iPhone's pushes are still on: at launch, and when the app comes back to the front.
void refreshPush();
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") void refreshPush();
});

// iOS may evict a web app's storage, and the outbox with it, unless the browser promised to keep it
// (SPEC §3.3): the installed app asks at launch while it hasn't.
const installed =
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as { standalone?: boolean }).standalone === true;
if (installed && navigator.storage?.persist) {
  void navigator.storage.persisted().then((kept) => (kept ? undefined : navigator.storage.persist()));
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
