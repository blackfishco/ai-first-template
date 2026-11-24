import "server-only";

import { env } from "./env";

interface DeploymentEnv {
  VERCEL_DEPLOYMENT_ID?: string;
  VERCEL_GIT_COMMIT_SHA?: string;
}

/**
 * Key parts of an `unstable_cache` entry, scoped to the deployment.
 *
 * `unstable_cache` entries persist across deployments, and only a tag
 * revalidation clears them. Migrations and seeds write the database without
 * revalidating, so an entry cached by an older deployment could shadow them
 * indefinitely, in a shape the new code no longer expects. With the deployment
 * id (or commit SHA) in the key, every deployment starts with its own entries.
 * Tags stay the same, so editor saves still revalidate within a deployment.
 */
export function deploymentCacheKey(
  parts: readonly string[],
  source: DeploymentEnv,
): string[] {
  const deployment =
    source.VERCEL_DEPLOYMENT_ID ?? source.VERCEL_GIT_COMMIT_SHA;
  return deployment ? [...parts, `deployment:${deployment}`] : [...parts];
}

/** `unstable_cache` key parts for this deployment, e.g. `cacheKey("page")`. */
export function cacheKey(...parts: string[]): string[] {
  return deploymentCacheKey(parts, env);
}
