# Verification and release

## Local checks

Use Node 24 and pnpm 12.23.0. Run:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
DATABASE_URL=postgres://template:template@127.0.0.1:5432/template_test pnpm test:int
pnpm build
pnpm test:e2e
```

`pnpm check` runs TypeScript and lint, stopping on failure. `pnpm test` runs the Vitest unit tests; they need no database, browser, or `.env` file. `pnpm test:int` applies the committed migrations and runs the integration tests in `tests/int/` against Postgres; point `DATABASE_URL` at a database named `*_test`, because the tests delete data. The command refuses any other database before it migrates, so a plain `pnpm test:int` cannot touch the development database from `.env`. Create it once and use it for nothing else; the other variables come from `.env`. `pnpm test:e2e` runs the Playwright tests in `e2e/` against the production build, so run `pnpm build` first. Install the browser once with `pnpm exec playwright install chromium`, or point `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` at an existing Chromium binary. The production server does not sync the schema, so after pulling a change that adds a collection or field, start `pnpm dev` once (or run the seed) before the end-to-end tests; otherwise every CMS write fails on a missing column.

For UI, routing, form, focus, or shared styling changes, run `pnpm start` after a fresh build and manually check the affected routes:

- `/` and `/en` after a seed: the home page, header navigation, and the language switcher.
- A page with the contact form block: errors at each field, a failed send keeping what was typed, and the confirmation after a successful send.
- The cookie banner in a private window: it appears once, all three choices work, the footer link reopens the settings with the saved choice, and the banner covers no content you need on a phone.
- Analytics, with a real tag ID on a production-like deployment: no request to `googletagmanager.com` before consent; after "Přijmout vše" GA4 DebugView shows page views, including after clicking a link; after switching analytics off in the footer settings no more requests.
- Shared UI: desktop and mobile layouts, keyboard navigation, focus handling, accessible names, dialogs, calendar, and toast feedback.

Stop the server after verification. Report commands, results, manual checks, and every unrun check with its reason. Lint, types, tests, and a build do not prove visual correctness. Do not weaken checks to pass.

## Performance (Lighthouse)

The CI job "Lighthouse" builds the seeded site and measures `/` and `/kontakt` three times each on a simulated phone. The job summary shows the scores; the full reports are in the job's artifacts. Budgets live in [`lighthouserc.json`](../lighthouserc.json): performance and best practices 90, accessibility 95, SEO 90.

The budgets only warn for now. CI machines vary, so a single run can drop a few points without a real change. Make them blocking (change `"warn"` to `"error"` in `lighthouserc.json`) once a project has its real design and content and the scores stay above the budget for a couple of weeks.

Locally, after `pnpm build` with `SITE_URL=http://127.0.0.1:3100 ALLOW_INDEXING=true` (otherwise SEO counts the non-production noindex and canonical host):

```sh
CHROME_PATH=/path/to/chromium SITE_URL=http://127.0.0.1:3100 ALLOW_INDEXING=true pnpm lighthouse
```

## GitHub activation (pending)

The workflow is delivered; host-side protection is a separate setup task. It is **not active merely because `ci.yml` exists**.

After connecting/pushing the repository to GitHub:

1. Enable Actions and confirm the configured runner is available to the repository.
2. Run the `CI` workflow on a pull request; confirm the `Quality checks` job runs frozen installation, lint, type checks, generated-type check, unit tests, migrations and integration tests, build, and end-to-end tests successfully.
3. Under repository Settings → Rules → Rulesets (or branch protection), target the actual default branch. Require pull requests and the successful **Quality checks** status reported by that workflow. Select its exact reported context after the first run rather than guessing a status name.
4. Restrict bypass permissions as appropriate, require the branch to be up to date if desired, and save the rule. Verify the rule is enabled, not only in evaluation mode.
5. On a disposable PR, deliberately introduce a type error, then a build failure, and verify merge is blocked. Revert those probes; do not weaken checks.

Record the repository, target branch, rule, required status, and verification evidence. Until these steps run, report protection as pending, not passed.

## Clean-source verification

For a published revision:

```sh
git clone <repository-url> template-check
cd template-check
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

Use the [README prerequisites](../README.md#start). Confirm the lockfile is unchanged. Run `pnpm dev` (it creates the schema on an empty database), open `/` and `/admin`, and stop the server afterwards. No existing `.next/`, `node_modules/`, `.env` secrets, or undocumented files should be needed. Builds may require network access for configured `next/font` fonts; do not confuse blocked font downloads with a verified offline build.

Before there is a publishable commit, a coordinator may snapshot tracked **and intended untracked source** into a temporary directory, initialize a standalone temporary repository, and clone that snapshot. Do not create a worktree or commit the user's working checkout for this purpose. Exclude `.git`, dependencies, build/cache output, secrets, and local skill evaluation workspaces. A snapshot check is not proof of a later published commit; repeat against the final distribution.

For release archives, verify [`.gitattributes`](../.gitattributes) export exclusions. Git clones include tracked evaluation files even when `export-ignore` excludes them from archives; a maintainer must inspect the distribution contents. Preserve the user's local evaluation artifacts.
