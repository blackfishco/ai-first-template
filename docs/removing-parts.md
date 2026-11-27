# Removing parts

The template ships parts not every project needs. Remove them at the start, before anything depends on them. After each removal run `pnpm check`, `pnpm test`, `pnpm test:int`, `pnpm build`, and `pnpm test:e2e`, and record the removal in [decisions](decisions.md).

## The second language

Keep the `[locale]` route segment; it costs nothing and keeps a second language cheap to add later.

1. `i18n/config.ts`: reduce `LOCALES` and `LOCALE_LABELS` to one language and set `DEFAULT_LOCALE`.
2. Delete the other `messages/<locale>.json` and its import in `i18n/messages.ts`.
3. Remove `LocaleSwitcher` from `components/layout/site-header.tsx` and delete `components/layout/locale-switcher.tsx` and the `LocaleSwitcher` messages.
4. `pnpm generate:types`. Until it runs, typecheck fails in `lib/cms/locale.ts`, which checks that the site and the CMS have the same languages.
5. `scripts/seed/content.ts`: typecheck now points at every text that needs only one language. Remove the others.
6. `pnpm payload migrate:create single-language`. The migration narrows the language list in the database. It fails on a database that still holds content in the removed language; on a new project there is none.
7. Remove the tests of the second language. Typecheck finds the unit and integration ones; the end-to-end ones fail when run.
   - Unit: the cases with a prefixed address in `lib/seo/seo.test.ts` and `lib/cms/preview.test.ts`, and the removed language in `i18n/config.test.ts`. Where a test only needs some language, pass the remaining one.
   - Integration: "keeps alt text per language" in `tests/int/media.int.test.ts` and "stores block content per language" in `tests/int/pages.int.test.ts`. `tests/int/contact.int.test.ts` passes the remaining language.
   - End-to-end: the language switcher and browser-language tests in `e2e/smoke.spec.ts`, and the parts that visit `/en` in `e2e/pages.spec.ts`, `e2e/redirects.spec.ts`, `e2e/seo.spec.ts`, and `e2e/site-settings.spec.ts`.

Fields stay `localized: true`. That keeps the schema ready for a second language and changes nothing for one.

## The contact form and e-mail

1. Delete `features/contact/`.
2. Delete `payload/blocks/contact-form.ts` and `components/sections/contact-form.tsx`; remove the block from `payload/blocks/page-blocks.ts` and the `contactForm` renderer and case from `components/sections/render-blocks.tsx`.
3. The form was the only block with a slot. Remove `BlockSlots` and the `slots` property from `components/sections/render-blocks.tsx`, `features/pages/components/cms-page.tsx`, and the two routes that pass it: `app/(frontend)/[locale]/page.tsx` and `app/(frontend)/[locale]/[...slug]/page.tsx`. Bring it back when a block needs a piece of a feature; [architecture](architecture.md) describes the pattern.
4. Delete `payload/collections/contact-messages.ts` and remove it from `payload.config.ts`.
5. Remove `CONTACT_EMAIL_TO` from `lib/env-schema.ts`, `.env.example`, and `docs/environments.md`. Keep the Resend variables: invitations and password resets use them.
6. `scripts/seed/content.ts`: remove the contact page and its navigation label, and point the home page's call to action somewhere else. Remove the `Contact` messages, `tests/int/contact.int.test.ts`, and `e2e/contact.spec.ts`.
7. `pnpm generate:types` and `pnpm payload migrate:create remove-contact`. The migration drops the messages table; export anything worth keeping first.
8. **Fix the generated migration before running it.** It drops the `contact_messages` table with `CASCADE` and then drops a constraint that went with the table, so it fails with `constraint "payload_locked_documents_rels_contact_messages_fk" … does not exist`. Change that line to `DROP CONSTRAINT IF EXISTS`. `pnpm test:int` applies the migration to the test database and shows whether it runs.
9. `docs/architecture.md` and `AGENTS.md` name the contact form as the reference for a form. Point them at another form, or keep the section as a description of the pattern.

`lib/stale-deployment.ts` stays: any Server Action call can use it. So does `lib/rate-limit` with its `rate-limit-hits` collection; if nothing else uses it, delete both, remove the collection from `payload.config.ts`, and include it in the same migration. To drop the form libraries too, remove `react-hook-form`, `@hookform/resolvers`, and the `react-hook-form` skill once no form uses them, and `@react-email/components` once no e-mail template uses it.

## TanStack Query

Nothing in the template uses it yet; it is wired in for client-owned server state.

1. `app/providers.tsx`: remove `QueryClientProvider` and the client setup; keep the `Toaster`.
2. `pnpm remove @tanstack/react-query @tanstack/eslint-plugin-query`.
3. `eslint.config.mjs`: remove the `pluginQuery` import and its config entry.
4. `AGENTS.md`: remove the "Manage server state with TanStack Query" section and the mention in the error-handling section. `docs/architecture.md`: remove the mentions of the Query client and the Query adapter.
5. Delete `.agents/skills/react-query-server-action-errors`, its link in `.claude/skills/`, and its entry in `skills-lock.json`, or keep it for its Server Action guidance.

## Analytics

1. Delete `features/analytics/`, `lib/analytics/`, and `e2e/analytics.spec.ts`.
2. `app/(frontend)/[locale]/layout.tsx`: remove `<Analytics />` and the `analyticsKind` lines.
3. Remove the `analyticsTagId` field from `payload/globals/site-settings.ts` and from `lib/site-settings/server.ts`.
4. Remove `ANALYTICS_ENABLED` from `lib/env-schema.ts`, `.env.example`, `docs/environments.md`, and the `webServer` env in `playwright.config.ts`.
5. `pnpm generate:types` and `pnpm payload migrate:create remove-analytics`.

## Cookie consent

Remove it only when the site sets no cookies beyond the necessary ones and loads no analytics or marketing scripts. Remove the analytics feature first if it is there; it reads consent.

1. Delete `features/consent/`, `lib/consent/`, and `e2e/consent.spec.ts`.
2. `app/(frontend)/[locale]/layout.tsx`: remove `<ConsentManager />`, the `<ConsentSettingsLink />` passed to `SiteFooter`, and the consent `<script>` in `<head>` with `suppressHydrationWarning` on `<html>`.
3. Remove the `Consent` messages from `messages/*.json`.
4. `playwright.config.ts`: remove the `consent` cookie from `storageState`.
5. Remove `@axe-core/playwright` if no other test uses it.

## Other optional pieces

- **Vercel Blob.** Replace the adapter in `payload/plugins/storage.ts`. Keep `alwaysInsertFields` so the schema does not depend on configuration.
- **Scheduled publishing.** Remove `schedulePublish` from `payload/collections/pages.ts`, the `jobs` block in `payload.config.ts`, the cron in `vercel.json`, and `CRON_SECRET`. Create a migration.
- **Live preview.** Remove `admin.livePreview` from `payload.config.ts`, `app/api/preview/`, `components/cms/live-preview-refresh.tsx` and its use in the layout, and `PREVIEW_SECRET`. Loaders keep their `draft` option; nothing sets it.
