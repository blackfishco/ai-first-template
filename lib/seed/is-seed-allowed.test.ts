import { describe, expect, it } from "vitest";

import { isSeedAllowed } from "./is-seed-allowed";

describe("isSeedAllowed", () => {
  it("allows only the exact value true", () => {
    expect(isSeedAllowed("true")).toBe(true);
  });

  it.each([undefined, "", "TRUE", "True", " true", "1", "yes", "false"])(
    "refuses %o",
    (value) => {
      expect(isSeedAllowed(value)).toBe(false);
    },
  );
});
