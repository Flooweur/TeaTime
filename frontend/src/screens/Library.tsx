/**
 * The library (SPEC §7): every blend, filtered by pool, made or not yet, can make now, origin,
 * flavour and caffeine. One that can't be made now is greyed, with what it lacks.
 */
import { type Blend, CAFFEINE_LEVELS, blendHistories, compareText } from "@teatime/core";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Screen, TrustBadge } from "../components/ui";
import { shortfallText, shortfallsNow } from "../lib/pantryView";
import { localAt, useNow } from "../lib/time";
import { useView } from "../lib/view";

type Pool = "all" | "safe" | "experimental";
type Made = "all" | "made" | "new";

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="label text-sm">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="min-h-tap rounded-control border-[1.5px] border-control bg-surface px-3"
      >
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Library() {
  const { state, catalog } = useView();
  const now = useNow(60_000);
  const today = localAt(now, state.settings.timeZone).date;
  const [pool, setPool] = useState<Pool>("all");
  const [made, setMade] = useState<Made>("all");
  const [canMake, setCanMake] = useState(false);
  const [origin, setOrigin] = useState("all");
  const [flavour, setFlavour] = useState("all");
  const [caffeine, setCaffeine] = useState("all");

  const blends = useMemo(() => catalog.blends.filter((b) => !b.retired), [catalog]);
  const histories = useMemo(() => blendHistories(Object.values(state.brews)), [state.brews]);
  const origins = useMemo(() => [...new Set(blends.map((b) => b.origin))].sort(compareText), [blends]);
  const flavours = useMemo(() => [...new Set(blends.flatMap((b) => b.flavours))].sort(compareText), [blends]);

  const rows = blends
    .map((blend) => ({ blend, shortfalls: shortfallsNow(blend, state, catalog, today) }))
    .filter(({ blend, shortfalls }) => {
      if (pool !== "all" && blend.mode !== pool) return false;
      const wasMade = histories.has(blend.code);
      if (made === "made" && !wasMade) return false;
      if (made === "new" && wasMade) return false;
      if (canMake && shortfalls.length) return false;
      if (origin !== "all" && blend.origin !== origin) return false;
      if (flavour !== "all" && !blend.flavours.includes(flavour)) return false;
      if (caffeine !== "all" && blend.caffeine !== caffeine) return false;
      return true;
    });

  return (
    <Screen title="Library">
      <div className="grid grid-cols-2 gap-3">
        <Select<Pool>
          label="Pool"
          value={pool}
          onChange={setPool}
          options={[
            ["all", "All"],
            ["safe", "Office (safe)"],
            ["experimental", "Home (experimental)"],
          ]}
        />
        <Select<Made>
          label="Made"
          value={made}
          onChange={setMade}
          options={[
            ["all", "All"],
            ["new", "Not yet"],
            ["made", "Made"],
          ]}
        />
        <Select
          label="Origin"
          value={origin}
          onChange={setOrigin}
          options={[["all", "All"], ...origins.map((o) => [o, o] as const)]}
        />
        <Select
          label="Flavour"
          value={flavour}
          onChange={setFlavour}
          options={[["all", "All"], ...flavours.map((f) => [f, f] as const)]}
        />
        <Select
          label="Caffeine"
          value={caffeine}
          onChange={setCaffeine}
          options={[["all", "All"], ...CAFFEINE_LEVELS.map((c) => [c, c] as const)]}
        />
        <label className="flex min-h-tap items-end gap-2 pb-2">
          <input type="checkbox" checked={canMake} onChange={(e) => setCanMake(e.target.checked)} className="size-5" />
          Can make now
        </label>
      </div>
      <ul className="flex flex-col gap-3">
        {rows.map(({ blend, shortfalls }) => (
          <li key={blend.code}>
            <BlendRow
              blend={blend}
              missing={shortfalls.map((s) => shortfallText(s, catalog))}
              notForMe={state.marks[blend.code]?.notForMe.value ?? false}
            />
          </li>
        ))}
        {rows.length === 0 && <li className="text-muted">No blend matches these filters.</li>}
      </ul>
    </Screen>
  );
}

function BlendRow({ blend, missing, notForMe }: { blend: Blend; missing: string[]; notForMe: boolean }) {
  const greyed = missing.length > 0;
  return (
    <Link
      to="/blend/$code"
      params={{ code: blend.code }}
      className={`block rounded-well bg-surface px-4 py-3 shadow-card ${greyed ? "opacity-70" : ""}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-lg font-semibold">
          <span className="nums text-highlight-ink">#{blend.code}</span> {blend.name}
        </span>
        <TrustBadge trust={blend.trust} />
      </div>
      <p className="text-sm text-muted">
        {blend.origin} · {blend.mode === "safe" ? "office" : "home"} · {blend.caffeine} caffeine
        {notForMe ? " · not for me" : ""}
      </p>
      {greyed && <p className="text-sm">Missing: {missing.join(", ")}</p>}
    </Link>
  );
}
