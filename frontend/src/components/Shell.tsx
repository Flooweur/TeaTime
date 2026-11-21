/**
 * The frame (SPEC §7): the screen, the banners (offline, refused changes, storage), the update toast,
 * and the bottom tab bar: Today · Pantry · Library · Guides · Settings. On the PC, the same column,
 * centred (decision of 2026-11-21). It keeps the screen on while a timer runs.
 */
import { Link, Outlet } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { teaDb } from "../lib/db";
import { usePushState } from "../lib/push";
import { kept, syncStatus, useStore } from "../lib/store";
import { syncNow } from "../lib/sync";
import { useNow } from "../lib/time";
import { anyRunning, useTimers } from "../lib/timer";
import { useWakeLock } from "../lib/wakeLock";
import { UpdateToast } from "./UpdateToast";

const icon = (path: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    className="size-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {path}
  </svg>
);

const TABS = [
  {
    to: "/",
    label: "Today",
    icon: icon(
      <>
        <path d="M4 11h13a0 0 0 0 1 0 0v2a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z" />
        <path d="M17 12h1.5a2.5 2.5 0 0 1 0 5H16" />
        <path d="M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4" />
      </>,
    ),
  },
  {
    to: "/pantry",
    label: "Pantry",
    icon: icon(
      <>
        <path d="M6 8h12l-1 12H7z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </>,
    ),
  },
  {
    to: "/library",
    label: "Library",
    icon: icon(
      <>
        <path d="M5 4h4v16H5zM10 4h4v16h-4z" />
        <path d="m15 5 3.5-1 3 15.5-3.5 1z" />
      </>,
    ),
  },
  {
    to: "/guides",
    label: "Guides",
    icon: icon(
      <>
        <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" />
        <path d="M4 21V5M8 7h6" />
      </>,
    ),
  },
  {
    to: "/settings",
    label: "Settings",
    icon: icon(
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
      </>,
    ),
  },
] as const;

const REFUSED_TEXT: Record<string, string> = {
  already_made: "it was already made, from another device",
  cancelled: "that day was cancelled",
  not_pending: "that tea was no longer waiting",
  no_pick: "that day has no tea drawn",
  not_found: "that cup was already removed",
  unknown_blend: "that blend isn't known",
  unknown_ingredient: "that ingredient isn't known",
  invalid: "the app sent it wrongly",
};

function Banners() {
  const { refused, storageError } = useStore(kept);
  const sync = useStore(syncStatus);
  const offline = sync.error?.code === "offline";
  const push = usePushState();
  // The installed iPhone, whose pushes are off (never turned on, or dropped by its push service).
  const pushesOff = push.support === "ok" && Boolean(push.key) && push.on === false;
  const dismiss = () => void teaDb().refused.clear();
  return (
    <div className="mx-auto flex w-full max-w-[30rem] flex-col gap-2 px-screen pt-[max(0.75rem,env(safe-area-inset-top))] empty:hidden">
      {pushesOff && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-well bg-sunk px-4 py-2 text-sm">
          <span>Pushes are off on this iPhone: no 8:00 tea.</span>
          <Link to="/settings" className="min-h-tap content-center font-bold text-accent">
            Turn on
          </Link>
        </div>
      )}
      {storageError && (
        <div role="alert" className="rounded-well border-[1.5px] border-legend bg-surface px-4 py-3 text-sm">
          This device couldn't keep a change: {storageError}
        </div>
      )}
      {offline && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-well bg-sunk px-4 py-2 text-sm">
          <span>The server can't be reached: your changes are kept here and sent later.</span>
          <button type="button" className="min-h-tap font-bold text-accent" onClick={() => void syncNow()}>
            Retry
          </button>
        </div>
      )}
      {refused.length > 0 && (
        <div role="alert" className="rounded-well border-[1.5px] border-legend bg-surface px-4 py-3 text-sm">
          <p className="font-bold">
            {refused.length === 1 ? "A change wasn't kept" : `${refused.length} changes weren't kept`}:
          </p>
          <ul className="list-disc pl-5">
            {refused.map((r) => (
              <li key={r.id}>
                {r.command.type}: {REFUSED_TEXT[r.code] ?? r.code}
              </li>
            ))}
          </ul>
          <button type="button" className="mt-1 min-h-tap font-bold text-accent" onClick={dismiss}>
            OK
          </button>
        </div>
      )}
    </div>
  );
}

export function Shell() {
  const timers = useTimers();
  const now = useNow(5_000);
  useWakeLock(anyRunning(timers, now));
  // The screens wait for the device's storage: before it answers, the state would be an empty one.
  const { loaded } = useStore(kept);
  return (
    <div className="min-h-dvh">
      <Banners />
      {loaded ? <Outlet /> : <div className="min-h-dvh" aria-busy="true" />}
      <UpdateToast />
      <nav
        aria-label="Screens"
        className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="mx-auto grid max-w-[30rem] grid-cols-5">
          {TABS.map((tab) => (
            <li key={tab.to}>
              <Link
                to={tab.to}
                activeOptions={{ exact: tab.to === "/" }}
                className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-tab font-medium text-muted data-[status=active]:text-accent"
              >
                {tab.icon}
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
