import type { MetadataRoute } from "next";

import { env } from "@/lib/env";
import { isIndexable } from "@/lib/seo/indexing";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexable(env)) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${env.SITE_URL}/sitemap.xml`,
  };
}
