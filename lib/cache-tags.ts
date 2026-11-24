/**
 * The one naming scheme for cache tags. Loaders tag cached CMS data with
 * these; CMS hooks revalidate them. Build tag strings nowhere else.
 */
export const CACHE_TAGS = {
  pages: "pages",
  siteSettings: "site-settings",
  redirects: "redirects",
} as const;

export type CacheTag =
  | (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]
  | `page:${string}`;

export function pageTag(slug: string): CacheTag {
  return `page:${slug}`;
}

interface WithSlug {
  slug?: string | null;
}

/**
 * Tags to revalidate when a page changes: the list of pages, the page itself,
 * and its previous slug, because a renamed page leaves the old URL cached.
 */
export function tagsForPageChange(
  doc: WithSlug | null | undefined,
  previous?: WithSlug | null,
): CacheTag[] {
  const slugs = new Set(
    [doc?.slug, previous?.slug].filter((slug): slug is string => Boolean(slug)),
  );
  return [CACHE_TAGS.pages, ...[...slugs].map((slug) => pageTag(slug))];
}
