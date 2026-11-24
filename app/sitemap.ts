import type { MetadataRoute } from "next";

import { getIndexablePages } from "@/features/pages/server/get-page";
import { pagePath } from "@/lib/cms/links";
import { env } from "@/lib/env";
import { isIndexable } from "@/lib/seo/indexing";
import { sitemapEntries } from "@/lib/seo/sitemap";

// Pages change in the CMS; the list is cached by tag in the loader.
export const dynamic = "force-dynamic";

/** Published, indexable CMS pages in every language. Empty on deployments that are not indexed. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexable(env)) return [];

  const pages = await getIndexablePages().match(
    (found) => found,
    () => {
      throw new Error("The CMS could not be reached while building the sitemap.");
    },
  );

  return sitemapEntries(
    pages.map((page) => ({
      path: pagePath(page.slug),
      updatedAt: page.updatedAt,
    })),
    env.SITE_URL,
  );
}
