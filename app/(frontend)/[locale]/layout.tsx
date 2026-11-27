import "../../globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";

import { AppProviders } from "@/app/providers";
import { LivePreviewRefresh } from "@/components/cms/live-preview-refresh";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Analytics } from "@/features/analytics/components/analytics";
import { ConsentManager } from "@/features/consent/components/consent-manager";
import { ConsentSettingsLink } from "@/features/consent/components/consent-settings-link";
import { isLocale, LOCALES } from "@/i18n/config";
import { isAnalyticsEnabled, tagKind } from "@/lib/analytics/tag-id";
import { env } from "@/lib/env";
import { getSiteSettings } from "@/lib/site-settings/server";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Titles, descriptions, and indexing rules come from each page; see lib/seo.
export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  // A nonce is per request, so with a policy on, every page renders per request.
  if (env.CSP_MODE !== "off") await connection();

  const t = await getTranslations({ locale, namespace: "Site" });
  const settings = await getSiteSettings(locale).match(
    (found) => found,
    () => {
      // The CMS is part of this app; failing to reach it is not recoverable here.
      throw new Error("The CMS could not be reached while rendering the layout.");
    },
  );
  const siteName = settings.siteName ?? t("name");
  const { isEnabled: isDraft } = await draftMode();
  const analyticsKind = isAnalyticsEnabled(env)
    ? tagKind(settings.analyticsTagId)
    : null;

  return (
    <html
      lang={locale}
      className={cn(
        "h-full antialiased font-sans",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <AppProviders>
            {isDraft ? <LivePreviewRefresh /> : null}
            <SiteHeader
              siteName={siteName}
              navigation={settings.headerNav}
              navigationLabel={t("mainNavigation")}
            />
            {children}
            <SiteFooter
              siteName={siteName}
              navigation={settings.footerNav}
              navigationLabel={t("footerNavigation")}
            >
              <ConsentSettingsLink />
            </SiteFooter>
            <ConsentManager />
            {analyticsKind && settings.analyticsTagId ? (
              <Analytics tagId={settings.analyticsTagId} kind={analyticsKind} />
            ) : null}
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
