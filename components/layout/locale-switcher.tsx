"use client";

import { useLocale, useTranslations } from "next-intl";

import { buttonVariants } from "@/components/ui/button";
import { LOCALES } from "@/i18n/config";
import { Link, usePathname } from "@/i18n/navigation";

/** Links to the current page in every configured language. */
export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const activeLocale = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="flex gap-1">
      {LOCALES.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          lang={locale}
          aria-current={locale === activeLocale ? "page" : undefined}
          className={buttonVariants({
            variant: locale === activeLocale ? "secondary" : "ghost",
            size: "sm",
          })}
        >
          {t(locale)}
        </Link>
      ))}
    </nav>
  );
}
