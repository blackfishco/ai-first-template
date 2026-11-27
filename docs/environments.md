# Environments

What each environment uses. Fill in the project's real names in a copy of the second table and keep it current: a mismatch between this page and the hosting dashboard is a bug.

## Matrix

| | Production | Preview | Development | CI |
| --- | --- | --- | --- | --- |
| Database | Its own | **Its own branch per preview** | Local Postgres (`docker compose up -d`) | Throwaway service container named `*_test` |
| Migrations | Run before the build | Run only with `PREVIEW_DATABASE_ISOLATED=true` | Never run; the CMS syncs the schema on start. Create a migration before committing | Run before the integration tests |
| Media storage | Its own Blob store | Its own Blob store, or local disk | Local disk (`/media`) | Local disk |
| E-mail | Resend | Server log, or Resend with a test domain | Server log | Server log |
| Indexed by search engines | Yes | No | No | No |
| Seed | Never | Allowed with `ALLOW_SEED=true` | Allowed with `ALLOW_SEED=true` | Run twice |
| Scheduled jobs | Vercel Cron every five minutes | Off | Off; call the endpoint as an admin | Off |

## The one rule that protects production

**Preview and production never share a database.** A build migrates the database its `DATABASE_URL` points at. With a shared database, the preview of an unmerged branch migrates production.

The build script ([`scripts/vercel-build.ts`](../scripts/vercel-build.ts)) therefore skips migrations on preview builds until the project sets `PREVIEW_DATABASE_ISOLATED=true`. Set it only after every preview gets its own database, for example with the Neon integration for Vercel, which creates a database branch per preview and replaces `DATABASE_URL` for it. Until then the build of a preview whose database lacks a migration fails on purpose, when it prerenders the first page; it does not touch production.

## Variables

Every variable is defined in [`lib/env-schema.ts`](../lib/env-schema.ts) and described in [`.env.example`](../.env.example). The app stops at startup and names any that are missing or malformed.

| Variable | Production | Preview | Development |
| --- | --- | --- | --- |
| `DATABASE_URL` | Required, own database | Required, own branch | Local Postgres |
| `PAYLOAD_SECRET` | Required, unique | Required, different from production | Any 32+ characters |
| `SITE_URL` | The canonical domain | Unset (derived from the deployment URL) | Unset |
| `BLOB_READ_WRITE_TOKEN` | Own store | Own store or unset | Unset |
| `PREVIEW_SECRET` | Set | Set, different | Optional |
| `CRON_SECRET` | Set | Unset | Unset |
| `RESEND_API_KEY`, `EMAIL_FROM` | Set | Usually unset | Unset |
| `CONTACT_EMAIL_TO` | The owner's address | A test address or unset | Unset |
| `PREVIEW_DATABASE_ISOLATED` | Not used | `true` once previews have their own database | Not used |
| `ALLOW_SEED` | **Never set** | Only while seeding | Only while seeding |
| `ALLOW_INDEXING` | Only off Vercel: `true` | Unset | Unset |

Use a different secret in every environment. A secret copied from production to preview lets a preview token work on production.

## Vercel

The steps below were run once against a new project (BF-988). Do them in this order: the first deployment of a new project goes to production whatever branch it comes from, so a push before the database exists produces a failed production build.

1. Create the project with the framework preset Next.js and connect the repository. The build command stays the default: Vercel runs the `vercel-build` script. Set the Node.js version to 24.x in the project settings; new projects may default to a newer one.
2. Add a Postgres database so that production and preview get separate databases. Either way works:
   - The Neon integration (Storage → Create Database → Neon), with a database branch per preview deployment switched on. It sets `DATABASE_URL` for each environment.
   - Two connection strings set by hand: `DATABASE_URL` for Production and another for Preview, for example two branches of one Neon project. Neon's pooled connection string works for migrations.

   Then set `PREVIEW_DATABASE_ISOLATED=true` for the Preview environment. Without it the preview build prints `Skipping database migrations` and fails on an empty database.
3. Add a Blob store and connect it; it sets `BLOB_READ_WRITE_TOKEN`. Without it the build warns that the `media` collection has no storage adapter, and uploads do not work on Vercel.
4. Set `PAYLOAD_SECRET`, `PREVIEW_SECRET`, and `CRON_SECRET` per environment. Vercel Cron sends `CRON_SECRET` automatically.
5. Deploy. The production build log shows `Running database migrations: Production build.` followed by each migration. Open `/admin` and create the first user, who becomes an admin.
6. Check `/api/health` (200) and that a preview responds with `X-Robots-Tag: noindex, nofollow`.

Two things about a new Vercel project that look like bugs and are not:

- **Deployment addresses ask for a Vercel login.** A team's new projects have Vercel Authentication on for every address except custom domains. An uptime monitor or a client therefore needs the custom domain, or a protection bypass set up in the project settings.
- **Vercel adds `X-Robots-Tag: noindex` to `*.vercel.app` addresses itself,** on production too. The header this app sends on non-production deployments is `noindex, nofollow`. Judge production by its custom domain and by `/robots.txt`, which must say `Allow: /`.

## Other hosts (Docker, Kubernetes)

The template ships no Dockerfile; projects that need one add it. The contract is the same on any host:

- **Run migrations once per release, before the new version serves traffic:** `pnpm payload migrate`. Use a release step: a Kubernetes Job as a pre-upgrade hook, a pre-deploy command, or an init step. Do not run it from every replica at startup.
- Build with `output: "standalone"` and Node 24.22.3 or newer.
- Set `ALLOW_INDEXING=true` on the production instance only.
- Call `/api/payload-jobs/run` every few minutes with `Authorization: Bearer <CRON_SECRET>` for scheduled publishing.
- Point the readiness probe at `/api/health`.
- Media needs shared storage as soon as there is more than one replica; replace the adapter in [`payload/plugins/storage.ts`](../payload/plugins/storage.ts) with an S3-compatible one.

## After writing content outside the site

Seeds and scripts write to the database without going through the running site, so they cannot revalidate its cache. Locally the seed clears the Next.js data cache; restart the server. On a deployed site, redeploy, or save the affected documents in the admin.
