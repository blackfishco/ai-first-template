import { expect, test } from "@playwright/test";

import { authHeaders, signIn } from "./cms";

test("a renamed page keeps its old address working in every language", async ({
  browser,
  request,
}) => {
  const headers = authHeaders(await signIn(request));
  const stamp = Date.now();
  const oldSlug = `old-${stamp}`;
  const newSlug = `new-${stamp}`;

  const created = await request.post("/api/pages?locale=cs", {
    headers,
    data: {
      title: "Přejmenovaná",
      slug: oldSlug,
      _status: "published",
      layout: [{ blockType: "hero", heading: "Stále tady" }],
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

  const renamed = await request.patch(`/api/pages/${id}?locale=cs`, {
    headers,
    data: { slug: newSlug, _status: "published" },
  });
  expect(renamed.ok()).toBe(true);

  const czech = await browser.newContext({ locale: "cs-CZ" });
  const czechPage = await czech.newPage();
  await czechPage.goto(`/${oldSlug}`);
  await expect(czechPage).toHaveURL(new RegExp(`/${newSlug}$`));
  await expect(czechPage.getByRole("heading", { level: 1 })).toHaveText(
    "Stále tady",
  );
  await czech.close();

  const english = await browser.newContext({ locale: "en-US" });
  const englishPage = await english.newPage();
  await englishPage.goto(`/en/${oldSlug}`);
  await expect(englishPage).toHaveURL(new RegExp(`/en/${newSlug}$`));
  await english.close();

  // Remove the page and the redirect the rename created.
  const redirects = await request.get(
    `/api/redirects?where[from][equals]=/${oldSlug}`,
    { headers },
  );
  const list: unknown = await redirects.json();
  const redirectId =
    typeof list === "object" &&
    list !== null &&
    "docs" in list &&
    Array.isArray(list.docs)
      ? (list.docs as { id: number }[])[0]?.id
      : undefined;
  expect(typeof redirectId).toBe("number");
  expect(
    (
      await request.delete(`/api/redirects/${String(redirectId)}`, { headers })
    ).ok(),
  ).toBe(true);
  expect((await request.delete(`/api/pages/${id}`, { headers })).ok()).toBe(
    true,
  );
});
