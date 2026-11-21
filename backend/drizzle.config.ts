// `npm run db:generate -w backend` writes a migration into drizzle/ from a change to src/db/schema.ts.
// The server runs them at startup (src/db/client.ts). Never edit a migration once it is merged.
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
});
