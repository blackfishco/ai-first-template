---
name: new-project
description: Turn a fresh copy of this template into a named project. Use when the user says they are starting a new project from the template, asks to rename or set up the project, asks what to remove from the template, or when package.json is still named master-repo-template. Covers the repository steps of docs/new-project.md; hosting steps need a person with access.
---

# New project from the template

Follow `docs/new-project.md`. This skill is the order of work and what to ask.

## Ask first, in one message

1. The project's name and one sentence on what the site is for.
2. Which languages. If only one: which.
3. Whether the site needs the contact form.
4. The Linear project or ticket prefix, if it differs from `BF`.
5. Whether a design or brand exists for the admin logo.

Do not invent answers. If the user does not know yet, leave the placeholder in `docs/project.md` and say so.

## Then

1. Create a branch. All setup is one pull request.
2. Rename: `package.json` `name`, the README title and first paragraph, `Site.name` in `messages/*.json`, `payload/admin/branding.tsx`.
3. Fill in `docs/project.md` with what the user said. Leave the comment placeholders for what they did not.
4. `AGENTS.md`: delete the example hard rule. Add the project's rules only if the user stated any.
5. `CONTEXT.md`: add domain terms the user used.
6. Remove what the project does not need, following `docs/removing-parts.md` exactly. Each removal that changes the CMS schema needs a migration and regenerated types.
7. Add an entry to `docs/decisions.md` for every removal.
8. Run `pnpm check`, `pnpm test`, `pnpm test:int`, `pnpm build`, and `pnpm test:e2e`. Fix what the removals broke; do not delete a test that still describes kept behaviour.
9. Open the pull request with the template filled in.

## Hand over

Tell the user which steps remain for a person: hosting and its variables (`docs/environments.md`), branch protection (`docs/verification.md`), and the pre-launch checklist in `docs/new-project.md`. Say plainly that none of those were done.

## Do not

- Do not set up hosting, domains, or secrets, and do not ask for secret values.
- Do not seed a database other than a local or `*_test` one.
- Do not remove the tests, the environment validation, the migrations workflow, or the import rules.
