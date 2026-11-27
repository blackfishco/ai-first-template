"use client";

import dynamic from "next/dynamic";
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

// The dialog and its switches load when a visitor opens the settings.
const ConsentSettingsDialog = dynamic(() =>
  import("./consent-settings-dialog").then((module) => module.ConsentSettingsDialog),
);

/**
 * Asks for cookie consent on the first visit and opens the settings whenever
 * something calls `openConsentSettings()`.
 *
 * The banner is part of the static HTML, so it paints with the page rather
 * than after the JavaScript. For a visitor who has already decided, the head
 * script from `consentBootScript()` marks `<html>` and CSS hides the banner
 * until React removes it. It floats over the page and moves no content.
 */
export function ConsentManager() {
  const t = useTranslations("Consent");
  const consent = useConsent();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // An event from another component (the footer link) opens the settings.
  useEffect(() => onOpenConsentSettings(() => setSettingsOpen(true)), []);

  const current = consent.status === "decided" ? consent.choice : REJECT_ALL;
  const showBanner = consent.status !== "decided" && !settingsOpen;

  return (
    <>
      {showBanner ? (
        <section
          aria-label={t("bannerLabel")}
          className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-2xl [html[data-consent=decided]_&]:hidden"
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
      {settingsOpen ? (
        <ConsentSettingsDialog
          open
          onOpenChange={setSettingsOpen}
          current={current}
          onSave={(choice) => {
            saveConsent(choice);
            setSettingsOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
