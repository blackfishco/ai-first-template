<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:shadcn-agent-rules -->

# This project does NOT use the shadcn you know

This project uses the current shadcn release, whose components, APIs, and conventions may differ from your training data. Before writing any UI code, inspect the project with `pnpm dlx shadcn@latest info` and read the relevant component documentation with `pnpm dlx shadcn@latest docs <component>`. Do not create custom replacements or hand-roll UI that shadcn provides. Always install, use, and compose shadcn primitives. Heed deprecation notices.

<!-- END:shadcn-agent-rules -->

<!-- BEGIN:visual-ui-consistency-agent-rules -->

# Keep visual UI changes consistent

Proceed without repeated approval when the visual intent is clear and the change stays within the requested scope. Keep one-off layout local, reuse shared variants in `components/ui` for repeated component styling, and use tokens in `app/globals.css` for site-wide design changes. If intent is ambiguous or the change affects UI outside the request, ask the user to confirm local, shared, or global scope before editing. Explain the reuse impact of shared or global changes; do not expand a local request into a redesign.

<!-- END:visual-ui-consistency-agent-rules -->

<!-- BEGIN:usehooks-agent-rules -->

# This project uses useHooks

This project uses `@uidotdev/usehooks`, whose APIs and runtime constraints may differ from your training data. Before writing any React hook, inspect the installed package version and read the relevant documentation at `https://usehooks.com`. Do not recreate behavior already provided by the package. Always prefer and reuse its hooks when they fit the requirement. Verify whether a hook supports server rendering or requires a Next.js Client Component boundary.

<!-- END:usehooks-agent-rules -->

<!-- BEGIN:bulletproof-react-agent-rules -->

# Follow Bulletproof React

Before writing or reorganizing React code, read and follow the relevant guidance in `https://github.com/alan2207/bulletproof-react`. Apply its principles for feature-based structure, clean boundaries, colocation, component composition, state management, security, performance, and error handling. Treat it as an architectural guide rather than a template: follow this project's local instructions, installed dependencies, and current Next.js and shadcn documentation whenever its example tools or versions conflict.

<!-- END:bulletproof-react-agent-rules -->

<!-- BEGIN:neverthrow-agent-rules -->

# Handle expected errors with neverthrow

Before implementing error flows, inspect the installed `neverthrow` version and read `https://github.com/supermacro/neverthrow`.

- Internal fallible operations return `Result<T, E>` or `ResultAsync<T, E>`. Wrap throwing/rejecting third-party APIs at system boundaries with `Result.fromThrowable`, `ResultAsync.fromThrowable`, or `ResultAsync.fromPromise`; map unknown failures to typed domain errors.
- Compose with `map`, `mapErr`, and `andThen`; consume each result explicitly with `match`, a discriminant branch, or a suitable fallback.
- Server Actions validate untrusted input and convert internal results to plain serializable success/failure objects with safe error codes. Never return `Result` instances, raw backend errors, or secrets to the browser.
- Direct action consumers handle the returned union as data. Only a TanStack Query adapter may convert an expected failure to a rejected Promise (including `throw` inside its async query/mutation function), because Query uses rejection to enter its error state. Keep this conversion at the adapter boundary, not in domain logic or Server Actions; show a safe translated message.
- Exceptions otherwise represent framework control flow or unexpected programmer failures, not expected application errors. Do not catch framework redirects/not-found signals as domain failures.

See [architecture](docs/architecture.md) and the `react-query-server-action-errors` skill for the boundary contract.

<!-- END:neverthrow-agent-rules -->

<!-- BEGIN:tanstack-query-agent-rules -->

# Manage server state with TanStack Query

This project uses `@tanstack/react-query` for client-owned server state. Before writing queries or mutations, inspect the installed version and read the relevant official documentation starting at `https://tanstack.com/query/latest/docs/framework/react/overview`. Also consult the relevant articles in TkDodo's blog at `https://tkdodo.eu/blog/`. Reuse the app's existing `QueryClient` and `QueryClientProvider`; do not create feature-level clients. Keep query keys, query options, fetchers, and mutations inside the feature that owns the data. Use stable query keys, map external failures to typed errors, and invalidate or update cached data deliberately after mutations. Keep local UI state in React and prefer Server Components for server-owned data when TanStack Query adds no client caching or synchronization value. In the Next.js App Router, use Server Components for prefetching and hydration when needed; do not use Server Actions as query functions because they execute serially, though they may be used for mutations.

<!-- END:tanstack-query-agent-rules -->

# Local architecture and tooling

- Use Node 24 LTS and pnpm 12.23.0, as declared in `.node-version` and `package.json`. Use only `pnpm-lock.yaml`; install with `pnpm install --frozen-lockfile`.
- Follow [docs/architecture.md](docs/architecture.md): `app` composes features; features use shared code, not other features; shared modules do not import features or `app`.
- Treat the removable task example as a server-validation/local-state demonstration, not production persistence. Do not add a mutable global server store or unnecessary Query caching.
- Read server environment variables only through `lib/env.ts`. Add each new variable to `lib/env-schema.ts` and `.env.example` in the same change; never read `process.env` elsewhere in server code.
- Keep secrets and privileged access in `server-only` modules. Return minimal safe DTOs and recheck authorization inside each real mutation boundary.

# Testing

- Unit tests use Vitest and live next to the code as `*.test.ts(x)`. They run without a database, a browser, or a `.env` file; keep it that way so `pnpm test` works on a clean checkout.
- Test domain logic and every boundary that accepts untrusted input: schemas, parsers, access rules, result-to-error-code mapping. Do not test framework behavior or markup details.
- Before refactoring untested logic, write a characterization test that pins the current behavior. Do not change it in the same change as the refactor.
- End-to-end tests use Playwright in `e2e/` and run against the production build. Keep them to a few flows that prove the app works end to end.
- Never skip, delete, or loosen a test to obtain a green run. Fix the cause, or change the test only when the intended behavior has explicitly changed.

# Definition of done

- Add or update tests for the behavior you changed.
- Run `pnpm check` (lint and typecheck), `pnpm test`, and `pnpm build` before handing off an implementation. Run `pnpm test:e2e` when routing, forms, or page composition changed.
- Leave visual and acceptance QA to the user. Hand off a concise checklist of affected behavior and expected results for the user to verify; [verification](docs/verification.md) provides manual-check guidance.
- Report commands, pass/fail results, and every unrun check with its reason. Passing tests are not evidence of visual correctness. Do not call blocked or unverified requirements complete.
- Never disable lint rules or skip required checks merely to obtain a green run. Fix the cause. Change a requirement only when the intended behavior has explicitly changed.

# Parallel work

Use a shared checkout, without worktrees. Preserve existing user changes. Assign one current owner per edited file, including the lockfile; request a change or explicit ownership transfer before editing another owner's file. Only the dependency owner runs installations. After writers stop, inspect the actual combined diff and run lint, typecheck, test, and build checks; agent summaries alone are not proof. Leave output QA to the user.
