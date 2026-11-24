import { describe, expect, it } from "vitest";

import { normalizePath, redirectProblem } from "./rules";

describe("normalizePath", () => {
  it.each([
    ["/o-nas/", "/o-nas"],
    ["o-nas", "/o-nas"],
    ["  /o-nas?x=1#top ", "/o-nas"],
    ["/", "/"],
    ["", "/"],
    ["/a/b//", "/a/b"],
  ])("turns %o into %o", (input, expected) => {
    expect(normalizePath(input)).toBe(expected);
  });
});

describe("redirectProblem", () => {
  const existing = [
    { id: 1, from: "/stara", to: "/nova" },
    { id: 2, from: "/letak", to: "https://example.com/letak.pdf" },
  ];

  it("accepts a redirect that touches nothing else", () => {
    expect(redirectProblem({ from: "/a", to: "/b" }, existing)).toBeNull();
    expect(
      redirectProblem({ from: "/a", to: "https://example.com" }, existing),
    ).toBeNull();
  });

  it("accepts a redirect whose target is gone", () => {
    expect(redirectProblem({ from: "/a", to: null }, existing)).toBeNull();
  });

  it.each(["a", "//evil.example", "https://example.com/a", "/\\a"])(
    "rejects the source %o",
    (from) => {
      expect(redirectProblem({ from, to: "/b" }, [])).toBe("format");
    },
  );

  it("rejects a redirect to itself", () => {
    expect(redirectProblem({ from: "/a", to: "/a/" }, [])).toBe("self");
  });

  it("rejects a second redirect from the same source", () => {
    expect(redirectProblem({ from: "/stara", to: "/jina" }, existing)).toBe(
      "duplicate",
    );
  });

  it("rejects a destination that is itself redirected", () => {
    expect(redirectProblem({ from: "/a", to: "/stara" }, existing)).toBe(
      "chain",
    );
  });

  it("rejects a source another redirect points to", () => {
    expect(redirectProblem({ from: "/nova", to: "/b" }, existing)).toBe(
      "chain",
    );
  });

  it("ignores the redirect being edited", () => {
    expect(
      redirectProblem({ id: 1, from: "/stara", to: "/jina" }, existing),
    ).toBeNull();
  });
});
