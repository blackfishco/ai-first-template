# Remove the task example and gallery

This removes teaching content, not the shared design system. Try the procedure in a disposable clean copy first. Preserve unrelated user files and changes; do not delete whole `components/` or `messages/` directories.

## 1. Remove only demo-owned paths

- `app/(frontend)/[locale]/example/` (page and loading route)
- `features/example/`
- `components/examples/example-gallery.tsx`
- `components/examples/gallery-interactions.tsx`
- `messages/example.cs.json` and `messages/example.en.json`

Leave any later unrelated files in `components/examples/` intact. Keep lint, type checks, and CI.

## 2. Disconnect messages and the homepage link

In `i18n/request.ts`:

- In `i18n/messages.ts`, remove the two `example.*` imports and their spreads.
- Replace `messages: { ...csMessages, ...exampleMessages }` with `messages: csMessages`.
- Keep locale validation and the remaining configuration unchanged.

In `app/(frontend)/[locale]/page.tsx`:

- Remove the demo `<Card>…</Card>` block, including its `/example` link.
- Remove unused `ArrowRightIcon`, `buttonVariants`, all `Card*`, and `Link` imports.
- Keep the page header, `Badge`, and footer. The starter remains usable without the demo card.

In `messages/cs.json`:

- Remove the `Gallery` namespace.
- Remove only `HomePage.exampleTitle`, `exampleDescription`, `exampleContent`, and `openExample`.
- Rewrite `HomePage.description` to avoid promising a demo, for example: `Začněte vzhledem. Sdílené komponenty vám pomohou udržet aplikaci přehlednou i při dalších změnách.`
- Keep the other `HomePage` keys and the `Notifications` namespace; the shared `Toaster` still uses it.

Keep `app/providers.tsx`, `components/ui/toast.tsx`, and the calendar focus fix. Shared providers and primitives are not demo-owned.

## 3. Update documentation without leaving broken references

- `README.md`: remove the demo URL, feature/gallery/example-message table rows, and demo-removal section; describe your actual starter instead.
- `docs/architecture.md`: replace the reference-flow section with your first real feature or a concise statement that no backend is configured; remove the demo source/gallery links.
- `docs/verification.md`: remove demo-only manual checks. Keep clean install, starter accessibility, import-boundary checks, and GitHub activation guidance.
- `AGENTS.md`: remove the bullet about the removable task example; preserve the architecture, security, and completion rules.
- `.agents/skills/react-query-server-action-errors/SKILL.md`: remove its example action links; keep the boundary contract and real shared toast/provider links.
- `.agents/skills/typescript-best-practices/context/code-patterns.md`: remove the compiled example-action link and describe the contract without claiming a compiled example remains.
- `.agents/skills/typescript-best-practices/context/organization.md`: replace the illustrative example layout with your feature's actual layout, or omit it.
- Remove `docs/removing-example.md` itself once these steps are complete.

Search the remaining source/docs for `/example`, `features/example`, `exampleMessages`, and the removed message namespaces. Inspect each remaining match rather than deleting by substring: skill fixtures and evaluation history may intentionally mention examples.

## 4. Verify the reduced app

In a fresh copy with the removal applied, follow the README runtime prerequisites and run:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

When reusing a disposable copy, delete only its generated `.next/` first so stale route types/build output cannot affect verification.

Expected: lint, type checks, and build pass. Run `pnpm start` and manually verify starter accessibility and mobile/desktop layouts, that `/cs` still renders, `/cs/example` no longer resolves, and there is no demo link on the homepage. Do not change dependencies or the lockfile merely to remove this example; audit unused dependencies separately.
