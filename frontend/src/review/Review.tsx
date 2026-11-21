/**
 * The weekly review (SPEC §2.8), on Saturday and Sunday: the week's teas side by side with their
 * ratings (and the colleague's for the office), ★ and make again on each blend, a tea still waiting
 * for an answer, what is going stale, the purchases that unlock the most, and next week's office
 * days. Everything here works offline: ratings, marks and skips are commands (SPEC §3.3).
 */
import { type Catalog, type PickRecord, type PickTea, type State, instantAt, minutesOf, pickCups } from "@teatime/core";
import { Link } from "@tanstack/react-router";
import { Button, Screen, Section, Toggle } from "../components/ui";
import { newId, send } from "../lib/commands";
import { qtyText } from "../lib/format";
import { longDate, localAt, useNow, weekdayOf } from "../lib/time";
import { useView } from "../lib/view";
import { Ratings } from "../today/Actions";
import { type ReviewDay, mondayOf, reviewModel } from "./model";

function teaName(tea: PickTea, catalog: Catalog): string {
  if (tea.kind === "blend") {
    const blend = catalog.blendByCode.get(tea.code);
    return blend ? `#${blend.code} ${blend.name}` : `#${tea.code}`;
  }
  if (tea.kind === "plain") return catalog.ingredientById.get(tea.tea)?.name ?? tea.tea;
  return "No tea to make";
}

/** ★ and make again, on a blend made this week (SPEC §2.8). */
function Marks({ code, state }: { code: string; state: State }) {
  const marks = state.marks[code];
  return (
    <div className="flex flex-col">
      <Toggle
        label="★ Favourite"
        checked={marks?.favourite.value ?? false}
        onChange={(favourite) => void send("blend.marked", { blend: code, favourite })}
      />
      <Toggle
        label="Make again"
        checked={marks?.makeAgain.value ?? false}
        onChange={(makeAgain) => void send("blend.marked", { blend: code, makeAgain })}
      />
    </div>
  );
}

/**
 * A tea still waiting, made after all: logged on its own day, at the morning time, so a pantry
 * measured since isn't counted down twice (decision of 2026-11-21; SPEC §3.3's deduction rule).
 */
function madeThatDay(pick: PickRecord, state: State) {
  const { tea } = pick;
  if (tea.kind === "none") return;
  const at = instantAt(pick.date, minutesOf(state.settings.morningTime), state.settings.timeZone);
  return send(
    "brew.logged",
    { brew: newId(), tea, cups: pickCups(pick, state.settings), date: pick.date, pick: pick.date },
    at,
  );
}

function DayRow({ row, state, catalog, today }: { row: ReviewDay; state: State; catalog: Catalog; today: string }) {
  const { date, day, pick, brew } = row;
  let body;
  if (day.kind === "off") body = <p className="text-muted">{day.why === "away" ? "Away." : "No tea."}</p>;
  else if (!pick) body = <p className="text-muted">No tea was drawn.</p>;
  else if (pick.status === "made" && brew) {
    body = (
      <>
        <p>{teaName(brew.tea, catalog)}</p>
        <Ratings brew={brew} />
        {brew.tea.kind === "blend" && <Marks code={brew.tea.code} state={state} />}
      </>
    );
  } else if (pick.status === "skipped") body = <p className="text-muted">{teaName(pick.tea, catalog)}: skipped.</p>;
  else if (pick.status === "cancelled") body = <p className="text-muted">Cancelled: the day changed.</p>;
  else if (date < today) {
    body = (
      <>
        <p>{teaName(pick.tea, catalog)}</p>
        <p className="text-sm text-muted">Still waiting for an answer: was it made, or skipped?</p>
        <div className="flex gap-3">
          {pick.tea.kind !== "none" && (
            <Button variant="primary" className="flex-1" onClick={() => void madeThatDay(pick, state)}>
              Made it
            </Button>
          )}
          <Button className="flex-1" onClick={() => void send("pick.skipped", { date })}>
            Skipped
          </Button>
        </div>
      </>
    );
  } else body = <p>{teaName(pick.tea, catalog)}: today's.</p>;
  return (
    <li className="flex flex-col gap-2 border-b border-line py-3 last:border-0">
      <p className="label text-sm">
        {weekdayOf(date)}
        {day.kind === "tea" ? `, ${day.type === "office" ? "office" : "home"}` : ""}
      </p>
      {body}
    </li>
  );
}

export function Review({ date }: { date: string | null }) {
  const { state, catalog } = useView();
  const now = useNow(60_000);
  const today = localAt(now, state.settings.timeZone).date;
  const model = reviewModel(state, catalog, date ?? today, today);
  const monday = mondayOf(date ?? today);
  return (
    <Screen eyebrow="The week's review" title={`Week of ${longDate(monday)}`}>
      <Section title="The week's teas">
        <ul className="rounded-well bg-surface px-4 shadow-card">
          {model.days.map((row) => (
            <DayRow key={row.date} row={row} state={state} catalog={catalog} today={today} />
          ))}
        </ul>
      </Section>

      {model.otherBrews.length > 0 && (
        <Section title="Other cups">
          <ul className="flex flex-col gap-4">
            {model.otherBrews.map((brew) => (
              <li key={brew.id} className="flex flex-col gap-2">
                <p>
                  {longDate(brew.date)}: {teaName(brew.tea, catalog)}
                </p>
                <Ratings brew={brew} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="To restock">
        {model.going.length === 0 && model.low.length === 0 ? (
          <p className="text-muted">Nothing is running low or going stale.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {model.low.map(({ ingredient, left, twoCups }) => (
              <li key={"low:" + ingredient.id}>
                <Link
                  to="/pantry/$id"
                  params={{ id: ingredient.id }}
                  className="font-bold underline underline-offset-4"
                >
                  {ingredient.name}
                </Link>
                : {qtyText(left, ingredient.unit)} left, less than two uses ({qtyText(twoCups, ingredient.unit)})
              </li>
            ))}
            {model.going.map(({ ingredient, freshness }) => (
              <li key={"going:" + ingredient.id}>
                <Link
                  to="/pantry/$id"
                  params={{ id: ingredient.id }}
                  className="font-bold underline underline-offset-4"
                >
                  {ingredient.name}
                </Link>
                : {freshness === "stale" ? "past its shelf life" : "use soon"}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {model.unlocks.length > 0 && (
        <Section title="What would unlock the most">
          <ul className="flex flex-col gap-1">
            {model.unlocks.map(({ item, count }) => (
              <li key={item.id}>
                <Link to="/pantry/$id" params={{ id: item.id }} className="font-bold underline underline-offset-4">
                  {item.name}
                </Link>
                : {count === 1 ? "1 blend" : `${count} blends`}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Next week at the office">
        <p>
          {model.preview.officeDays.length === 0
            ? "No office day next week."
            : `${model.preview.officeDays.map(weekdayOf).join(", ")}: ${model.preview.officeDays.length} office ${
                model.preview.officeDays.length === 1 ? "day" : "days"
              }.`}{" "}
          The pantry makes {model.preview.safeMakeable} of the office blends now. Each is drawn the evening before, from
          the pantry as it is then.
        </p>
        {model.preview.restock.length > 0 && (
          <>
            <p className="label text-sm">Won't last the week</p>
            <ul className="flex flex-col gap-1">
              {model.preview.restock.map(({ ingredient, left, need }) => (
                <li key={ingredient.id}>
                  <Link
                    to="/pantry/$id"
                    params={{ id: ingredient.id }}
                    className="font-bold underline underline-offset-4"
                  >
                    {ingredient.name}
                  </Link>
                  : {qtyText(left, ingredient.unit)} left, the office days may take up to{" "}
                  {qtyText(need, ingredient.unit)}
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>
    </Screen>
  );
}
