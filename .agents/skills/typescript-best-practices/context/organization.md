# TypeScript Code Organization

Follow the repository's [architecture](../../../../docs/architecture.md), not a generic controller/service template.

- Keep `strict` enabled in `tsconfig.json`. Do not weaken compiler options to hide errors.
- `app/` owns Next.js routes, layouts, and composition.
- `features/<name>/` owns its components, schema, actions, server modules, and colocated tests. Create only needed files.
- `components/ui/` owns shared primitives; `lib/` owns genuinely shared utilities. Shared code must not import `features/` or `app/`.
- Compose features in `app/` instead of importing one feature from another.
- Follow existing kebab-case file names and PascalCase component exports.
- Prefer direct imports. Do not add barrel files merely to shorten paths, especially barrels mixing server-only and client modules.
- Mark privileged modules `server-only`; export browser-safe types from separate files when needed.

Example layout, not a requirement to create every file:

```text
app/[locale]/example/page.tsx
features/example/
  components/task-demo.tsx
  server/tasks.ts
  actions.ts
  schema.ts
components/ui/button.tsx
```

The installed Next.js guides and local ESLint boundary rules take precedence over generic snippets.
