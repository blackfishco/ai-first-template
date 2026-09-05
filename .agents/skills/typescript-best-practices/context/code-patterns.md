# TypeScript Code Patterns

## Types and functions

- Infer obvious local types; annotate public and external boundaries.
- Use interfaces for object contracts and type aliases for unions/utilities.
- Prefer `unknown` to `any`; validate before using external values.
- Use short functions with one responsibility and early returns rather than nested branches.
- Do not create a service class, cache, or generic wrapper solely to demonstrate a typing technique.

```ts
import { err, ok, type Result } from "neverthrow";

type TextError = "INVALID_TEXT";

function normalizeText(value: unknown): Result<string, TextError> {
  if (typeof value !== "string") return err("INVALID_TEXT");
  const text = value.trim();
  if (!text) return err("INVALID_TEXT");
  return ok(text);
}
```

This illustrates narrowing and guard clauses. For application forms, reuse the feature's existing schema rather than writing a second validator.

## Expected errors

Follow [the project's error boundary contract](../../../../docs/architecture.md):

- Return `Result` or `ResultAsync` from internal fallible operations.
- Wrap throwing/rejecting third-party calls at the boundary; map unknown reasons to typed domain codes. Never cast an unvalidated response to an application DTO.
- Use `map`, `mapErr`, and `andThen` to compose the flow, then consume the result explicitly.
- Server Actions return plain serializable success/failure unions, not `Result` instances or raw errors.
- Only the TanStack Query adapter converts an expected failure into rejection to enter Query's error state. Direct action consumers branch on returned data.
- Multiple validation issues are typed data, not `AggregateError`. Reserve exceptions for framework control flow or unexpected programmer failures.

The [compiled example action](../../../../features/example/actions.ts) is the local model. Do not copy throwing validation or catch-and-rethrow service patterns from generic TypeScript examples.

## Async composition

Run independent operations concurrently when they share no sequencing or resource constraint. Combine their results explicitly with the installed `neverthrow` APIs; do not unwrap errors simply to fit `Promise.all`.

Use `andThen` when the next operation depends on the previous successful value. Avoid nested `.then` chains, ignored promises, and unhandled result values.

Remove unnecessary `async` only if it preserves the public contract. Next.js Server Actions must remain async even when their current demo implementation has no asynchronous I/O.
