# Decisions

One entry per decision: what was decided, why, and where it lives in the code. Add an entry in the same change that makes the decision. Do not rewrite old entries; add a new one that supersedes them.

## 2026-11-24 — Dependency ceilings (BF-967)

**What.** These packages stay below their latest major:

| Package | Pinned | Latest | Blocked by |
| --- | --- | --- | --- |
| `typescript` | 6.0 | 7.0 | `typescript-eslint` 8 supports TypeScript `<6.1.0` |
| `eslint` | 9 | 10 | `eslint-config-next` 16.4 depends on `eslint-plugin-import` 2, which supports ESLint up to 9 |
| `eslint-plugin-unicorn` | 65 | 80 | 66 and later require ESLint `>=10.4` |
| `@types/node` | 24 | 26 | Must match the Node 24 LTS runtime in `.node-version` |

**Why.** The type-aware lint rules and the import-boundary rule (`import/no-restricted-paths`) are part of the template's contract. Upgrading past these ceilings means dropping or replacing them, which is a separate decision.

**Where.** `package.json`, `eslint.config.mjs`.

**Revisit when.** `typescript-eslint` supports TypeScript 7, and `eslint-config-next` no longer pulls in `eslint-plugin-import` 2.

## 2026-11-24 — Respect pnpm's minimum release age (BF-966)

**What.** Versions published within pnpm's minimum release age are not installed. The template takes the newest version that passes the policy and does not add `minimumReleaseAgeExclude` entries.

**Why.** The delay is a supply-chain guard. Excluding packages to get the very latest patch removes the guard for exactly the releases it exists for.

**Where.** `pnpm-workspace.yaml`, `pnpm-lock.yaml`.
