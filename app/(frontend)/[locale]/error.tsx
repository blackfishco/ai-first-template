"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

/**
 * Shown when a page of the site fails unexpectedly. The server already logged
 * the error (instrumentation.ts); visitors see no technical detail.
 */
export default function PageError({ reset }: { reset: () => void }) {
  const t = useTranslations("Errors");

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-12">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>
            <h1>{t("unexpectedTitle")}</h1>
          </EmptyTitle>
          <EmptyDescription>{t("unexpectedDescription")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={reset}>{t("retry")}</Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
