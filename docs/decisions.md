# Decisions

One entry per decision: what was decided, why, and where it lives in the code. Add an entry in the same change that makes the decision. Do not rewrite old entries; add a new one that supersedes them.

## 2026-11-24 — End-to-end tests run one at a time (BF-979)

**What.** Playwright runs with one worker.

**Why.** The tests write to one CMS and read one site. Run in parallel, the test that changes site settings failed once: the header showed the old site name while other tests were rendering the same pages. It passed alone and passes serially. Whether a page regeneration that starts before a save can store stale content after it was not investigated further; if editors ever report a save that does not show up, start there.

**Where.** `playwright.config.ts`.

## 2026-11-24 — CMS data is cached with `unstable_cache` and tags (BF-977)

**What.** Published CMS content is cached with `unstable_cache`, tagged from one registry, and revalidated by CMS hooks with `revalidateTag(tag, { expire: 0 })`. Cache keys include the deployment id. Drafts are never cached.

**Why.** The alternative, the `use cache` directive, requires opting the whole app into Cache Components, which changes rendering for every route including the CMS admin. The installed Next.js docs still recommend `unstable_cache` for non-`fetch` data that must persist across deployments. `expire: 0` makes an editor's save visible on the next request instead of serving the stale copy once. The deployment id in the key keeps a new deployment from reading entries an older one cached in a different shape.

**Where.** `lib/cache-tags.ts`, `lib/cache-key.ts`, `lib/cms/revalidate.ts`, `payload/hooks/revalidate.ts`, loaders in `features/*/server/`.

**Revisit when.** Cache Components is verified with Payload's admin and next-intl, and `use cache` entries persist across deployments.

## 2026-11-24 — Pages render on first request, not at build time (BF-974)

**What.** `generateStaticParams` for CMS pages returns an empty list. A page is rendered on its first request and then served from the cache until an editor changes it. Pages are not nested: one slug, one segment.

**Why.** A build then needs no content, so a new project and CI build against an empty database. Nested pages need breadcrumb-based lookups and URL building in every link; earlier projects got those wrong, so nesting is left to the project that needs it.

**Where.** `app/(frontend)/[locale]/[...slug]/page.tsx`, `features/pages/server/get-page.ts`.

## 2026-11-24 — The task example stays until the contact form replaces it (BF-974)

**What.** `features/example` is kept for now. The home page shows the CMS page with the slug `home` and falls back to the starter page while that page does not exist.

**Why.** The example is the reference for the Server Action and error contract in `docs/architecture.md`. Removing it before the contact form (BF-981) exists would leave that contract without a working example.

**Where.** `app/(frontend)/[locale]/page.tsx`, `features/example/`.

## 2026-11-24 — Locale comes from the root parameter, read through a checked helper (BF-970)

**What.** The site and the CMS admin are two root layouts in route groups: `app/(frontend)/[locale]` and `app/(payload)`. `i18n/request.ts` resolves the locale from the `[locale]` root parameter through `getRootLocale()` in `i18n/root-locale.ts`.

**Why.** Reading the root parameter keeps every page statically rendered without calling `setRequestLocale` in each layout and page. The alternative, next-intl's `requestLocale`, silently turns a route dynamic as soon as a file that receives no params (for example `loading.tsx`) uses translations.

Next.js 16.4 resolves the parameter correctly at runtime but generates no `next/root-params` types for root layouts inside route groups: the generator strips group names, sees the CMS layout as `/`, and treats it as an ancestor of `/[locale]`. The helper therefore treats the module as unknown and checks its shape at runtime.

**Where.** `i18n/root-locale.ts`, `i18n/request.ts`.

**Revisit when.** `.next/types/root-params.d.ts` declares `locale`. Then import it directly and delete the helper.

## 2026-11-24 — Payload runs inside the Next.js app on Postgres (BF-970)

**What.** Payload CMS is part of the same Next.js application. The schema is synced directly only in development (`push`); every other environment applies committed migrations from `payload/migrations`.

**Why.** One deployable unit and the Local API with no network hop. Committed migrations make schema changes reviewable and repeatable; `push` outside development has caused schema drift in earlier projects.

**Where.** `payload.config.ts`, `payload/`, `app/(payload)`.

## 2026-11-24 — Dependency ceilings (BF-967)

**What.** These packages stay below their latest major:

| Package | Pinned | Latest | Blocked by |
| --- | --- | --- | --- |
| `typescript` | 6.0 | 7.0 | `typescript-eslint` 8 supports TypeScript `<6.1.0` |
| `eslint` | 9 | 10 | `eslint-config-next` 16.4 depends on `eslint-plugin-import` 2, which supports ESLint up to 9 |
| `eslint-plugin-unicorn` | 65 | 80 | 66 and later require ESLint `>=10.4` |
| `@types/node` | 24 | 26 | Must match the Node 24 LTS runtime in `.node-version` |

**Why.** The type-aware lint rules and the import-boundary rule (`import/no-restricted-paths`) are part of the template's contract. Upgrading past these ceilings means dropping or replacing them, which is a separate decision.

**Where.** `package.json`, `eslint.config.mjs`.

**Revisit when.** `typescript-eslint` supports TypeScript 7, and `eslint-config-next` no longer pulls in `eslint-plugin-import` 2.

## 2026-11-24 — Respect pnpm's minimum release age (BF-966)

**What.** Versions published within pnpm's minimum release age are not installed. The template takes the newest version that passes the policy and does not add `minimumReleaseAgeExclude` entries.

**Why.** The delay is a supply-chain guard. Excluding packages to get the very latest patch removes the guard for exactly the releases it exists for.

**Where.** `pnpm-workspace.yaml`, `pnpm-lock.yaml`.
