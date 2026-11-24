import type { Instrumentation } from "next";

import { captureError } from "./lib/observability";

/**
 * Called once when a server instance starts. Register an error tracker here
 * with `setErrorReporter`; see docs/architecture.md.
 */
export function register(): void {
  // Nothing to register by default: errors go to the structured log.
}

/** Every error the server did not handle, from pages, route handlers, and Server Actions. */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  await captureError(error, {
    source: "request",
    method: request.method,
    // The path only: query strings can carry personal data and secrets.
    path: request.path.split("?")[0],
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
  });
};
