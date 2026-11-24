import "server-only";

import { getLocale } from "next-intl/server";

import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";
import type { Config } from "@/payload-types";

/**
 * Compile-time proof that every site language is a CMS content locale and the
 * other way round. It fails typecheck when `payload-types.ts` is stale after
 * a change in i18n/config.ts.
 */
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never;
const localesMatch: Same<Locale, Config["locale"]> = true;
void localesMatch;

/**
 * The language of the current request, for the `locale` option of Local API
 * calls. Every content query passes it; without it Payload returns the
 * default language whatever page the visitor is on.
 */
export async function getContentLocale(): Promise<Locale> {
  const locale = await getLocale();
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}
