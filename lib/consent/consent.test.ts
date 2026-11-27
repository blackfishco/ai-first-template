import { runInNewContext } from "node:vm";

import { describe, expect, it } from "vitest";

import {
  ACCEPT_ALL,
  CONSENT_COOKIE,
  CONSENT_MAX_AGE_SECONDS,
  consentBootScript,
  consentCookie,
  consentFromCookies,
  parseConsent,
  REJECT_ALL,
  serializeConsent,
} from "./consent";

describe("serializeConsent and parseConsent", () => {
  it.each([
    ACCEPT_ALL,
    REJECT_ALL,
    { analytics: true, marketing: false },
    { analytics: false, marketing: true },
  ])("round-trips %o", (choice) => {
    expect(parseConsent(serializeConsent(choice))).toEqual(choice);
  });

  it("stores one digit per category after the version", () => {
    expect(serializeConsent({ analytics: true, marketing: false }, 3)).toBe("3.10");
  });

  it("ignores a choice stored for another version", () => {
    expect(parseConsent(serializeConsent(ACCEPT_ALL, 1), 2)).toBeNull();
  });

  it.each([undefined, null, "", "yes", "1.", "1.1", "1.111", "1.12", "x.10", " 1.10"])(
    "rejects %o",
    (value) => {
      expect(parseConsent(value)).toBeNull();
    },
  );
});

describe("consentFromCookies", () => {
  it("finds the consent cookie among others", () => {
    expect(
      consentFromCookies(`NEXT_LOCALE=cs; ${CONSENT_COOKIE}=1.01; other=a=b`),
    ).toEqual({ analytics: false, marketing: true });
  });

  it("returns null without the cookie or with a broken value", () => {
    expect(consentFromCookies("")).toBeNull();
    expect(consentFromCookies("NEXT_LOCALE=cs")).toBeNull();
    expect(consentFromCookies(`${CONSENT_COOKIE}=nonsense`)).toBeNull();
  });
});

describe("consentCookie", () => {
  it("stores the choice for the whole site with a limited lifetime", () => {
    const cookie = consentCookie(ACCEPT_ALL, false);

    expect(cookie).toContain(`${CONSENT_COOKIE}=1.11`);
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain(`Max-Age=${CONSENT_MAX_AGE_SECONDS}`);
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).not.toContain("Secure");
  });

  it("is secure on HTTPS", () => {
    expect(consentCookie(REJECT_ALL, true)).toContain("; Secure");
  });
});

describe("consentBootScript", () => {
  function run(cookie: string): string | null {
    let marked: string | null = null;
    const document = {
      cookie,
      documentElement: {
        setAttribute: (name: string, value: string) => {
          marked = `${name}=${value}`;
        },
      },
    };
    // The script runs in the page's <head>; here it gets a stand-in document.
    runInNewContext(consentBootScript(), { document });
    return marked;
  }

  it("marks a visitor with a current choice", () => {
    expect(run(`NEXT_LOCALE=cs; ${CONSENT_COOKIE}=${serializeConsent(REJECT_ALL)}`)).toBe(
      "data-consent=decided",
    );
    expect(run(`${CONSENT_COOKIE}=${serializeConsent(ACCEPT_ALL)}; other=1`)).toBe(
      "data-consent=decided",
    );
  });

  it("leaves a visitor without a valid, current choice", () => {
    expect(run("")).toBeNull();
    expect(run(`${CONSENT_COOKIE}=${serializeConsent(ACCEPT_ALL, 0)}`)).toBeNull();
    expect(run(`${CONSENT_COOKIE}=1.1`)).toBeNull();
    expect(run(`${CONSENT_COOKIE}=nonsense`)).toBeNull();
    expect(run(`my${CONSENT_COOKIE}=1.11`)).toBeNull();
  });
});
