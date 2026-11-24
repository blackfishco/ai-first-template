import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({ revalidateTag }));

const { affectsPublishedContent, revalidateCms } = await import("./revalidate");
const { CACHE_TAGS, pageTag, tagsForPageChange } = await import(
  "../cache-tags"
);

beforeEach(() => {
  revalidateTag.mockClear();
});

describe("affectsPublishedContent", () => {
  it.each([
    ["a publish", { _status: "published" }, { _status: "draft" }, true],
    ["an unpublish", { _status: "draft" }, { _status: "published" }, true],
    ["an autosaved draft", { _status: "draft" }, { _status: "draft" }, false],
    ["a first draft", { _status: "draft" }, undefined, false],
    ["a collection without drafts", {}, undefined, true],
  ] as const)("is right for %s", (_name, doc, previous, expected) => {
    expect(affectsPublishedContent(doc, previous)).toBe(expected);
  });
});

describe("revalidateCms", () => {
  it("revalidates each tag once, without serving stale content", () => {
    revalidateCms([CACHE_TAGS.pages, CACHE_TAGS.pages, pageTag("about")], {});

    expect(revalidateTag.mock.calls).toEqual([
      ["pages", { expire: 0 }],
      ["page:about", { expire: 0 }],
    ]);
  });

  it("does nothing when the caller disabled revalidation", () => {
    revalidateCms([CACHE_TAGS.pages], { disableRevalidate: true });

    expect(revalidateTag).not.toHaveBeenCalled();
  });
});

describe("tagsForPageChange", () => {
  it("includes the page and the list", () => {
    expect(tagsForPageChange({ slug: "about" })).toEqual([
      "pages",
      "page:about",
    ]);
  });

  it("includes the previous slug after a rename", () => {
    expect(
      tagsForPageChange({ slug: "about-us" }, { slug: "about" }).toSorted(),
    ).toEqual(["page:about", "page:about-us", "pages"]);
  });

  it("handles a document without a slug", () => {
    expect(tagsForPageChange({ slug: null })).toEqual(["pages"]);
  });
});
