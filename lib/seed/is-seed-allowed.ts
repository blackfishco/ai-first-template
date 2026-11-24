/**
 * The seed overwrites content it owns, so it runs only where someone asked
 * for it in so many words: `ALLOW_SEED=true`, exactly. Anything else, including
 * `TRUE`, `1`, or `yes`, keeps it off.
 */
export function isSeedAllowed(value: string | undefined): boolean {
  return value === "true";
}
