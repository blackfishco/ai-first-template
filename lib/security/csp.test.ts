import { describe, expect, it } from "vitest";

import { buildCsp, createNonce, CSP_SOURCES, cspHeaderName } from "./csp";

function directives(policy: string): Map<string, string[]> {
  return new Map(
    policy.split("; ").map((directive) => {
      const [name = "", ...values] = directive.split(" ");
      return [name, values];
    }),
  );
}

const production = { nonce: "abc123", development: false, https: true };

describe("buildCsp", () => {
  it("allows scripts only with the request's nonce", () => {
    const script = directives(buildCsp(production)).get("script-src");

    expect(script).toEqual(["'self'", "'nonce-abc123'", "'strict-dynamic'"]);
  });

  it("blocks plugins, foreign base URLs, form targets and framing by other sites", () => {
    const policy = directives(buildCsp(production));

    expect(policy.get("object-src")).toEqual(["'none'"]);
    expect(policy.get("base-uri")).toEqual(["'self'"]);
    expect(policy.get("form-action")).toEqual(["'self'"]);
    expect(policy.get("frame-ancestors")).toEqual(["'self'"]);
  });

  it("lets analytics connect to Google", () => {
    const connect = directives(buildCsp(production)).get("connect-src");

    expect(connect).toEqual(["'self'", ...CSP_SOURCES.connect]);
  });

  it("adds unsafe-eval only in development", () => {
    expect(buildCsp(production)).not.toContain("unsafe-eval");
    expect(
      directives(buildCsp({ ...production, development: true })).get("script-src"),
    ).toContain("'unsafe-eval'");
  });

  it("upgrades insecure requests only on HTTPS", () => {
    expect(directives(buildCsp(production)).has("upgrade-insecure-requests")).toBe(true);
    expect(
      directives(buildCsp({ ...production, https: false })).has(
        "upgrade-insecure-requests",
      ),
    ).toBe(false);
  });
});

describe("cspHeaderName", () => {
  it("maps each mode to its header", () => {
    expect(cspHeaderName("off")).toBeNull();
    expect(cspHeaderName("report-only")).toBe("Content-Security-Policy-Report-Only");
    expect(cspHeaderName("enforce")).toBe("Content-Security-Policy");
  });
});

describe("createNonce", () => {
  it("is different every time and safe in a header", () => {
    const nonces = new Set(Array.from({ length: 50 }, () => createNonce()));

    expect(nonces.size).toBe(50);
    for (const nonce of nonces) expect(nonce).toMatch(/^[A-Za-z0-9+/=]{16,}$/);
  });
});
