import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ContactForm } from "@/features/contact/components/contact-form";
import { CmsPage } from "@/features/pages/components/cms-page";
import { getPageMetadata } from "@/features/pages/server/get-page-metadata";
import { HOME_SLUG } from "@/lib/slug";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata(HOME_SLUG);
}

/** The CMS page with the slug `home`, or a pointer to the CMS until it exists. */
export default function Home() {
  return (
    <CmsPage
      slug={HOME_SLUG}
      slots={{ contactForm: <ContactForm /> }}
      fallback={<NoHomePage />}
    />
  );
}

async function NoHomePage() {
  const t = await getTranslations("HomePage");

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-12">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>
            <h1>{t("emptyTitle")}</h1>
          </EmptyTitle>
          <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {/* The admin is outside locale routing, so this is not the localized Link. */}
          <Link href="/admin" className={buttonVariants()}>
            {t("openAdmin")}
          </Link>
        </EmptyContent>
      </Empty>
    </main>
  );
}
