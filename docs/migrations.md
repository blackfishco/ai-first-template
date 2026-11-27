# Database migrations

The CMS schema is code. Every change to a collection, global, block, field, localization, or a plugin that adds fields changes the database, and ships as a migration.

## Workflow

1. Change the config. In development the schema syncs to your local database directly on the next start, so you can iterate. You never run `migrate` on that database.
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
| Development | Never. The CMS syncs the schema itself on start, also on an empty database. |
| Test database (`*_test`) | Before the integration tests: `pnpm test:int` runs them. The test database is only ever migrated, never synced. |
| CI | Before the integration tests, on an empty database. |
| Production on Vercel | In the build, before `next build`. |
| Preview on Vercel | In the build, only with `PREVIEW_DATABASE_ISOLATED=true`; see [environments](environments.md). |
| Other hosts | A release step before the new version starts. |

## When something goes wrong

- **A migration failed half-way.** Each migration runs in a transaction, so the schema is as it was. Fix the migration (if it has not been merged) or add a corrected one, and deploy again.
- **`migrate` asks whether to proceed because "data loss will occur".** You ran it on a development database, which the CMS syncs by itself. Answer no. A development database does not need migrations; if you want one built from migrations only, recreate it and run `NODE_ENV=production pnpm payload migrate` before starting anything in development mode.
- **A migration fails on a test database with a table that already exists.** Something ran in development mode against it. Recreate the test database.
- **Removing a collection fails with `constraint … does not exist`.** The generated SQL drops the table with `CASCADE` and then drops a foreign key on `payload_locked_documents_rels` that went with it. Change that line to `DROP CONSTRAINT IF EXISTS`. The same SQL sits in the `down` function of every migration that **adds** a collection, so fix it there too before committing. `pnpm test:int` shows whether `up` applies; check `down` with `NODE_ENV=production pnpm payload migrate:down` on the test database.
- **The types are stale.** Run `pnpm generate:types` and commit the result.
