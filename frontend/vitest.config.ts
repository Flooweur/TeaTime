import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defaultClientConditions, defaultServerConditions } from "vite";
import { defineConfig } from "vitest/config";

// The app's tests: its logic in node, its screens in happy-dom (a file says `@vitest-environment happy-dom`).
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Workspace packages from their TypeScript sources (packages/README.md), in both environments.
    conditions: ["source", ...defaultClientConditions],
    // No service worker in the tests: the PWA plugin's virtual module is a stub.
    alias: {
      "virtual:pwa-register/react": fileURLToPath(new URL("./src/test/pwa-register.ts", import.meta.url)),
    },
  },
  ssr: { resolve: { conditions: ["source", ...defaultServerConditions] } },
  test: { environment: "node", include: ["src/**/*.test.{ts,tsx}"], setupFiles: ["./src/test/setup.ts"] },
});
