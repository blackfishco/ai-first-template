import { existsSync } from "node:fs";
import path from "node:path";

import { testDatabaseProblem } from "../lib/testing/test-database.ts";

/**
 * Runs before `payload migrate` in `pnpm test:int`. Without it, a plain
 * `pnpm test:int` would migrate the development database from `.env`.
 * Reads `.env` the way the Payload CLI does; variables already set win.
 */
const envFile = path.join(import.meta.dirname, "..", ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

const problem = testDatabaseProblem(process.env.DATABASE_URL);
if (problem) {
  console.error(problem);
  process.exit(1);
}
