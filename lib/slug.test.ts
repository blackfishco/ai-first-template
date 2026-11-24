import { describe, expect, it } from "vitest";

import { slugify, slugProblem, uniqueSlug } from "./slug";

describe("slugify", () => {
  it.each([
    ["Láska z mládí", "laska-z-mladi"],
    ["  O nás!  ", "o-nas"],
    ["Ceník 2026 / služby", "cenik-2026-sluzby"],
    ["Žluťoučký KŮŇ", "zlutoucky-kun"],
    ["---", ""],
  ])("turns %o into %o", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});

describe("uniqueSlug", () => {
  it("keeps a free slug", async () => {
    expect(await uniqueSlug("about", () => Promise.resolve(false))).toBe(
      "about",
    );
  });

  it("appends the first free number", async () => {
    const taken = new Set(["about", "about-2"]);

    expect(
      await uniqueSlug("about", (candidate) =>
        Promise.resolve(taken.has(candidate)),
      ),
    ).toBe("about-3");
  });
});

describe("slugProblem", () => {
  it("accepts a clean slug and an empty value", () => {
    expect(slugProblem("o-nas")).toBeNull();
    expect(slugProblem("")).toBeNull();
    expect(slugProblem(null)).toBeNull();
  });

  it("rejects slugs owned by fixed routes", () => {
    expect(slugProblem("admin")).toBe("reserved");
    expect(slugProblem("api")).toBe("reserved");
  });

  it("rejects slugs that are not already slugified", () => {
    expect(slugProblem("O nás")).toBe("format");
    expect(slugProblem("a/b")).toBe("format");
  });
});
