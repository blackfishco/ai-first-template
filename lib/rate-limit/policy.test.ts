import { describe, expect, it } from "vitest";

import { decide, windowStart } from "./policy";

const rule = { limit: 3, windowMs: 60_000 };

describe("windowStart", () => {
  it("goes back by the window length", () => {
    expect(windowStart(new Date("2026-01-01T00:10:00Z"), rule)).toEqual(
      new Date("2026-01-01T00:09:00Z"),
    );
  });
});

describe("decide", () => {
  it("allows requests below the limit", () => {
    expect(decide(0, rule)).toBe("allowed");
    expect(decide(2, rule)).toBe("allowed");
  });

  it("limits the request that would exceed it", () => {
    expect(decide(3, rule)).toBe("limited");
    expect(decide(10, rule)).toBe("limited");
  });
});
