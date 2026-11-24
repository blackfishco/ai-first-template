import { describe, expect, it, vi } from "vitest";

vi.stubEnv("DATABASE_URL", "postgres://user:password@127.0.0.1:5432/app");
vi.stubEnv("PAYLOAD_SECRET", "x".repeat(32));

const { PASSWORD_MIN_LENGTH, passwordEmailHtml, validatePassword } =
  await import("./users");

describe("validatePassword", () => {
  it("accepts a password of the minimum length", () => {
    expect(validatePassword("a".repeat(PASSWORD_MIN_LENGTH))).toBe(true);
  });

  it("rejects a shorter password with a message", () => {
    expect(validatePassword("a".repeat(PASSWORD_MIN_LENGTH - 1))).toEqual(
      expect.stringContaining(String(PASSWORD_MIN_LENGTH)),
    );
  });

  it.each([undefined, null, ""])("treats %o as unchanged", (value) => {
    expect(validatePassword(value)).toBe(true);
  });
});

describe("passwordEmailHtml", () => {
  it("links to the admin reset page with the token", () => {
    const html = passwordEmailHtml("abc123", "https://example.com");

    expect(html).toContain('href="https://example.com/admin/reset/abc123"');
  });

  it("escapes values that could break out of the attribute", () => {
    const html = passwordEmailHtml("t", 'https://example.com/"><script>');

    expect(html).not.toContain("<script>");
    expect(html).toContain("&quot;&gt;&lt;script&gt;");
  });
});
