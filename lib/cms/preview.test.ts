import { describe, expect, it } from "vitest";

import {
  isAuthorizedBearer,
  isSafeSitePath,
  isValidSecret,
  previewPath,
  previewUrl,
} from "./preview";

describe("previewPath", () => {
  it("builds the page path in the default language without a prefix", () => {
    expect(previewPath({ collection: "pages", slug: "o-nas", locale: "cs" })).toBe(
      "/o-nas",
    );
  });

  it("prefixes other languages", () => {
    expect(previewPath({ collection: "pages", slug: "o-nas", locale: "en" })).toBe(
      "/en/o-nas",
    );
  });

  it("maps the home page to the root", () => {
    expect(previewPath({ collection: "pages", slug: "home", locale: "cs" })).toBe("/");
    expect(previewPath({ collection: "pages", slug: "home", locale: "en" })).toBe(
      "/en",
    );
  });

  it("returns null for a page without a slug and for other collections", () => {
    expect(previewPath({ collection: "pages", slug: null })).toBeNull();
    expect(previewPath({ collection: "media", slug: "x" })).toBeNull();
  });

  it("ignores an unknown language", () => {
    expect(previewPath({ collection: "pages", slug: "a", locale: "de" })).toBe("/a");
  });
});

describe("previewUrl", () => {
  it("carries the secret and the path", () => {
    const url = new URL(previewUrl("/en/a b", "s3cret", "https://example.com"));

    expect(url.pathname).toBe("/api/preview");
    expect(url.searchParams.get("secret")).toBe("s3cret");
    expect(url.searchParams.get("path")).toBe("/en/a b");
  });
});

describe("isValidSecret", () => {
  it("accepts only the exact secret", () => {
    expect(isValidSecret("abc", "abc")).toBe(true);
    expect(isValidSecret("abd", "abc")).toBe(false);
    expect(isValidSecret("abcd", "abc")).toBe(false);
  });

  it("fails closed without a configured or received secret", () => {
    expect(isValidSecret("abc", undefined)).toBe(false);
    expect(isValidSecret("", "")).toBe(false);
    expect(isValidSecret(null, "abc")).toBe(false);
  });
});

describe("isSafeSitePath", () => {
  it.each(["/", "/o-nas", "/en/o-nas?x=1"])("accepts %s", (path) => {
    expect(isSafeSitePath(path)).toBe(true);
  });

  it.each([
    null,
    "",
    "o-nas",
    "//evil.example",
    "https://evil.example",
    "/\\evil.example",
    "/\t/evil.example",
    "/\n/evil.example",
  ])("rejects %o", (path) => {
    expect(isSafeSitePath(path)).toBe(false);
  });
});

describe("isAuthorizedBearer", () => {
  it("accepts the configured bearer token only", () => {
    expect(isAuthorizedBearer("Bearer abc", "abc")).toBe(true);
    expect(isAuthorizedBearer("Bearer abd", "abc")).toBe(false);
    expect(isAuthorizedBearer("abc", "abc")).toBe(false);
  });

  it("fails closed without a secret or a header", () => {
    expect(isAuthorizedBearer("Bearer ", undefined)).toBe(false);
    expect(isAuthorizedBearer(null, "abc")).toBe(false);
  });
});
