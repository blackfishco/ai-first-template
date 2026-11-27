"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { openConsentSettings } from "@/lib/consent/client";

/** Lets a visitor change their cookie choice at any time. Placed in the footer. */
export function ConsentSettingsLink() {
  const t = useTranslations("Consent");

  return (
    <Button
      variant="link"
      size="sm"
      className="h-auto p-0 text-muted-foreground"
      onClick={openConsentSettings}
    >
      {t("openSettings")}
    </Button>
  );
}
