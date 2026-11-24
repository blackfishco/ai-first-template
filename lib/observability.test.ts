import { afterEach, describe, expect, it, vi } from "vitest";

import {
  captureError,
  scrub,
  scrubText,
  setErrorReporter,
  toLogEntry,
} from "./observability";

afterEach(() => {
  setErrorReporter(undefined);
  vi.restoreAllMocks();
});

describe("scrubText", () => {
  it("removes e-mail addresses", () => {
    expect(scrubText("Sent to jana.novakova@example.com today")).toBe(
      "Sent to [redacted] today",
    );
  });

  it("cuts very long text", () => {
    expect(scrubText("a".repeat(5000)).length).toBeLessThan(2100);
  });
});

describe("scrub", () => {
  it("replaces values under secret-looking keys at any depth", () => {
    expect(
      scrub({
        user: { password: "hunter2", apiKey: "k", name: "Jana" },
        headers: { Authorization: "Bearer abc", cookie: "sid=1" },
        resetPasswordToken: "t",
      }),
    ).toEqual({
      user: { password: "[redacted]", apiKey: "[redacted]", name: "Jana" },
      headers: { Authorization: "[redacted]", cookie: "[redacted]" },
      resetPasswordToken: "[redacted]",
    });
  });

  it("removes e-mail addresses from nested strings and arrays", () => {
    expect(scrub({ to: ["a@example.com"], note: "from b@example.com" })).toEqual({
      to: ["[redacted]"],
      note: "from [redacted]",
    });
  });

  it("stops at a fixed depth", () => {
    const deep = { a: { b: { c: { d: { e: "too deep" } } } } };

    expect(JSON.stringify(scrub(deep))).toContain("[truncated]");
  });
});

describe("toLogEntry", () => {
  it("describes an error without personal data", () => {
    const entry = toLogEntry(new Error("No user jana@example.com"), {
      source: "request",
      path: "/kontakt",
      email: "jana@example.com",
    });

    const text = JSON.stringify(entry);
    expect(text).not.toContain("jana@example.com");
    expect(entry).toMatchObject({
      level: "error",
      error: { name: "Error", message: "No user [redacted]" },
      context: { source: "request", path: "/kontakt" },
    });
  });

  it("handles values that are not errors", () => {
    expect(toLogEntry("boom", { source: "x" }).error).toEqual({
      message: "boom",
    });
  });
});

describe("captureError", () => {
  it("logs and forwards the error to the registered reporter", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const reporter = vi.fn();
    setErrorReporter(reporter);
    const error = new Error("boom");

    await captureError(error, { source: "test" });

    expect(log).toHaveBeenCalledOnce();
    expect(reporter).toHaveBeenCalledWith(error, { source: "test" });
  });

  it("does not throw when the reporter fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    setErrorReporter(() => {
      throw new Error("tracker down");
    });

    await expect(
      captureError(new Error("boom"), { source: "test" }),
    ).resolves.toBeUndefined();
  });
});
