import type { MetadataRoute } from "next";

import { DEFAULT_LOCALE, LOCALES } from "../../i18n/config";
import { localizedPath } from "./metadata";

interface SitemapPage {
  /** Site path without the language prefix. */
  path: string;
  updatedAt?: string;
}

/** One entry per page in the default language, with every language as an alternate. */
export function sitemapEntries(
  pages: readonly SitemapPage[],
  siteUrl: string,
): MetadataRoute.Sitemap {
  const absolute = (path: string) =>
    `${siteUrl}${path === "/" ? "" : path}` || siteUrl;

  return pages.map((page) => ({
    url: absolute(localizedPath(page.path, DEFAULT_LOCALE)),
    lastModified: page.updatedAt,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((locale) => [
          locale,
          absolute(localizedPath(page.path, locale)),
        ]),
      ),
    },
  }));
}
