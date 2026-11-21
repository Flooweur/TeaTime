/**
 * Settings → the week (SPEC §2.1, §7): the office weekdays, the per-date overrides, and the away
 * periods. Each needs the server, which re-checks the pending picks they touch (SPEC §2.4).
 */
import { DAY_TYPES, type DayType, type Weekday } from "@teatime/core";
import { useState } from "react";
import { Button, Notice, Section } from "../../components/ui";
import { longDate, localAt, useNow } from "../../lib/time";
import { useOnline } from "../../lib/useOnline";
import { useView } from "../../lib/view";

const WEEKDAYS: readonly (readonly [Weekday, string])[] = [
  [1, "Mon"],
  [2, "Tue"],
  [3, "Wed"],
  [4, "Thu"],
  [5, "Fri"],
];

const PLACE: Record<DayType, string> = { office: "at the office", home: "at home" };

/** What a change needing the server said: its refusal, or the packed kit it would throw away. */
export function OnlineFeedback({ online }: { online: ReturnType<typeof useOnline> }) {
  if (online.heldText && online.held) {
    const { send } = online.held;
    return (
      <Notice tone="warn">
        <p>{online.heldText}</p>
        <div className="mt-2 flex gap-3">
          <Button onClick={() => void send()} disabled={online.busy}>
            Go on
          </Button>
          <Button variant="quiet" onClick={online.cancel}>
            Keep the kit
          </Button>
        </div>
      </Notice>
    );
  }
  return online.error ? <Notice tone="warn">{online.error}</Notice> : null;
}

const input = "min-h-tap rounded-control border-[1.5px] border-control bg-surface px-3";

export function Week() {
  const { state } = useView();
  const now = useNow(60_000);
  const today = localAt(now, state.settings.timeZone).date;
  const online = useOnline();
  const [overrideDate, setOverrideDate] = useState("");
  const [overrideType, setOverrideType] = useState<DayType>("home");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const officeDays = state.settings.officeDays;
  const toggleDay = (day: Weekday) => {
    const next = officeDays.includes(day) ? officeDays.filter((d) => d !== day) : [...officeDays, day];
    void online.run("PUT", "settings", { officeDays: [...next].sort() });
  };

  const overrides = Object.entries(state.overrides)
    .filter(([date]) => date >= today)
    .sort(([a], [b]) => a.localeCompare(b));
  const away = state.away.filter((period) => period.to >= today);

  return (
    <Section title="The week">
      <div>
        <p className="label mb-1.5 text-sm">At the office</p>
        <div className="grid grid-cols-5 gap-2" role="group" aria-label="Office days">
          {WEEKDAYS.map(([day, label]) => {
            const on = officeDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                aria-pressed={on}
                disabled={online.busy}
                onClick={() => toggleDay(day)}
                className={`min-h-[50px] rounded-control font-bold ${on ? "bg-accent text-on-accent" : "border-[1.5px] border-control"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-sm text-muted">The other weekdays are at home.</p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="label text-sm">One day different</p>
        {overrides.map(([date, type]) => (
          <div key={date} className="flex items-center justify-between gap-3">
            <span>
              {longDate(date)}, {PLACE[type]}
            </span>
            <Button
              variant="quiet"
              disabled={online.busy}
              onClick={() => void online.run("PUT", `overrides/${date}`, { type: null })}
            >
              Remove
            </Button>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            aria-label="The day"
            min={today}
            value={overrideDate}
            onChange={(e) => setOverrideDate(e.target.value)}
            className={input}
          />
          <select
            aria-label="Where"
            value={overrideType}
            onChange={(e) => setOverrideType(e.target.value as DayType)}
            className={input}
          >
            {DAY_TYPES.map((type) => (
              <option key={type} value={type}>
                {PLACE[type]}
              </option>
            ))}
          </select>
          <Button
            disabled={online.busy || !overrideDate}
            onClick={() =>
              void online
                .run("PUT", `overrides/${overrideDate}`, { type: overrideType })
                .then((ok) => ok && setOverrideDate(""))
            }
          >
            Set
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="label text-sm">Away: no tea, no pushes</p>
        {away.map((period) => (
          <div key={period.id} className="flex items-center justify-between gap-3">
            <span>
              {period.from === period.to ? longDate(period.from) : `${longDate(period.from)} to ${longDate(period.to)}`}
            </span>
            <Button
              variant="quiet"
              disabled={online.busy}
              onClick={() => void online.run("DELETE", `away/${period.id}`)}
            >
              Remove
            </Button>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            aria-label="Away from"
            min={today}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={input}
          />
          <input
            type="date"
            aria-label="Away to"
            min={from || today}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={input}
          />
          <Button
            disabled={online.busy || !from || !to}
            onClick={() =>
              void online.run("POST", "away", { id: crypto.randomUUID(), from, to }).then((ok) => {
                if (ok) {
                  setFrom("");
                  setTo("");
                }
              })
            }
          >
            Add
          </Button>
        </div>
      </div>
      <OnlineFeedback online={online} />
    </Section>
  );
}
