import { existsSync } from "node:fs";
import path from "node:path";

import { defineConfig } from "vitest/config";

const root = import.meta.dirname;

// The CMS config validates the environment when it loads. Read `.env` the way
// the Payload CLI does, so `DATABASE_URL=… pnpm test:int` is all a developer
// types. Variables that are already set win, so the test database stays.
const envFile = path.join(root, ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

/**
 * Integration tests run the CMS against a real Postgres database. They refuse
 * to start unless the database name ends with `_test`; see tests/int/setup.ts.
 */
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^server-only$/,
        replacement: path.join(root, "tests/mocks/server-only.ts"),
      },
      { find: /^@payload-config$/, replacement: path.join(root, "payload.config.ts") },
      { find: /^@\//, replacement: `${root}/` },
    ],
  },
  test: {
    environment: "node",
    include: ["tests/int/**/*.int.test.ts"],
    globalSetup: ["tests/int/setup.ts"],
    // One database, so one file at a time.
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
});
