import { describe, expect, it } from "vitest";
import { notificationOf, pushTarget } from "./push";

describe("a push on the PC (SPEC §3.8)", () => {
  it("shows the declarative push's words, its tag, and keeps its link", () => {
    const shown = notificationOf({
      web_push: 8030,
      notification: {
        title: "Tomorrow at the office: #005",
        body: "Pack the kit.",
        navigate: "https://t.test/today",
        tag: "evening:2026-11-23",
      },
    });
    expect(shown.title).toBe("Tomorrow at the office: #005");
    expect(shown.options).toMatchObject({
      body: "Pack the kit.",
      tag: "evening:2026-11-23",
      data: { url: "https://t.test/today" },
    });
  });

  it("always shows something", () => {
    expect(notificationOf(null).title).toBe("TeaTime");
    expect(notificationOf({}).options.data).toEqual({ url: "/" });
  });

  it("opens only the app's own pages", () => {
    const origin = "https://teatime.test:8443";
    expect(pushTarget(`${origin}/?date=2026-11-23&from=push`, origin)).toBe("/?date=2026-11-23&from=push");
    expect(pushTarget("/review?date=2026-11-28", origin)).toBe("/review?date=2026-11-28");
    expect(pushTarget("https://elsewhere.example/phish", origin)).toBe("/");
    expect(pushTarget(42, origin)).toBe("/");
  });
});
