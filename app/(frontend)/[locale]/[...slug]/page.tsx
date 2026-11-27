import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LazyContactForm } from "@/features/contact/components/contact-form-lazy";
import { CmsPage } from "@/features/pages/components/cms-page";
import { getPageMetadata } from "@/features/pages/server/get-page-metadata";
import { env } from "@/lib/env";
import { HOME_SLUG, slugProblem } from "@/lib/slug";

/**
 * Pages are rendered on first request and then served from the cache until an
 * editor changes them, so a build needs no content.
 *
 * With a Content Security Policy on, every page renders per request instead.
 * A route that prerenders nothing at build cannot switch to that later, so the
 * build then renders one probe address: the layout reads the request, and
 * Next.js marks the whole route as rendered per request. The probe is a 404.
 */
export function generateStaticParams() {
  return env.CSP_MODE === "off" ? [] : [{ slug: ["csp-render-per-request"] }];
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/[...slug]">): Promise<Metadata> {
  const { slug: segments } = await params;
  const [slug, ...rest] = segments;
  if (!slug || rest.length > 0 || slugProblem(slug)) return {};
  return getPageMetadata(slug);
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

  return <CmsPage slug={slug} slots={{ contactForm: <LazyContactForm /> }} />;
}
