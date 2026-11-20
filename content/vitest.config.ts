import { defaultServerConditions } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Workspace packages from their TypeScript sources (packages/README.md). Tests in the node
  // environment resolve through the SSR conditions, so both are set.
  resolve: { conditions: ["source", ...defaultServerConditions] },
  ssr: { resolve: { conditions: ["source", ...defaultServerConditions] } },
  test: { environment: "node", include: ["test/**/*.test.ts"] },
});
