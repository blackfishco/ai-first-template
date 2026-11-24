import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { RenderBlocks } from "@/components/sections/render-blocks";
import { getContentLocale } from "@/lib/cms/locale";

import { getPage } from "../server/get-page";

interface CmsPageProps {
  slug: string;
  /** Shown when no published page has this slug. Without it the route is a 404. */
  fallback?: ReactNode;
}

/** Renders the CMS page with the given slug in the request's language. */
export async function CmsPage({ slug, fallback }: CmsPageProps) {
  const locale = await getContentLocale();
  const { isEnabled: draft } = await draftMode();

  const page = await getPage({ slug, locale, draft }).match(
    (found) => found,
    () => {
      // The CMS is part of this app; failing to reach it is not recoverable here.
      throw new Error("The CMS could not be reached while rendering a page.");
    },
  );

  if (!page) {
    if (fallback !== undefined) return fallback;
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-6 py-12 sm:py-20">
      <RenderBlocks blocks={page.blocks} locale={locale} />
    </main>
  );
}
