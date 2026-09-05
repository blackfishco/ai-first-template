# Payload CMS branch

Use this branch when Payload is owned by the Next.js application.
Prefer Payload Local API for same-process server access; expose HTTP only for real external consumers or browser requirements.

## Inspect

Check whether Payload or any `@payloadcms/*` package, `payload.config.*`, `@payload-config` alias, `(payload)` route group, DB adapter, generated types, migrations, or media storage already exists.
Verify all Payload package versions and Next.js peer compatibility together. Payload package families must use compatible matching versions.

## Interview

Ask unresolved questions in dependency order:

1. Database and hosting: PostgreSQL, MongoDB, or SQLite; local and hosted provider; migration ownership.
2. Admin identity: admin collection, roles, initial bootstrap process, and whether app users are separate.
3. Content model: required collections/globals, fields, relations, ownership, and public versus private fields.
4. Access: public reads, authenticated reads, writes, role/resource rules, drafts, versions, and preview.
5. Optional infrastructure only when relevant: uploads/storage, image processing, email, localization, jobs, multi-tenancy, search, or external consumers.

Recommend PostgreSQL for a conventional hosted production baseline unless repository or deployment constraints favor another supported adapter. Do not choose a provider for the user.

## Plan requirements

The final plan must cover:

- exact, mutually compatible `payload`, `@payloadcms/next`, DB adapter, and optional package versions
- current official `(payload)` App Router files rather than an invented route layout
- `withPayload` integration in the existing Next config
- `payload.config.ts` and the `@payload-config` TypeScript alias
- explicit admin/auth collection and `admin.user`
- the requested first domain collection and field/access outline
- DB migrations and deployment sequencing for SQL adapters
- generated Payload types and import-map generation
- root env placeholders, including at least `PAYLOAD_SECRET`, the selected DB connection variable, and the canonical server URL when required
- `.env.example` handling; this template's `.gitignore` currently ignores `.env*`, so the plan must include an explicit safe exception
- admin URL, API surface, health/smoke check, typecheck, build, and migration verification

Use the current official blank template as the source for route-group files. Do not recreate stale file contents from memory.

## Local API and access control

For Server Components, route handlers, DAL functions, jobs, hooks, and access callbacks, recommend `getPayload({ config })` or `req.payload` as documented.

Highlight the critical Local API behavior:

- Local API uses `overrideAccess: true` by default.
- Passing a `user` alone does not enforce collection access.
- User-scoped operations must pass the user/request context and `overrideAccess: false`.
- Deliberate privileged system operations should state why bypassing access is safe.

Put privileged Payload access in `server-only` modules and return minimal DTOs to UI code.

## Runtime and caching

Confirm Node versus Edge runtime. Payload integration is server-side and must not be assumed to work in Edge runtime.
Do not cache personalized or draft content in a shared cache.
Specify revalidation/invalidation for published content and mutation flows.

## Official sources

- https://payloadcms.com/docs/getting-started/installation
- https://payloadcms.com/docs/database/overview
- https://payloadcms.com/docs/configuration/overview
- https://payloadcms.com/docs/configuration/environment-vars
- https://payloadcms.com/docs/admin/overview
- https://payloadcms.com/docs/authentication/overview
- https://payloadcms.com/docs/local-api/overview
- https://payloadcms.com/docs/access-control/overview
- https://payloadcms.com/docs/typescript/generating-types
- https://payloadcms.com/docs/database/migrations
