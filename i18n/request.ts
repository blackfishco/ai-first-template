import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE, isLocale } from "./config";
import { MESSAGES } from "./messages";
import { getRootLocale } from "./root-locale";

export default getRequestConfig(async ({ locale }) => {
  // Outside a route (Server Actions, Route Handlers) there is no `[locale]`
  // segment. Code there passes the language explicitly; without one, the
  // default language applies.
  const requestedLocale = locale ?? (await getRootLocale()) ?? DEFAULT_LOCALE;

  if (!isLocale(requestedLocale)) {
    notFound();
  }

  return {
    locale: requestedLocale,
    messages: MESSAGES[requestedLocale],
  };
});
