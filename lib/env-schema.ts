import { err, ok, type Result } from "neverthrow";
import { z } from "zod";

/**
 * Server environment schema. This module stays free of `server-only` so CLI
 * tools that load configuration outside Next.js can validate the same
 * variables. Application code reads env only through `lib/env.ts`.
 *
 * Add every new variable here and to `.env.example` in the same change.
 */
export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Set automatically by Vercel; absent locally and in CI.
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  // Set automatically by Vercel at runtime; part of cache keys (lib/cache-key.ts).
  VERCEL_DEPLOYMENT_ID: z.string().min(1).optional(),
  VERCEL_GIT_COMMIT_SHA: z.string().min(1).optional(),
  // Canonical origin without a trailing slash, e.g. https://example.com
  SITE_URL: z
    .url({ protocol: /^https?$/ })
    .refine((value) => !value.endsWith("/"), "must not end with a slash")
    .default("http://localhost:3000"),

  // Postgres connection string. Use a separate database (or database branch)
  // for every environment; see docs/architecture.md.
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  // Signs Payload auth tokens. Use a different value in every environment.
  PAYLOAD_SECRET: z.string().min(32),
  // Search engines index only the Vercel production deployment. On other
  // hosts, set this to `true` on the production instance.
  ALLOW_INDEXING: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  // Shared secret of the CMS live preview. Without it preview is off and the
  // preview route rejects every request.
  PREVIEW_SECRET: z.string().min(32).optional(),
  // Bearer token of scheduled jobs (Vercel Cron sends it automatically).
  // Without it the jobs endpoint accepts signed-in admins only.
  CRON_SECRET: z.string().min(16).optional(),
  // Read by scripts/vercel-build.ts; see lib/deploy/migration-policy.ts.
  PREVIEW_DATABASE_ISOLATED: z.string().optional(),
  MIGRATE_ON_BUILD: z.string().optional(),
  // Read by scripts/seed.ts, which runs only when this is exactly `true`.
  ALLOW_SEED: z.string().optional(),
  // E-mail through Resend. Both are needed; without them e-mails are written
  // to the server log and nothing fails.
  RESEND_API_KEY: z.string().min(1).optional(),
  // Sender address on a domain verified in Resend.
  EMAIL_FROM: z.email().optional(),
  EMAIL_FROM_NAME: z.string().min(1).optional(),
  // Where contact form messages are sent. Without it they are only stored.
  CONTACT_EMAIL_TO: z.email().optional(),
  // Analytics loads on the production deployment only (lib/analytics).
  // `true` or `false` overrides that rule; the end-to-end tests set `true`.
  ANALYTICS_ENABLED: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  // Content Security Policy for the site (lib/security/csp.ts). `off` keeps
  // pages static; `report-only` and `enforce` render every page per request.
  CSP_MODE: z.enum(["off", "report-only", "enforce"]).default("off"),
  // Vercel Blob read-write token. Without it uploads stay on local disk.
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export type EnvSource = Record<string, string | undefined>;

export interface InvalidEnvError {
  code: "INVALID_ENV";
  /** Variable names only. Values never leave this module. */
  variables: string[];
}

/** Empty strings (`KEY=` copied from `.env.example`) count as unset. */
function dropEmpty(source: EnvSource): EnvSource {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== ""),
  );
}

/**
 * Without an explicit SITE_URL, derive it from Vercel's system variables so
 * preview and production deployments link to themselves.
 */
export function resolveSiteUrl(source: EnvSource): string | undefined {
  if (source.SITE_URL) return source.SITE_URL;
  if (
    source.VERCEL_ENV === "production" &&
    source.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${source.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (source.VERCEL_URL) return `https://${source.VERCEL_URL}`;
  return undefined;
}

export function parseServerEnv(
  source: EnvSource,
): Result<ServerEnv, InvalidEnvError> {
  const cleaned = dropEmpty(source);
  const parsed = serverEnvSchema.safeParse({
    ...cleaned,
    SITE_URL: resolveSiteUrl(cleaned),
  });

  if (!parsed.success) {
    const variables = [
      ...new Set(parsed.error.issues.map((issue) => issue.path.join("."))),
    ];
    return err({ code: "INVALID_ENV", variables });
  }

  return ok(parsed.data);
}

/**
 * Startup boundary: a misconfigured environment is not a recoverable
 * application error, so this throws and stops the build or the server.
 */
export function loadServerEnv(source: EnvSource): ServerEnv {
  return parseServerEnv(source).match(
    (env) => env,
    (error) => {
      throw new Error(
        `Invalid server environment variables: ${error.variables.join(", ")}. See .env.example.`,
      );
    },
  );
}
