"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  onOpenConsentSettings,
  saveConsent,
  useConsent,
} from "@/lib/consent/client";
import { ACCEPT_ALL, REJECT_ALL } from "@/lib/consent/consent";

import { ConsentSettingsDialog } from "./consent-settings-dialog";

/**
 * Asks for cookie consent on the first visit and opens the settings whenever
 * something calls `openConsentSettings()`. Renders nothing on the server, so
 * pages stay static; the banner floats over the page and moves no content.
 */
export function ConsentManager() {
  const t = useTranslations("Consent");
  const consent = useConsent();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // An event from another component (the footer link) opens the settings.
  useEffect(() => onOpenConsentSettings(() => setSettingsOpen(true)), []);

  const current = consent.status === "decided" ? consent.choice : REJECT_ALL;
  const showBanner = consent.status === "undecided" && !settingsOpen;

  return (
    <>
      {showBanner ? (
        <section
          aria-label={t("bannerLabel")}
          className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-2xl"
        >
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>{t("title")}</h2>
              </CardTitle>
              <CardDescription>{t("description")}</CardDescription>
            </CardHeader>
            <CardContent className="sr-only">{t("choiceHint")}</CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button onClick={() => saveConsent(ACCEPT_ALL)}>
                {t("acceptAll")}
              </Button>
              <Button onClick={() => saveConsent(REJECT_ALL)}>
                {t("rejectAll")}
              </Button>
              <Button variant="outline" onClick={() => setSettingsOpen(true)}>
                {t("customize")}
              </Button>
            </CardFooter>
          </Card>
        </section>
      ) : null}
      <ConsentSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        current={current}
        onSave={(choice) => {
          saveConsent(choice);
          setSettingsOpen(false);
        }}
      />
    </>
  );
}
