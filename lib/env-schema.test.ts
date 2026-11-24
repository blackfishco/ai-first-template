import { describe, expect, it } from "vitest";

import { loadServerEnv, parseServerEnv, resolveSiteUrl } from "./env-schema";

describe("parseServerEnv", () => {
  it("applies defaults when nothing is set", () => {
    const env = parseServerEnv({})._unsafeUnwrap();

    expect(env.NODE_ENV).toBe("development");
    expect(env.SITE_URL).toBe("http://localhost:3000");
  });

  it("treats empty strings as unset", () => {
    const env = parseServerEnv({ SITE_URL: "", VERCEL_ENV: "" })._unsafeUnwrap();

    expect(env.SITE_URL).toBe("http://localhost:3000");
    expect(env.VERCEL_ENV).toBeUndefined();
  });

  it("reports the names of invalid variables without their values", () => {
    const error = parseServerEnv({
      SITE_URL: "not-a-url",
      NODE_ENV: "staging",
    })._unsafeUnwrapErr();

    expect(error.code).toBe("INVALID_ENV");
    expect(error.variables.toSorted()).toEqual(["NODE_ENV", "SITE_URL"]);
    expect(JSON.stringify(error)).not.toContain("not-a-url");
  });

  it.each(["https://example.com/", "ftp://example.com"])(
    "rejects SITE_URL %s",
    (value) => {
      const error = parseServerEnv({ SITE_URL: value })._unsafeUnwrapErr();

      expect(error.variables).toEqual(["SITE_URL"]);
    },
  );
});

describe("resolveSiteUrl", () => {
  it("prefers an explicit SITE_URL", () => {
    expect(
      resolveSiteUrl({ SITE_URL: "https://example.com", VERCEL_URL: "x.vercel.app" }),
    ).toBe("https://example.com");
  });

  it("uses the production domain on a Vercel production deployment", () => {
    expect(
      resolveSiteUrl({
        VERCEL_ENV: "production",
        VERCEL_PROJECT_PRODUCTION_URL: "example.com",
        VERCEL_URL: "project-abc.vercel.app",
      }),
    ).toBe("https://example.com");
  });

  it("uses the deployment URL on a preview deployment", () => {
    expect(
      resolveSiteUrl({
        VERCEL_ENV: "preview",
        VERCEL_PROJECT_PRODUCTION_URL: "example.com",
        VERCEL_URL: "project-abc.vercel.app",
      }),
    ).toBe("https://project-abc.vercel.app");
  });

  it("returns undefined off Vercel so the schema default applies", () => {
    expect(resolveSiteUrl({})).toBeUndefined();
  });
});

describe("loadServerEnv", () => {
  it("throws an error that names the variable", () => {
    expect(() => loadServerEnv({ SITE_URL: "not-a-url" })).toThrow(
      /SITE_URL/,
    );
  });
});
