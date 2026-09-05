# GraphQL branch

Use this branch when the source exposes a GraphQL schema through a file, registry, or introspection endpoint.
GraphQL Code Generator generates typed documents and helpers; it does not choose or configure every runtime transport.

## Inspect the contract

Determine:

- schema file, schema registry, or introspection endpoint
- safe generation-time auth through an env variable name
- operation documents or colocated GraphQL tags
- query, mutation, fragment, and subscription needs
- custom scalars and their runtime representations
- deprecations, multipart uploads, persisted operations, federation, and schema visibility
- whether local and CI generation can obtain the same schema

If schema/introspection is unavailable, stop codegen planning and identify the schema export or registry access required.

## Interview

Ask only missing decisions:

1. Which operations and fragments are in scope?
2. Is runtime access server-only, browser-only, or mixed?
3. Is auth public, server credential, per-user token/cookie, or OAuth?
4. Is plain HTTP enough, or are subscriptions/uploads required?
5. What are endpoint, cache, pagination, retry, and invalidation rules?
6. Does the backend already support persisted operations?

## Code Generator plan

Verify current official versions and peer requirements before writing commands.
Default to:

- local `@graphql-codegen/cli` and `@graphql-codegen/client-preset`
- exact-pinned generator versions
- `graphql` runtime dependency
- the `client` preset and generated `TypedDocumentNode` artifacts
- `graphql-request` for simple HTTP query/mutation transport when its ESM/runtime constraints fit
- existing TanStack Query only for client-owned server state
- committed output with an explicit generation script and `graphql-codegen --check` drift check

The `codegen.ts` plan must include:

- schema source and env-based generation headers where needed
- document globs that include operation files and exclude generated output
- a source-specific output directory
- explicit custom scalar mappings when present
- generation and check scripts
- no-manual-edit policy

Do not enable persisted documents unless the backend and runtime transport are configured to store and send them. Generating hashes alone is insufficient.

## Transport boundary

For server-only queries, keep endpoint/auth access in a `server-only` DAL and return minimal DTOs.
For browser queries, expose only browser-safe endpoint values and use user-scoped auth; never ship service credentials.
Map transport and GraphQL errors to typed domain errors rather than leaking raw responses.

Subscriptions need a transport compatible with the backend's WebSocket or SSE protocol. `graphql-request` alone is not a subscription runtime. If subscriptions are requested, treat transport selection as an unresolved decision until the server protocol is known.

## Verification

Include schema reachability, generation, document validation, drift check, lint, typecheck, tests, and build. Add an operation-level smoke test that does not print tokens or private response fields.

## Official sources

- https://the-guild.dev/graphql/codegen/docs/getting-started/installation
- https://the-guild.dev/graphql/codegen/docs/config-reference/codegen-config
- https://the-guild.dev/graphql/codegen/docs/config-reference/schema-field
- https://the-guild.dev/graphql/codegen/docs/config-reference/documents-field
- https://the-guild.dev/graphql/codegen/plugins/presets/preset-client
- https://the-guild.dev/graphql/codegen/docs/getting-started/development-workflow
- https://the-guild.dev/graphql/codegen/docs/guides/react-vue
