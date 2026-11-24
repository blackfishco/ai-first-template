import "server-only";

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { pagePath } from "@/lib/cms/links";
import { getContentLocale } from "@/lib/cms/locale";
import { env } from "@/lib/env";
import { isIndexable } from "@/lib/seo/indexing";
import { buildMetadata } from "@/lib/seo/metadata";
import { getSiteSettings } from "@/lib/site-settings/server";

import { getPage } from "./get-page";

/**
 * Metadata of the CMS page with the given slug. A missing page, or a CMS that
 * cannot be reached, yields no page-specific metadata; the route itself then
 * reports the 404 or the error.
 */
export async function getPageMetadata(slug: string): Promise<Metadata> {
  const locale = await getContentLocale();
  const t = await getTranslations({ locale, namespace: "Site" });

  const page = await getPage({ slug, locale }).unwrapOr(null);
  const settings = await getSiteSettings(locale).unwrapOr(null);
  const siteName = settings?.siteName ?? t("name");

  return buildMetadata({
    title: page?.title ?? null,
    seoTitle: page?.seo.title,
    seoDescription: page?.seo.description,
    seoImage: page?.seo.image,
    noindex: page?.seo.noindex,
    path: pagePath(slug),
    locale,
    siteName,
    defaultShareImage: settings?.defaultShareImage,
    indexable: isIndexable(env),
  });
}
