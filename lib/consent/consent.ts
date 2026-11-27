/**
 * The visitor's cookie consent: categories, the stored format, and parsing.
 * Pure and safe on the server. The browser side is in `./client.ts`.
 *
 * Features read consent through this module and `./client.ts`, never through
 * `features/consent`, so a feature that needs consent (analytics) does not
 * depend on the feature that asks for it.
 */

/** Categories a visitor can switch on or off. Necessary cookies are always on. */
export const OPTIONAL_CATEGORIES = ["analytics", "marketing"] as const;
export type OptionalCategory = (typeof OPTIONAL_CATEGORIES)[number];

export type ConsentChoice = Record<OptionalCategory, boolean>;

export const CONSENT_COOKIE = "consent";

/**
 * Raise this when the categories or what they cover change. Every stored
 * choice of an older version is ignored, so visitors are asked again.
 */
export const CONSENT_VERSION = 1;

/** How long a choice is kept: six months, after which the visitor is asked again. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 182;

export const ACCEPT_ALL: ConsentChoice = { analytics: true, marketing: true };
export const REJECT_ALL: ConsentChoice = { analytics: false, marketing: false };

/** Stored value: the version, a dot, and one digit per category, e.g. `1.10`. */
export function serializeConsent(
  choice: ConsentChoice,
  version: number = CONSENT_VERSION,
): string {
  const bits = OPTIONAL_CATEGORIES.map((category) =>
    choice[category] ? "1" : "0",
  ).join("");
  return `${version}.${bits}`;
}

/** The stored choice, or `null` when there is none, it is malformed, or it is outdated. */
export function parseConsent(
  value: string | undefined | null,
  version: number = CONSENT_VERSION,
): ConsentChoice | null {
  const match = /^(\d+)\.([01]+)$/.exec(value ?? "");
  if (!match) return null;
  const [, storedVersion, bits = ""] = match;
  if (Number(storedVersion) !== version) return null;
  if (bits.length !== OPTIONAL_CATEGORIES.length) return null;

  const choice = { ...REJECT_ALL };
  OPTIONAL_CATEGORIES.forEach((category, index) => {
    choice[category] = bits[index] === "1";
  });
  return choice;
}

/** The choice stored in a `Cookie` header or `document.cookie`. */
export function consentFromCookies(cookies: string): ConsentChoice | null {
  for (const part of cookies.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === CONSENT_COOKIE) return parseConsent(rest.join("="));
  }
  return null;
}

/** A `document.cookie` assignment that stores the choice. */
export function consentCookie(choice: ConsentChoice, secure: boolean): string {
  const attributes = [
    `${CONSENT_COOKIE}=${serializeConsent(choice)}`,
    "Path=/",
    `Max-Age=${CONSENT_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ];
  if (secure) attributes.push("Secure");
  return attributes.join("; ");
}
