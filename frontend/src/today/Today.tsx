/**
 * Today (SPEC §7): the day's card, chosen by the model (model.ts), and, from the evening's draw
 * time, tomorrow's: its office kit to pack, its blend to start tonight, or its draw.
 */
import { type Catalog, type PickRecord, type State, pickCups, recipeOf } from "@teatime/core";
import { useState } from "react";
import { Ingredients, Steps } from "../components/Recipe";
import { Button, CupsStepper, Notice, Screen, Section } from "../components/ui";
import { send } from "../lib/commands";
import { longDate, useNow } from "../lib/time";
import { type View, useView } from "../lib/view";
import { Away, BlendDay, NothingDay, Page, PlainDay, Teaser, Undrawn, Weekend } from "./Cards";
import { type DayCard, type Evening, todayModel } from "./model";

const clockOf = (at: number, timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone }).format(at);

function CardView({
  card,
  view,
  date,
  onPeek,
}: {
  card: DayCard;
  view: View;
  date: string;
  onPeek: (date: string) => void;
}) {
  const { state, catalog } = view;
  switch (card.kind) {
    case "weekend":
      return <Weekend next={card.next} />;
    case "away":
      return <Away next={card.next} />;
    case "undrawn":
      return (
        <Page>
          <h2 className="font-display text-2xl font-semibold">Today's tea isn't drawn yet</h2>
          <p className="text-muted">The server draws it as soon as it can, or now.</p>
          <Undrawn date={date} label="Draw today's tea" />
        </Page>
      );
    case "teaser":
      return (
        <Teaser
          when={`Today's tea arrives at ${clockOf(card.revealsAt, state.settings.timeZone)}`}
          onPeek={() => onPeek(card.pick.date)}
        />
      );
    case "blend":
      return (
        <BlendDay
          key={card.pick.date}
          pick={card.pick}
          blend={card.blend}
          state={state}
          catalog={catalog}
          date={date}
        />
      );
    case "plain":
      return (
        <PlainDay
          key={card.pick.date}
          pick={card.pick}
          tea={card.tea}
          teaType={card.teaType}
          unlock={card.unlock}
          state={state}
          catalog={catalog}
          date={date}
        />
      );
    case "nothing":
      return <NothingDay pick={card.pick} unlock={card.unlock} />;
    case "cancelled":
      return (
        <Page>
          <h2 className="font-display text-2xl font-semibold">No tea today</h2>
          <p className="text-muted">This day changed after its tea was drawn.</p>
        </Page>
      );
    case "unknown":
      return <Notice tone="warn">This tea comes from a newer version of the content: reload the app to see it.</Notice>;
  }
}

/** Tomorrow's office kit, as a checklist for its cups, with Packed (SPEC §2.4). */
function Kit({ pick, state, catalog }: { pick: PickRecord; state: State; catalog: Catalog }) {
  const [cups, setCups] = useState(() => pickCups(pick, state.settings));
  const [message, setMessage] = useState<string | null>(null);
  const recipe = recipeOf(pick.tea, cups, catalog);
  if (!recipe) return <p className="text-muted">Nothing to pack: tomorrow has no tea to make.</p>;
  const pack = async () => {
    const { result } = await send("pick.packed", { date: pick.date, cups });
    setMessage(result.ok ? null : "That couldn't be marked packed.");
  };
  return (
    <div className="flex flex-col gap-4">
      {pick.packedAt === null && <CupsStepper cups={cups} onChange={setCups} />}
      <Ingredients recipe={recipe} catalog={catalog} />
      {pick.packedAt !== null ? (
        <p className="font-bold">Packed, for {pick.packedCups} cups.</p>
      ) : (
        <Button variant="primary" onClick={() => void pack()}>
          Packed
        </Button>
      )}
      {message && <Notice tone="warn">{message}</Notice>}
    </div>
  );
}

function EveningView({ evening, view, onPeek }: { evening: Evening; view: View; onPeek: (date: string) => void }) {
  const { state, catalog } = view;
  const title = `Tomorrow, ${longDate(evening.date)}`;
  const { pick, card } = evening;
  if (!pick) {
    return (
      <Section title={title}>
        <p className="text-muted">
          {evening.type === "office"
            ? "An office day: draw its tea now to pack the kit."
            : "Tomorrow's tea is drawn tonight."}
        </p>
        <Undrawn date={evening.date} label="Draw tomorrow's tea now" />
      </Section>
    );
  }
  const blend = card?.kind === "blend" ? card.blend : null;
  const tonight = blend?.prep === "evening" && pick.status === "pending";
  return (
    <Section title={title}>
      {pick.type === "office" && (
        <>
          <p className="text-muted">The office kit{blend ? `: #${blend.code} ${blend.name}` : ""}.</p>
          <Kit pick={pick} state={state} catalog={catalog} />
        </>
      )}
      {tonight && blend && (
        <Page>
          <p className="label text-sm">Start tonight</p>
          <h3 className="font-display text-2xl font-semibold">
            #{blend.code} {blend.name}
          </h3>
          <Steps
            steps={blend.steps}
            stage="evening"
            office={false}
            scope={`${pick.date}:${blend.code}`}
            infusionsS={blend.brew.infusionsS}
          />
        </Page>
      )}
      {pick.type === "home" && card?.kind === "teaser" && (
        <Teaser
          when={`Tomorrow's tea arrives at ${clockOf(card.revealsAt, state.settings.timeZone)}`}
          onPeek={() => onPeek(pick.date)}
        />
      )}
      {pick.type === "home" && !tonight && card?.kind !== "teaser" && card?.kind !== "blend" && (
        <p className="text-muted">Tomorrow's tea is drawn.</p>
      )}
      {pick.type === "home" && !tonight && card?.kind === "blend" && (
        <p>
          Tomorrow: #{card.blend.code} {card.blend.name}.
        </p>
      )}
    </Section>
  );
}

export function Today({ fromPush }: { fromPush: string | null }) {
  const view = useView();
  const now = useNow(15_000);
  const [peeked, setPeeked] = useState<ReadonlySet<string>>(new Set());
  const model = todayModel(view.state, view.catalog, now, { peeked, fromPush });
  const peek = (date: string) => setPeeked((current) => new Set([...current, date]));
  const type =
    model.card.kind === "weekend" || model.card.kind === "away"
      ? null
      : "pick" in model.card
        ? model.card.pick.type
        : model.card.type;
  return (
    <Screen eyebrow={type ? (type === "office" ? "At the office" : "At home") : null} title={longDate(model.date)}>
      <CardView card={model.card} view={view} date={model.date} onPeek={peek} />
      {model.evening && <EveningView evening={model.evening} view={view} onPeek={peek} />}
    </Screen>
  );
}
