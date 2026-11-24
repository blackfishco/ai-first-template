/** Rules for editor-managed redirects. Pure, shared by the CMS config and tests. */

/** A source path as stored and compared: leading slash, no trailing slash, no query or hash. */
export function normalizePath(input: string): string {
  const [withoutQuery = ""] = input.trim().split(/[?#]/);
  const withSlash = withoutQuery.startsWith("/")
    ? withoutQuery
    : `/${withoutQuery}`;
  const trimmed = withSlash.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export interface RedirectRule {
  id?: number | string;
  from: string;
  /** Resolved destination: a site path or a full URL. `null` when the target is gone. */
  to: string | null;
}

export type RedirectProblem = "format" | "self" | "duplicate" | "chain";

/**
 * What is wrong with a redirect, or `null` when it can be saved.
 *
 * - `format`: the source is not a path on this site.
 * - `self`: the redirect points to its own source.
 * - `duplicate`: another redirect already has this source.
 * - `chain`: the destination is itself redirected, or another redirect points
 *   to this source. Chains slow visitors down and can form loops.
 */
export function redirectProblem(
  candidate: RedirectRule,
  existing: readonly RedirectRule[],
): RedirectProblem | null {
  const from = candidate.from;
  if (!from.startsWith("/") || from.startsWith("//") || from.includes("\\")) {
    return "format";
  }

  const to = candidate.to === null ? null : destinationPath(candidate.to);
  if (to === from) return "self";

  const others = existing.filter((rule) => rule.id !== candidate.id);
  if (others.some((rule) => rule.from === from)) return "duplicate";

  const destinationIsRedirected =
    to !== null && others.some((rule) => rule.from === to);
  const sourceIsADestination = others.some(
    (rule) => rule.to !== null && destinationPath(rule.to) === from,
  );
  return destinationIsRedirected || sourceIsADestination ? "chain" : null;
}

/** A site path is compared normalized; a full URL is compared as written. */
function destinationPath(to: string): string {
  return to.startsWith("/") && !to.startsWith("//") ? normalizePath(to) : to;
}
