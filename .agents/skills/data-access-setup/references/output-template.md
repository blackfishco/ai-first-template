# Output template

Use this structure for every final plan. Omit no section; write `None` where a section does not apply.

```md
# Data access plan

## Status
- Ready | Blocked
- Blocking evidence and smallest next action, if blocked

## Repository findings
- Framework, runtime, package manager, installed data libraries, relevant paths, and constraints

## Decisions
| Source | Protocol | Owner | Runtime | Auth | Operations | Cache |
|---|---|---|---|---|---|---|

## Target architecture
- Source boundaries
- Server/client flow
- DAL and DTO boundary
- Mutation and invalidation flow
- Why this structure fits the repository

## Dependencies
| Package | Version/range | Dependency type | Reason | Compatibility evidence |
|---|---|---|---|---|

## File plan
| Action | Path | Purpose | Generated? |
|---|---|---|---|

### File contents and patches
For each file, provide a complete small file or a focused patch against inspected content.
Never place handwritten code inside a generated directory.

## Environment contract
| Variable | Scope | Secret? | Required in | Purpose | Placeholder |
|---|---|---|---|---|---|

State explicitly which variables are server-only and which `NEXT_PUBLIC_*` values are frozen at build time.
Include the `.env.example` and `.gitignore` changes for the implementing agent, but never include a real secret.

## Code generation
- Contract source
- Config and output directory
- pnpm scripts
- Local and CI flow
- Generated-code ownership and drift policy

## Data and error behavior
- Validation and DTO minimization
- Typed `neverthrow` boundary errors
- Timeout, retry, pagination, rate-limit, and idempotency behavior
- Cache, freshness, and invalidation

## Security checks
- Authentication and authorization
- Secret isolation and `server-only` boundary
- Browser exposure, CORS/CSRF/cookie forwarding
- Personalized-data cache isolation

## Implementation handoff
- Approval required before a separate implementation task executes the plan
- File/dependency ownership and ordered steps for the implementing agent
- Exact pnpm commands, including frozen-lockfile installation for verification

Do not claim these commands ran. The user approves scope; the implementing agent applies files and runs commands, rather than asking the user to paste code.

## Verification
| Check | Command or action | Expected result |
|---|---|---|

Include codegen, lint, typecheck, relevant tests, build, and one safe smoke test.

## Risks and recovery
- Contract drift, incompatible versions, rollout, migration, and rollback steps

## Open decisions
- None, or the remaining questions and why they block implementation

## Official sources
- Exact official URLs consulted
```

For mixed sources, repeat source-specific dependency, file, env, codegen, and verification subsections. End with shared naming and failure-isolation rules.
