# Master Repo Template

A starting point for sites built by Blackfish: Next.js with Payload CMS in one app, on Postgres. It ships pages composed from blocks, two languages, media, SEO, redirects, a contact form, tests, and instructions for AI agents. It contains no client-specific content and no visitor accounts.

Starting a new project? Follow [docs/new-project.md](docs/new-project.md).

## Start

Prerequisites: **Node 24.22.3 or newer 24.x** (see [`.node-version`](.node-version)), **pnpm 12.23.0** (see [`package.json`](package.json)), and Postgres. Select Node with your runtime manager and install pnpm following its [installation guide](https://pnpm.io/installation), selecting this exact version.

```sh
pnpm install --frozen-lockfile
cp .env.example .env            # then set PAYLOAD_SECRET (openssl rand -hex 32)
docker compose up -d            # local Postgres matching DATABASE_URL in .env.example
ALLOW_SEED=true pnpm seed       # optional: demo pages, navigation and an image
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The admin is at [http://localhost:3000/admin](http://localhost:3000/admin); the first visit creates the first account, which becomes an admin.

In development the CMS creates and updates the database schema by itself on start; do not run `pnpm payload migrate` on a development database. Any Postgres works in place of Docker: point `DATABASE_URL` at it. The app stops at startup and names any environment variable that is missing or malformed. Until a page with the slug `home` is published, the home page points to the admin.

`pnpm-lock.yaml` is the only lockfile. Use `pnpm add` for dependency changes and commit the manifest and lockfile together. Do not broadly allow dependency build scripts; review entries in `pnpm-workspace.yaml` one by one.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Development server on port 3000 |
| `pnpm check` | Lint and TypeScript; stops on failure |
| `pnpm test` | Unit tests (Vitest); need no database |
| `pnpm test:int` | Migrations and integration tests against a `*_test` Postgres database |
| `pnpm build` | Production build |
| `pnpm test:e2e` | End-to-end tests (Playwright) against the production build |
| `pnpm vercel-build` | Deployment build: migrate when allowed, then build |
| `pnpm start` | Serve an existing production build |
| `pnpm payload migrate` | Apply committed migrations (deployments and test databases, not development) |
| `pnpm payload migrate:create <name>` | Create a migration after a schema change |
| `pnpm generate:types` | Regenerate `payload-types.ts` |
| `ALLOW_SEED=true pnpm seed` | Fill the CMS with demo content in every language |

A full local check:

```sh
createdb -h 127.0.0.1 -U template template_test   # once
pnpm check
pnpm test
DATABASE_URL=postgres://template:template@127.0.0.1:5432/template_test pnpm test:int
pnpm build
pnpm test:e2e
```

Tests do not replace looking at the site; see [verification](docs/verification.md).

## What is where

| Area | Location |
| --- | --- |
| Site routes | [`app/(frontend)/[locale]/`](app/(frontend)/[locale]/) |
| Admin and CMS API (generated) | [`app/(payload)/`](app/(payload)/) |
| CMS config | [`payload.config.ts`](payload.config.ts), [`payload/`](payload/) |
| Page blocks | [`payload/blocks/`](payload/blocks/) and [`components/sections/`](components/sections/) |
| Features | [`features/`](features/): `pages` (CMS pages), `contact` (the reference form) |
| Shared UI | [`components/ui/`](components/ui/) (shadcn on Base UI), [`components/layout/`](components/layout/) |
| Design tokens | [`app/globals.css`](app/globals.css) |
| Languages and interface text | [`i18n/config.ts`](i18n/config.ts), [`messages/`](messages/) |
| Environment variables | [`lib/env-schema.ts`](lib/env-schema.ts), [`.env.example`](.env.example) |
| Tests | `*.test.ts` next to the code, [`tests/int/`](tests/int/), [`e2e/`](e2e/) |
| Seed | [`scripts/seed.ts`](scripts/seed.ts) |

## Documentation

- [Architecture](docs/architecture.md): how the pieces fit, import rules, the CMS, caching, errors.
- [New project](docs/new-project.md): from this template to a deployed site.
- [Environments](docs/environments.md): what production, preview, development and CI use; Vercel and other hosts.
- [Migrations](docs/migrations.md): rules for schema changes.
- [Removing parts](docs/removing-parts.md): the second language, the contact form, TanStack Query.
- [Decisions](docs/decisions.md): why things are the way they are.
- [Verification](docs/verification.md): checks before handing work over.
- [CONTEXT.md](CONTEXT.md): the vocabulary.
- [AGENTS.md](AGENTS.md): instructions for AI agents; `CLAUDE.md` imports it.

## CI and delivery

[GitHub Actions](.github/workflows/ci.yml) runs on pushes and pull requests: frozen installation, lint and types, a check that generated CMS types are current, unit tests, migrations and integration tests on a throwaway Postgres, the seed twice, a production build, and end-to-end tests.

A passing workflow does not mean merges are blocked. Branch protection is a setting on GitHub; follow [the activation checklist](docs/verification.md#github-activation-pending) and do not claim protection before verifying it there.

Dependency updates come from [Renovate](renovate.json): one batch of pull requests on Monday mornings, security fixes at any time. Payload, Next.js, and React packages arrive grouped; the version ceilings in [decisions](docs/decisions.md) are respected. A new project inherits the configuration; the Renovate app must be installed on its repository.

Deployment targets Vercel with a Postgres database per environment and Vercel Blob for media; see [environments](docs/environments.md), which also covers other hosts.
