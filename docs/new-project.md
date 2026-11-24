# Starting a new project

From this template to a deployed site. An agent can do the repository steps with the `new-project` skill; the hosting steps need a person with access.

## 1. Create the repository

Create a new repository from this template and clone it. Work on a branch; the first pull request is the project setup.

## 2. Name the project

- `package.json`: set `name`.
- `README.md`: replace the title and the first paragraph with what this project is. Keep the rest.
- `docs/project.md`: fill it in (purpose, people, links, the Linear project). It is the first thing a new person or agent reads.
- `AGENTS.md`: write the project's first hard rules, if any are known. Delete the example rule.
- `CONTEXT.md`: add the project's domain terms.
- `payload/admin/branding.tsx`: the admin title, logo, and icon.
- `messages/*.json`: `Site.name`, the fallback site name.
- `commitlint.config.mjs` and `.github/pull_request_template.md`: nothing to change if tickets live in Linear under the `BF` prefix.

## 3. Decide what to keep

The template ships more than every project needs. Remove what this one does not, now, while nothing depends on it. [Removing parts](removing-parts.md) has the steps for:

- the second language;
- the contact form and e-mail;
- TanStack Query.

Keep the tests, the environment validation, and the migrations workflow.

## 4. Run it locally

```sh
pnpm install --frozen-lockfile
cp .env.example .env            # set PAYLOAD_SECRET
docker compose up -d
ALLOW_SEED=true pnpm seed
pnpm dev
```

Open `/admin`, create the first account, and look at the seeded site. Then run the full check from the README.

Do not run `pnpm payload migrate` here. In development the CMS creates the schema by itself the first time it starts, including when the seed runs. Migrations are for deployments and for the test database; see [migrations](migrations.md).

## 5. Set up hosting

Follow [environments](environments.md#vercel). The points that cause trouble later if skipped:

- **A separate database for production and for previews.** Set `PREVIEW_DATABASE_ISOLATED=true` only after previews have their own.
- **Different secrets per environment.**
- **`ALLOW_SEED` is never set on production.**

After the first deploy: create the first account on production, check `/api/health`, and check that a preview answers with `X-Robots-Tag: noindex, nofollow`.

## 6. Protect the main branch

Follow [the activation checklist](verification.md#github-activation-pending): require pull requests and the `Quality checks` status. Verify the rule blocks a failing pull request before relying on it.

## 7. Set up the work

- Create the Linear project and link it in `docs/project.md`.
- One ticket, one branch, one pull request. Commits carry the ticket as their scope: `feat(bf-123): …`.
- Write decisions into `docs/decisions.md` as they are made.

## 8. Before launch

- [ ] The real domain is set as `SITE_URL` on production.
- [ ] The admin has real accounts with strong passwords; the setup account is removed or renamed.
- [ ] `RESEND_API_KEY`, `EMAIL_FROM`, and `CONTACT_EMAIL_TO` are set, and a test message arrives.
- [ ] `PREVIEW_SECRET` and `CRON_SECRET` are set; a scheduled page publishes.
- [ ] The seeded demo content is replaced or deleted.
- [ ] `/robots.txt` on production allows indexing and lists the sitemap; a preview disallows everything.
- [ ] The site was checked by hand on a phone and a desktop, in every language.
- [ ] Redirects from the old site, if there was one, are entered in the admin.
