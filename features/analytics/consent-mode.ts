import type { ConsentChoice } from "@/lib/consent/consent";

type ConsentSignal = "granted" | "denied";

/** Google Consent Mode v2 signals. */
export interface ConsentModeState {
  analytics_storage: ConsentSignal;
  ad_storage: ConsentSignal;
  ad_user_data: ConsentSignal;
  ad_personalization: ConsentSignal;
}

export const ALL_DENIED: ConsentModeState = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
};

/** Maps the visitor's choice to Consent Mode: marketing covers every ad signal. */
export function consentModeState(choice: ConsentChoice): ConsentModeState {
  const signal = (granted: boolean): ConsentSignal =>
    granted ? "granted" : "denied";
  return {
    analytics_storage: signal(choice.analytics),
    ad_storage: signal(choice.marketing),
    ad_user_data: signal(choice.marketing),
    ad_personalization: signal(choice.marketing),
  };
}
