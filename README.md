# Vitek template

Next.js App Router template for AI-assisted development, with strict TypeScript, shadcn/Base UI, Payload CMS, Czech and English translations, and automated checks. Start with the existing patterns rather than adding a framework around each feature.

## Start

Prerequisites: **Node 24 LTS** (see [`.node-version`](.node-version)) and **pnpm 12.23.0** (see [`package.json`](package.json)). Select Node with your runtime manager; install pnpm following its [official installation guide](https://pnpm.io/installation), selecting this exact version. Do not change the machine's global runtime merely to run this project.

```sh
node --version       # v24.22.3 or newer 24.x
pnpm --version       # 12.23.0
pnpm install --frozen-lockfile
cp .env.example .env   # then set PAYLOAD_SECRET (openssl rand -hex 32)
docker compose up -d   # local Postgres matching DATABASE_URL in .env.example
pnpm payload migrate   # create the database schema
ALLOW_SEED=true pnpm seed   # optional: demo pages, navigation and an image
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The CMS admin is at [http://localhost:3000/admin](http://localhost:3000/admin); the first visit creates the first user.

The app needs a Postgres database and the variables in [`.env.example`](.env.example); it stops at startup and names any variable that is missing or malformed. Any Postgres works in place of Docker: point `DATABASE_URL` at it. Until a page with the slug `home` is published in the CMS, the home page points to the admin.

`pnpm-lock.yaml` is the only dependency lockfile. Use `pnpm add` for intentional dependency changes and commit the updated manifest and lockfile together. Do not hand-edit the lockfile or broadly allow dependency build scripts; review individual entries in `pnpm-workspace.yaml`.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Development server on port 3000 |
| `pnpm check` | Lint and TypeScript; stops on failure |
| `pnpm test` | Vitest unit tests |
| `pnpm test:int` | Migrations and integration tests against a `*_test` Postgres database |
| `pnpm build` | Production build |
| `pnpm test:e2e` | Playwright tests against the production build |
| `pnpm vercel-build` | Deployment build: migrate when allowed, then build |
| `pnpm start` | Serve an existing production build |
| `pnpm payload migrate` | Apply committed database migrations |
| `pnpm payload migrate:create <name>` | Create a migration after a schema change |
| `pnpm generate:types` | Regenerate `payload-types.ts` |
| `ALLOW_SEED=true pnpm seed` | Fill the CMS with demo content in every language |

For a full local check:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm test:e2e
```

Unit tests sit next to the code as `*.test.ts`; end-to-end tests are in `e2e/`. Tests do not replace a visual check of a fresh production build; see [verification](docs/verification.md).

## Where to change things

| Area | Files |
| --- | --- |
| Starter page | [`app/(frontend)/[locale]/page.tsx`](app/(frontend)/[locale]/page.tsx) |
| Layout and metadata | [`app/(frontend)/[locale]/layout.tsx`](app/(frontend)/[locale]/layout.tsx) |
| Design tokens and base CSS | [`app/globals.css`](app/globals.css) |
| Shared UI primitives | [`components/ui/`](components/ui/) |
| Reference feature | [`features/contact/`](features/contact/) |
| UI text | [`messages/cs.json`](messages/cs.json), [`messages/en.json`](messages/en.json) |
| Languages | [`i18n/config.ts`](i18n/config.ts) |
| Locale setup/message composition | [`i18n/routing.ts`](i18n/routing.ts), [`i18n/request.ts`](i18n/request.ts) |
| Query and toast providers | [`app/providers.tsx`](app/providers.tsx) |

Keep layout changes local, recurring UI styling in shared component variants, and site-wide design changes in tokens. Ask before expanding a change's scope. Read [architecture](docs/architecture.md) for data flow and import rules, [decisions](docs/decisions.md) for why things are the way they are, [CONTEXT.md](CONTEXT.md) for the vocabulary, and [AGENTS.md](AGENTS.md) for agent instructions.

## CI and delivery

[GitHub Actions](.github/workflows/ci.yml) checks pushes and pull requests with frozen installation, lint, type checks, unit tests, a production build, and end-to-end tests. A local passing check does not prove that GitHub branch protection is active.

**Branch protection is pending until the repository is connected to GitHub and configured.** Follow [the activation checklist](docs/verification.md#github-activation-pending). Do not claim merges are blocked before verifying that setting on the host.

For a Node deployment, use Node 24 and pnpm 12.23.0, install with `pnpm install --frozen-lockfile`, build with `pnpm build`, and run `pnpm start`. A platform adapter must support this installed Next.js version and Server Actions; this is not a static-export app. No production storage is configured. Plan authentication, authorization, persistence, and environment validation before turning the demo into a real product.

## Remove the demo / prepare a release

- [Clean-source installation and release checks](docs/verification.md#clean-source-verification) ensure the project works without the original checkout's dependencies or build output.

Keep skill evaluation working files out of release archives; do not delete a user's local evaluation history to tidy a delivery.
