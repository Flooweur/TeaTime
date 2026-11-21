/**
 * Diagnostics (SPEC §3.8, §7): what to look at when something's off. This app's and the server's
 * versions, the service worker and the storage, push, the changes waiting or refused, the jobs, the
 * recent pushes, the backups, and the device's clock against the server's (flagged past 60 s).
 */
import { type ReactNode, useCallback, useEffect, useState } from "react";
import appVersion from "../../../app-version.json";
import { Button, Notice, Screen, Section } from "../components/ui";
import { ApiError } from "../lib/api";
import { bundle } from "../lib/content";
import { CLOCK_SKEW_MS, type ServerDiag, readServer, storageKept, workerVersion } from "../lib/diagnostics";
import { usePushState } from "../lib/push";
import { kept, syncStatus, useStore } from "../lib/store";
import { syncNow } from "../lib/sync";

const when = (ms: number | string | null) =>
  ms === null
    ? "never"
    : new Date(ms).toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" });

function Row({ label, children, warn = false }: { label: string; children: ReactNode; warn?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-0">
      <span className="text-muted">{label}</span>
      <span className={`nums text-right ${warn ? "font-bold text-legend" : ""}`}>{children}</span>
    </div>
  );
}

const Box = ({ children }: { children: ReactNode }) => (
  <div className="rounded-well bg-surface px-4 shadow-card">{children}</div>
);

export function Diagnostics() {
  const { snapshot, outbox, refused } = useStore(kept);
  const sync = useStore(syncStatus);
  const push = usePushState();
  const [server, setServer] = useState<{ diag: ServerDiag; skewMs: number } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [worker, setWorker] = useState<number | null | undefined>(undefined);
  const [storage, setStorage] = useState<boolean | null | undefined>(undefined);

  const load = useCallback(() => {
    readServer().then(
      (read) => {
        setServer(read);
        setServerError(null);
      },
      (err: unknown) => setServerError(err instanceof ApiError ? err.message : String(err)),
    );
    void workerVersion().then(setWorker);
    void storageKept().then(setStorage);
  }, []);
  useEffect(() => load(), [load]);

  const skew = server?.skewMs ?? null;
  return (
    <Screen eyebrow="Settings" title="Diagnostics">
      <Section
        title="This device"
        aside={
          <Button variant="quiet" onClick={load}>
            Again
          </Button>
        }
      >
        <Box>
          <Row label="App version">{appVersion.version}</Row>
          <Row label="Service worker" warn={worker !== undefined && worker !== null && worker !== appVersion.version}>
            {worker === undefined ? "…" : worker === null ? "none" : `version ${worker}`}
          </Row>
          <Row label="Content">{bundle.hash.slice(0, 12)}</Row>
          <Row label="Storage kept" warn={storage === false && push.support === "ok"}>
            {storage === undefined
              ? "…"
              : storage === null
                ? "unknown"
                : storage
                  ? "yes"
                  : push.support === "ok"
                    ? "no: iOS may clear it"
                    : "no"}
          </Row>
          <Row label="Pushes here">
            {push.support === "ok"
              ? push.on
                ? "on"
                : "off"
              : push.support === "iphone-only"
                ? "the iPhone only"
                : push.support}
          </Row>
          <Row label="Last synced" warn={sync.error !== null}>
            {sync.error ? `failed: ${sync.error.code}` : when(sync.lastSyncedAt)}
          </Row>
          <Row label="Waiting to be sent" warn={outbox.length > 0}>
            {outbox.length}
          </Row>
          <Row label="Snapshot">{snapshot ? `revision ${snapshot.revision}` : "none yet"}</Row>
        </Box>
        <Button onClick={() => void syncNow()}>Sync now</Button>
        {refused.length > 0 && (
          <Notice tone="warn">
            Not kept by the server: {refused.map((r) => `${r.command.type} (${r.code})`).join(", ")}.
          </Notice>
        )}
      </Section>

      <Section title="The server">
        {serverError && <Notice tone="warn">{serverError}</Notice>}
        {!server && !serverError && <p className="text-muted">Asking…</p>}
        {server && (
          <>
            <Box>
              <Row label="Version" warn={server.diag.version !== appVersion.version}>
                {server.diag.version} ({server.diag.environment})
              </Row>
              <Row label="Content" warn={server.diag.contentHash !== bundle.hash}>
                {server.diag.contentHash.slice(0, 12)}
              </Row>
              <Row label="Clock" warn={skew !== null && Math.abs(skew) > CLOCK_SKEW_MS}>
                {skew === null
                  ? "…"
                  : Math.abs(skew) > CLOCK_SKEW_MS
                    ? `this device is ${Math.round(Math.abs(skew) / 1000)} s ${skew > 0 ? "ahead" : "behind"}`
                    : "in step"}
              </Row>
              <Row label="Revision">{server.diag.revision}</Row>
              <Row label="Pushes">
                {server.diag.push.on
                  ? `on, ${server.diag.push.subscriptions.filter((s) => s.disabledAt === null).length} device(s)`
                  : "off: no keys"}
              </Row>
              <Row label="Backups" warn={server.diag.backups.on && server.diag.backups.count === 0}>
                {server.diag.backups.on
                  ? `${server.diag.backups.count}, latest ${server.diag.backups.latest ?? "none"}`
                  : "off"}
              </Row>
            </Box>
            <p className="label text-sm">Jobs</p>
            <Box>
              {server.diag.jobs.map((job) => (
                <Row key={job.name} label={job.name} warn={job.failingRuns > 0}>
                  {job.lastError ? `failing: ${job.lastError}` : `ok, ${job.runs} runs, last ${when(job.lastEndedAt)}`}
                </Row>
              ))}
            </Box>
            <p className="label text-sm">Recent pushes</p>
            {server.diag.notifications.length === 0 ? (
              <p className="text-muted">None yet.</p>
            ) : (
              <Box>
                {server.diag.notifications.map((n) => (
                  <Row key={`${n.kind}:${n.date}`} label={`${n.kind} ${n.date}`} warn={n.status === "failed"}>
                    {n.status}, {n.attempts} {n.attempts === 1 ? "try" : "tries"}, {when(n.updatedAt)}
                  </Row>
                ))}
              </Box>
            )}
            {server.diag.refused.length > 0 && (
              <>
                <p className="label text-sm">Refused lately</p>
                <Box>
                  {server.diag.refused.map((r, i) => (
                    <Row key={i} label={r.type}>
                      {r.code ?? "?"}, {when(r.receivedAt)}
                    </Row>
                  ))}
                </Box>
              </>
            )}
          </>
        )}
      </Section>
    </Screen>
  );
}
