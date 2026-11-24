import type { PageBlock } from "@/components/sections/render-blocks";
import type { MediaImage } from "@/lib/media/image-size";

/** What the site needs from a CMS page. */
export interface PageView {
  title: string;
  slug: string;
  blocks: PageBlock[];
  seo: {
    title: string | null;
    description: string | null;
    image: MediaImage | null;
    noindex: boolean;
  };
}

export type PageLoadError = { code: "CMS_UNAVAILABLE" };
