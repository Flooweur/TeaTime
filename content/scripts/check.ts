/**
 * `npm run content:check` (part of `npm run check`): the content against its schemas and itself,
 * ids.yaml, and the bundle as the build would write it. It writes nothing; `npm run content:build`
 * fixes what it says is out of date.
 */
import { problemCount, report, runContent, staleFiles, summary } from "./content.js";

const run = runContent();
if (!run.bundle || run.problems.length) {
  console.error(`The content has ${problemCount(run.problems)}:\n${report(run.problems)}`);
  process.exit(1);
}
const stale = staleFiles(run);
if (stale.length) {
  const added = run.added.length ? ` (new ids: ${run.added.join(", ")})` : "";
  console.error(`Out of date: ${stale.map((w) => w.label).join(", ")}${added}. Run npm run content:build.`);
  process.exit(1);
}
console.log(`The content is fine: ${summary(run.bundle)}.`);
