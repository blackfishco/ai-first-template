import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";

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
import { Link } from "@/i18n/navigation";

export default function Home() {
  const t = useTranslations("HomePage");

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
