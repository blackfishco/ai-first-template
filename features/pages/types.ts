import type { PageBlock } from "@/components/sections/render-blocks";

/** What the site needs from a CMS page. */
export interface PageView {
  title: string;
  slug: string;
  blocks: PageBlock[];
}

export type PageLoadError = { code: "CMS_UNAVAILABLE" };
