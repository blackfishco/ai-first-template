import "../../globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";

import { AppProviders } from "@/app/providers";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale, LOCALES } from "@/i18n/config";
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

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: "Vývojová šablona",
  description: "Přehledný základ pro vývoj vlastní aplikace se sdílenými komponentami.",
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

  const t = await getTranslations({ locale, namespace: "Site" });
  const settings = await getSiteSettings(locale).match(
    (found) => found,
    () => {
      // The CMS is part of this app; failing to reach it is not recoverable here.
      throw new Error("The CMS could not be reached while rendering the layout.");
    },
  );
  const siteName = settings.siteName ?? t("name");

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
            />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
