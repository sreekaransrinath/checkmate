/**
 * @file .eslintrc.cjs
 *
 * ESLint configuration for Check Mate.
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
    "playwright",
  ],
  extends: [
    "airbnb-typescript",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:playwright/recommended",
    "prettier",
  ],
  settings: {
    react: { version: "detect" },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        moduleDirectory: ["node_modules", "src/"],
      },
    },
  },
  rules: {
    "react/jsx-filename-extension": [1, { extensions: [".tsx"] }],
    "react/react-in-jsx-scope": "off",
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: [
          "**/tests/**",
          "**/*.test.ts",
          "**/*.test.tsx",
          "jest.setup.ts",
        ],
      },
    ],
    "no-void": ["error", { allowAsStatement: true }],
    "react/require-default-props": "off",
    "react/prop-types": "off",
    "jsx-a11y/anchor-is-valid": "off",
    "class-methods-use-this": "off",
    "@typescript-eslint/no-floating-promises": ["error", { ignoreIIFE: true }],
    "import/extensions": ["error", "never"],
    "import/no-duplicates": "off",
    "import/namespace": "off",
  },
  overrides: [
    {
      files: ["src/background/**"],
      rules: {
        "no-restricted-globals": "off",
        "no-await-in-loop": "off",
      },
    },
    {
      files: ["tests/**"],
      env: {
        jest: true,
        node: true,
      },
      extends: ["plugin:playwright/recommended"],
    },
  ],
  ignorePatterns: ["dist/", ".vite/", "playwright-report/", "*.config.*"],
};
