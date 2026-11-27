import type { ReactNode } from "react";

import { CmsLink } from "@/components/cms/cms-link";
import type { CmsLinkField } from "@/payload-types";

interface SiteFooterProps {
  siteName: string;
  navigation: CmsLinkField[];
  navigationLabel: string;
  /** Feature-owned extras passed by the layout, such as the cookie settings link. */
  children?: ReactNode;
}

export function SiteFooter({
  siteName,
  navigation,
  navigationLabel,
  children,
}: SiteFooterProps) {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-6 text-sm text-muted-foreground">
        <p>{siteName}</p>
        {navigation.length > 0 ? (
          <nav aria-label={navigationLabel} className="flex flex-wrap gap-4">
            {navigation.map((link, index) => (
              <CmsLink
                key={index}
                link={link}
                className="underline-offset-4 hover:underline"
              />
            ))}
          </nav>
        ) : null}
        {children}
      </div>
    </footer>
  );
}
