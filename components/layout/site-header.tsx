import { CmsLink } from "@/components/cms/cms-link";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { CmsLinkField } from "@/payload-types";

import { LocaleSwitcher } from "./locale-switcher";

interface SiteHeaderProps {
  siteName: string;
  navigation: CmsLinkField[];
  navigationLabel: string;
}

export function SiteHeader({
  siteName,
  navigation,
  navigationLabel,
}: SiteHeaderProps) {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          {siteName}
        </Link>
        {navigation.length > 0 ? (
          <nav aria-label={navigationLabel} className="flex flex-wrap gap-1">
            {navigation.map((link, index) => (
              <CmsLink
                // Navigation items have no id of their own; order is stable per render.
                key={index}
                link={link}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              />
            ))}
          </nav>
        ) : null}
        <LocaleSwitcher />
      </div>
    </header>
  );
}
