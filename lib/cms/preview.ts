import { timingSafeEqual } from "node:crypto";

import { DEFAULT_LOCALE, isLocale } from "../../i18n/config";
import { localizedPath } from "../seo/metadata";
import { HOME_SLUG } from "../slug";

/**
 * Draft preview. The CMS opens `/api/preview?secret=…&path=…` in the live
 * preview frame; the route checks the secret and the signed-in editor, turns
 * on draft mode, and redirects to the page.
 */

interface PreviewTarget {
  collection?: string;
  slug?: string | null;
  locale?: string | null;
}

/** Site path of a CMS document, or `null` when it has no page yet. */
export function previewPath(target: PreviewTarget): string | null {
  if (target.collection !== "pages" || !target.slug) return null;

  const locale = isLocale(target.locale) ? target.locale : DEFAULT_LOCALE;
  const path =
    target.slug === HOME_SLUG ? "/" : `/${encodeURIComponent(target.slug)}`;
  return localizedPath(path, locale);
}

export function previewUrl(
  path: string,
  secret: string,
  siteUrl: string,
): string {
  const url = new URL("/api/preview", siteUrl);
  url.searchParams.set("secret", secret);
  url.searchParams.set("path", path);
  return url.toString();
}

/** Constant-time comparison that fails closed: without a configured secret nothing is accepted. */
export function isValidSecret(
  received: string | null | undefined,
  expected: string | undefined,
): boolean {
  if (!expected || !received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Only same-site paths, so the route cannot be used as an open redirect. */
export function isSafeSitePath(path: string | null): path is string {
  if (!path?.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return false;
  }
  // Browsers drop tabs and newlines from URLs, so "/\t/evil" would become "//evil".
  return ![...path].some((char) => {
    const code = char.codePointAt(0) ?? 0;
    return code < 0x20 || code === 0x7f;
  });
}

/** `Authorization: Bearer <secret>` check for cron and job endpoints. Fails closed. */
export function isAuthorizedBearer(
  authorization: string | null,
  secret: string | undefined,
): boolean {
  if (!secret) return false;
  return isValidSecret(authorization, `Bearer ${secret}`);
}
