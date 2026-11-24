import { spawnSync } from "node:child_process";

import { migrationDecision } from "../lib/deploy/migration-policy.ts";

/**
 * Build command for deployments: migrate when the policy allows it, then
 * build. Run with Node's built-in TypeScript support: `node scripts/vercel-build.ts`.
 */
function run(command: string, args: string[]): void {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const decision = migrationDecision({
  VERCEL_ENV: process.env.VERCEL_ENV,
  PREVIEW_DATABASE_ISOLATED: process.env.PREVIEW_DATABASE_ISOLATED,
  MIGRATE_ON_BUILD: process.env.MIGRATE_ON_BUILD,
});
console.log(
  `[build] ${decision.migrate ? "Running" : "Skipping"} database migrations: ${decision.reason}`,
);

if (decision.migrate) run("pnpm", ["payload", "migrate"]);
run("pnpm", ["build"]);
