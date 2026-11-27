"use server";

import { headers } from "next/headers";

import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { clientIp } from "@/lib/rate-limit/client";

import { parseContactInput } from "./schema";
import { submitContactMessage } from "./server/submit-message";
import type { ContactResult } from "./types";

/**
 * Receives the contact form. Both arguments are untrusted, whatever their
 * TypeScript types say.
 *
 * The form passes its language: a Server Action runs outside a route, so the
 * `[locale]` root parameter is not available here.
 */
export async function submitContactAction(
  input: unknown,
  locale: unknown,
): Promise<ContactResult> {
  const parsed = parseContactInput(input);

  if (parsed.isErr()) {
    // A bot that filled the hidden field gets a success it cannot tell from a real one.
    if (parsed.error.rejected) return { success: true };
    return { success: false, code: "INVALID_INPUT", fields: parsed.error.fields };
  }

  return submitContactMessage(
    parsed.value,
    isLocale(locale) ? locale : DEFAULT_LOCALE,
    clientIp(await headers()),
  ).match<ContactResult>(
    () => ({ success: true }),
    (error) => ({ success: false, code: error.code }),
  );
}
