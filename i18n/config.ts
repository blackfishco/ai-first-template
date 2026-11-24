/**
 * The single definition of the site's languages. Routing (next-intl), the CMS
 * content locales (Payload), and message loading all read it. Adding a
 * language starts here; see docs/architecture.md for the remaining steps.
 */
export const LOCALES = ["cs", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE = "cs" satisfies Locale;

/** Language names in their own language, for the CMS and the language switcher. */
export const LOCALE_LABELS = {
  cs: "Čeština",
  en: "English",
} satisfies Record<Locale, string>;

export function isLocale(value: unknown): value is Locale {
  return LOCALES.some((locale) => locale === value);
}
