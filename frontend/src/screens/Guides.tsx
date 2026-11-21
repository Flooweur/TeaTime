/**
 * The guides (SPEC §6): the general tea guide and the Earl Grey guide. A guide the content has is
 * shown in full, rendered at build time and readable offline. One not written yet shows its chapter
 * outline, as docs/original-plan.md lays it out; a later content batch writes it, with sources.
 */
import type { Guide } from "@teatime/core";
import { Screen, Section } from "../components/ui";
import { bundle } from "../lib/content";

/** The two guides and their chapters, until they're written (docs/original-plan.md, Guides). */
export const OUTLINES: readonly {
  readonly id: string;
  readonly title: string;
  readonly chapters: readonly string[];
}[] = [
  {
    id: "general",
    title: "The tea guide",
    chapters: [
      "The tea families: white, green, yellow, oolong, black, dark and pu-erh, and herbal infusions",
      "Water: hardness, Lyon's tap water against soft bottled water, filtering, never reboiling",
      "Temperature by tea type, and how to get it without a variable kettle",
      "Ratio and time: Western style and gongfu, and several infusions",
      "Equipment: the teapot, the gaiwan, the kyusu, a scale, a thermometer, and what's worth buying",
      "Storage and freshness",
      "Additions: milk, sugar, honey, citrus, spices and flowers, and when each works",
      "Tasting: how to describe a tea, and a template for the journal page",
      "Making tea at the office",
    ],
  },
  {
    id: "earl-grey",
    title: "The Earl Grey guide",
    chapters: [
      "The legend and the facts",
      "Choosing the base tea: Ceylon, Keemun, Darjeeling, Chinese black, or oolong and green",
      "Bergamot: the oil or fresh zest, dried peel, and Calabria's season (winter)",
      "Making your own Earl Grey, step by step",
      "Brewing it well: the water, the temperature, the time, with or without milk",
      "Additions: cornflower, lavender, vanilla, rose, orange peel (Lady Grey)",
      "Earl Grey drinks: London Fog, iced Earl Grey, Earl Grey cold brew",
      "Food pairings: shortbread, madeleines, scones, lemon cake, dark chocolate, Lyon's tarte aux pralines",
      "A tasting of three Earl Greys side by side, for a weekend",
    ],
  },
];

function Written({ guide }: { guide: Guide }) {
  return (
    <Section title={guide.title}>
      <nav aria-label={`${guide.title}: chapters`}>
        <ol className="list-decimal pl-6">
          {guide.chapters.map((chapter) => (
            <li key={chapter.id}>
              <a href={`#${chapter.id}`} className="underline underline-offset-4">
                {chapter.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      {/* Rendered at build time from Markdown that holds no raw HTML (content's check, SPEC §6). */}
      <article className="guide flex flex-col gap-3" dangerouslySetInnerHTML={{ __html: guide.html }} />
    </Section>
  );
}

export function Guides() {
  const written = new Map(bundle.guides.map((guide) => [guide.id, guide]));
  return (
    <Screen title="Guides">
      {OUTLINES.map((outline) => {
        const guide = written.get(outline.id);
        if (guide) return <Written key={outline.id} guide={guide} />;
        return (
          <Section key={outline.id} title={outline.title}>
            <p className="text-sm text-muted">
              To be written, with its sources, in a later batch of content. Its chapters:
            </p>
            <ol className="list-decimal pl-6">
              {outline.chapters.map((chapter) => (
                <li key={chapter}>{chapter}</li>
              ))}
            </ol>
          </Section>
        );
      })}
    </Screen>
  );
}
