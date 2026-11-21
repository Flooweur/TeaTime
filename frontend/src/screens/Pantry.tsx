/**
 * The pantry (SPEC §7): each ingredient with have or don't have, the amount left, its freshness and
 * whether some is kept at the office; then the gear, have or don't have. Opening one shows its shops
 * and the blends it is used in or would unlock (PantryItem.tsx).
 */
import { CATEGORIES, type Category, type Ingredient, compareText, entryOf, freshnessOf } from "@teatime/core";
import { Link } from "@tanstack/react-router";
import { Screen, Section } from "../components/ui";
import { send } from "../lib/commands";
import { qtyText } from "../lib/format";
import { localAt, useNow } from "../lib/time";
import { useView } from "../lib/view";

const CATEGORY_TITLES: Record<Category, string> = {
  tea: "Teas",
  herb: "Herbs",
  spice: "Spices",
  citrus: "Citrus",
  flower: "Flowers",
  sweetener: "Sweeteners",
  dairy: "Dairy",
  other: "Other",
};

export const FRESHNESS_TEXT = { fresh: null, "use-soon": "use soon", stale: "past its shelf life" } as const;

function HaveSwitch({ id, name, have }: { id: string; name: string; have: boolean }) {
  // The box is 24 px; its label around it gives the 44 px a tap needs (SPEC §3.8).
  return (
    <label className="-mr-2 flex size-tap shrink-0 items-center justify-center">
      <input
        type="checkbox"
        role="switch"
        aria-label={`Have ${name}`}
        checked={have}
        onChange={(e) => void send("pantry.set", { ingredient: id, have: e.target.checked })}
        className="size-6 accent-[var(--color-accent)]"
      />
    </label>
  );
}

function Row({ id, name, detail, have }: { id: string; name: string; detail: string | null; have: boolean }) {
  return (
    <li className="flex min-h-tap items-center gap-3 border-b border-line py-2 last:border-0">
      <Link to="/pantry/$id" params={{ id }} className="min-w-0 flex-1">
        <span className={have ? "" : "text-muted"}>{name}</span>
        {detail && <span className="block text-sm text-muted">{detail}</span>}
      </Link>
      <HaveSwitch id={id} name={name} have={have} />
    </li>
  );
}

export function Pantry() {
  const { state, catalog } = useView();
  const now = useNow(60_000);
  const today = localAt(now, state.settings.timeZone).date;
  const byCategory = new Map<Category, Ingredient[]>();
  for (const ingredient of catalog.ingredients.filter((i) => !i.retired)) {
    byCategory.set(ingredient.category, [...(byCategory.get(ingredient.category) ?? []), ingredient]);
  }
  const detailOf = (ingredient: Ingredient) => {
    const entry = entryOf(state.pantry, ingredient.id);
    if (!entry.have.value) return null;
    const parts = [
      entry.amount.value === null ? null : `${qtyText(entry.amount.value, ingredient.unit)} left`,
      FRESHNESS_TEXT[freshnessOf(entry, ingredient, today) ?? "fresh"],
      entry.atOffice.value ? "some at the office" : null,
    ].filter(Boolean);
    return parts.length ? parts.join(" · ") : null;
  };
  const gear = catalog.gear.filter((g) => !g.retired);

  return (
    <Screen title="Pantry">
      {CATEGORIES.filter((c) => byCategory.has(c)).map((category) => (
        <Section key={category} title={CATEGORY_TITLES[category]}>
          <ul className="rounded-well bg-surface px-4 shadow-card">
            {(byCategory.get(category) ?? [])
              .sort((a, b) => compareText(a.name, b.name))
              .map((ingredient) => (
                <Row
                  key={ingredient.id}
                  id={ingredient.id}
                  name={ingredient.name}
                  detail={detailOf(ingredient)}
                  have={entryOf(state.pantry, ingredient.id).have.value}
                />
              ))}
          </ul>
        </Section>
      ))}
      {gear.length > 0 && (
        <Section title="Gear">
          <p className="text-sm text-muted">
            What the blends need besides ingredients: the shopping list for what you don't have yet.
          </p>
          <ul className="rounded-well bg-surface px-4 shadow-card">
            {gear.map((piece) => (
              <Row
                key={piece.id}
                id={piece.id}
                name={piece.name}
                detail={null}
                have={entryOf(state.pantry, piece.id).have.value}
              />
            ))}
          </ul>
        </Section>
      )}
    </Screen>
  );
}
