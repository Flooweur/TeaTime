import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

const load = async () => (await import("../src/config.js")).config;

describe("the config (the self-review of phase 5)", () => {
  it("lets writes come from Vite's preview in dev only", async () => {
    vi.stubEnv("PUBLIC_ORIGIN", "https://teatime.test:8443");
    vi.stubEnv("APP_ENV", "daily");
    expect((await load()).origins).toEqual(["https://teatime.test:8443"]);
    vi.resetModules();
    vi.stubEnv("APP_ENV", "dev");
    expect((await load()).origins).toEqual(["https://teatime.test:8443", "http://localhost:5181"]);
  });
});
