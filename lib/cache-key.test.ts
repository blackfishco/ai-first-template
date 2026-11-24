import { describe, expect, it, vi } from "vitest";

vi.stubEnv("DATABASE_URL", "postgres://user:password@127.0.0.1:5432/app");
vi.stubEnv("PAYLOAD_SECRET", "x".repeat(32));

const { deploymentCacheKey } = await import("./cache-key");

describe("deploymentCacheKey", () => {
  it("leaves the key unchanged outside a deployment", () => {
    expect(deploymentCacheKey(["page"], {})).toEqual(["page"]);
  });

  it("scopes the key to the deployment", () => {
    expect(
      deploymentCacheKey(["page"], { VERCEL_DEPLOYMENT_ID: "dpl_1" }),
    ).toEqual(["page", "deployment:dpl_1"]);
  });

  it("falls back to the commit when there is no deployment id", () => {
    expect(
      deploymentCacheKey(["page"], { VERCEL_GIT_COMMIT_SHA: "abc" }),
    ).toEqual(["page", "deployment:abc"]);
  });
});
