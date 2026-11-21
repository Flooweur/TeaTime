/**
 * The update toast (SPEC §3.8; ported from EagleEye): it registers the service worker, and offers a
 * new version once one is waiting, which takes over only when the owner taps Reload. When the
 * server's content is newer than the app's (its hash isn't the app's), it says so too.
 */
import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect, useState } from "react";
import { bundle } from "../lib/content";
import { createStore, kept, useStore } from "../lib/store";

/** The service worker's registration, once it's registered. */
const registrationStore = createStore<ServiceWorkerRegistration | undefined>(undefined);

/** Looks for a new version when the app comes back to the front, and every hour (SPEC §3.8). */
function useUpdateChecks(registration: ServiceWorkerRegistration | undefined) {
  useEffect(() => {
    if (!registration) return;
    const check = () => void registration.update().catch(() => undefined);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    const hourly = setInterval(check, 60 * 60_000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(hourly);
    };
  }, [registration]);
}

export function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ onRegisteredSW: (_url, registration) => registrationStore.set(registration) });
  useUpdateChecks(useStore(registrationStore));
  const { snapshot } = useStore(kept);
  // The hash this toast was dismissed for: a later difference shows it again.
  const [dismissedHash, setDismissedHash] = useState<string | null>(null);
  const otherContent =
    snapshot !== null && snapshot.contentHash !== bundle.hash && snapshot.contentHash !== dismissedHash;

  if (!needRefresh && !otherContent) return null;
  return (
    <div
      role="status"
      className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-20 mx-auto flex max-w-md items-center gap-3 rounded-well bg-fg px-4 py-3 text-bg shadow-card"
    >
      <span className="flex-1 text-sm">
        {needRefresh
          ? "A new version is ready."
          : "The app and the server have different teas: an update is on its way."}
      </span>
      {!needRefresh && snapshot && (
        <button
          className="min-h-tap rounded-control px-3 text-sm"
          onClick={() => setDismissedHash(snapshot.contentHash)}
        >
          Later
        </button>
      )}
      {needRefresh && (
        <>
          <button className="min-h-tap rounded-control px-3 text-sm" onClick={() => setNeedRefresh(false)}>
            Later
          </button>
          <button
            className="min-h-tap rounded-control bg-highlight px-3 text-sm font-bold text-on-highlight"
            onClick={() => void updateServiceWorker(true)}
          >
            Reload
          </button>
        </>
      )}
    </div>
  );
}
