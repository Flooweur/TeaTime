/**
 * A recipe for its cups (SPEC §7, the blend card): the ingredients and gear with dotted leaders to
 * their quantities, the water row, and the steps with their timers, the infusions chained (each
 * waits for a tap once the one before is done). On an office day, each step's office version.
 */
import type { Brew, Catalog, PlainBrew, Recipe, Stage, Step } from "@teatime/core";
import { qtyText, tempText, waterText } from "../lib/format";
import { statusOf, useTimers } from "../lib/timer";
import { useNow } from "../lib/time";
import { Countdown } from "./Countdown";

export function Ingredients({ recipe, catalog }: { recipe: Recipe; catalog: Catalog }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {recipe.ingredients.map((item) => {
        const ingredient = catalog.ingredientById.get(item.id);
        return (
          <li key={item.id} className="flex items-end">
            <span>
              {ingredient?.name ?? item.id}
              {item.optional && <span className="text-sm text-muted"> (optional)</span>}
            </span>
            <span className="leader" aria-hidden />
            <span className="nums font-display text-lg font-semibold">{qtyText(item.qty, item.unit)}</span>
          </li>
        );
      })}
      {recipe.gear.map((piece) => (
        <li key={piece.id} className="flex items-end">
          <span>
            {catalog.gearById.get(piece.id)?.name ?? piece.id}
            <span className="text-sm text-muted">{piece.optional ? " (optional gear)" : " (gear)"}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The water row: how much, which, how hot, the ratio, preheating, and the vessel; a plain tea's brew gives fewer. */
export function WaterRow({
  waterMl,
  brew,
}: {
  waterMl: number;
  brew: Pick<Brew, "tempC" | "tempRange"> & Partial<Pick<Brew, "water" | "vessel" | "preheat" | "ratioGPer100ml">>;
}) {
  const parts = [
    brew.water ? `${waterMl} ml ${waterText(brew.water)}` : `${waterMl} ml of water`,
    tempText(brew),
    brew.ratioGPer100ml ? `${brew.ratioGPer100ml} g per 100 ml` : null,
    brew.vessel ? (brew.preheat ? `preheat the ${brew.vessel}` : `in a ${brew.vessel}`) : null,
  ].filter(Boolean);
  return <p className="nums rounded-well bg-sunk px-4 py-3">{parts.join(" · ")}</p>;
}

/** The infusions, chained: the next one shows once the one before is done. */
function Infusions({ scope, seconds }: { scope: string; seconds: readonly number[] }) {
  const timers = useTimers();
  const now = useNow(1000);
  const shown: number[] = [];
  for (let i = 0; i < seconds.length; i++) {
    shown.push(i);
    if (statusOf(timers[`${scope}:infusion:${i}`], now) !== "done") break;
  }
  return (
    <div className="flex flex-col gap-2">
      {shown.map((i) => (
        <Countdown
          key={i}
          timerKey={`${scope}:infusion:${i}`}
          seconds={seconds[i] as number}
          label={seconds.length > 1 ? `Infusion ${i + 1}` : "Infusion"}
        />
      ))}
    </div>
  );
}

export function Steps({
  steps,
  stage,
  office,
  scope,
  infusionsS,
}: {
  steps: readonly Step[];
  stage: Stage | "all";
  office: boolean;
  scope: string;
  infusionsS: readonly number[];
}) {
  const shown = steps.map((step, i) => ({ step, i })).filter(({ step }) => stage === "all" || step.stage === stage);
  return (
    <ol className="flex flex-col gap-4">
      {shown.map(({ step, i }, n) => (
        <li key={i} className="flex gap-3">
          <span
            className="nums mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-control font-display font-semibold"
            aria-hidden
          >
            {n + 1}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {stage === "all" && step.stage === "evening" && <span className="label text-sm">The evening before</span>}
            <p>{office && step.office ? step.office : step.text}</p>
            {step.timerS !== undefined && (
              <Countdown timerKey={`${scope}:step:${i}`} seconds={step.timerS} label="Timer" />
            )}
            {step.infusions && <Infusions scope={`${scope}:step:${i}`} seconds={infusionsS} />}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** A plain tea's steps (SPEC §2.5), from its brew: hot water, then the infusions. */
export function plainSteps(brew: PlainBrew, office: boolean): Step[] {
  const temp = office ? brew.office.tempC : brew.tempC;
  return [
    {
      text: `Heat the water to ${temp} °C${brew.tempRange ? ` (${brew.tempRange.min}–${brew.tempRange.max})` : ""}.`,
      office: brew.office.method,
      infusions: false,
      stage: "day",
    },
    {
      text: "Pour the water on the leaves, and time each infusion.",
      office: "Pour, and time each infusion.",
      infusions: true,
      stage: "day",
    },
  ];
}
