# Database migrations

The CMS schema is code. Every change to a collection, global, block, field, localization, or a plugin that adds fields changes the database, and ships as a migration.

## Workflow

1. Change the config. In development the schema syncs to your local database directly, so you can iterate.
2. When the change is ready, create the migration and regenerate the types:

   ```sh
   pnpm payload migrate:create <short-name>
   pnpm generate:types
   pnpm generate:importmap   # only if admin components changed
   ```

3. Read the generated SQL. It is what will run on production.
4. Commit the migration, `payload/migrations/index.ts`, and `payload-types.ts` together with the config change. CI fails when the types are stale, and runs every migration on an empty database.

`pnpm payload migrate:create` reports "No schema changes detected" when there is nothing to migrate. In a script, close its input (`</dev/null`), or it waits for an answer to a question about creating an empty migration.

## Rules

- **Never enable `push` outside development.** It changes the schema without a record and has drifted production databases in earlier projects.
- **Migrations go forward only.** Do not edit a migration that has been merged; write a new one.
- **A migration must work with the previous version of the code.** A deploy is not atomic: the old version serves traffic while the migration runs, and a rollback of the code does not roll back the database. So:
  - add a column as nullable or with a default, and make it required in a later release;
  - remove a column only in a release after the code stopped using it;
  - rename in three steps: add the new, copy and switch the code, then remove the old.
- **Data changes are migrations too.** Put a backfill in a migration, not in a one-off script, so every environment gets it.
- **Postgres truncates identifiers at 63 characters.** Nested arrays, blocks, and selects build long names. Set a short `dbName` or `enumName` before the first migration that contains them; renaming later is a data migration.

## Where migrations run

| Environment | When |
| --- | --- |
| Development | Not needed day to day (`push`). Run `pnpm payload migrate` on a fresh database. |
| CI | Before the integration tests, on an empty database. |
| Production on Vercel | In the build, before `next build`. |
| Preview on Vercel | In the build, only with `PREVIEW_DATABASE_ISOLATED=true`; see [environments](environments.md). |
| Other hosts | A release step before the new version starts. |

## When something goes wrong

- **A migration failed half-way.** Each migration runs in a transaction, so the schema is as it was. Fix the migration (if it has not been merged) or add a corrected one, and deploy again.
- **A development database and the migrations disagree.** After a lot of `push`, `migrate` can fail on a table that already exists. Recreate the local database and run `pnpm payload migrate`.
- **The types are stale.** Run `pnpm generate:types` and commit the result.
