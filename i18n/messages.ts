import csMessages from "@/messages/cs.json";
import enMessages from "@/messages/en.json";
import exampleCsMessages from "@/messages/example.cs.json";
import exampleEnMessages from "@/messages/example.en.json";

import type { Locale } from "./config";

/**
 * Messages per language. Czech is the reference shape: a language that misses
 * a key or adds an unknown one fails typecheck here.
 */
type Messages = typeof csMessages & typeof exampleCsMessages;

export const MESSAGES = {
  cs: { ...csMessages, ...exampleCsMessages },
  en: { ...enMessages, ...exampleEnMessages },
} satisfies Record<Locale, Messages>;
