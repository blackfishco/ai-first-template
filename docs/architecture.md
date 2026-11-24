# Architecture

## Ownership and imports

```text
app → features → shared modules
app ───────────→ shared modules
```

- **`app/`** owns routing, layouts, providers, and composition. Pages may compose multiple independent features.
- **`features/<name>/`** owns its UI, schemas, actions, server operations, types, and colocated tests. Import within the same feature or from shared modules, never from another feature or `app/`.
- **Shared modules** (`components/`, `lib/`, `hooks/`, `i18n/`, and other shared directories covered by lint) do not import `features/` or `app/`. Keep genuinely shared UI in `components/ui/`; do not move business logic there to bypass a boundary.
- Prefer direct file imports; avoid barrels mixing server/client code. Create only needed folders, not a generic CRUD/service framework.

[ESLint](../eslint.config.mjs) enforces the direction of imports. The route composes the feature and the independent [gallery](../components/examples/example-gallery.tsx); the gallery does not import the feature. Translation JSON lives in [`messages/`](../messages/) so [`i18n/request.ts`](../i18n/request.ts) can combine namespaces without a cross-feature code import.

## Reference data flow

Start at [`app/[locale]/example/page.tsx`](../app/[locale]/example/page.tsx), then follow its imports into [`features/example/`](../features/example/).

1. A Server Component reads deterministic initial tasks from a `server-only` demo module.
2. The client receives only safe task fields (`id`, `text`) and owns its local additions.
3. [`createTaskAction`](../features/example/actions.ts) accepts untrusted `FormData`; the server validates it, including the explicit demo-failure control.
4. Internal logic returns a typed `neverthrow` result. The action converts it to a plain success/task or failure/code union.
5. The UI branches on that union, showing validation/recovery text or adding the accepted task and confirming success.

**This demonstrates validation, not persistence.** There is no mutable module-global server list, browser storage, database, user session, or authoritative client-supplied history. Refreshing restores the initial state; one visitor's changes do not affect another. Do not add Query caching or revalidation to pretend these local additions are durable.

## Real data boundaries

For a real backend, use the `data-access-setup` skill to plan the contract, security, and cache ownership. After approval, a separate implementation task applies and verifies the plan; the user need not paste generated code.

- Put secrets, privileged clients, and data access in `server-only` modules.
- Validate untrusted input at every server entry point; a form or TypeScript annotation is not a security boundary.
- Recheck authentication and resource authorization inside each real mutation, even if the page already checked access.
- Return minimal safe DTOs, not full database records, credentials, or backend error objects. `NEXT_PUBLIC_*` values are public and embedded at build time.
- Define timeout, retry, freshness, invalidation, and personalized-data isolation deliberately.
- Keep data server-owned by default. For genuinely client-owned server state, reuse the QueryClient in [`app/providers.tsx`](../app/providers.tsx); keep query keys/options/adapters in the owning feature.

## Environment

[`lib/env-schema.ts`](../lib/env-schema.ts) is the only definition of server environment variables. [`lib/env.ts`](../lib/env.ts) validates them once at startup and is the only place server code reads them; a missing or malformed variable stops the build or the server with an error that names the variable, never its value. Add a variable to the schema and to [`.env.example`](../.env.example) in the same change. The schema module stays free of `server-only` so CLI tools outside Next.js can reuse it.

## One error contract

| Layer | Expected failure representation |
| --- | --- |
| Internal domain/data operation | `Result<T, E>` / `ResultAsync<T, E>` with a typed domain error |
| Server Action | Plain serializable discriminated union with safe codes |
| Direct action UI | Branch on the union and translate known codes |
| Optional TanStack Query adapter | Convert failure to rejected Promise so Query enters its error state |
| UI notification | Safe translated message through `toast.add({ type, title })` plus inline recovery where needed |

Only the Query adapter performs the expected-error-to-rejection conversion. Do not throw expected validation errors in the action or return `Result` instances over the React boundary. Unexpected transport errors get a generic message; never render arbitrary server `Error.message`. Keep framework redirects/not-found control flow outside domain error conversion.

[`Toaster`](../components/ui/toast.tsx) is mounted by the shared provider. Reuse the exported manager instead of adding a renderer per feature. The [Query error skill](../.agents/skills/react-query-server-action-errors/SKILL.md) describes an optional adapter; the demo intentionally does not contain a compiled Query mutation.

## References and verification

- [Local rules](../AGENTS.md) and [verification](verification.md)
- [Next.js data security](https://nextjs.org/docs/app/guides/data-security) and installed `node_modules/next/dist/docs/01-app/02-guides/data-security.md`
- [Bulletproof React project structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md), adapted to this project's root-level Next.js layout

Follow installed-version documentation when upstream examples conflict with local Next.js, shadcn, or error-handling conventions.
