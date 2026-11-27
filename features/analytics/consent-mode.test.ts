import { describe, expect, it } from "vitest";

import { ACCEPT_ALL, REJECT_ALL } from "@/lib/consent/consent";

import { ALL_DENIED, consentModeState } from "./consent-mode";

describe("consentModeState", () => {
  it("denies everything when the visitor rejects all", () => {
    expect(consentModeState(REJECT_ALL)).toEqual(ALL_DENIED);
  });

  it("grants everything when the visitor accepts all", () => {
    expect(Object.values(consentModeState(ACCEPT_ALL))).toEqual([
      "granted",
      "granted",
      "granted",
      "granted",
    ]);
  });

  it("keeps ad signals denied with analytics only", () => {
    expect(consentModeState({ analytics: true, marketing: false })).toEqual({
      ...ALL_DENIED,
      analytics_storage: "granted",
    });
  });
});
