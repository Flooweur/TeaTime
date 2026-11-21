// Lint rules for every workspace. Formatting is Prettier's job (.prettierrc.json): no stylistic rules here.
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/** packages/core is pure: no I/O, no Node, no DOM (SPEC §4.2). Its tsconfig refuses the types too. */
const CORE_IS_PURE = {
  group: ["node:*", "fs", "fs/*", "path", "os", "child_process", "http", "https", "net", "crypto"],
  message: "packages/core has zero I/O (SPEC §4.2): pass time, randomness and data in.",
};

/**
 * packages/core never reads the clock or draws randomness itself (SPEC §4.2): a `Clock` and a
 * seed come in as arguments. The compiler already refuses `crypto` and `performance` there
 * (no DOM, no Node); these are the ones ES2023 itself has.
 */
const INJECTED =
  "packages/core takes time and randomness as arguments (SPEC §4.2): use the Clock or seed it was given.";
const CORE_TAKES_TIME_AND_RANDOMNESS = {
  "no-restricted-properties": [
    "error",
    { object: "Date", property: "now", message: INJECTED },
    { object: "Math", property: "random", message: INJECTED },
  ],
  "no-restricted-syntax": [
    "error",
    { selector: "NewExpression[callee.name='Date'][arguments.length=0]", message: INJECTED },
    { selector: "CallExpression[callee.name='Date']", message: INJECTED },
  ],
};

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "spikes/**",
      ".claude/**",
      // Data, written by npm run content:build.
      "content/src/bundle.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
      eqeqeq: ["error", "always"],
    },
  },
  {
    files: [
      "packages/**/*.ts",
      "content/**/*.ts",
      "backend/**/*.ts",
      "**/*.config.{js,ts,mjs}",
      "**/scripts/**/*.{js,mjs,ts}",
    ],
    languageOptions: { globals: globals.node },
  },
  {
    // The app: the browser's globals, and the rules of hooks.
    files: ["frontend/src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: ["frontend/src/sw/**/*.ts"],
    languageOptions: { globals: globals.serviceworker },
  },
  {
    files: ["packages/core/src/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [CORE_IS_PURE] }],
      ...CORE_TAKES_TIME_AND_RANDOMNESS,
    },
  },
);
