"use client";

import { useSyncExternalStore } from "react";

import {
  type ConsentChoice,
  consentCookie,
  consentFromCookies,
} from "./consent";

const CHANGE_EVENT = "consent:change";
const OPEN_SETTINGS_EVENT = "consent:open-settings";

/**
 * - `unknown`: rendering on the server, or before hydration. Render nothing
 *   that depends on consent, so pages stay static.
 * - `undecided`: the visitor has not chosen yet.
 * - `decided`: the visitor's choice.
 */
export type ConsentState =
  | { status: "unknown" }
  | { status: "undecided" }
  | { status: "decided"; choice: ConsentChoice };

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function cookieSnapshot(): string {
  return document.cookie;
}

function serverSnapshot(): null {
  return null;
}

/** The visitor's consent, kept in sync with every change on the page. */
export function useConsent(): ConsentState {
  const cookies = useSyncExternalStore<string | null>(
    subscribe,
    cookieSnapshot,
    serverSnapshot,
  );
  if (cookies === null) return { status: "unknown" };
  const choice = consentFromCookies(cookies);
  return choice ? { status: "decided", choice } : { status: "undecided" };
}

/** Stores the visitor's choice and tells every consent reader on the page. */
export function saveConsent(choice: ConsentChoice): void {
  // The consent cookie is itself a necessary cookie: it stores the answer.
  document.cookie = consentCookie(choice, window.location.protocol === "https:");
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Asks the consent feature to open its settings, e.g. from a footer link. */
export function openConsentSettings(): void {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

/** Calls `listener` whenever something asks to open the consent settings. */
export function onOpenConsentSettings(listener: () => void): () => void {
  window.addEventListener(OPEN_SETTINGS_EVENT, listener);
  return () => window.removeEventListener(OPEN_SETTINGS_EVENT, listener);
}
