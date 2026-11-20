/**
 * `npm run content:build`: checks the content as `content:check` does, then writes the bundle
 * (src/bundle.ts) and ids.yaml (adding the ids that are new). It writes nothing when anything is
 * wrong.
 */
import { writeFileSync } from "node:fs";
import { problemCount, report, runContent, staleFiles, summary } from "./content.js";

const run = runContent();
if (!run.bundle || run.problems.length) {
  console.error(`The content has ${problemCount(run.problems)}; nothing was written:\n${report(run.problems)}`);
  process.exit(1);
}
const stale = staleFiles(run);
for (const write of stale) writeFileSync(write.path, write.text);
console.log(`Content: ${summary(run.bundle)}.`);
if (run.added.length) console.log(`New ids, now in ids.yaml (${run.added.length}): ${run.added.join(", ")}`);
console.log(stale.length ? `Wrote ${stale.map((w) => w.label).join(", ")}.` : "Everything was already up to date.");
