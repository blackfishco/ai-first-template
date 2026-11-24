import { expect, test } from "@playwright/test";

import { authHeaders, signIn } from "./cms";

test("header navigation from the CMS links to pages in the visitor's language", async ({
  browser,
  request,
}) => {
  const headers = authHeaders(await signIn(request));
  const slug = `nav-${Date.now()}`;

  const created = await request.post("/api/pages?locale=cs", {
    headers,
    data: { title: "Navigace", slug, _status: "published" },
  });
  expect(created.ok()).toBe(true);
  const body: unknown = await created.json();
  const pageId =
    typeof body === "object" &&
    body !== null &&
    "doc" in body &&
    typeof body.doc === "object" &&
    body.doc !== null &&
    "id" in body.doc
      ? body.doc.id
      : undefined;
  expect(typeof pageId).toBe("number");

  const saved = await request.post("/api/globals/site-settings?locale=cs", {
    headers,
    data: {
      siteName: "Testovací web",
      headerNav: [
        {
          link: {
            type: "reference",
            reference: { relationTo: "pages", value: pageId },
            label: "Navigace",
          },
        },
      ],
    },
  });
  expect(saved.ok()).toBe(true);

  const czech = await browser.newContext({ locale: "cs-CZ" });
  const czechPage = await czech.newPage();
  await czechPage.goto("/");
  await expect(
    czechPage.getByRole("banner").getByRole("link", { name: "Testovací web" }),
  ).toBeVisible();
  await expect(
    czechPage.getByRole("banner").getByRole("link", { name: "Navigace" }),
  ).toHaveAttribute("href", `/${slug}`);
  await czech.close();

  // The label is localized; English falls back to the default language.
  const english = await browser.newContext({ locale: "en-US" });
  const englishPage = await english.newPage();
  await englishPage.goto("/en");
  await expect(
    englishPage.getByRole("banner").getByRole("link", { name: "Navigace" }),
  ).toHaveAttribute("href", `/en/${slug}`);
  await english.close();

  // Leave the shared settings and content as they were.
  const reset = await request.post("/api/globals/site-settings?locale=cs", {
    headers,
    data: { siteName: null, headerNav: [] },
  });
  expect(reset.ok()).toBe(true);
  const deleted = await request.delete(`/api/pages/${String(pageId)}`, {
    headers,
  });
  expect(deleted.ok()).toBe(true);
});
