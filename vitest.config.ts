import path from "node:path";

import { defineConfig } from "vitest/config";

const root = import.meta.dirname;

// Unit tests run without a database, a browser, or a `.env` file.
export default defineConfig({
  resolve: {
    alias: [
      // `server-only` throws outside a React Server environment.
      {
        find: /^server-only$/,
        replacement: path.join(root, "tests/mocks/server-only.ts"),
      },
      { find: /^@\//, replacement: `${root}/` },
    ],
  },
  test: {
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "e2e/**", ".agents/**", ".claude/**"],
  },
});
