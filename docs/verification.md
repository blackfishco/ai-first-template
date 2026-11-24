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

`pnpm check` runs TypeScript and lint, stopping on failure. `pnpm test` runs the Vitest unit tests; they need no database, browser, or `.env` file. `pnpm test:int` applies the committed migrations and runs the integration tests in `tests/int/` against Postgres; point `DATABASE_URL` at a database named `*_test`, because the tests delete data. `pnpm test:e2e` runs the Playwright tests in `e2e/` against the production build, so run `pnpm build` first. Install the browser once with `pnpm exec playwright install chromium`, or point `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` at an existing Chromium binary.

For UI, routing, form, focus, or shared styling changes, run `pnpm start` after a fresh build and manually check the affected routes:

- `/` and `/en` after a seed: the home page, header navigation, and the language switcher.
- A page with the contact form block: errors at each field, a failed send keeping what was typed, and the confirmation after a successful send.
- Shared UI: desktop and mobile layouts, keyboard navigation, focus handling, accessible names, dialogs, calendar, and toast feedback.

Stop the server after verification. Report commands, results, manual checks, and every unrun check with its reason. Lint, types, tests, and a build do not prove visual correctness. Do not weaken checks to pass.

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

Use the [README prerequisites](../README.md#start). Confirm the lockfile is unchanged. Run `pnpm payload migrate` and `pnpm dev`, open `/` and `/admin`, and stop the server afterwards. No existing `.next/`, `node_modules/`, `.env` secrets, or undocumented files should be needed. Builds may require network access for configured `next/font` fonts; do not confuse blocked font downloads with a verified offline build.

Before there is a publishable commit, a coordinator may snapshot tracked **and intended untracked source** into a temporary directory, initialize a standalone temporary repository, and clone that snapshot. Do not create a worktree or commit the user's working checkout for this purpose. Exclude `.git`, dependencies, build/cache output, secrets, and local skill evaluation workspaces. A snapshot check is not proof of a later published commit; repeat against the final distribution.

For release archives, verify [`.gitattributes`](../.gitattributes) export exclusions. Git clones include tracked evaluation files even when `export-ignore` excludes them from archives; a maintainer must inspect the distribution contents. Preserve the user's local evaluation artifacts.
