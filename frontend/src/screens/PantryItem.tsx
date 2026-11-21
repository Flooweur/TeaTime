/**
 * One ingredient or piece of gear (SPEC §7): have or don't have; for an ingredient, the amount
 * left, when it was opened and whether some is kept at the office; its shops; and the blends it is
 * used in, and how many it would unlock.
 */
import { type Shop, type ShopRef, entryOf, freshnessOf } from "@teatime/core";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Notice, Screen, Section, Toggle } from "../components/ui";
import { send } from "../lib/commands";
import { unlocksNow } from "../lib/pantryView";
import { localAt, useNow } from "../lib/time";
import { useView } from "../lib/view";
import { FRESHNESS_TEXT } from "./Pantry";

function Shops({ refs, shops }: { refs: readonly ShopRef[]; shops: ReadonlyMap<string, Shop> }) {
  return (
    <ul className="flex flex-col gap-3">
      {refs.map((ref) => {
        const shop = shops.get(ref.shop);
        const href = ref.url ?? shop?.url;
        return (
          <li key={ref.shop} className="rounded-well bg-surface px-4 py-3 shadow-card">
            <p className="font-bold">
              {href ? (
                <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                  {shop?.name ?? ref.shop}
                </a>
              ) : (
                (shop?.name ?? ref.shop)
              )}
              <span className="font-normal text-muted">
                {" "}
                · {shop?.kind === "lyon" ? (shop.address ?? "Lyon") : "online"}
              </span>
            </p>
            <p className="text-sm">{ref.why}</p>
            <p className="nums text-sm text-muted">
              {ref.price} · checked {ref.checked}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

/** The amount left, entered and saved at once (a measurement: SPEC §3.3). */
function AmountField({ id, unit, amount }: { id: string; unit: string; amount: number | null }) {
  const [text, setText] = useState(amount === null ? "" : String(amount));
  const [error, setError] = useState<string | null>(null);
  const save = async () => {
    const trimmed = text.trim().replace(",", ".");
    const value = trimmed === "" ? null : Number(trimmed);
    if (value !== null && (!Number.isFinite(value) || value < 0 || value > 100_000)) {
      setError(`A number of ${unit} from 0.`);
      return;
    }
    setError(null);
    if (value !== amount) await send("pantry.set", { ingredient: id, amount: value });
  };
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-3">
        <span className="flex-1">Left ({unit})</span>
        <input
          inputMode="decimal"
          value={text}
          placeholder="not tracked"
          onChange={(e) => setText(e.target.value)}
          onBlur={() => void save()}
          onKeyDown={(e) => {
            if (e.key === "Enter") void save();
          }}
          className="nums min-h-tap w-32 rounded-control border-[1.5px] border-control bg-surface px-3 text-right"
        />
      </label>
      <p className="text-sm text-muted">Empty: the amount isn't tracked, and Made it takes nothing off.</p>
      {error && <Notice tone="warn">{error}</Notice>}
    </div>
  );
}

export function PantryItem({ id }: { id: string }) {
  const { state, catalog, content } = useView();
  const now = useNow(60_000);
  const today = localAt(now, state.settings.timeZone).date;
  const ingredient = catalog.ingredientById.get(id);
  const gear = catalog.gearById.get(id);
  const item = ingredient ?? gear;
  if (!item) {
    return (
      <Screen title="Not found">
        <Link to="/pantry" className="font-bold text-accent underline">
          The pantry
        </Link>
      </Screen>
    );
  }
  const entry = entryOf(state.pantry, id);
  const shops = new Map(content.shops.map((s) => [s.id, s]));
  const usedIn = catalog.blends.filter(
    (b) => !b.retired && (b.ingredients.some((i) => i.id === id) || b.gear.some((g) => g.id === id)),
  );
  const unlocks = unlocksNow(state, catalog, today).get(id) ?? 0;
  const freshness = ingredient ? freshnessOf(entry, ingredient, today) : null;

  return (
    <Screen eyebrow={ingredient ? "Ingredient" : "Gear"} title={item.name}>
      <Section title="In the pantry">
        <Toggle
          label="I have it"
          checked={entry.have.value}
          onChange={(have) => void send("pantry.set", { ingredient: id, have })}
        />
        {ingredient && entry.have.value && (
          <>
            <AmountField
              key={`${entry.amount.at}`}
              id={id}
              unit={ingredient.unit === "pieces" ? "pieces" : ingredient.unit}
              amount={entry.amount.value}
            />
            <label className="flex items-center gap-3">
              <span className="flex-1">Opened (or bought, if fresh)</span>
              <input
                type="date"
                value={entry.openedOn.value ?? ""}
                max={today}
                onChange={(e) => void send("pantry.set", { ingredient: id, openedOn: e.target.value || null })}
                className="min-h-tap rounded-control border-[1.5px] border-control bg-surface px-3"
              />
            </label>
            <p className="text-sm text-muted">
              Keeps {ingredient.shelfLifeDays} days once opened
              {freshness && FRESHNESS_TEXT[freshness] ? `: ${FRESHNESS_TEXT[freshness]}` : ""}. {ingredient.storage}
            </p>
            <Toggle
              label="Some is kept at the office"
              hint="The no-kit card offers it when the evening draw was missed."
              checked={entry.atOffice.value}
              onChange={(atOffice) => void send("pantry.set", { ingredient: id, atOffice })}
            />
          </>
        )}
      </Section>

      <Section title="Blends">
        <p>
          {usedIn.length === 1 ? "Used in 1 blend" : `Used in ${usedIn.length} blends`}
          {!entry.have.value && unlocks > 0 ? `; having it would unlock ${unlocks}` : ""}.
        </p>
        <ul className="flex flex-wrap gap-2">
          {usedIn.map((b) => (
            <li key={b.code}>
              <Link
                to="/blend/$code"
                params={{ code: b.code }}
                className="inline-block rounded-control border-[1.5px] border-control px-3 py-2"
              >
                #{b.code} {b.name}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Where to buy it">
        <p className="text-sm">{item.quality}</p>
        <Shops refs={item.shops} shops={shops} />
      </Section>

      <Button variant="quiet" className="self-start" onClick={() => history.back()}>
        Back
      </Button>
    </Screen>
  );
}
