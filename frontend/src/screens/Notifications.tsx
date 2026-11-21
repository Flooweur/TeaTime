/**
 * Settings → Notifications (SPEC §3.8): this device's pushes on or off, from a tap, and a test.
 * On an iPhone, pushes come only in the installed app: Safari says how to add it first.
 */
import { useEffect, useState } from "react";
import { Button, Notice, Section } from "../components/ui";
import { ApiError } from "../lib/api";
import { PushProblem, refreshPush, testPush, turnPushOff, turnPushOn, usePushState } from "../lib/push";

const PROBLEMS: Record<PushProblem["reason"], string> = {
  denied: "Notifications are blocked for TeaTime: allow them in this device's settings, then try again.",
  dismissed: "Notifications weren't allowed. Tap again to be asked again.",
  off: "The server has no push keys yet, so it can't send pushes.",
  unsupported: "This browser can't get pushes.",
};

export function Notifications() {
  const state = usePushState();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void refreshPush();
  }, []);

  const run = async (action: () => Promise<string | null>) => {
    setBusy(true);
    setMessage(null);
    try {
      setMessage(await action());
    } catch (err) {
      if (err instanceof PushProblem) setMessage(PROBLEMS[err.reason]);
      else if (err instanceof ApiError && err.code === "offline")
        setMessage("The server can't be reached: try again later.");
      else setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  let body;
  if (state.support === "install") {
    body = (
      <p>
        On an iPhone, pushes come only to the installed app. In Safari, tap <span className="font-bold">Share</span>,
        then <span className="font-bold">Add to Home Screen</span>, and open TeaTime from there.
      </p>
    );
  } else if (state.support === "iphone-only") {
    body = (
      <div className="flex flex-col gap-3">
        <p>Pushes come to the iPhone, in the installed app: turn them on there.</p>
        {state.key && (
          <Button
            disabled={busy}
            onClick={() =>
              void run(async () => {
                const { sent } = await testPush();
                return sent ? "Sent: it should show on the iPhone." : "No iPhone has pushes on yet.";
              })
            }
          >
            Send the iPhone a test
          </Button>
        )}
      </div>
    );
  } else if (state.support === "unsupported") {
    body = <p className="text-muted">This browser can't get pushes.</p>;
  } else if (state.key === null) {
    body = (
      <p className="text-muted">The server has no push keys yet, so it sends no pushes. The draws still happen.</p>
    );
  } else if (state.on) {
    body = (
      <div className="flex flex-col gap-3">
        <p>Pushes are on for this device: the 8:00 tea, the evening's kit, and Saturday's review.</p>
        <div className="grid grid-cols-2 gap-3">
          <Button
            disabled={busy}
            onClick={() =>
              void run(async () => {
                const { sent, failed } = await testPush();
                return sent
                  ? `Sent to ${sent === 1 ? "1 device" : `${sent} devices`}.`
                  : failed
                    ? "The push service refused it."
                    : "No device got it.";
              })
            }
          >
            Send a test
          </Button>
          <Button
            disabled={busy}
            onClick={() => void run(async () => (await turnPushOff(), "Pushes are off for this device."))}
          >
            Turn off
          </Button>
        </div>
      </div>
    );
  } else {
    body = (
      <Button
        variant="primary"
        disabled={busy || state.on === undefined}
        onClick={() => void run(async () => (await turnPushOn(), null))}
      >
        Turn on pushes
      </Button>
    );
  }

  return (
    <Section title="Notifications">
      {body}
      {message && <Notice>{message}</Notice>}
    </Section>
  );
}
