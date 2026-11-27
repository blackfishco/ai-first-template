# Decisions

One entry per decision: what was decided, why, and where it lives in the code. Add an entry in the same change that makes the decision. Do not rewrite old entries; add a new one that supersedes them.

## 2026-11-27 — The Content Security Policy is optional and off by default (BF-998)

**What.** `CSP_MODE` (`off`, `report-only`, `enforce`) switches a nonce-based policy for the site. Off by default. The CMS admin is outside it. This supersedes "No Content Security Policy in the template".

**Why.** The original reason still holds: a nonce forces every page to render per request, which gives up the static cache. Projects that need a policy (a client's security audit, a strict DPO) should not have to write it from scratch, though, and the template's own pages, analytics, and live preview must keep working under it, which only a tested policy proves. Hence: off by default, one variable to turn on, report-only first, and a CI job that runs the whole end-to-end suite under `enforce`.

- *Admin outside the policy:* Payload's admin injects inline scripts and styles we do not control; a policy there breaks with any Payload update.
- *`style-src 'unsafe-inline'`:* inline style attributes from components and rich text cannot carry a nonce. Script injection is the risk a policy addresses; styles are not.
- *Probe address in `generateStaticParams`:* a route that prerenders nothing at build stays an on-demand static route and fails with `DYNAMIC_SERVER_USAGE` when it reads the request later. Prerendering one address that reads the request makes Next.js mark the route dynamic at build.

**Where.** `lib/security/csp.ts`, `proxy.ts`, `app/(frontend)/[locale]/layout.tsx`, `app/(frontend)/[locale]/[...slug]/page.tsx`, `.github/workflows/ci.yml`.

## 2026-11-27 — Analytics loads only after consent and only on production (BF-1001)

**What.** One Google tag ID in the CMS site settings, `GTM-…` or `G-…`. The script loads after the visitor consents to analytics, with Consent Mode v2 set before it. Withdrawing consent reloads the page. Page views are sent by the site on every route change. The tag runs on production only.

**Why.**
- *Not loaded before consent* rather than loaded in Consent Mode's denied state: denied mode still sends cookieless pings to Google, which many Czech DPOs treat as processing without consent. Loading nothing is the answer that needs no discussion.
- *Reload on withdrawal:* a loaded tag cannot be unloaded, and Tag Manager may have started other tags. A reload is the only way to be sure nothing keeps sending.
- *One ID:* GA4 next to a container that also sends to GA4 counts everything twice.
- *Explicit page views:* the site knows when a client-side navigation happens; GA4's history-based detection and Tag Manager's "All Pages" trigger do not agree on it.
- *Inline lint exception:* `features/analytics/tag.ts` disables `prefer-rest-params` for one line, because gtag.js reads commands only as `arguments` objects; rest parameters produce arrays it ignores.

**Where.** `lib/analytics/tag-id.ts`, `features/analytics/`, `payload/globals/site-settings.ts`, `app/(frontend)/[locale]/layout.tsx`.

## 2026-11-27 — Cookie consent is part of the template, not a hosted service (BF-1000)

**What.** The template ships its own consent banner (`features/consent`) with three categories and a versioned cookie. The consent state is a shared contract in `lib/consent`.

**Why.** Hosted consent platforms (Cookiebot, CookieYes and others) cost money per site, load a third-party script before anything else, and differ between clients. Most of our sites need three categories and Google Consent Mode, which a small banner covers. A project that must use a client's platform removes `features/consent` and implements `lib/consent/client.ts` on top of that platform; analytics keeps working because it reads only the contract. The legal wording stays out of the template on purpose: it differs per client, and a filled-in text invites leaving it unchanged.

**Where.** `lib/consent/`, `features/consent/`, `app/(frontend)/[locale]/layout.tsx`, `playwright.config.ts`.

## 2026-11-27 — Renovate keeps dependencies current (BF-996)

**What.** [`renovate.json`](../renovate.json) opens update pull requests once a week (Monday before 6:00 Prague time), at most five open at a time, and security fixes immediately. Payload, Next.js, and React packages are grouped; small updates of development tools come as one pull request. Commits use the `deps` scope that commitlint accepts.

**Why.** The template is current on the day it is copied and outdated three months later; every project made from it would start with that debt. Renovate rather than Dependabot because it can group packages that must move together (all `@payloadcms/*` on one exact version), enforce the version ceilings recorded in BF-967 with `allowedVersions`, and wait for a minimum release age like pnpm does. Releases younger than three days are not proposed, which matches pnpm's supply-chain guard.

**Where.** `renovate.json`. When a ceiling in "Dependency ceilings" changes, change its `allowedVersions` rule in the same pull request.

## 2026-11-27 — Rate limits live in Postgres (BF-995)

**What.** `lib/rate-limit` counts accepted requests per client in the `rate-limit-hits` collection. The contact form allows five messages per visitor in ten minutes. The client is the first `x-forwarded-for` address, stored only as an HMAC keyed with `PAYLOAD_SECRET`.

**Why.** On Vercel every request can land on another instance, so a limit in process memory does nothing. A hosted store (Upstash, Vercel KV) would be faster but adds a service, a key, and a cost to every project. The database is already there, and a form that writes a row per message can afford one more read and write. Two requests at the same instant can both take the last slot; for a form that is acceptable. A request without an address (local scripts, tests) is not limited.

**Where.** `lib/rate-limit/`, `payload/collections/rate-limit-hits.ts`, `features/contact/server/submit-message.ts`, `features/contact/actions.ts`.

**Revisit when.** A project needs limits on hot paths (login, search, API), where a database round trip per request matters. Move the store behind the same `consumeRateLimit` signature.

## 2026-11-24 — `pnpm test:int` checks the database name before it migrates (BF-987)

**What.** `pnpm test:int` first runs `scripts/check-test-database.ts`, which stops unless `DATABASE_URL` names a database ending in `_test`. The same check stays in the Vitest setup.

**Why.** The command migrates and then runs the tests. The name check used to sit only in the test setup, after the migration. A plain `pnpm test:int` therefore ran the migrations against the development database from `.env`, and Payload asked whether to proceed with data loss. A trial run of the template found this.

**Where.** `lib/testing/test-database.ts`, `scripts/check-test-database.ts`, `tests/int/setup.ts`, `package.json`.

## 2026-11-24 — No error tracker is installed; errors go through one seam (BF-984)

**What.** Unhandled errors go to `captureError()`, which logs them without personal data. No Sentry SDK is installed. A project plugs a tracker in with `setErrorReporter`.

**Why.** The ticket asked for Sentry as an optional module. The SDK wraps the Next.js config, adds client and server setup files, and ships browser code to every visitor whether or not a DSN is set. Not every project uses Sentry, and removing it is more work than adding it. The seam keeps the one decision that matters, a single place for errors with scrubbing, and leaves the vendor to the project.

**Where.** `lib/observability.ts`, `instrumentation.ts`, `docs/architecture.md`.

## 2026-11-24 — Preview builds do not migrate until previews have their own database (BF-983)

**What.** The build script migrates on production. On a preview it migrates only when `PREVIEW_DATABASE_ISOLATED=true`.

**Why.** A build migrates whatever database `DATABASE_URL` points at. An earlier project shared one database between production and preview, so every preview build of an unmerged branch migrated production. The safe default costs a preview that needs a new migration and fails until the project sets up a database per preview; that failure is visible and harmless.

**Where.** `lib/deploy/migration-policy.ts`, `scripts/vercel-build.ts`, `docs/environments.md`.

## 2026-11-24 — No Content Security Policy in the template (BF-983)

**What.** The template sends HSTS, `nosniff`, frame, referrer, and permissions headers, and no Content Security Policy.

**Why.** A policy that blocks inline scripts needs a per-request nonce. Next.js then renders every page dynamically, which gives up static generation and the cache for the whole site. That trade depends on the project, and so do the allowed third-party hosts. A project that needs a policy adds the nonce in `proxy.ts` and accepts dynamic rendering.

**Where.** `lib/security/headers.ts`, `next.config.ts`.

## 2026-11-24 — The contact form replaces the task example (BF-981)

**What.** `features/example` and its gallery are removed. `features/contact` is now the reference for a form, a Server Action, and the error contract. This supersedes the entry "The task example stays until the contact form replaces it".

**Why.** The contact form shows the same contract on something every site needs, and it writes real data.

**Where.** `features/contact/`, `docs/architecture.md`.

## 2026-11-24 — Server Actions receive the language as an argument (BF-981)

**What.** A Server Action that needs the language takes it as an argument from the client and validates it with `isLocale`. `i18n/request.ts` falls back to the default language outside a route.

**Why.** Next.js does not expose root parameters inside Server Actions and Route Handlers; the getter throws there. The end-to-end test of the contact form caught this.

**Where.** `features/contact/actions.ts`, `i18n/root-locale.ts`, `i18n/request.ts`.

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
