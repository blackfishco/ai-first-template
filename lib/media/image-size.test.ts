import { describe, expect, it } from "vitest";

import { pickImageSize, toSiteRelativeMediaUrl } from "./image-size";

const size = (width: number) => ({
  url: `/api/media/file/photo-${width}.webp`,
  width,
  height: width / 2,
});

describe("pickImageSize", () => {
  it("returns the requested size when it exists", () => {
    const media = { sizes: { thumb: size(400), card: size(800) } };

    expect(pickImageSize(media, "card")?.width).toBe(800);
  });

  it("falls back to the nearest wider size", () => {
    const media = { sizes: { thumb: size(400), hero: size(1920) } };

    expect(pickImageSize(media, "card")?.width).toBe(1920);
  });

  it("falls back to the widest narrower size", () => {
    const media = { sizes: { thumb: size(400) } };

    expect(pickImageSize(media, "hero")?.width).toBe(400);
  });

  it("falls back to the original when no size was generated", () => {
    const media = { ...size(300), sizes: { thumb: { url: null } } };

    expect(pickImageSize(media, "card")?.width).toBe(300);
  });

  it("returns null when nothing is usable", () => {
    expect(pickImageSize({ url: "/x.jpg" }, "card")).toBeNull();
  });
});

describe("toSiteRelativeMediaUrl", () => {
  it("makes an absolute URL of the CMS file route relative", () => {
    expect(
      toSiteRelativeMediaUrl("https://example.com/api/media/file/a.webp?v=1"),
    ).toBe("/api/media/file/a.webp?v=1");
  });

  it.each([
    "/api/media/file/a.webp",
    "https://store.public.blob.vercel-storage.com/a.webp",
    "https://example.com/other/a.webp",
    "not a url",
  ])("leaves %s unchanged", (url) => {
    expect(toSiteRelativeMediaUrl(url)).toBe(url);
  });
});
