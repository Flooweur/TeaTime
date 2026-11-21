/** Settings → export (SPEC §3.4, §7): everything as JSON, and the cups made as a spreadsheet (CSV). */
import { Section } from "../../components/ui";

const link =
  "inline-flex min-h-[50px] items-center justify-center rounded-control border-[1.5px] border-control px-4 font-bold";

export function Export() {
  return (
    <Section title="Export">
      <div className="grid grid-cols-2 gap-3">
        <a href="/api/export.json" download className={link}>
          Everything (JSON)
        </a>
        <a href="/api/export.csv" download className={link}>
          Cups made (CSV)
        </a>
      </div>
      <p className="text-sm text-muted">The server's copy: changes not sent yet aren't in it.</p>
    </Section>
  );
}
