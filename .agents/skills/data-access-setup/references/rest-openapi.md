# REST and OpenAPI branch

Use this branch only when a usable OpenAPI contract exists or the user can obtain one.
A Swagger UI page is not necessarily the contract; locate its underlying JSON or YAML document.

## Inspect the contract

Determine:

- OpenAPI version and validation status
- local file, public URL, protected URL, or registry location
- servers/base URLs and environment differences
- security schemes and which operations use them
- tags, operation IDs, pagination, errors, uploads/downloads, webhooks, SSE, and long-running operations
- whether the contract can be fetched deterministically in local development and CI

Never ask for a spec token value. Ask for the generation-time env variable name and where CI supplies it.
If the spec is missing or invalid, stop codegen planning and explain how to export or repair it.

## Interview

Ask only missing decisions:

1. Which endpoints and operations are needed now?
2. Is runtime access server-only, browser-only, or mixed?
3. Is auth a server credential, user cookie/token, OAuth flow, or public?
4. Where do dev, staging, and production base URLs come from?
5. Are uploads, streaming, retries, idempotency, or rate limits involved?
6. What owns cache freshness and mutation invalidation?

## Hey API plan

Before producing commands, verify the current stable `@hey-api/openapi-ts` version, TypeScript peer range, and Node engine. The 0.99.0 release requires Node `>=22.18.0`; never recommend it until the target development and CI runtimes satisfy that requirement. If they do not, present upgrade versus documented compatible-version options without guessing a version.

Default to:

- exact-pinned `@hey-api/openapi-ts` as a dev dependency
- Fetch client unless a documented Next-specific client feature is required
- `openapi-ts.config.ts` using `defineConfig`
- a source-specific generated directory, clearly marked as generated
- an explicit package script such as `codegen:<source>`, run with `pnpm codegen:<source>`
- committed generated output and a CI drift check

The plan must show:

- local or remote `input`, including safe env-based headers for protected specs
- `output` outside handwritten wrappers
- selected plugins and why each is needed
- runtime base URL setup for each environment
- runtime auth injection without embedding credentials in generated code
- one server-side usage example and, only if required, one browser/TanStack Query example
- a handwritten adapter/DAL that maps transport failures to typed `neverthrow` errors and returns minimal DTOs
- generated-output regeneration and no-manual-edit policy

If config runs outside Next.js and needs `.env*`, explain the documented loading mechanism or require variables to be supplied by the shell/CI. Do not assume Next automatically loads env for arbitrary CLI config.

## Security and cache

Use a server-only client when auth requires a secret.
Do not expose a secret by renaming it to `NEXT_PUBLIC_*`.
For user cookies/tokens, define forwarding, CSRF/CORS, authorization, and cache isolation.
Make timeout, retry, idempotency, and rate-limit behavior explicit; do not blindly retry mutations.

## Verification

Include generation, lint, typecheck, tests, build, and drift checks. State expected outputs for each command.

## Official sources

- https://heyapi.dev/docs/openapi/typescript/get-started
- https://heyapi.dev/docs/openapi/typescript/configuration
- https://heyapi.dev/docs/openapi/typescript/configuration/input
- https://heyapi.dev/docs/openapi/typescript/configuration/output
- https://heyapi.dev/docs/openapi/typescript/clients/fetch
- https://heyapi.dev/docs/openapi/typescript/clients/next-js
