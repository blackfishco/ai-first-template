import { describe, expect, it } from "vitest";

import { pagePath, resolveLink } from "./links";

const page = (slug: string | null) => ({
  relationTo: "pages" as const,
  value: { id: 1, title: "Page", slug, updatedAt: "", createdAt: "" },
});

describe("pagePath", () => {
  it("serves the home page at the root", () => {
    expect(pagePath("home")).toBe("/");
    expect(pagePath("about")).toBe("/about");
  });
});

describe("resolveLink", () => {
  it("resolves a link to a page", () => {
    expect(resolveLink({ type: "reference", reference: page("about") })).toEqual(
      { kind: "internal", href: "/about", newTab: false },
    );
  });

  it("resolves a link to the home page", () => {
    expect(
      resolveLink({ type: "reference", reference: page("home") })?.href,
    ).toBe("/");
  });

  it("treats a custom path as internal and a full URL as external", () => {
    expect(resolveLink({ type: "custom", url: "/contact" })?.kind).toBe(
      "internal",
    );
    expect(
      resolveLink({ type: "custom", url: "https://example.com", newTab: true }),
    ).toEqual({ kind: "external", href: "https://example.com", newTab: true });
  });

  it("treats a protocol-relative URL as external", () => {
    expect(resolveLink({ type: "custom", url: "//evil.example" })?.kind).toBe(
      "external",
    );
  });

  it.each([
    ["an unpopulated reference", { type: "reference", reference: { relationTo: "pages", value: 7 } }],
    ["a page without a slug", { type: "reference", reference: page(null) }],
    ["a missing reference", { type: "reference", reference: null }],
    ["an empty custom URL", { type: "custom", url: "" }],
  ] as const)("returns null for %s", (_name, link) => {
    expect(resolveLink(link)).toBeNull();
  });
});
