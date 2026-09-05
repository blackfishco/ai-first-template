import { useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/skeleton";

export default function ExampleLoading() {
  const t = useTranslations("Example");

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-12" aria-busy="true">
      <p role="status">{t("loading")}</p>
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-72 w-full" />
    </main>
  );
}
