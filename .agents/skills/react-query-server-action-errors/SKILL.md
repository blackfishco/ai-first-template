---
name: react-query-server-action-errors
description: Handle expected Next.js Server Action errors with TanStack React Query mutations. Use when server actions, mutationFn, useMutation, onError toasts, throwOnError, QueryBoundary, ActionResult discriminated unions, translated error codes, or production-safe client error messages are involved. Do not use for generic React Query data fetching or unrelated form validation.
---

# React Query Server Action Errors

## Boundary contract

1. Internal fallible logic returns `neverthrow` `Result`/`ResultAsync` with typed domain errors.
2. The Server Action validates input, consumes that result, and returns a plain serializable success/failure union containing only safe data/error codes.
3. Direct action consumers branch on the union. Do not add TanStack Query solely to show errors.
4. When Query owns the mutation, its client adapter converts a failure into a rejected Promise. Throwing inside this adapter's async `mutationFn` is the explicit exception to the no-expected-exceptions rule: Query requires rejection for its error state.
5. Handle the error close to the workflow using a safe translated message. Never display an arbitrary caught `Error.message` from the server or transport.

Reuse `AppProviders` and its QueryClient. Do not create a feature-level client. Keep mutation options and adapters inside the owning feature. Define cache invalidation/update behavior when real cached data changes; never use Server Actions as query functions.

## Optional Query adapter pattern

This is an illustrative pattern for a future Query-owned feature, not a second data path to add to the local-state demo. The action, input, and translation keys below belong to that future feature.

```tsx
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";

type SaveErrorCode = "INVALID_INPUT" | "UNAVAILABLE";
type SaveResult<T> =
  | { success: true; data: T }
  | { success: false; error: SaveErrorCode };

class ActionMutationError extends Error {
  constructor(readonly code: SaveErrorCode) {
    super(code);
    this.name = "ActionMutationError";
  }
}

// Inside the owning Client Component:
// saveAction(input) returns Promise<SaveResult<SavedItem>>.
// t is the feature's translation function; include errors.UNEXPECTED.
const mutation = useMutation({
  mutationFn: async (input: SaveInput) => {
    const result = await saveAction(input);
    if (result.success) return result.data;

    // Query adapter only: rejected Promise enters Query's error state.
    throw new ActionMutationError(result.error);
  },
  onError: (error) => {
    const code = error instanceof ActionMutationError
      ? error.code
      : "UNEXPECTED";
    toast.add({ type: "error", title: t(`errors.${code}`) });
  },
});
```

Use the existing Base UI toast manager from `components/ui/toast.tsx`: `toast.add({ type, title, description? })`, not `toast.error(...)`. Its renderer is `Toaster`, mounted once by `app/providers.tsx`; do not add a second renderer per feature. Keep important validation/recovery instructions inline as well, rather than relying only on a transient toast.

Do not enable global mutation `throwOnError: true`. Use it per mutation only when a deliberate boundary fallback is the intended UX. Do not inspect production Server Action exception messages or return raw backend errors, `Result` instances, or secrets to the client. Unexpected transport failures get a generic safe message; framework control-flow exceptions must not be converted into expected domain errors on the server.

## Existing counterparts

- [Architecture and error layers](../../../docs/architecture.md)
- [Compiled Server Action](../../../features/example/actions.ts): direct action, no Query adapter.
- [Toast manager/renderer](../../../components/ui/toast.tsx) and [provider integration](../../../app/providers.tsx).

There is no compiled Query mutation example in this template. If a real feature needs this adapter, verify typed action failures and unexpected rejections as part of its acceptance checks.

## Documentation

Before changing code, inspect installed versions and read the relevant official docs:

- Local Next.js `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`
- https://github.com/supermacro/neverthrow
- https://tanstack.com/query/latest/docs/framework/react/guides/mutations
- https://tkdodo.eu/blog/react-query-error-handling
- https://base-ui.com/react/components/toast
