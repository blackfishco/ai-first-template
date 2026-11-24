import type { Metadata } from "next";

import { DEFAULT_LOCALE, type Locale, LOCALES } from "../../i18n/config";
import type { MediaImage } from "../media/image-size";
import { pickImageSize, toSiteRelativeMediaUrl } from "../media/image-size";
import { seoTitle, truncateDescription } from "./fallbacks";

export interface SeoInput {
  /** Title of the document, used when no SEO title is set. */
  title: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoImage?: MediaImage | null;
  noindex?: boolean | null;
  /** Site path without the language prefix, for example "/about" or "/". */
  path: string;
  locale: Locale;
  siteName: string;
  defaultShareImage?: MediaImage | null;
  /** False on previews and other deployments that must not be indexed. */
  indexable: boolean;
}

/** Path of a page in a language: the default language has no prefix. */
export function localizedPath(path: string, locale: Locale): string {
  // Read as a string first: with a single language the check below leaves no
  // other language for the type checker to see.
  const segment: string = locale;
  if (locale === DEFAULT_LOCALE) return path;
  return path === "/" ? `/${segment}` : `/${segment}${path}`;
}

/**
 * Metadata of a CMS document, with the same fallbacks the CMS uses for its
 * "generate" buttons. Relative URLs resolve against `metadataBase` from the layout.
 */
export function buildMetadata(input: SeoInput): Metadata {
  const title = input.seoTitle?.trim() || seoTitle(input.title, input.siteName);
  const description = truncateDescription(input.seoDescription) || undefined;
  const image = input.seoImage ?? input.defaultShareImage ?? null;
  const picked = image ? pickImageSize(image, "hero") : null;
  const canonical = localizedPath(input.path, input.locale);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(
          LOCALES.map((locale) => [locale, localizedPath(input.path, locale)]),
        ),
        "x-default": localizedPath(input.path, DEFAULT_LOCALE),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: input.siteName,
      locale: input.locale,
      type: "website",
      ...(picked
        ? {
            images: [
              {
                url: toSiteRelativeMediaUrl(picked.url),
                width: picked.width,
                height: picked.height,
                alt: image?.alt ?? undefined,
              },
            ],
          }
        : {}),
    },
    robots:
      input.indexable && !input.noindex
        ? undefined
        : { index: false, follow: false },
  };
}
