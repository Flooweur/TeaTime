/**
 * The exports (SPEC §3.4), as downloads named by the owner's date:
 * - `GET export.json`: everything, the snapshot with the app's version;
 * - `GET export.csv`: one row per cup made, oldest first, for a spreadsheet.
 */
import type { FastifyPluginAsync } from "fastify";
import { type BrewRecord, type Catalog, type State, clockTimeOf, wallClockAt } from "@teatime/core";
import type { Deps } from "../deps.js";
import { currentSnapshot } from "../state/service.js";
import { APP_VERSION } from "../version.js";

export const CSV_COLUMNS = ["date", "time", "tea", "name", "cups", "place", "rating", "colleague_rating"] as const;

/**
 * A CSV field: quoted when it holds a comma, a quote or a line break. One that a spreadsheet would
 * read as a formula (`=`, `+`, `-`, `@` first) is quoted with a leading apostrophe, so it stays text.
 */
export function csvField(value: string | number | null): string {
  if (value === null) return "";
  let text = String(value);
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function teaName(brew: BrewRecord, catalog: Catalog): string {
  if (brew.tea.kind === "blend") return catalog.blendByCode.get(brew.tea.code)?.name ?? brew.tea.code;
  return catalog.ingredientById.get(brew.tea.tea)?.name ?? brew.tea.tea;
}

/** The brews as CSV, oldest first, with a byte-order mark so a spreadsheet reads it as UTF-8. */
export function brewsCsv(state: State, catalog: Catalog): string {
  const { timeZone } = state.settings;
  const brews = Object.values(state.brews).sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
  const rows = brews.map((brew) => {
    const tea = brew.tea.kind === "blend" ? `#${brew.tea.code}` : brew.tea.tea;
    const place = brew.pick === null ? null : brew.office ? "office" : "home";
    return [
      brew.date,
      clockTimeOf(wallClockAt(brew.at, timeZone).minutes),
      tea,
      teaName(brew, catalog),
      brew.cups,
      place,
      brew.rating.value,
      brew.colleagueRating.value,
    ];
  });
  const lines = [CSV_COLUMNS.join(","), ...rows.map((row) => row.map(csvField).join(","))];
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

export const exportRoutes: FastifyPluginAsync<{ deps: Deps }> = async (app, { deps }) => {
  const filename = (ext: string, state: State) =>
    `attachment; filename="teatime-${wallClockAt(deps.clock().getTime(), state.settings.timeZone).date}.${ext}"`;

  app.get("/export.json", async (_req, reply) => {
    const snapshot = currentSnapshot(deps);
    return reply
      .header("content-disposition", filename("json", snapshot.state))
      .header("cache-control", "private, no-store")
      .send({
        app: "TeaTime",
        version: APP_VERSION,
        exportedAt: new Date(snapshot.serverTime).toISOString(),
        snapshot,
      });
  });

  app.get("/export.csv", async (_req, reply) => {
    const { state } = currentSnapshot(deps);
    return reply
      .header("content-type", "text/csv; charset=utf-8")
      .header("content-disposition", filename("csv", state))
      .header("cache-control", "private, no-store")
      .send(brewsCsv(state, deps.catalog));
  });
};
