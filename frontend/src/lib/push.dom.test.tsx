// @vitest-environment happy-dom
import { initialState } from "@teatime/core";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createAppRouter } from "../router";
import { freshDevice, snapshotOf } from "../test/fakes";
import { setFetch } from "./api";
import { refreshPush, supportOf, turnPushOn } from "./push";
import { kept } from "./store";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";
const WINDOWS =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0 Safari/537.36";
const KEY = "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM";

/** A device: its user agent, whether it runs installed, and a push manager holding `existing`. */
function device(userAgent: string, standalone: boolean, existing: { endpoint: string } | null = null) {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(userAgent);
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: standalone && query.includes("standalone") }));
  const unsubscribe = vi.fn(async () => true);
  const old = existing ? { ...existing, unsubscribe, options: { applicationServerKey: null } } : null;
  const pushManager = {
    getSubscription: vi.fn(async () => old),
    subscribe: vi.fn(async () => ({
      endpoint: "https://web.push.apple.com/new",
      toJSON: () => ({ endpoint: "https://web.push.apple.com/new", keys: { p256dh: "p", auth: "a" } }),
      options: { applicationServerKey: null },
    })),
  };
  const registration = { pushManager };
  vi.stubGlobal("PushManager", class {});
  vi.stubGlobal("Notification", { permission: "granted", requestPermission: async () => "granted" });
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: { ready: Promise.resolve(registration), getRegistration: async () => registration },
  });
  const calls: string[] = [];
  setFetch(async (input, init) => {
    calls.push(`${init?.method ?? "GET"} ${input} ${init?.body ?? ""}`);
    if (input.endsWith("push/key")) return new Response(JSON.stringify({ publicKey: KEY }));
    if (input.endsWith("push/check")) return new Response(JSON.stringify({ on: false }));
    if (input.endsWith("state")) return new Response(JSON.stringify(snapshotOf(initialState(), 1)));
    return new Response(null, { status: 204 });
  });
  return { calls, unsubscribe };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("the self-review of phase 7", () => {
  it("keeps pushes to the iPhone: the PC is never offered them (decision of 2026-11-20)", () => {
    device(WINDOWS, false);
    expect(supportOf()).toBe("iphone-only");
    device(IPHONE, false);
    expect(supportOf()).toBe("install");
    device(IPHONE, true);
    expect(supportOf()).toBe("ok");
  });

  it("forgets a replaced subscription at the server too", async () => {
    const { calls, unsubscribe } = device(IPHONE, true, { endpoint: "https://web.push.apple.com/old" });
    await turnPushOn();
    const deleted = calls.findIndex((c) => c.startsWith("DELETE /api/push/subscriptions") && c.includes("/old"));
    const posted = calls.findIndex((c) => c.startsWith("POST /api/push/subscriptions") && c.includes("/new"));
    expect(deleted).toBeGreaterThanOrEqual(0);
    expect(posted).toBeGreaterThan(deleted);
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("says on every screen when the installed iPhone's pushes are off", async () => {
    device(IPHONE, true);
    freshDevice();
    kept.set({ loaded: true, snapshot: snapshotOf(initialState(), 1), outbox: [], refused: [], storageError: null });
    await refreshPush();
    render(<RouterProvider router={createAppRouter(createMemoryHistory({ initialEntries: ["/library"] }))} />);
    expect(await screen.findByText("Pushes are off on this iPhone: no 8:00 tea.")).toBeTruthy();
  });
});
