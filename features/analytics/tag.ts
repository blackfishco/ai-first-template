import { type TagKind,tagScriptUrl } from "@/lib/analytics/tag-id";

import { ALL_DENIED, type ConsentModeState } from "./consent-mode";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function dataLayer(): unknown[] {
  window.dataLayer ??= [];
  return window.dataLayer;
}

/**
 * The gtag command queue. gtag.js and Tag Manager read commands only as
 * `arguments` objects; an array pushed instead is ignored.
 */
function gtag(..._command: unknown[]): void {
  // eslint-disable-next-line prefer-rest-params -- gtag.js requires the arguments object, see above.
  dataLayer().push(arguments);
}

/** Whether Google's script for this tag is already on the page. */
export function isTagInstalled(id: string, kind: TagKind): boolean {
  const src = tagScriptUrl(id, kind);
  return [...document.scripts].some((script) => script.src === src);
}

/**
 * Sets Consent Mode, configures the tag, and loads Google's script. Call it
 * only after the visitor consented to analytics. Does nothing when the script
 * is already on the page, so a remounted component never loads it twice.
 */
export function installTag(id: string, kind: TagKind, consent: ConsentModeState): void {
  if (isTagInstalled(id, kind)) {
    updateConsent(consent);
    return;
  }
  gtag("consent", "default", ALL_DENIED);
  gtag("consent", "update", consent);

  if (kind === "ga4") {
    gtag("js", new Date());
    // Page views are sent by trackPageView, also on client-side navigation.
    gtag("config", id, { send_page_view: false });
  } else {
    dataLayer().push({ "gtm.start": Date.now(), event: "gtm.js" });
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = tagScriptUrl(id, kind);
  document.head.append(script);
}

export function updateConsent(consent: ConsentModeState): void {
  gtag("consent", "update", consent);
}

/**
 * Records a page view. GA4 gets a `page_view` event; a Tag Manager container
 * gets a `page_view` data layer event to trigger its tags on.
 */
export function trackPageView(kind: TagKind, path: string): void {
  const details = {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  };
  if (kind === "ga4") gtag("event", "page_view", details);
  else dataLayer().push({ event: "page_view", ...details });
}
