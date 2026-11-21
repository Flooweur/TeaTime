/**
 * What the diagnostics screen reads (SPEC §3.8, §7): the server's `GET diag`, the clock check, and
 * this device's service worker and storage. The clock check is pure, so it's tested.
 */
import { api } from "./api";

/** A device clock this far off the server's is flagged (SPEC §3.8). */
export const CLOCK_SKEW_MS = 60_000;

/**
 * How far the device's clock is from the server's, in milliseconds (positive: the device is ahead),
 * the request's own time halved out: the server read its clock somewhere between `sentAt` and `gotAt`.
 */
export function clockSkew(serverTime: number, sentAt: number, gotAt: number): number {
  return Math.round((sentAt + gotAt) / 2 - serverTime);
}

export interface ServerDiag {
  readonly version: number;
  readonly environment: string;
  readonly serverTime: number;
  readonly timeZone: string;
  readonly revision: number;
  readonly contentHash: string;
  readonly counts: {
    readonly picks: number;
    readonly brews: number;
    readonly pantry: number;
    readonly commands: number;
  };
  readonly jobs: readonly {
    readonly name: string;
    readonly runs: number;
    readonly lastEndedAt: string | null;
    readonly lastError: string | null;
    readonly failingRuns: number;
  }[];
  readonly push: {
    readonly on: boolean;
    readonly subscriptions: readonly {
      readonly id: number;
      readonly service: string;
      readonly lastSuccessAt: number | null;
      readonly failures: number;
      readonly disabledAt: number | null;
    }[];
  };
  readonly notifications: readonly {
    readonly kind: string;
    readonly date: string;
    readonly status: string;
    readonly attempts: number;
    readonly updatedAt: number;
  }[];
  readonly refused: readonly { readonly type: string; readonly receivedAt: number; readonly code: string | null }[];
  readonly backups: { readonly on: boolean; readonly count: number; readonly latest: string | null };
}

/** The server's diagnostics, and the device's clock against its. */
export async function readServer(): Promise<{ diag: ServerDiag; skewMs: number }> {
  const sentAt = Date.now();
  const diag = await api<ServerDiag>("GET", "diag");
  return { diag, skewMs: clockSkew(diag.serverTime, sentAt, Date.now()) };
}

/** The version the service worker controlling this page was built as; null without one, or no answer. */
export function workerVersion(waitMs = 2_000): Promise<number | null> {
  const controller = typeof navigator !== "undefined" ? navigator.serviceWorker?.controller : null;
  if (!controller) return Promise.resolve(null);
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => resolve(null), waitMs);
    channel.port1.onmessage = (event) => {
      clearTimeout(timer);
      resolve((event.data as { version?: number } | null)?.version ?? null);
    };
    controller.postMessage({ type: "VERSION" }, [channel.port2]);
  });
}

/** Whether the browser promised to keep this app's storage (SPEC §3.3); null where it can't say. */
export async function storageKept(): Promise<boolean | null> {
  try {
    return (await navigator.storage?.persisted?.()) ?? null;
  } catch {
    return null;
  }
}
