import { HOME_SLUG } from "../slug";

/**
 * Site path of a page without the language prefix. Kept free of the `@/` alias
 * and of generated types, so the CMS config can import it.
 */
export function pagePathFromSlug(slug: string): string {
  return slug === HOME_SLUG ? "/" : `/${slug}`;
}
