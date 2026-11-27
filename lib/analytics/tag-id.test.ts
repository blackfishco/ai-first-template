import { describe, expect, it } from "vitest";

import { isAnalyticsEnabled, tagKind, tagScriptUrl, validateTagId } from "./tag-id";

describe("tagKind", () => {
  it("recognises Tag Manager and GA4 IDs", () => {
    expect(tagKind("GTM-ABC1234")).toBe("gtm");
    expect(tagKind("G-ABCDE12345")).toBe("ga4");
  });

  it.each([null, undefined, "", "UA-12345-1", "gtm-abc1234", "GTM-", "G-12", "GTM-ABC 123", "GTM-ABC1234\"><script>"])(
    "rejects %o",
    (id) => {
      expect(tagKind(id)).toBeNull();
    },
  );
});

describe("validateTagId", () => {
  it("accepts an empty value and valid IDs", () => {
    expect(validateTagId("")).toBe(true);
    expect(validateTagId(null)).toBe(true);
    expect(validateTagId(undefined)).toBe(true);
    expect(validateTagId("GTM-ABC1234")).toBe(true);
  });

  it("explains a wrong value", () => {
    expect(validateTagId("UA-1")).toEqual(expect.stringContaining("GTM-"));
    expect(validateTagId(42)).toEqual(expect.stringContaining("GTM-"));
  });
});

describe("tagScriptUrl", () => {
  it("points at the right Google script", () => {
    expect(tagScriptUrl("GTM-ABC1234", "gtm")).toBe(
      "https://www.googletagmanager.com/gtm.js?id=GTM-ABC1234",
    );
    expect(tagScriptUrl("G-ABCDE12345", "ga4")).toBe(
      "https://www.googletagmanager.com/gtag/js?id=G-ABCDE12345",
    );
  });
});

describe("isAnalyticsEnabled", () => {
  it("is on for the Vercel production deployment only", () => {
    expect(isAnalyticsEnabled({ VERCEL_ENV: "production" })).toBe(true);
    expect(isAnalyticsEnabled({ VERCEL_ENV: "preview" })).toBe(false);
    expect(isAnalyticsEnabled({ VERCEL_ENV: "development" })).toBe(false);
  });

  it("follows ALLOW_INDEXING off Vercel", () => {
    expect(isAnalyticsEnabled({ ALLOW_INDEXING: true })).toBe(true);
    expect(isAnalyticsEnabled({ ALLOW_INDEXING: false })).toBe(false);
    expect(isAnalyticsEnabled({})).toBe(false);
  });

  it("lets ANALYTICS_ENABLED override the rule", () => {
    expect(isAnalyticsEnabled({ VERCEL_ENV: "preview", ANALYTICS_ENABLED: true })).toBe(true);
    expect(isAnalyticsEnabled({ VERCEL_ENV: "production", ANALYTICS_ENABLED: false })).toBe(false);
  });
});
