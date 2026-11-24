import { describe, expect, it } from "vitest";

import { scopePayloadClientHints } from "../payload-client-hints";
import { securityHeaders } from "../security/headers";
import { migrationDecision } from "./migration-policy";

describe("migrationDecision", () => {
  it("migrates a production build", () => {
    expect(migrationDecision({ VERCEL_ENV: "production" }).migrate).toBe(true);
  });

  it("does not migrate a preview that may share its database", () => {
    expect(migrationDecision({ VERCEL_ENV: "preview" }).migrate).toBe(false);
    expect(
      migrationDecision({
        VERCEL_ENV: "preview",
        PREVIEW_DATABASE_ISOLATED: "TRUE",
      }).migrate,
    ).toBe(false);
  });

  it("migrates a preview that confirmed its own database", () => {
    expect(
      migrationDecision({
        VERCEL_ENV: "preview",
        PREVIEW_DATABASE_ISOLATED: "true",
      }).migrate,
    ).toBe(true);
  });

  it("does not migrate off Vercel unless asked", () => {
    expect(migrationDecision({}).migrate).toBe(false);
    expect(migrationDecision({ MIGRATE_ON_BUILD: "true" }).migrate).toBe(true);
  });

  it("lets MIGRATE_ON_BUILD=false switch migrations off everywhere", () => {
    expect(
      migrationDecision({ VERCEL_ENV: "production", MIGRATE_ON_BUILD: "false" })
        .migrate,
    ).toBe(false);
  });

  it("does not let MIGRATE_ON_BUILD=true open a shared preview", () => {
    expect(
      migrationDecision({ VERCEL_ENV: "preview", MIGRATE_ON_BUILD: "true" })
        .migrate,
    ).toBe(false);
  });
});

describe("securityHeaders", () => {
  it("sends HSTS only from a production build", () => {
    const keys = (productionBuild: boolean) =>
      securityHeaders({ productionBuild }).map((header) => header.key);

    expect(keys(true)).toContain("Strict-Transport-Security");
    expect(keys(false)).not.toContain("Strict-Transport-Security");
  });

  it("always forbids MIME sniffing and framing by other sites", () => {
    const headers = Object.fromEntries(
      securityHeaders({ productionBuild: false }).map((header) => [
        header.key,
        header.value,
      ]),
    );

    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("SAMEORIGIN");
  });
});

describe("scopePayloadClientHints", () => {
  it("moves the colour-scheme hint headers to the admin only", () => {
    const rules = scopePayloadClientHints([
      {
        source: "/:path*",
        headers: [
          { key: "Accept-CH", value: "Sec-CH-Prefers-Color-Scheme" },
          { key: "Critical-CH", value: "Sec-CH-Prefers-Color-Scheme" },
          { key: "Vary", value: "Sec-CH-Prefers-Color-Scheme" },
          { key: "X-Other", value: "kept" },
        ],
      },
    ]);

    expect(rules).toEqual([
      { source: "/:path*", headers: [{ key: "X-Other", value: "kept" }] },
      {
        source: "/admin/:path*",
        headers: [
          { key: "Accept-CH", value: "Sec-CH-Prefers-Color-Scheme" },
          { key: "Critical-CH", value: "Sec-CH-Prefers-Color-Scheme" },
          { key: "Vary", value: "Sec-CH-Prefers-Color-Scheme" },
        ],
      },
    ]);
  });

  it("leaves unrelated rules alone", () => {
    const rules = [
      { source: "/:path*", headers: [{ key: "Vary", value: "Accept" }] },
      { source: "/other", headers: [{ key: "Accept-CH", value: "Sec-CH-Prefers-Color-Scheme" }] },
    ];

    expect(scopePayloadClientHints(rules)).toEqual(rules);
  });
});
