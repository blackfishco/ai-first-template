import csMessages from "@/messages/cs.json";
import enMessages from "@/messages/en.json";

import type { Locale } from "./config";

/**
 * Messages per language. Czech is the reference shape: a language that misses
 * a key or adds an unknown one fails typecheck here.
 */
type Messages = typeof csMessages;

export const MESSAGES = {
  cs: csMessages,
  en: enMessages,
} satisfies Record<Locale, Messages>;
