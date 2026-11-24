import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { scopePayloadClientHints } from "./lib/payload-client-hints";
import { securityHeaders } from "./lib/security/headers";
import { isIndexable, NOINDEX_HEADER } from "./lib/seo/indexing";

// Read at build time: lib/env.ts is server-only and cannot load here.
const indexable = isIndexable({
  VERCEL_ENV: process.env.VERCEL_ENV,
  ALLOW_INDEXING: process.env.ALLOW_INDEXING,
});

const nextConfig: NextConfig = {
  poweredByHeader: false,
  headers() {
    return Promise.resolve([
      {
        source: "/:path*",
        headers: [
          ...securityHeaders({
            productionBuild: process.env.NODE_ENV === "production",
          }),
          // Deployments that must not be indexed say so on every response.
          ...(indexable ? [] : [NOINDEX_HEADER]),
        ],
      },
    ]);
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // The CMS serves uploads from this path (local disk or proxied storage).
    localPatterns: [{ pathname: "/api/media/file/**" }],
    // Direct Vercel Blob URLs.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

const config = withPayload(withNextIntl(nextConfig), {
  devBundleServerPackages: false,
});
const payloadHeaders = config.headers;

export default {
  ...config,
  // Keep Payload's client-hint headers on the admin; see lib/payload-client-hints.ts.
  headers: async () => scopePayloadClientHints((await payloadHeaders?.()) ?? []),
} satisfies NextConfig;
