import { expect, test } from "@playwright/test";

import { authHeaders, signIn } from "./cms";

interface CreatedPage {
  id: number;
  layout: { id: string }[];
}

function readDoc(body: unknown): CreatedPage {
  if (typeof body === "object" && body !== null && "doc" in body) {
    // SAFETY: the CMS returns the saved document under `doc`.
    return body.doc as CreatedPage;
  }
  throw new Error("The CMS response has no document.");
}

test("a published CMS page is served in both languages and follows edits", async ({
  browser,
  page,
  request,
}) => {
  const headers = authHeaders(await signIn(request));
  const slug = `e2e-${Date.now()}`;

  const created = await request.post("/api/pages?locale=cs", {
    headers,
    data: {
      title: "Testovací stránka",
      slug,
      _status: "published",
      layout: [
        { blockType: "hero", heading: "Český nadpis", lead: "Úvodní text" },
        {
          blockType: "callToAction",
          heading: "Ozvěte se",
          link: { type: "custom", url: "/kontakt", label: "Na ukázku" },
        },
      ],
    },
  });
  expect(created.ok()).toBe(true);
  const doc = readDoc(await created.json());
  const [hero, cta] = doc.layout;

  const translated = await request.patch(`/api/pages/${doc.id}?locale=en`, {
    headers,
    data: {
      title: "Test page",
      layout: [
        { id: hero?.id, blockType: "hero", heading: "English heading" },
        {
          id: cta?.id,
          blockType: "callToAction",
          heading: "Get in touch",
          link: { type: "custom", url: "/kontakt", label: "To the example" },
        },
      ],
    },
  });
  expect(translated.ok()).toBe(true);

  await page.goto(`/${slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Český nadpis",
  );
  await expect(page.getByRole("link", { name: "Na ukázku" })).toHaveAttribute(
    "href",
    "/kontakt",
  );

  await page.goto(`/en/${slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "English heading",
  );
  // Internal links keep the visitor's language.
  await expect(
    page.getByRole("link", { name: "To the example" }),
  ).toHaveAttribute("href", "/en/kontakt");

  // An edit reaches the cached page without a redeploy.
  const edited = await request.patch(`/api/pages/${doc.id}?locale=cs`, {
    headers,
    data: {
      layout: [
        { id: hero?.id, blockType: "hero", heading: "Upravený nadpis" },
        {
          id: cta?.id,
          blockType: "callToAction",
          heading: "Ozvěte se",
          link: { type: "custom", url: "/kontakt", label: "Na ukázku" },
        },
      ],
    },
  });
  expect(edited.ok()).toBe(true);

  // The first page remembers the English visit and would be redirected to it,
  // so a new visitor checks the Czech address.
  const visitor = await browser.newContext({ locale: "cs-CZ" });
  const fresh = await visitor.newPage();

  await fresh.goto(`/${slug}`);
  await expect(fresh).toHaveURL(new RegExp(`/${slug}$`));
  await expect(fresh.getByRole("heading", { level: 1 })).toHaveText(
    "Upravený nadpis",
  );

  // A deleted page is gone from the site.
  const deleted = await request.delete(`/api/pages/${doc.id}`, { headers });
  expect(deleted.ok()).toBe(true);

  const response = await fresh.goto(`/${slug}`);
  expect(response?.status()).toBe(404);
  await visitor.close();
});

test("an unknown address is a translated 404", async ({ browser }) => {
  const czech = await browser.newContext({ locale: "cs-CZ" });
  const czechPage = await czech.newPage();
  const response = await czechPage.goto("/this-page-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(czechPage.getByRole("heading", { level: 1 })).toHaveText(
    "Stránka nenalezena",
  );
  await czech.close();

  const english = await browser.newContext({ locale: "en-US" });
  const englishPage = await english.newPage();
  await englishPage.goto("/en/this-page-does-not-exist");

  await expect(englishPage.getByRole("heading", { level: 1 })).toHaveText(
    "Page not found",
  );
  await english.close();
});
