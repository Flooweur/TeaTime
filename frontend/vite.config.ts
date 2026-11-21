import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defaultClientConditions, defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

/** The backend in dev (SPEC §3.7): Vite's dev server and its preview send /api there. */
const backend = process.env.BACKEND_URL ?? "http://127.0.0.1:3200";

export default defineConfig({
  // Workspace packages from their TypeScript sources (packages/README.md).
  resolve: { conditions: ["source", ...defaultClientConditions] },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // TeaTime's own service worker (src/sw/sw.ts): the shell's precache, so the app opens offline.
      strategies: "injectManifest",
      srcDir: "src/sw",
      filename: "sw.ts",
      // A new version waits until the owner taps Reload in the update toast (SPEC §3.8).
      registerType: "prompt",
      injectRegister: false,
      // The fonts' latin and latin-ext files only: the others (Cyrillic, Greek…) load when a page needs them.
      // The plugin adds the manifest and its icons itself; the Apple icon is added here.
      injectManifest: { globPatterns: ["**/*.{js,css,html,svg}", "**/*-latin-*.woff2"] },
      includeAssets: ["apple-touch-icon.png"],
      devOptions: { enabled: false },
      // Installed as TeaTime, which iOS prints above each push (SPEC §3.8).
      manifest: {
        name: "TeaTime",
        short_name: "TeaTime",
        description: "One sourced tea blend every weekday, made from what's in your pantry.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#f3ebdd",
        theme_color: "#f3ebdd",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  server: { port: 5180, strictPort: true, proxy: { "/api": backend } },
  preview: { port: 5181, strictPort: true, proxy: { "/api": backend } },
});
