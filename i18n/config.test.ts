import { describe, expect, it } from "vitest";

import { DEFAULT_LOCALE, isLocale, LOCALE_LABELS, LOCALES } from "./config";
import { MESSAGES } from "./messages";
import { routing } from "./routing";

function keyPaths(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("locale config", () => {
  it("routes exactly the configured languages", () => {
    expect(routing.locales).toEqual(LOCALES);
    expect(routing.defaultLocale).toBe(DEFAULT_LOCALE);
  });

  it("has a label and messages for every language", () => {
    expect(Object.keys(LOCALE_LABELS).toSorted()).toEqual(LOCALES.toSorted());
    expect(Object.keys(MESSAGES).toSorted()).toEqual(LOCALES.toSorted());
  });

  it("keeps every language's messages in the same shape", () => {
    const reference = keyPaths(MESSAGES[DEFAULT_LOCALE]).toSorted();

    for (const locale of LOCALES) {
      expect(keyPaths(MESSAGES[locale]).toSorted()).toEqual(reference);
    }
  });

  it("recognises only configured languages", () => {
    expect(isLocale("cs")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
