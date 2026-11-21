import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { CSV_COLUMNS, csvField } from "../src/export/routes.js";
import { at, command, have, testApp } from "./helpers.js";

describe("the exports (SPEC §3.4)", () => {
  it("gives everything as JSON, named by the owner's date", async () => {
    const t = await testApp({ now: at("2026-11-23", "09:00") });
    await t.commands(have("assam", at("2026-11-23", "08:00"), 120));
    const res = await t.app.inject({ method: "GET", url: "/api/export.json" });
    expect(res.headers["content-disposition"]).toBe('attachment; filename="teatime-2026-11-23.json"');
    expect(res.headers["cache-control"]).toBe("private, no-store");
    const body = res.json() as { app: string; version: number; snapshot: { state: { pantry: object } } };
    expect(body.app).toBe("TeaTime");
    expect(Number.isInteger(body.version)).toBe(true);
    expect(body.snapshot.state.pantry).toHaveProperty("assam");
  });

  it("gives one CSV row per cup made, oldest first, at the owner's time", async () => {
    const t = await testApp({ now: at("2026-11-23", "18:00") });
    const later = randomUUID();
    await t.commands(
      have("earl-grey", at("2026-11-23", "07:00"), 100),
      command(
        "brew.logged",
        { brew: later, tea: { kind: "plain", tea: "earl-grey" }, cups: 1, date: "2026-11-23", rating: 3 },
        at("2026-11-23", "16:15"),
      ),
      command(
        "brew.logged",
        { brew: randomUUID(), tea: { kind: "blend", code: "005" }, cups: 2, date: "2026-11-23", rating: 5 },
        at("2026-11-23", "09:05"),
      ),
    );
    const res = await t.app.inject({ method: "GET", url: "/api/export.csv" });
    expect(res.headers["content-type"]).toBe("text/csv; charset=utf-8");
    expect(res.headers["content-disposition"]).toBe('attachment; filename="teatime-2026-11-23.csv"');
    const lines = res.body
      .replace(/^\uFEFF/, "")
      .trimEnd()
      .split("\r\n");
    expect(lines[0]).toBe(CSV_COLUMNS.join(","));
    expect(lines.slice(1)).toEqual([
      '2026-11-23,09:05,#005,"Earl Grey, the classic",2,,5,',
      "2026-11-23,16:15,earl-grey,Earl Grey tea,1,,3,",
    ]);
  });

  it("quotes what needs it, and keeps a would-be formula as text", () => {
    expect(csvField('a "b", c')).toBe('"a ""b"", c"');
    expect(csvField("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvField(-1)).toBe("-1");
    expect(csvField(null)).toBe("");
  });
});
