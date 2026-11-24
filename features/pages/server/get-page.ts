import "server-only";

import config from "@payload-config";
import { ResultAsync } from "neverthrow";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";

import type { Locale } from "@/i18n/config";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { cacheKey } from "@/lib/cache-key";
import { CACHE_TAGS, pageTag } from "@/lib/cache-tags";
import type { Page } from "@/payload-types";

import type { PageLoadError, PageView } from "../types";

interface PageQuery {
  slug: string;
  locale: Locale;
  /** Draft mode: the latest draft, read with editor rights and never cached. */
  draft?: boolean;
}

function toPageView(doc: Page): PageView | null {
  // A page without a slug has no address yet.
  if (!doc.slug) return null;
  const image = doc.meta?.image;
  return {
    title: doc.title,
    slug: doc.slug,
    blocks: doc.layout ?? [],
    seo: {
      title: doc.meta?.title ?? null,
      description: doc.meta?.description ?? null,
      image: typeof image === "object" ? image : null,
      noindex: Boolean(doc.meta?.noindex),
    },
  };
}

async function findPage({
  slug,
  locale,
  draft = false,
}: PageQuery): Promise<PageView | null> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    locale,
    fallbackLocale: DEFAULT_LOCALE,
    draft,
    // Visitors go through access control and see published pages only. Draft
    // mode is entered through the preview route, which authenticates an editor.
    overrideAccess: draft,
    limit: 1,
    // Block images and linked pages.
    depth: 1,
  });

  const doc = docs[0];
  return doc ? toPageView(doc) : null;
}

/** Cached until an editor publishes, unpublishes, or deletes the page. */
function findPublishedPage(slug: string, locale: Locale) {
  return unstable_cache(
    () => findPage({ slug, locale }),
    cacheKey("page", slug, locale),
    { tags: [CACHE_TAGS.pages, pageTag(slug)] },
  )();
}

/**
 * One page by slug in the given language. Resolves to `null` when no published
 * page has that slug, and to an error when the CMS cannot be reached.
 */
export function getPage(
  query: PageQuery,
): ResultAsync<PageView | null, PageLoadError> {
  return ResultAsync.fromPromise(
    query.draft ? findPage(query) : findPublishedPage(query.slug, query.locale),
    (): PageLoadError => ({ code: "CMS_UNAVAILABLE" }),
  );
}

export interface IndexablePage {
  slug: string;
  updatedAt: string;
}

/** Published pages search engines may index, for the sitemap. */
export function getIndexablePages(): ResultAsync<
  IndexablePage[],
  PageLoadError
> {
  const load = unstable_cache(
    async () => {
      const payload = await getPayload({ config });
      const { docs } = await payload.find({
        collection: "pages",
        overrideAccess: false,
        pagination: false,
        depth: 0,
        select: { slug: true, meta: { noindex: true }, updatedAt: true },
      });
      return docs.flatMap((doc) =>
        doc.slug && !doc.meta?.noindex
          ? [{ slug: doc.slug, updatedAt: doc.updatedAt }]
          : [],
      );
    },
    cacheKey("indexable-pages"),
    { tags: [CACHE_TAGS.pages] },
  );

  return ResultAsync.fromPromise(
    load(),
    (): PageLoadError => ({ code: "CMS_UNAVAILABLE" }),
  );
}

