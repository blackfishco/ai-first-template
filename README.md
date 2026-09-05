# Vitek template

Next.js App Router template for AI-assisted development, with strict TypeScript, shadcn/Base UI, Czech translations, and automated checks. Start with the existing patterns rather than adding a framework around each feature.

## Start

Prerequisites: **Node 24 LTS** (see [`.node-version`](.node-version)) and **pnpm 11.21.0** (see [`package.json`](package.json)). Select Node with your runtime manager; install pnpm following its [official installation guide](https://pnpm.io/installation), selecting this exact version. Do not change the machine's global runtime merely to run this project.

```sh
node --version       # v24.x
pnpm --version       # 11.21.0
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:3000/cs](http://localhost:3000/cs). The removable task demo and small component gallery are at [http://localhost:3000/cs/example](http://localhost:3000/cs/example).

No account, database, external API, or secret environment variable is needed. Demo additions exist only in that page's local state: refreshing restores the initial tasks. The server validates additions but does **not** persist them or share them between visitors.

`pnpm-lock.yaml` is the only dependency lockfile. Use `pnpm add` for intentional dependency changes and commit the updated manifest and lockfile together. Do not hand-edit the lockfile or broadly allow dependency build scripts; review individual entries in `pnpm-workspace.yaml`.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Development server on port 3000 |
| `pnpm check` | Lint and TypeScript; stops on failure |
| `pnpm build` | Production build |
| `pnpm start` | Serve an existing production build |

For a full local check:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

No automated test runner is configured. Check browser behavior manually against a fresh production build; see [verification](docs/verification.md).

## Where to change things

| Area | Files |
| --- | --- |
| Starter page | [`app/[locale]/page.tsx`](app/[locale]/page.tsx) |
| Layout and metadata | [`app/[locale]/layout.tsx`](app/[locale]/layout.tsx) |
| Design tokens and base CSS | [`app/globals.css`](app/globals.css) |
| Shared UI primitives | [`components/ui/`](components/ui/) |
| Reference feature | [`features/example/`](features/example/) |
| Demo route | [`app/[locale]/example/`](app/[locale]/example/) |
| Small gallery and interactions | [`components/examples/example-gallery.tsx`](components/examples/example-gallery.tsx), [`components/examples/gallery-interactions.tsx`](components/examples/gallery-interactions.tsx) |
| Czech UI text | [`messages/cs.json`](messages/cs.json), [`messages/example.cs.json`](messages/example.cs.json) |
| Locale setup/message composition | [`i18n/routing.ts`](i18n/routing.ts), [`i18n/request.ts`](i18n/request.ts) |
| Query and toast providers | [`app/providers.tsx`](app/providers.tsx) |

Keep layout changes local, recurring UI styling in shared component variants, and site-wide design changes in tokens. Ask before expanding a change's scope. Read [architecture](docs/architecture.md) for data flow and import rules, and [AGENTS.md](AGENTS.md) for agent instructions.

## CI and delivery

[GitHub Actions](.github/workflows/ci.yml) checks pushes and pull requests with frozen installation, lint, type checks, and a production build. A local passing check does not prove that GitHub branch protection is active.

**Branch protection is pending until the repository is connected to GitHub and configured.** Follow [the activation checklist](docs/verification.md#github-activation-pending). Do not claim merges are blocked before verifying that setting on the host.

For a Node deployment, use Node 24 and pnpm 11.21.0, install with `pnpm install --frozen-lockfile`, build with `pnpm build`, and run `pnpm start`. A platform adapter must support this installed Next.js version and Server Actions; this is not a static-export app. No production storage is configured. Plan authentication, authorization, persistence, and environment validation before turning the demo into a real product.

## Remove the demo / prepare a release

- [Exact demo and gallery removal steps](docs/removing-example.md) preserve the starter and providers.
- [Clean-source installation and release checks](docs/verification.md#clean-source-verification) ensure the project works without the original checkout's dependencies or build output.

Keep skill evaluation working files out of release archives; do not delete a user's local evaluation history to tidy a delivery.
