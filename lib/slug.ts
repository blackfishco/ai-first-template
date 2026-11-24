/** URL slug from a title: "Láska z mládí" becomes "laska-z-mladi". */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replaceAll(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}

/**
 * First free slug: `base`, then `base-2`, `base-3` and so on. `isTaken` says
 * whether a candidate is already used.
 */
export async function uniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  let candidate = base;
  for (let n = 2; await isTaken(candidate); n++) candidate = `${base}-${n}`;
  return candidate;
}

/** The page with this slug is served at the site root. */
export const HOME_SLUG = "home";

/**
 * Slugs a page cannot take because a fixed route or a system path owns them.
 * Add every new top-level route of the app here.
 */
export const RESERVED_SLUGS = ["admin", "api", "next", "media"];

export type SlugProblem = "reserved" | "format";

export function slugProblem(
  slug: string | null | undefined,
  reserved: readonly string[] = RESERVED_SLUGS,
): SlugProblem | null {
  if (!slug) return null;
  if (slug !== slugify(slug)) return "format";
  if (reserved.includes(slug)) return "reserved";
  return null;
}
