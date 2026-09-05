import { CircleCheckIcon, InboxIcon, TriangleAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { GalleryInteractions } from "@/components/examples/gallery-interactions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function ExampleGallery() {
  const t = useTranslations("Gallery");

  return (
    <section aria-labelledby="gallery-title" className="flex min-w-0 flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2 id="gallery-title" className="text-2xl font-semibold tracking-tight">
          {t("title")}
        </h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </header>
      <GalleryInteractions />
      <Card>
        <CardHeader>
          <CardTitle><h3>{t("feedbackTitle")}</h3></CardTitle>
          <CardDescription>{t("feedbackDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Alert role="status">
            <CircleCheckIcon aria-hidden="true" />
            <AlertTitle>{t("successTitle")}</AlertTitle>
            <AlertDescription>{t("successDescription")}</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <TriangleAlertIcon aria-hidden="true" />
            <AlertTitle>{t("errorTitle")}</AlertTitle>
            <AlertDescription>{t("errorDescription")}</AlertDescription>
          </Alert>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><InboxIcon aria-hidden="true" /></EmptyMedia>
              <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
              <EmptyDescription>{t("emptyDescription")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    </section>
  );
}
