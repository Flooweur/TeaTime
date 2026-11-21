/**
 * Today's cards (SPEC §7): the blend's page, the plain tea, nothing to make, the teaser, the
 * weekend, away, a tea not drawn yet. Each is drawn from the model's card (model.ts).
 */
import {
  type Blend,
  type Catalog,
  type Ingredient,
  type PickRecord,
  type State,
  type TeaType,
  pickCups,
  plainTeaRecipe,
  scaleRecipe,
} from "@teatime/core";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { Ingredients, Steps, WaterRow, plainSteps } from "../components/Recipe";
import { Button, CupsStepper, Notice, TrustBadge } from "../components/ui";
import { ApiError } from "../lib/api";
import { plainBrew } from "../lib/format";
import { online } from "../lib/sync";
import { longDate } from "../lib/time";
import { PickActions } from "./Actions";
import type { NextDay, Unlock } from "./model";

const placeOf = (type: "office" | "home") => (type === "office" ? "at the office" : "at home");

/** The journal page: a surface card with its margin rule and, for a blend, its ribbon. */
export function Page({ ribbon = false, children }: { ribbon?: boolean; children: ReactNode }) {
  return (
    <article className="journal-page flex flex-col gap-4">
      {ribbon && <div className="journal-ribbon" aria-hidden />}
      {children}
    </article>
  );
}

/** The journal strip: the code to write in the paper journal, and Copy. */
function JournalStrip({ blend }: { blend: Blend }) {
  const [copied, setCopied] = useState(false);
  const text = `#${blend.code} ${blend.name}`;
  const copy = () =>
    void navigator.clipboard?.writeText(text).then(
      () => setCopied(true),
      () => undefined,
    );
  return (
    <div className="flex items-center justify-between gap-3 rounded-well border-[1.5px] border-dashed border-control px-4 py-2">
      <span className="font-display text-xl font-semibold">{text}</span>
      <Button variant="quiet" onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

/** The blend's name, story and trust: on Today and on its own page. */
export function BlendHead({ blend }: { blend: Blend }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="pr-10">
        <p className="nums font-display text-lg font-semibold text-highlight-ink">#{blend.code}</p>
        <h2 className="font-display text-3xl font-semibold">{blend.name}</h2>
        <p className="mt-1 text-sm text-muted">{blend.origin}</p>
      </div>
      <div>
        <TrustBadge trust={blend.trust} />
      </div>
      <p className={`story ${open ? "" : "line-clamp-4"}`}>{blend.story}</p>
      <Button variant="quiet" className="-mt-3 self-start" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? "Less" : "The whole story"}
      </Button>
    </>
  );
}

export function BlendDay({
  pick,
  blend,
  state,
  catalog,
  date,
}: {
  pick: PickRecord;
  blend: Blend;
  state: State;
  catalog: Catalog;
  date: string;
}) {
  const [cups, setCups] = useState(() => pickCups(pick, state.settings));
  const office = pick.type === "office";
  const recipe = scaleRecipe(blend, cups);
  const done = pick.status !== "pending";
  return (
    <Page ribbon>
      <BlendHead blend={blend} />
      {!done && <CupsStepper cups={cups} onChange={setCups} />}
      {recipe.sessions !== null && (
        <p className="text-sm text-muted">
          {recipe.sessions === 1 ? "One session" : `${recipe.sessions} sessions`}, shared among up to{" "}
          {blend.scaling.kind === "per-session" ? blend.scaling.sessionMax : 1}.
        </p>
      )}
      <Ingredients recipe={recipe} catalog={catalog} />
      <WaterRow waterMl={recipe.waterMl} brew={blend.brew} />
      {office && <p className="label text-sm">The office version</p>}
      <Steps
        steps={blend.steps}
        stage="day"
        office={office}
        scope={`${pick.date}:${blend.code}`}
        infusionsS={blend.brew.infusionsS}
      />
      <JournalStrip blend={blend} />
      <PickActions
        pick={pick}
        state={state}
        date={date}
        cups={cups}
        tea={{ kind: "blend", code: blend.code }}
        blendCode={blend.code}
      />
    </Page>
  );
}

export function UnlockLine({ unlock }: { unlock: Unlock | null }) {
  if (!unlock) return null;
  return (
    <p>
      The purchase that would unlock the most blends:{" "}
      <Link
        to="/pantry/$id"
        params={{ id: unlock.item.id }}
        className="font-bold text-accent underline underline-offset-4"
      >
        {unlock.item.name}
      </Link>
      .
    </p>
  );
}

export function PlainDay({
  pick,
  tea,
  teaType,
  unlock,
  state,
  catalog,
  date,
}: {
  pick: PickRecord;
  tea: Ingredient;
  teaType: TeaType;
  unlock: Unlock | null;
  state: State;
  catalog: Catalog;
  date: string;
}) {
  const [cups, setCups] = useState(() => pickCups(pick, state.settings));
  const office = pick.type === "office";
  const noKit = pick.source === "no-kit";
  const recipe = plainTeaRecipe(tea, teaType, cups);
  const brew = plainBrew(teaType, office);
  return (
    <Page>
      <div>
        <p className="label text-sm">{noKit ? "No kit today" : "A plain tea"}</p>
        <h2 className="font-display text-3xl font-semibold">{tea.name}</h2>
      </div>
      <p className="text-muted">
        {noKit
          ? "The evening draw was missed, so no kit was packed: this is a tea kept at the office."
          : "No blend can be made from the pantry as it is, so today is a plain tea, brewed by its type."}
      </p>
      {pick.status === "pending" && <CupsStepper cups={cups} onChange={setCups} />}
      <Ingredients recipe={recipe} catalog={catalog} />
      <WaterRow waterMl={recipe.waterMl} brew={{ tempC: brew.tempC, ratioGPer100ml: teaType.ratioGPer100ml }} />
      <Steps
        steps={plainSteps(teaType, office)}
        stage="day"
        office={office}
        scope={`${pick.date}:${tea.id}`}
        infusionsS={brew.infusionsS}
      />
      {!noKit && <UnlockLine unlock={unlock} />}
      <PickActions
        pick={pick}
        state={state}
        date={date}
        cups={cups}
        tea={{ kind: "plain", tea: tea.id }}
        blendCode={null}
      />
    </Page>
  );
}

export function NothingDay({ pick, unlock }: { pick: PickRecord; unlock: Unlock | null }) {
  const noKit = pick.source === "no-kit";
  return (
    <Page>
      <h2 className="font-display text-2xl font-semibold">{noKit ? "No kit today" : "No tea to make today"}</h2>
      <p className="text-muted">
        {noKit
          ? "The evening draw was missed, so no kit was packed, and no tea is marked as kept at the office."
          : "The pantry has no tea that can be brewed."}
      </p>
      {noKit ? (
        <p>
          Mark the teas you keep at the office in the{" "}
          <Link to="/pantry" className="font-bold text-accent underline underline-offset-4">
            pantry
          </Link>
          .
        </p>
      ) : (
        <UnlockLine unlock={unlock} />
      )}
    </Page>
  );
}

/** The sealed envelope: a home blend before the morning time (SPEC §2.2). */
export function Teaser({ when, onPeek }: { when: string; onPeek: () => void }) {
  return (
    <div className="overflow-hidden rounded-card bg-surface shadow-card">
      <div className="relative h-16 bg-sunk" aria-hidden>
        <div className="absolute top-10 left-1/2 size-10 -translate-x-1/2 rounded-full bg-highlight" />
      </div>
      <div className="flex flex-col items-center gap-4 px-card pt-8 pb-card text-center">
        <p className="font-display text-2xl font-semibold">{when}</p>
        <Button onClick={onPeek}>Peek</Button>
      </div>
    </div>
  );
}

function NextTeaDay({ next }: { next: NextDay | null }) {
  if (!next) return null;
  return (
    <p>
      The next tea day is <span className="font-bold">{longDate(next.date)}</span>, {placeOf(next.type)}.
    </p>
  );
}

export function Weekend({ next }: { next: NextDay | null }) {
  return (
    <Page>
      <h2 className="font-display text-2xl font-semibold">No tea today</h2>
      <NextTeaDay next={next} />
      <p>
        To make one anyway, pick it in the{" "}
        <Link to="/library" className="font-bold text-accent underline underline-offset-4">
          library
        </Link>{" "}
        and tap I made this.
      </p>
    </Page>
  );
}

export function Away({ next }: { next: NextDay | null }) {
  return (
    <Page>
      <h2 className="font-display text-2xl font-semibold">You're away</h2>
      <p className="text-muted">No tea and no notifications until you're back.</p>
      <NextTeaDay next={next} />
    </Page>
  );
}

/** A tea day whose tea isn't drawn yet: "Draw now", which needs the server. */
export function Undrawn({ date, label }: { date: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const draw = async () => {
    setBusy(true);
    setError(null);
    try {
      await online("POST", `picks/${date}/draw`);
    } catch (err) {
      setError(
        err instanceof ApiError && err.code === "offline"
          ? "The server can't be reached: try again later."
          : (err as Error).message,
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex flex-col gap-3">
      <Button variant="primary" onClick={() => void draw()} disabled={busy}>
        {busy ? "Drawing…" : label}
      </Button>
      {error && <Notice tone="warn">{error}</Notice>}
    </div>
  );
}
