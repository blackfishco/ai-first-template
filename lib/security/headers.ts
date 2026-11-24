export interface Header {
  key: string;
  value: string;
}

/**
 * Headers for every response. HSTS only from a production build: `next dev`
 * on http://localhost must not pin anything.
 *
 * There is no Content Security Policy here. A useful one needs a per-request
 * nonce, which forces every page to render dynamically; add it per project
 * when the trade is worth it. See docs/decisions.md.
 */
export function securityHeaders({
  productionBuild,
}: {
  productionBuild: boolean;
}): Header[] {
  return [
    ...(productionBuild
      ? [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ]
      : []),
    { key: "X-Content-Type-Options", value: "nosniff" },
    // The CMS shows the site in a frame on the same origin (live preview).
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    },
  ];
}
