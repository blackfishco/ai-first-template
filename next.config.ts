import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { isIndexable, NOINDEX_HEADER } from "./lib/seo/indexing";

// Read at build time: lib/env.ts is server-only and cannot load here.
const indexable = isIndexable({
  VERCEL_ENV: process.env.VERCEL_ENV,
  ALLOW_INDEXING: process.env.ALLOW_INDEXING,
});

const nextConfig: NextConfig = {
  poweredByHeader: false,
  headers() {
    // Deployments that must not be indexed say so on every response.
    return Promise.resolve(
      indexable ? [] : [{ source: "/:path*", headers: [NOINDEX_HEADER] }],
    );
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

export default withPayload(withNextIntl(nextConfig), {
  devBundleServerPackages: false,
});
