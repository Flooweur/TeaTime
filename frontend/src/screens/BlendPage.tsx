/**
 * A blend's page (SPEC §7): its story and sources, its recipe for the chosen cups with timers, what
 * it lacks, its marks (★, make again, not for me), and I made this, which logs a brew outside the
 * day's pick and deducts it like any other (SPEC §2.4).
 */
import { RATINGS, type Rating, scaleRecipe } from "@teatime/core";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Ingredients, Steps, WaterRow } from "../components/Recipe";
import { Button, CircleChoice, CupsStepper, Notice, Screen, Section, Toggle } from "../components/ui";
import { newId, send } from "../lib/commands";
import { defaultCups, shortfallText, shortfallsNow } from "../lib/pantryView";
import { localAt, useNow } from "../lib/time";
import { useView } from "../lib/view";
import { BlendHead, Page } from "../today/Cards";
import { useUndo } from "../today/useUndo";

export function BlendPage({ code }: { code: string }) {
  const { state, catalog } = useView();
  const blend = catalog.blendByCode.get(code);
  const now = useNow(60_000);
  const today = localAt(now, state.settings.timeZone).date;
  const [cups, setCups] = useState(() => (blend ? defaultCups(blend, state) : 1));
  const [brewId, setBrewId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { offer, offerUndo, undo } = useUndo();

  if (!blend) {
    return (
      <Screen title="Not found">
        <p>No blend has the code #{code}.</p>
        <Link to="/library" className="font-bold text-accent underline">
          The library
        </Link>
      </Screen>
    );
  }

  const recipe = scaleRecipe(blend, cups);
  const missing = shortfallsNow(blend, state, catalog, today);
  const marks = state.marks[blend.code];
  const brew = brewId ? state.brews[brewId] : undefined;

  const mark = (field: "favourite" | "makeAgain" | "notForMe") => (on: boolean) =>
    void send("blend.marked", { blend: blend.code, [field]: on });

  const madeThis = async () => {
    setMessage(null);
    const id = newId();
    const { result } = await send("brew.logged", {
      brew: id,
      tea: { kind: "blend", code: blend.code },
      cups,
      date: today,
    });
    if (!result.ok) return setMessage("That couldn't be logged.");
    setBrewId(id);
    offerUndo({
      label: "I made this",
      run: async () => {
        await send("brew.removed", { brew: id });
        setBrewId(null);
      },
    });
  };

  const rate = (value: Rating) =>
    brew && void send("brew.rated", { brew: brew.id, rating: value === brew.rating.value ? null : value });

  return (
    <Screen eyebrow={blend.mode === "safe" ? "Office (safe)" : "Home (experimental)"} title={`#${blend.code}`}>
      <Page ribbon>
        <BlendHead blend={blend} />
        {missing.length > 0 && (
          <Notice tone="warn">Missing: {missing.map((s) => shortfallText(s, catalog)).join(", ")}.</Notice>
        )}
        <CupsStepper cups={cups} onChange={setCups} />
        <Ingredients recipe={recipe} catalog={catalog} />
        <WaterRow waterMl={recipe.waterMl} brew={blend.brew} />
        <Steps
          steps={blend.steps}
          stage="all"
          office={false}
          scope={`blend:${blend.code}`}
          infusionsS={blend.brew.infusionsS}
        />
        {offer && (
          <div className="flex items-center justify-between gap-3 rounded-well bg-sunk px-4 py-1" role="status">
            <span>{offer.label}: logged.</span>
            <Button variant="quiet" onClick={() => void undo()}>
              Undo
            </Button>
          </div>
        )}
        {brew ? (
          <div>
            <p className="label mb-1.5 text-sm">Your rating</p>
            <CircleChoice label="Your rating" values={RATINGS} value={brew.rating.value} onChange={rate} />
          </div>
        ) : (
          <Button variant="primary" onClick={() => void madeThis()}>
            I made this
          </Button>
        )}
        {message && <Notice tone="warn">{message}</Notice>}
      </Page>

      <Section title="Marks">
        <Toggle label="★ Favourite" checked={marks?.favourite.value ?? false} onChange={mark("favourite")} />
        <Toggle
          label="Make again"
          hint="It comes back even after a low rating."
          checked={marks?.makeAgain.value ?? false}
          onChange={mark("makeAgain")}
        />
        <Toggle
          label="Not for me"
          hint="It's never drawn while this is on."
          checked={marks?.notForMe.value ?? false}
          onChange={mark("notForMe")}
        />
      </Section>

      <Section title="Sources">
        <ul className="flex flex-col gap-3">
          {blend.sources.map((source, i) => (
            <li key={i} className="text-sm">
              <span className="font-bold">
                {source.url ? (
                  <a href={source.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                    {source.title}
                  </a>
                ) : (
                  source.title
                )}
              </span>
              {source.author && <span>, {source.author}</span>}
              {source.ref && <span> ({source.ref})</span>}
              <span className="text-muted">
                {" "}
                · {source.lang}
                {source.primary ? " · primary" : ""} · backs the {source.supports.join(", ")}
              </span>
              {source.note && <span className="block text-muted">{source.note}</span>}
            </li>
          ))}
        </ul>
      </Section>
    </Screen>
  );
}
