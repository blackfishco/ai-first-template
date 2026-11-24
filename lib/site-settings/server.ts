import "server-only";

import config from "@payload-config";
import { ResultAsync } from "neverthrow";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";

import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { cacheKey } from "@/lib/cache-key";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { CmsLinkField, Media } from "@/payload-types";

/** What the site needs from the site settings. */
export interface SiteSettingsView {
  siteName: string | null;
  headerNav: CmsLinkField[];
  footerNav: CmsLinkField[];
  defaultShareImage: Media | null;
}

export type SiteSettingsError = { code: "CMS_UNAVAILABLE" };

async function findSiteSettings(locale: Locale): Promise<SiteSettingsView> {
  const payload = await getPayload({ config });
  const settings = await payload.findGlobal({
    slug: "site-settings",
    locale,
    fallbackLocale: DEFAULT_LOCALE,
    overrideAccess: false,
    // Linked pages and the share image.
    depth: 1,
  });

  return {
    siteName: settings.siteName ?? null,
    headerNav: (settings.headerNav ?? []).map((item) => item.link),
    footerNav: (settings.footerNav ?? []).map((item) => item.link),
    defaultShareImage:
      typeof settings.defaultShareImage === "object"
        ? settings.defaultShareImage
        : null,
  };
}

/** Site settings in the given language, cached until an editor saves them. */
export function getSiteSettings(
  locale: Locale,
): ResultAsync<SiteSettingsView, SiteSettingsError> {
  const load = unstable_cache(
    () => findSiteSettings(locale),
    cacheKey("site-settings", locale),
    // Navigation links carry page slugs, so a page change refreshes them too.
    { tags: [CACHE_TAGS.siteSettings, CACHE_TAGS.pages] },
  );

  return ResultAsync.fromPromise(
    load(),
    (): SiteSettingsError => ({ code: "CMS_UNAVAILABLE" }),
  );
}
