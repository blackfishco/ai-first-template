"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import type { TagKind } from "@/lib/analytics/tag-id";
import { useConsent } from "@/lib/consent/client";

import { consentModeState } from "../consent-mode";
import { installTag, isTagInstalled, trackPageView } from "../tag";

interface AnalyticsProps {
  tagId: string;
  kind: TagKind;
}

/**
 * Loads the Google tag once the visitor consents to analytics, and reports
 * page views, including client-side navigation. Without consent nothing from
 * Google loads. When consent is withdrawn, the page reloads so no tag code
 * keeps running.
 */
export function Analytics({ tagId, kind }: AnalyticsProps) {
  const consent = useConsent();
  const pathname = usePathname();

  const decided = consent.status === "decided";
  const analytics = decided && consent.choice.analytics;
  const marketing = decided && consent.choice.marketing;

  // Google's script is an external system; this effect keeps it in step with consent.
  useEffect(() => {
    if (!decided) return;
    const state = consentModeState({ analytics, marketing });

    if (!analytics) {
      if (isTagInstalled(tagId, kind)) window.location.reload();
      return;
    }
    installTag(tagId, kind, state);
  }, [decided, analytics, marketing, tagId, kind]);

  useEffect(() => {
    if (analytics) trackPageView(kind, pathname);
  }, [analytics, kind, pathname]);

  return null;
}
