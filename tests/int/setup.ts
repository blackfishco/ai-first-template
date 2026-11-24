import { testDatabaseProblem } from "../../lib/testing/test-database";

/**
 * Guards the integration suite. `pnpm test:int` runs the same check before it
 * migrates (scripts/check-test-database.ts); this one covers a direct
 * `vitest --config vitest.int.config.ts` run.
 */
export default function setup(): void {
  const problem = testDatabaseProblem(process.env.DATABASE_URL);
  if (problem) throw new Error(problem);
}
