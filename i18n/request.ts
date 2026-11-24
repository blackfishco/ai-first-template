import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import csMessages from "@/messages/cs.json";
import exampleMessages from "@/messages/example.cs.json";

import { getRootLocale } from "./root-locale";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  const requestedLocale = locale ?? (await getRootLocale());

  if (!hasLocale(routing.locales, requestedLocale)) {
    notFound();
  }

  return {
    locale: requestedLocale,
    messages: { ...csMessages, ...exampleMessages },
  };
});
