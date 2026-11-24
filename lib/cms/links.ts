import { HOME_SLUG } from "@/lib/slug";
import type { CmsLinkField } from "@/payload-types";

/** Path of a page without the language prefix; `Link` from i18n/navigation adds it. */
export function pagePath(slug: string): string {
  return slug === HOME_SLUG ? "/" : `/${slug}`;
}

export type ResolvedLink =
  | { kind: "internal"; href: string; newTab: boolean }
  | { kind: "external"; href: string; newTab: boolean };

/**
 * Turns a CMS link into an address. Returns `null` when the link cannot be
 * followed: the linked page was deleted, is not populated, or has no slug yet.
 */
export function resolveLink(
  link: Pick<CmsLinkField, "type" | "reference" | "url" | "newTab">,
): ResolvedLink | null {
  const newTab = Boolean(link.newTab);

  if (link.type === "custom") {
    if (!link.url) return null;
    // A custom URL that starts with a slash points inside the site.
    return link.url.startsWith("/") && !link.url.startsWith("//")
      ? { kind: "internal", href: link.url, newTab }
      : { kind: "external", href: link.url, newTab };
  }

  const target = link.reference?.value;
  if (typeof target !== "object" || !target.slug) return null;
  return { kind: "internal", href: pagePath(target.slug), newTab };
}
