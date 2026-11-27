/**
 * Content Security Policy for the site (not the CMS admin, which the proxy
 * does not touch). Off by default: a nonce-based policy needs every page to
 * render per request. See docs/decisions.md and docs/architecture.md.
 *
 * Pure, without `server-only`: the proxy and tests use it.
 */

export type CspMode = "off" | "report-only" | "enforce";

/**
 * Hosts the site loads from beyond its own origin. Add a project's third
 * parties here, in one place. Scripts need no hosts: with `'strict-dynamic'`
 * a script the site loads (the Google tag) may load its own scripts.
 */
export const CSP_SOURCES = {
  // Images: CMS media on Vercel Blob, analytics pixels, and any https image.
  img: ["https:"],
  // Analytics (features/analytics): Google tag and GA4 collection endpoints.
  connect: [
    "https://www.googletagmanager.com",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
  ],
} as const;

export interface CspOptions {
  nonce: string;
  /** `next dev` needs `'unsafe-eval'` for React's debugging. */
  development: boolean;
  /** Only an HTTPS site upgrades insecure requests; on http://localhost it would break them. */
  https: boolean;
}

export function buildCsp({ nonce, development, https }: CspOptions): string {
  const directives: string[][] = [
    ["default-src", "'self'"],
    [
      "script-src",
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      ...(development ? ["'unsafe-eval'"] : []),
    ],
    // Inline style attributes come from components and rich text; a nonce
    // cannot cover attributes, so styles allow inline.
    ["style-src", "'self'", "'unsafe-inline'"],
    ["img-src", "'self'", "data:", "blob:", ...CSP_SOURCES.img],
    ["font-src", "'self'", "data:"],
    ["connect-src", "'self'", ...CSP_SOURCES.connect],
    ["object-src", "'none'"],
    ["base-uri", "'self'"],
    ["form-action", "'self'"],
    // The CMS shows the site in a frame on the same origin (live preview).
    ["frame-ancestors", "'self'"],
    ...(https ? [["upgrade-insecure-requests"]] : []),
  ];
  return directives.map((directive) => directive.join(" ")).join("; ");
}

/** The response header for a mode; `null` when the policy is off. */
export function cspHeaderName(mode: CspMode): string | null {
  if (mode === "enforce") return "Content-Security-Policy";
  if (mode === "report-only") return "Content-Security-Policy-Report-Only";
  return null;
}

/** A fresh, unguessable nonce for one request. */
export function createNonce(): string {
  return btoa(crypto.randomUUID());
}
