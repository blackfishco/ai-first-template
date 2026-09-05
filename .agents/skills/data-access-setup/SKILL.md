---
name: data-access-setup
description: Plan safe, typed data access for this Next.js template. Use whenever the user adds or expands Payload CMS, an external REST/OpenAPI or Swagger API, a GraphQL API, generated API clients, API authentication, server/client data fetching, TanStack Query integration, caching, or API environment variables—even when they ask only for a client, CMS, endpoint, schema, or codegen setup. Produces repository-specific implementation guidance without changing files. Do not use for unrelated one-off fetch bugs, incidents, or data migrations.
compatibility: Next.js App Router, TypeScript, Node 24 LTS, pnpm 11.21.0, repository read tools, and a structured question tool. Official documentation access is recommended.
---

# Data Access Setup

Plan a repository-specific data integration without changing the repository.

## Operating contract

- Work read-only. Do not install packages, edit files, run code generation, or create application files.
- Return an implementation-ready plan with exact pnpm commands and focused file changes. The user approves the plan; a separate implementation task applies it.
- Never request, display, or persist secret values. Ask only for auth mechanisms, variable names, and whether credentials exist.
- Do not invent an OpenAPI contract, GraphQL schema, endpoint, field, or Payload model.
- Treat generated code as replaceable. Keep custom code outside generated directories.
- Use the user's language for questions and the final plan.
- Keep this skill guidance-only. Once the user approves the plan and requests implementation, hand its decisions, file ownership, commands, and verification criteria to a separate implementation task/agent. Do not require the user to paste code or run the plan manually; do not treat plan approval alone as permission to execute.

## Workflow

### 1. Inspect before asking

Read discoverable facts first:

- `AGENTS.md` and nested instructions
- `package.json`, lockfile, Node/package-manager constraints, and installed versions
- `tsconfig.json`, `next.config.*`, `app/` or `src/app/`
- existing `features/`, `lib/`, data-access, API, generated, and provider modules
- TanStack Query provider and current query-key conventions
- existing Payload, OpenAPI, GraphQL, env-validation, and codegen config
- env variable **names only**, `.gitignore`, deployment config, and CI scripts
- the relevant installed Next.js guides under `node_modules/next/dist/docs/`

Do not ask the user for facts available in these files.
Do not print values read from env files.

### 2. Select sources

Ask which sources are in scope:

1. Payload CMS owned by this application
2. External API
3. Both or multiple sources

Support multiple named sources. Give each source its own contract, client boundary, env namespace, and generated output directory.

### 3. Resolve common decisions

Ask only unresolved decisions, no more than four questions per round. Put the recommended option first and explain why briefly.

For each source establish:

- required reads, writes, uploads, streams, and background operations
- execution location: Server Components/DAL, browser, or both
- authentication category: public, server credential, user cookie/token, or OAuth; never ask for the credential
- dev, staging, and production endpoints and deployment/runtime constraints
- freshness, caching, invalidation, retry, timeout, pagination, and rate-limit needs
- expected error behavior and which data may cross the server/client boundary

Use server-first access by default. Add browser access only when interaction, synchronization, polling, or optimistic updates require it.
Use TanStack Query only for client-owned server state; reuse the existing `QueryClient`.

### 4. Follow the selected branch

- Payload: read [references/payload.md](references/payload.md).
- REST/OpenAPI: read [references/rest-openapi.md](references/rest-openapi.md).
- GraphQL: read [references/graphql.md](references/graphql.md).
- For mixed sources, process each branch independently, then add one integration section describing shared auth, cache boundaries, naming, and failure isolation.

If the external protocol is unknown, ask before choosing a generator.
If it is neither REST/OpenAPI nor GraphQL, mark code generation outside this skill's scope and provide only the generic architecture decisions.

### 5. Verify current documentation

Before recommending packages or config syntax:

1. Determine exact installed versions.
2. Read official documentation for those versions.
3. If a package is absent, check the current stable version, peer dependencies, Node requirements, and framework compatibility.
4. Pin code generators and matched package families where upstream requires it.
5. Cite the official sources used.

Do not substitute remembered APIs when current documentation is unavailable or conflicting. Report the blocker and the evidence needed to resolve it.

### 6. Produce the plan

Use [references/output-template.md](references/output-template.md) exactly.
Include complete small config files and focused patches for larger existing files.
Use pnpm commands throughout: `pnpm add`, `pnpm add -D`, `pnpm exec`, and project scripts. Use `pnpm install --frozen-lockfile` for reproducible verification; only the dependency owner updates `pnpm-lock.yaml` during implementation.
Never imply that proposed commands were executed.

## Architecture defaults

- Put secrets, authorization, and privileged clients in a `server-only` Data Access Layer.
- Return minimal DTOs rather than raw backend records.
- Keep generated clients close to the feature that owns them; use shared infrastructure only when several features truly own the source.
- Map expected boundary failures to typed domain errors with `neverthrow`. Server Actions serialize them to plain success/failure unions with safe codes; only a TanStack Query adapter converts an expected failure to a rejected Promise. Follow [the local architecture](../../../docs/architecture.md).
- Validate untrusted client input and re-check authorization inside every mutation boundary.
- Keep Payload and external clients isolated so one source can fail or regenerate without coupling the others.
- Prefer explicit cache and invalidation policy over framework defaults.

## Stop conditions

Return a blocked plan instead of guessing when:

- REST has no usable OpenAPI document.
- GraphQL has no schema or introspection/export path.
- protected contract retrieval has no safe generation-time credential mechanism.
- package peer requirements conflict with the repository runtime.
- browser access would expose a secret.
- auth, authorization, cache ownership, or deployment runtime remains materially ambiguous.

State the smallest next action that unblocks the plan.

## Quality gate

Before responding, verify that the plan:

- reflects the inspected repository rather than a generic Next.js sample
- separates server-only and browser-safe modules
- contains no secret values
- lists every dependency, file action, env name, script, and verification command
- identifies generated files and says not to edit them
- includes auth, authorization, DTO, cache, error, and deployment implications
- handles every selected source and flags every unresolved blocker
- cites current official documentation
