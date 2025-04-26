/**
 * @file .eslintrc.cjs
 *
 * Central ESLint configuration for the Check Mate Chrome extension.
 * The config extends Airbnb’s TypeScript/React style-guide, enables Prettier
 * formatting integration, and applies sensible overrides for Manifest V3
 * service-worker code (background) and Playwright/Jest tests.
 *
 * Key highlights:
 * • Uses @typescript-eslint/parser and points at the project’s tsconfig.json
 * • Ignores generated folders (dist, .vite) and configuration files
 * • Allows top-level await inside `src/background/**`
 * • Relaxes React JSX-prop-spreading rule (copy-to-clipboard components rely on it)
 *
 * @see https://airbnb.io/javascript/
 * @see https://typescript-eslint.io/
 */

module.exports = {
    root: true,
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: "./tsconfig.json",
      tsconfigRootDir: __dirname,
      ecmaFeatures: { jsx: true },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: [
      "@typescript-eslint",
      "react",
      "react-hooks",
      "jsx-a11y",
      "import",
    ],
    extends: [
      "airbnb-typescript",          // Airbnb base + TS rules
      "plugin:react-hooks/recommended",
      "plugin:jsx-a11y/recommended",
      "plugin:import/recommended",
      "plugin:import/typescript",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking",
      "prettier",                   // disable rules that clash with Prettier
    ],
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: {},             // support `@common/*` path alias
      },
    },
    rules: {
      "react/jsx-filename-extension": [1, { extensions: [".tsx"] }],
      "react/react-in-jsx-scope": "off",          // React 18 new JSX transform
      "import/no-extraneous-dependencies": [
        "error",
        { devDependencies: ["**/tests/**", "**/*.test.ts", "**/*.test.tsx"] },
      ],
      "no-void": ["error", { allowAsStatement: true }],  // allow `void chrome.*`
      "react/require-default-props": "off",       // TS handles prop defaults
      "react/prop-types": "off",                  // using TS
      "jsx-a11y/anchor-is-valid": "off",          // Twitter clones use button‐ish <a>
      "class-methods-use-this": "off",
      "@typescript-eslint/no-floating-promises": [
        "error",
        { ignoreIIFE: true },
      ],
    },
    overrides: [
      {
        files: ["src/background/**"],
        rules: {
          "no-restricted-globals": "off",    // service worker global scope
          "no-await-in-loop": "off",
        },
      },
      {
        files: ["tests/**"],
        env: { jest: true, "playwright/playwright-test": true },
        rules: { "@typescript-eslint/explicit-function-return-type": "off" },
      },
    ],
    ignorePatterns: ["dist/", ".vite/", "playwright-report/", "*.config.*"],
  };
  