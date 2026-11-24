import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

import { isLocale } from "./config";
import { MESSAGES } from "./messages";
import { getRootLocale } from "./root-locale";

export default getRequestConfig(async ({ locale }) => {
  const requestedLocale = locale ?? (await getRootLocale());

  if (!isLocale(requestedLocale)) {
    notFound();
  }

  return {
    locale: requestedLocale,
    messages: MESSAGES[requestedLocale],
  };
});
