import { expect, test } from "@playwright/test";

import { authHeaders, signIn } from "./cms";

test("a page carries its SEO fields, language alternates and a canonical address", async ({
  browser,
  request,
}) => {
  const headers = authHeaders(await signIn(request));
  const slug = `seo-${Date.now()}`;

  const created = await request.post("/api/pages?locale=cs", {
    headers,
    data: {
      title: "SEO stránka",
      slug,
      _status: "published",
      meta: { title: "Vlastní titulek", description: "Vlastní popis stránky." },
    },
  });
  expect(created.ok()).toBe(true);
  const body: unknown = await created.json();
  const id =
    typeof body === "object" &&
    body !== null &&
    "doc" in body &&
    typeof body.doc === "object" &&
    body.doc !== null &&
    "id" in body.doc
      ? String(body.doc.id)
      : "";

  const visitor = await browser.newContext({ locale: "cs-CZ" });
  const page = await visitor.newPage();
  await page.goto(`/${slug}`);

  await expect(page).toHaveTitle("Vlastní titulek");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Vlastní popis stránky.",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    new RegExp(`/${slug}$`),
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", new RegExp(`/en/${slug}$`));
  await visitor.close();

  const deleted = await request.delete(`/api/pages/${id}`, { headers });
  expect(deleted.ok()).toBe(true);
});

test("a deployment that is not production tells search engines to stay out", async ({
  page,
  request,
}) => {
  const response = await page.goto("/");

  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );

  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).not.toContain("<url>");
});
