import { describe, expect, it } from "vitest";

import { seoTitle, truncateDescription } from "./fallbacks";
import { isIndexable } from "./indexing";
import { buildMetadata, localizedPath } from "./metadata";

describe("isIndexable", () => {
  it("indexes only the Vercel production deployment", () => {
    expect(isIndexable({ VERCEL_ENV: "production" })).toBe(true);
    expect(isIndexable({ VERCEL_ENV: "preview" })).toBe(false);
    expect(isIndexable({ VERCEL_ENV: "development" })).toBe(false);
  });

  it("does not let the override open a Vercel preview", () => {
    expect(isIndexable({ VERCEL_ENV: "preview", ALLOW_INDEXING: "true" })).toBe(
      false,
    );
  });

  it("needs an explicit opt-in off Vercel", () => {
    expect(isIndexable({})).toBe(false);
    expect(isIndexable({ ALLOW_INDEXING: "true" })).toBe(true);
    expect(isIndexable({ ALLOW_INDEXING: "false" })).toBe(false);
  });
});

describe("seoTitle", () => {
  it("joins the page and site names", () => {
    expect(seoTitle("O nás", "Web")).toBe("O nás – Web");
  });

  it("uses the site name alone when there is no page title", () => {
    expect(seoTitle("", "Web")).toBe("Web");
    expect(seoTitle(null, "Web")).toBe("Web");
    expect(seoTitle("Web", "Web")).toBe("Web");
  });
});

describe("truncateDescription", () => {
  it("keeps a short text and collapses whitespace", () => {
    expect(truncateDescription("  Krátký \n text  ")).toBe("Krátký text");
  });

  it("cuts a long text at a word boundary within the limit", () => {
    const result = truncateDescription("slovo ".repeat(60), 50);

    expect(result.length).toBeLessThanOrEqual(50);
    expect(result.endsWith("…")).toBe(true);
    expect(result).not.toContain("slov…");
  });

  it("returns an empty string for nothing", () => {
    expect(truncateDescription(null)).toBe("");
  });
});

describe("localizedPath", () => {
  it("leaves the default language without a prefix", () => {
    expect(localizedPath("/o-nas", "cs")).toBe("/o-nas");
    expect(localizedPath("/", "cs")).toBe("/");
  });

  it("prefixes other languages", () => {
    expect(localizedPath("/o-nas", "en")).toBe("/en/o-nas");
    expect(localizedPath("/", "en")).toBe("/en");
  });
});

describe("buildMetadata", () => {
  const base = {
    title: "O nás",
    path: "/o-nas",
    locale: "en",
    siteName: "Web",
    indexable: true,
  } as const;

  it("falls back to the page title and the default share image", () => {
    const metadata = buildMetadata({
      ...base,
      defaultShareImage: { url: "/api/media/file/share.webp", width: 1200, height: 630, alt: "Share" },
    });

    expect(metadata.title).toBe("O nás – Web");
    expect(metadata.description).toBeUndefined();
    expect(metadata.openGraph?.images).toEqual([
      { url: "/api/media/file/share.webp", width: 1200, height: 630, alt: "Share" },
    ]);
  });

  it("prefers the SEO fields", () => {
    const metadata = buildMetadata({
      ...base,
      seoTitle: "Custom",
      seoDescription: "Popis",
    });

    expect(metadata.title).toBe("Custom");
    expect(metadata.description).toBe("Popis");
  });

  it("lists every language and the canonical address", () => {
    const metadata = buildMetadata(base);

    expect(metadata.alternates).toEqual({
      canonical: "/en/o-nas",
      languages: { cs: "/o-nas", en: "/en/o-nas", "x-default": "/o-nas" },
    });
  });

  it("marks a page noindex when asked or when the deployment is not indexable", () => {
    expect(buildMetadata(base).robots).toBeUndefined();
    expect(buildMetadata({ ...base, noindex: true }).robots).toEqual({
      index: false,
      follow: false,
    });
    expect(buildMetadata({ ...base, indexable: false }).robots).toEqual({
      index: false,
      follow: false,
    });
  });
});

describe("sitemapEntries", () => {
  it("lists a page once with every language as an alternate", async () => {
    const { sitemapEntries } = await import("./sitemap");

    expect(
      sitemapEntries(
        [{ path: "/", updatedAt: "2026-01-01" }, { path: "/o-nas" }],
        "https://example.com",
      ),
    ).toEqual([
      {
        url: "https://example.com",
        lastModified: "2026-01-01",
        alternates: {
          languages: { cs: "https://example.com", en: "https://example.com/en" },
        },
      },
      {
        url: "https://example.com/o-nas",
        lastModified: undefined,
        alternates: {
          languages: {
            cs: "https://example.com/o-nas",
            en: "https://example.com/en/o-nas",
          },
        },
      },
    ]);
  });
});
