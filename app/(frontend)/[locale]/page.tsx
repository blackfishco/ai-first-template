import { ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CmsPage } from "@/features/pages/components/cms-page";
import { getPageMetadata } from "@/features/pages/server/get-page-metadata";
import { Link } from "@/i18n/navigation";
import { HOME_SLUG } from "@/lib/slug";

export function generateMetadata(): Promise<Metadata> {
  return getPageMetadata(HOME_SLUG);
}

/** The CMS page with the slug `home`, or the starter page until it exists. */
export default function Home() {
  return <CmsPage slug={HOME_SLUG} fallback={<Starter />} />;
}

async function Starter() {
  const t = await getTranslations("HomePage");

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-12 sm:py-20">
      <header className="flex max-w-2xl flex-col items-start gap-5">
        <Badge variant="secondary">{t("badge")}</Badge>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          {t("description")}
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle><h2>{t("exampleTitle")}</h2></CardTitle>
          <CardDescription>{t("exampleDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{t("exampleContent")}</p>
        </CardContent>
        <CardFooter>
          <Link href="/example" className={buttonVariants()}>
            {t("openExample")}
            <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
          </Link>
        </CardFooter>
      </Card>
      <p className="text-sm text-muted-foreground">{t("footer")}</p>
    </main>
  );
}
