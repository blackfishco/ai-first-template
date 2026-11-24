import Image, { type ImageProps } from "next/image";

import {
  type ImageSizeName,
  type MediaImage,
  pickImageSize,
  toSiteRelativeMediaUrl,
} from "@/lib/media/image-size";
import { cn } from "@/lib/utils";

type CmsImageProps = Omit<
  ImageProps,
  "src" | "alt" | "width" | "height" | "fill" | "placeholder" | "blurDataURL"
> & {
  /** CMS media document, or the part of it a DTO keeps. */
  media: MediaImage | null | undefined;
  /** Generated size to start from; next/image then serves the right width. */
  size: ImageSizeName;
  /** `sizes` attribute, for example "(min-width: 1280px) 432px, 100vw". */
  sizes: string;
  /**
   * The page's Largest Contentful Paint image: fetched first and never lazy.
   * Set it on one image per page only.
   */
  lcp?: boolean;
}

/**
 * Image from the CMS. It picks the generated size, always passes the alt text
 * and the real dimensions (no layout shift), and shows the stored blur
 * placeholder while loading.
 */
export function CmsImage({
  media,
  size,
  sizes,
  className,
  lcp,
  ...props
}: CmsImageProps) {
  if (!media) return null;
  const picked = pickImageSize(media, size);
  if (!picked) return null;

  return (
    <Image
      src={toSiteRelativeMediaUrl(picked.url)}
      width={picked.width}
      height={picked.height}
      alt={media.alt ?? ""}
      sizes={sizes}
      className={cn("h-auto max-w-full", className)}
      {...(media.blurDataUrl
        ? { placeholder: "blur", blurDataURL: media.blurDataUrl }
        : {})}
      {...(lcp ? { fetchPriority: "high", loading: "eager" } : {})}
      {...props}
    />
  );
}
