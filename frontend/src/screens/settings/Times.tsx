/**
 * Settings → pushes and brewing (SPEC §2.2, §2.7, §7): the three times, pushes on or off for every
 * device (the draws happen anyway), the cooldown, and the default cups. Each needs the server.
 */
import { EARLIEST_TIME, LATEST_TIME, MAX_COOLDOWN_DAYS, type Settings } from "@teatime/core";
import { useState } from "react";
import { CupsStepper, Section, Toggle } from "../../components/ui";
import { useOnline } from "../../lib/useOnline";
import { useView } from "../../lib/view";
import { OnlineFeedback } from "./Week";

const TIMES: readonly (readonly [
  keyof Pick<Settings, "eveningTime" | "morningTime" | "reviewTime">,
  string,
  string,
])[] = [
  [
    "eveningTime",
    "The evening draw",
    "The day before each tea day: the draw, and the push when there's a kit to pack.",
  ],
  ["morningTime", "The morning push", "And when a home day's blend stops being a surprise."],
  ["reviewTime", "Saturday's review", "Its push."],
];

const input = "nums min-h-tap rounded-control border-[1.5px] border-control bg-surface px-3";

/** A time input, saved when it changes to a whole time. */
function TimeField({
  label,
  hint,
  value,
  onSave,
}: {
  label: string;
  hint: string;
  value: string;
  onSave: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span>
        {label}
        <span className="block text-sm text-muted">{hint}</span>
      </span>
      <input
        type="time"
        min={EARLIEST_TIME}
        max={LATEST_TIME}
        defaultValue={value}
        key={value}
        onBlur={(e) => {
          if (e.target.value && e.target.value !== value) onSave(e.target.value);
        }}
        className={input}
      />
    </label>
  );
}

export function Times() {
  const { state } = useView();
  const s = state.settings;
  const online = useOnline();
  const save = (patch: Partial<Settings>) => void online.run("PUT", "settings", patch);
  const [cooldown, setCooldown] = useState(String(s.cooldownDays));

  return (
    <>
      <Section title="Pushes">
        <Toggle
          label="Pushes"
          hint="For every device. The teas are still drawn when they're off."
          checked={s.notifications}
          onChange={(notifications) => save({ notifications })}
        />
        {TIMES.map(([key, label, hint]) => (
          <TimeField key={key} label={label} hint={hint} value={s[key]} onSave={(v) => save({ [key]: v })} />
        ))}
        <p className="text-sm text-muted">
          Times from {EARLIEST_TIME} to {LATEST_TIME}, in {s.timeZone}.
        </p>
      </Section>
      <Section title="Brewing">
        <div className="flex items-center justify-between gap-4">
          <span>Office cups</span>
          <CupsStepper cups={s.officeCups} onChange={(officeCups) => save({ officeCups })} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Home cups</span>
          <CupsStepper cups={s.homeCups} onChange={(homeCups) => save({ homeCups })} />
        </div>
        <label className="flex items-center justify-between gap-4">
          <span>
            Cooldown, in days
            <span className="block text-sm text-muted">How long a made blend waits before it can be drawn again.</span>
          </span>
          <input
            inputMode="numeric"
            value={cooldown}
            onChange={(e) => setCooldown(e.target.value)}
            onBlur={() => {
              const days = Number(cooldown);
              if (Number.isInteger(days) && days >= 0 && days <= MAX_COOLDOWN_DAYS && days !== s.cooldownDays) {
                save({ cooldownDays: days });
              } else setCooldown(String(s.cooldownDays));
            }}
            className={`${input} w-20 text-right`}
          />
        </label>
      </Section>
      <OnlineFeedback online={online} />
    </>
  );
}
