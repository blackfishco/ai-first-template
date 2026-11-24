import "server-only";

import config from "@payload-config";
import { ResultAsync } from "neverthrow";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";

import { cacheKey } from "@/lib/cache-key";
import { CACHE_TAGS } from "@/lib/cache-tags";

import { pagePathFromSlug } from "./paths";
import { normalizePath } from "./rules";

export interface RedirectTarget {
  /** A site path without the language prefix, or a full URL. */
  to: string;
  permanent: boolean;
}

export type RedirectError = { code: "CMS_UNAVAILABLE" };

type RedirectMap = Record<string, RedirectTarget>;

/** Paths compare decoded: `/caf%C3%A9` and `/café` are the same address. */
function key(path: string): string {
  const decoded = URL.canParse(path, "http://site.invalid")
    ? safeDecode(path)
    : path;
  return normalizePath(decoded);
}

function safeDecode(path: string): string {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

async function loadRedirectMap(): Promise<RedirectMap> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "redirects",
    // A system read: visitors cannot list redirects, but they follow them.
    overrideAccess: true,
    pagination: false,
    depth: 1,
  });

  const map: RedirectMap = {};
  for (const redirect of docs) {
    const target = redirect.to;
    const page = target?.reference?.value;
    const to =
      target?.type === "custom"
        ? target.url
        : typeof page === "object" && page.slug && page._status === "published"
          ? pagePathFromSlug(page.slug)
          : null;
    if (to) map[key(redirect.from)] = { to, permanent: redirect.type !== "302" };
  }
  return map;
}

/**
 * The redirect an editor set up for this path, or `null`. Call it where the
 * site would answer 404. Cached until a redirect or a page changes.
 */
export function findRedirect(
  path: string,
): ResultAsync<RedirectTarget | null, RedirectError> {
  const load = unstable_cache(loadRedirectMap, cacheKey("redirects"), {
    tags: [CACHE_TAGS.redirects, CACHE_TAGS.pages],
  });

  return ResultAsync.fromPromise(
    load(),
    (): RedirectError => ({ code: "CMS_UNAVAILABLE" }),
  ).map((map) => map[key(path)] ?? null);
}
