# Removing parts

The template ships parts not every project needs. Remove them at the start, before anything depends on them. After each removal run `pnpm check`, `pnpm test`, `pnpm test:int`, `pnpm build`, and `pnpm test:e2e`, and record the removal in [decisions](decisions.md).

## The second language

Keep the `[locale]` route segment; it costs nothing and keeps a second language cheap to add later.

1. `i18n/config.ts`: reduce `LOCALES` and `LOCALE_LABELS` to one language and set `DEFAULT_LOCALE`.
2. Delete the other `messages/<locale>.json` and its import in `i18n/messages.ts`.
3. Remove `LocaleSwitcher` from `components/layout/site-header.tsx` and delete `components/layout/locale-switcher.tsx` and the `LocaleSwitcher` messages.
4. `scripts/seed/content.ts`: typecheck now points at every text that needs only one language. Remove the others.
5. `pnpm payload migrate:create single-language` and `pnpm generate:types`.
6. Remove the tests that switch languages: in `e2e/smoke.spec.ts`, and the English halves of `e2e/pages.spec.ts`, `e2e/redirects.spec.ts`, and `e2e/site-settings.spec.ts`.

Fields stay `localized: true`. That keeps the schema ready for a second language and changes nothing for one.

## The contact form and e-mail

1. Delete `features/contact/`.
2. Delete `payload/blocks/contact-form.ts` and `components/sections/contact-form.tsx`; remove the block from `payload/blocks/page-blocks.ts` and the `contactForm` renderer, case, and slot from `components/sections/render-blocks.tsx`. Typecheck lists the routes that pass the slot.
3. Delete `payload/collections/contact-messages.ts` and remove it from `payload.config.ts`.
4. Remove `CONTACT_EMAIL_TO` from `lib/env-schema.ts`, `.env.example`, and `docs/environments.md`. Keep the Resend variables: invitations and password resets use them.
5. Remove the contact page from `scripts/seed/content.ts`, the `Contact` messages, `tests/int/contact.int.test.ts`, and `e2e/contact.spec.ts`.
6. `pnpm payload migrate:create remove-contact` and `pnpm generate:types`. The migration drops the messages table; export anything worth keeping first.
7. `docs/architecture.md` names the contact form as the reference for a form. Point it at another form, or keep the section as a description of the pattern.

To drop React Hook Form too, remove `react-hook-form` and `@hookform/resolvers` and the `react-hook-form` skill, once no form uses them.

## TanStack Query

Nothing in the template uses it yet; it is wired in for client-owned server state.

1. `app/providers.tsx`: remove `QueryClientProvider` and the client setup; keep the `Toaster`.
2. `pnpm remove @tanstack/react-query @tanstack/eslint-plugin-query`.
3. `eslint.config.mjs`: remove the `pluginQuery` import and its config entry.
4. `AGENTS.md`: remove the "Manage server state with TanStack Query" section and the mention in the error-handling section.
5. Delete `.agents/skills/react-query-server-action-errors` and its link in `.claude/skills/`, or keep it for its Server Action guidance.

## Other optional pieces

- **Vercel Blob.** Replace the adapter in `payload/plugins/storage.ts`. Keep `alwaysInsertFields` so the schema does not depend on configuration.
- **Scheduled publishing.** Remove `schedulePublish` from `payload/collections/pages.ts`, the `jobs` block in `payload.config.ts`, the cron in `vercel.json`, and `CRON_SECRET`. Create a migration.
- **Live preview.** Remove `admin.livePreview` from `payload.config.ts`, `app/api/preview/`, `components/cms/live-preview-refresh.tsx` and its use in the layout, and `PREVIEW_SECRET`. Loaders keep their `draft` option; nothing sets it.
