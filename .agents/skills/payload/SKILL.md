---
name: payload
description: Work with Payload CMS in this template. Use when changing payload.config.ts or anything in payload/ (collections, globals, blocks, fields, access rules, hooks, plugins, migrations), when reading or writing CMS content from the site, when adding a page block, when a migration or generated type is involved, or when debugging access control, drafts, localization, cache revalidation, or the seed. It wins over other skills on Payload questions.
---

# Payload CMS in this template

Payload runs inside the Next.js app. Read the Payload section of `docs/architecture.md` first; this skill is the short version plus recipes. For API details, read the official docs at `https://payloadcms.com/docs` for the installed version (`pnpm ls payload`). Do not rely on memory for option names.

## Rules that are easy to break

- **The Local API skips access control by default.** `payload.find(...)` returns drafts and private documents unless you pass `overrideAccess: false`. Passing `user` alone changes nothing. Anything served to a visitor uses `overrideAccess: false`. When you bypass access on purpose, write why in a comment next to the call.
- **Every content read passes the language.** `locale` from `getContentLocale()` and `fallbackLocale: DEFAULT_LOCALE`. Without it Payload returns the default language on every page.
- **A schema change ships with its migration and types.** `pnpm payload migrate:create <name>`, `pnpm generate:types`, and `pnpm generate:importmap` when admin components changed. Never enable `push` outside development. Never edit a merged migration.
- **Revalidation works only inside a Next.js request.** Scripts, seeds, and tests pass `context: { disableRevalidate: true }`. Content written that way stays stale in a running site until its cache is cleared; see the seed.
- **A Server Action cannot read the language from the route.** Take it as an argument and validate it with `isLocale`.
- **`payload/` is shared code.** It does not import `app/`, `features/`, or site components. It is also loaded by the Payload CLI outside Next.js: no `server-only`, no `@/` alias in files the config imports, and read environment variables with `loadServerEnv(process.env)`.
- **Do not edit `app/(payload)` or `payload-types.ts` by hand.** They are generated.
- **Postgres truncates identifiers at 63 characters.** Give nested arrays, blocks, and selects a short `dbName` or `enumName` before their first migration.

## Where things are

| Need | Location |
| --- | --- |
| Config | `payload.config.ts` |
| Collections, globals | `payload/collections/`, `payload/globals/` |
| Page blocks | `payload/blocks/` (config), `components/sections/` (component), `components/sections/render-blocks.tsx` (map) |
| Reusable fields | `payload/fields/` (`slugField`, `linkField`) |
| Access rules | `payload/access/` (`isAdmin`, `isEditor`, `adminOrSelf`, `publishedOrEditor`) |
| Hooks | `payload/hooks/` (`revalidateCollection`, `revalidateGlobal`, `redirectAfterSlugChange`) |
| Plugins | `payload/plugins/` (SEO, redirects, storage) |
| Cache tags | `lib/cache-tags.ts` |
| Content loaders | `features/<name>/server/`, `lib/site-settings/server.ts` |
| Seed | `scripts/seed.ts`, `scripts/seed/content.ts` |

## Recipes

### Add a page block

1. Config in `payload/blocks/<name>.ts` with `slug`, `interfaceName`, and bilingual labels. Mark text fields `localized: true`.
2. Add it to `PAGE_BLOCKS` in `payload/blocks/page-blocks.ts`.
3. `pnpm payload migrate:create add-<name>-block` and `pnpm generate:types`.
4. Component in `components/sections/<name>.tsx`, typed with the generated interface.
5. Add a renderer and a `case` in `components/sections/render-blocks.tsx`. Typecheck fails until both exist.
6. If the block needs something a feature owns (a form, a list), render a slot and pass the piece from the route; see the contact form.
7. Add the block to the seed if a demo should show it.

### Add a collection with its own pages

1. Config in `payload/collections/<name>.ts`. Use `slugField`, drafts if editors need them, `publishedOrEditor` for `read`, `isEditor` for writes.
2. Add a tag to `lib/cache-tags.ts` and `revalidateCollection(...)` hooks.
3. Register it in `payload.config.ts`, then create the migration and types.
4. Loader in `features/<name>/server/`: `server-only`, returns `ResultAsync` and a small view type, passes `locale`, uses `overrideAccess: false`, caches published content with `unstable_cache` and tags.
5. Route in `app/(frontend)/[locale]/`. Add the route's first segment to `RESERVED_SLUGS` in `lib/slug.ts`.
6. Make it linkable and previewable if needed: `LINKABLE_COLLECTIONS` in `payload/fields/link.ts`, `resolveLink`, `previewPath`, and `admin.livePreview.collections`.
7. Add it to the SEO plugin, the redirects plugin, and the sitemap if it is public.
8. Integration test for the access rules in `tests/int/`.

### Add a field

Change the config, then create the migration and types. A new required field needs a default or a backfill in the migration; see `docs/migrations.md`.

### Write content from a script

Use `payload run scripts/<name>.ts`. Start a transaction with `payload.db.beginTransaction()`, pass `req: { transactionID, context: { disableRevalidate: true } }` to every call, commit or roll back, and clear the local data cache afterwards as the seed does. Gate anything destructive behind an explicit variable.

## Testing

- Pure rules (validation, access helpers, tag selection) get unit tests next to the code.
- Access rules and hooks get integration tests in `tests/int/` with `overrideAccess: false` and an explicit `user`. They run against a database named `*_test`.
- A flow a visitor or editor depends on gets an end-to-end test that writes through the CMS API and checks the site.

## When something does not work

- **A visitor sees a draft, or an editor's content is missing.** Check `overrideAccess` and the `read` access of the collection.
- **English shows Czech.** The loader does not pass `locale`, or the field is not `localized`.
- **A saved change does not show.** The loader has no tag, the collection has no revalidation hook, or the write came from a script.
- **`migrate` warns about data loss locally.** It ran on a development database, which syncs by itself. Do not run `migrate` there; see `docs/migrations.md`.
- **Typecheck fails after a config change.** Run `pnpm generate:types`.
