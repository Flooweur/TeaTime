/**
 * The app's small pieces, in the Warm journal look (docs/design/README.md): screens, buttons,
 * labels, notices, the trust badge, and the round choices (cups, rating) as radio groups with
 * arrow keys and a single tab stop.
 */
import type { TrustLevel } from "@teatime/core";
import { type ButtonHTMLAttributes, type KeyboardEvent, type ReactNode, useRef } from "react";

export function Screen({ title, eyebrow, children }: { title: ReactNode; eyebrow?: ReactNode; children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[30rem] px-[max(var(--spacing-screen),env(safe-area-inset-left))] pt-[max(1.25rem,env(safe-area-inset-top))] pb-28">
      {eyebrow && <p className="label text-sm">{eyebrow}</p>}
      <h1 className="font-display text-3xl font-semibold">{title}</h1>
      <div className="mt-section flex flex-col gap-section">{children}</div>
    </main>
  );
}

export function Section({ title, children, aside }: { title: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

type Variant = "primary" | "secondary" | "quiet" | "dashed";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-on-accent font-bold min-h-[54px] text-md",
  secondary: "border-[1.5px] border-control text-fg font-bold min-h-[50px]",
  quiet: "text-accent font-bold min-h-tap underline-offset-4 hover:underline",
  dashed: "border-[1.5px] border-dashed border-control text-fg font-bold min-h-[50px]",
};

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-control px-4 text-base disabled:opacity-45 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn"; children: ReactNode }) {
  const border = tone === "warn" ? "border-legend" : "border-line";
  return <div className={`rounded-well border-[1.5px] ${border} bg-surface px-4 py-3 text-sm`}>{children}</div>;
}

const TRUST: Record<TrustLevel, { label: string; colour: string; note: string }> = {
  documented: { label: "Documented", colour: "border-documented text-documented", note: "A written source backs it." },
  attested: {
    label: "Attested",
    colour: "border-attested text-attested",
    note: "A tea master, chef or tea house says so.",
  },
  legend: {
    label: "Legend",
    colour: "border-legend text-legend border-dashed",
    note: "A good story that can't be proven.",
  },
};

export function TrustBadge({ trust }: { trust: TrustLevel }) {
  const { label, colour, note } = TRUST[trust];
  return (
    <span
      title={note}
      className={`inline-flex items-center gap-1 rounded-full border-[1.5px] px-2.5 py-0.5 text-sm font-medium ${colour}`}
    >
      {label}
    </span>
  );
}

/** A row of round choices (the rating), as a radio group: arrow keys move, one tab stop. */
export function CircleChoice<T extends number>({
  label,
  values,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  values: readonly T[];
  value: T | null;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = value === null ? -1 : values.indexOf(value);
  const onKey = (event: KeyboardEvent, i: number) => {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!step) return;
    event.preventDefault();
    const next = (i + step + values.length) % values.length;
    onChange(values[next] as T);
    refs.current[next]?.focus();
  };
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {values.map((v, i) => {
        const checked = v === value;
        return (
          <button
            key={v}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            disabled={disabled}
            tabIndex={checked || (index === -1 && i === 0) ? 0 : -1}
            onClick={() => onChange(v)}
            onKeyDown={(e) => onKey(e, i)}
            className={`nums size-control rounded-full font-display text-lg font-semibold ${
              checked ? "bg-accent text-on-accent" : "border-[1.5px] border-control"
            } disabled:opacity-45`}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}

/** − n cups + : the cups selector, from 1 to 12 (SPEC §2.4). */
export function CupsStepper({
  cups,
  onChange,
  unit = "cup",
  disabled = false,
}: {
  cups: number;
  onChange: (cups: number) => void;
  unit?: string;
  /** While a change is on its way to the server: a second tap would send the same value again. */
  disabled?: boolean;
}) {
  const round = "size-control rounded-full border-[1.5px] border-control font-display text-xl disabled:opacity-35";
  return (
    <div className="flex items-center gap-3" role="group" aria-label="Cups">
      <button
        type="button"
        className={round}
        disabled={disabled || cups <= 1}
        onClick={() => onChange(cups - 1)}
        aria-label="One cup fewer"
      >
        −
      </button>
      <span className="nums min-w-[4.5rem] text-center font-display text-lg font-semibold" aria-live="polite">
        {cups} {cups === 1 ? unit : `${unit}s`}
      </span>
      <button
        type="button"
        className={round}
        disabled={disabled || cups >= 12}
        onClick={() => onChange(cups + 1)}
        aria-label="One cup more"
      >
        +
      </button>
    </div>
  );
}

/** An on/off switch with its label. */
export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (on: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex min-h-tap items-center justify-between gap-4">
      <span>
        {label}
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-6 accent-[var(--color-accent)]"
      />
    </label>
  );
}
