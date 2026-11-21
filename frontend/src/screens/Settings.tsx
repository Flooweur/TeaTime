/**
 * Settings (SPEC §7). For now: light or dark, this device's own (decision of 2026-11-21), and what
 * this app and the server are. The week, the notifications and the export join it in phase 8.
 */
import type { ReactNode } from "react";
import appVersion from "../../../app-version.json";
import { Screen, Section } from "../components/ui";
import { bundle } from "../lib/content";
import { kept, syncStatus, useStore } from "../lib/store";
import { type ThemeChoice, setTheme, useTheme } from "../lib/theme";

const THEMES: readonly (readonly [ThemeChoice, string])[] = [
  ["device", "As the device"],
  ["light", "Light"],
  ["dark", "Dark"],
];

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-0">
      <span className="text-muted">{label}</span>
      <span className="nums text-right">{children}</span>
    </div>
  );
}

export function Settings() {
  const theme = useTheme();
  const { snapshot, outbox } = useStore(kept);
  const sync = useStore(syncStatus);
  return (
    <Screen title="Settings">
      <Section title="Light or dark">
        <div role="radiogroup" aria-label="Light or dark" className="grid grid-cols-3 gap-2">
          {THEMES.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={theme === value}
              onClick={() => setTheme(value)}
              className={`min-h-[50px] rounded-control px-2 font-bold ${
                theme === value ? "bg-accent text-on-accent" : "border-[1.5px] border-control"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">This device's own choice: the phone and the PC each keep theirs.</p>
      </Section>
      <Section title="This app">
        <div className="rounded-well bg-surface px-4 shadow-card">
          <Row label="Version">{appVersion.version}</Row>
          <Row label="Content">{bundle.hash.slice(0, 12)}</Row>
          <Row label="Server's state">{snapshot ? `revision ${snapshot.revision}` : "not reached yet"}</Row>
          <Row label="Waiting to be sent">{outbox.length === 1 ? "1 change" : `${outbox.length} changes`}</Row>
          <Row label="Last synced">
            {sync.lastSyncedAt
              ? new Date(sync.lastSyncedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
              : "not yet"}
          </Row>
        </div>
      </Section>
    </Screen>
  );
}
