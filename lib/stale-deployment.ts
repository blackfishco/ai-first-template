/**
 * After a deploy, a tab that was already open still runs the old JavaScript
 * and calls Server Actions the new build no longer knows. Next.js answers
 * "Server Action … was not found on the server". Nothing is wrong with the
 * data or the visitor's rights; the page only needs to load again.
 */
export function isStaleDeploymentError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const name = "name" in error ? error.name : undefined;
  const message = "message" in error ? String(error.message) : "";
  return (
    name === "UnrecognizedActionError" ||
    /Server Action ".*" was not found on the server/.test(message)
  );
}

/**
 * Reloads the page when the error comes from an old version of the app and
 * returns `true`; the caller then shows no error. Otherwise returns `false`.
 */
export function reloadOnStaleDeployment(
  error: unknown,
  reload: () => void = () => {
    globalThis.location.reload();
  },
): boolean {
  if (!isStaleDeploymentError(error)) return false;
  reload();
  return true;
}
