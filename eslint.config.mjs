import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

const root = process.cwd();
const featuresPath = path.join(root, "features");
const featureNames = existsSync(featuresPath)
  ? readdirSync(featuresPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  : [];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    settings: {
      "import/resolver": {
        typescript: { project: path.join(root, "tsconfig.json") },
      },
    },
    rules: {
      // Next's import plugin resolves both @/ aliases and relative paths.
      "import/no-restricted-paths": [
        "error",
        {
          basePath: root,
          zones: [
            {
              target: ["./components", "./lib", "./hooks", "./i18n"],
              from: ["./app", "./features"],
              message: "Shared code must not depend on app or feature modules.",
            },
            {
              target: "./features",
              from: "./app",
              message: "Features must not import app composition modules.",
            },
            ...featureNames.map((name) => ({
              target: `./features/${name}`,
              from: "./features",
              except: [`./${name}`],
              message: "Compose separate features in app instead of importing across features.",
            })),
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "tmp/**",
    ".tmp/**",
    "next-env.d.ts",
    ".agents/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
