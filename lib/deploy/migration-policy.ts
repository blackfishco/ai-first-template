/**
 * Whether a build may run database migrations. Pure, so the build script and
 * tests share it.
 *
 * A build migrates the database its `DATABASE_URL` points at. That is right
 * for production. A preview build does it only when the project confirms that
 * previews have their own database (for example a Neon branch per preview):
 * with a shared database, a preview of an unmerged branch would migrate
 * production.
 */
export type MigrationDecision =
  | { migrate: true; reason: string }
  | { migrate: false; reason: string };

export function migrationDecision(source: {
  VERCEL_ENV?: string;
  PREVIEW_DATABASE_ISOLATED?: string;
  MIGRATE_ON_BUILD?: string;
}): MigrationDecision {
  if (source.MIGRATE_ON_BUILD === "false") {
    return { migrate: false, reason: "MIGRATE_ON_BUILD is false." };
  }

  if (source.VERCEL_ENV === "preview") {
    return source.PREVIEW_DATABASE_ISOLATED === "true"
      ? {
          migrate: true,
          reason: "Preview with its own database (PREVIEW_DATABASE_ISOLATED=true).",
        }
      : {
          migrate: false,
          reason:
            "Preview build without PREVIEW_DATABASE_ISOLATED=true: migrating could change a database shared with production.",
        };
  }

  if (source.VERCEL_ENV === "production") {
    return { migrate: true, reason: "Production build." };
  }

  // Off Vercel the build runs where the operator pointed DATABASE_URL.
  return source.MIGRATE_ON_BUILD === "true"
    ? { migrate: true, reason: "MIGRATE_ON_BUILD is true." }
    : {
        migrate: false,
        reason:
          "Not a Vercel build. Run `pnpm payload migrate` before starting, or set MIGRATE_ON_BUILD=true.",
      };
}
