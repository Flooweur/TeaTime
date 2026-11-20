# packages

Shared workspace packages. Today, only `core` ([its README](core/README.md)); `content` sits at the repo root, where the content lives.

## The `source` export condition
Each package's `package.json` exports its entry points under three conditions:

```json
".": { "source": "./src/index.ts", "types": "./dist/index.d.ts", "default": "./dist/index.js" }
```

- **While developing, type-checking and testing,** every tool resolves `source`, so a change in a package is seen at once, with no build:
  - TypeScript, through `customConditions: ["source"]` in [tsconfig.base.json](../tsconfig.base.json);
  - tsx, through `--conditions=source`;
  - Vite and Vitest, through `resolve.conditions`. Tests in the node environment resolve through the SSR conditions, so `ssr.resolve.conditions` is set too: without it, tests need `dist/`, which CI doesn't build before testing (a lesson from EagleEye's `frontend/vitest.config.ts`).
- **The production builds** (`npm run build`) compile each package to `dist/` with `customConditions: []`, so they use each other's compiled output.
