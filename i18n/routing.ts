import { defineRouting } from "next-intl/routing";

import { DEFAULT_LOCALE, LOCALES } from "./config";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  // The default language has no URL prefix (`/about`); others do (`/en/about`).
  localePrefix: "as-needed",
});
