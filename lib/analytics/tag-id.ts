/**
 * The Google tag a site loads: a Tag Manager container (`GTM-…`) or a GA4
 * measurement ID (`G-…`). One ID per site; with Tag Manager, GA4 is set up
 * inside the container. Pure: the CMS field and the site both use it.
 */
export type TagKind = "gtm" | "ga4";

const PATTERNS: Record<TagKind, RegExp> = {
  gtm: /^GTM-[A-Z0-9]{4,12}$/,
  ga4: /^G-[A-Z0-9]{4,15}$/,
};

/** The kind of a valid ID, or `null` for anything else. */
export function tagKind(id: string | null | undefined): TagKind | null {
  if (!id) return null;
  if (PATTERNS.gtm.test(id)) return "gtm";
  if (PATTERNS.ga4.test(id)) return "ga4";
  return null;
}

/** Payload field validation: empty, or a valid ID. */
export function validateTagId(value: unknown): true | string {
  if (value === null || value === undefined || value === "") return true;
  if (typeof value === "string" && tagKind(value)) return true;
  return "Use a Tag Manager ID (GTM-XXXXXXX) or a GA4 measurement ID (G-XXXXXXXXXX).";
}

/** The script URL Google serves for an ID. */
export function tagScriptUrl(id: string, kind: TagKind): string {
  const encoded = encodeURIComponent(id);
  return kind === "gtm"
    ? `https://www.googletagmanager.com/gtm.js?id=${encoded}`
    : `https://www.googletagmanager.com/gtag/js?id=${encoded}`;
}

/**
 * Whether this deployment may load analytics: production only, like search
 * indexing, so previews and development send no data. `ANALYTICS_ENABLED`
 * overrides the rule both ways (the end-to-end tests switch it on).
 */
export function isAnalyticsEnabled(source: {
  VERCEL_ENV?: string;
  ALLOW_INDEXING?: boolean;
  ANALYTICS_ENABLED?: boolean;
}): boolean {
  if (source.ANALYTICS_ENABLED !== undefined) return source.ANALYTICS_ENABLED;
  if (source.VERCEL_ENV) return source.VERCEL_ENV === "production";
  return source.ALLOW_INDEXING === true;
}
