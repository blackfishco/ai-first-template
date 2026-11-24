import { notFound } from "next/navigation";

import { CmsPage } from "@/features/pages/components/cms-page";
import { HOME_SLUG, slugProblem } from "@/lib/slug";

/**
 * Pages are rendered on first request and then served from the cache until an
 * editor changes them, so a build needs no content.
 */
export function generateStaticParams() {
  return [];
}

export default async function Page({
  params,
}: PageProps<"/[locale]/[...slug]">) {
  const { slug: segments } = await params;
  const [slug, ...rest] = segments;

  // Pages are not nested, and the home page has only one address: the root.
  if (!slug || rest.length > 0 || slug === HOME_SLUG || slugProblem(slug)) {
    notFound();
  }

  return <CmsPage slug={slug} />;
}
