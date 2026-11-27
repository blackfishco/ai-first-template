import { describe, expect, it } from "vitest";

import { clientIp, clientKey } from "./client";

describe("clientIp", () => {
  it("takes the first address of x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });
    expect(clientIp(headers)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    expect(clientIp(new Headers({ "x-real-ip": " 203.0.113.8 " }))).toBe(
      "203.0.113.8",
    );
  });

  it("returns null without either header", () => {
    expect(clientIp(new Headers())).toBeNull();
    expect(clientIp(new Headers({ "x-forwarded-for": " " }))).toBeNull();
  });
});

describe("clientKey", () => {
  const secret = "s".repeat(32);

  it("does not contain the address", () => {
    const key = clientKey("contact", "203.0.113.7", secret);
    expect(key).toMatch(/^[0-9a-f]{64}$/);
    expect(key).not.toContain("203.0.113.7");
  });

  it("is stable for one scope and client", () => {
    expect(clientKey("contact", "203.0.113.7", secret)).toBe(
      clientKey("contact", "203.0.113.7", secret),
    );
  });

  it("differs between scopes, clients and secrets", () => {
    const key = clientKey("contact", "203.0.113.7", secret);
    expect(clientKey("login", "203.0.113.7", secret)).not.toBe(key);
    expect(clientKey("contact", "203.0.113.8", secret)).not.toBe(key);
    expect(clientKey("contact", "203.0.113.7", "t".repeat(32))).not.toBe(key);
  });
});
