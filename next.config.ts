import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
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
