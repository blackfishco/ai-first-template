import { expect, test } from "@playwright/test";

import { authHeaders, signIn } from "./cms";

test("the contact form validates input and stores a message", async ({
  browser,
  request,
}) => {
  const headers = authHeaders(await signIn(request));
  const slug = `contact-${Date.now()}`;

  const created = await request.post("/api/pages?locale=cs", {
    headers,
    data: {
      title: "Kontakt",
      slug,
      _status: "published",
      layout: [{ blockType: "contactForm", heading: "Napište nám" }],
    },
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
      ? String(body.doc.id)
      : "";

  const visitor = await browser.newContext({ locale: "cs-CZ" });
  const page = await visitor.newPage();
  await page.goto(`/${slug}`);
  await expect(page.getByRole("heading", { name: "Napište nám" })).toBeVisible();

  // An empty form shows a translated error at each field and sends nothing.
  await page.getByRole("button", { name: "Odeslat zprávu" }).click();
  await expect(page.getByText("Vyplňte toto pole.").first()).toBeVisible();
  await expect(page.getByLabel("Jméno")).toHaveAttribute("aria-invalid", "true");

  await page.getByLabel("Jméno").fill("Jana Nováková");
  await page.getByLabel("E-mail").fill("neplatny");
  await page.getByLabel("Zpráva").fill("Dobrý den, mám dotaz k vašim službám.");
  await page.getByRole("button", { name: "Odeslat zprávu" }).click();
  await expect(
    page.getByText("Zadejte platnou e-mailovou adresu."),
  ).toBeVisible();

  const email = `jana-${Date.now()}@example.com`;
  await page.getByLabel("E-mail").fill(email);
  await page.getByRole("button", { name: "Odeslat zprávu" }).click();
  await expect(page.getByRole("status")).toContainText("zpráva je odeslaná");
  // A sent form is cleared.
  await expect(page.getByLabel("Zpráva")).toHaveValue("");

  // A visitor cannot read stored messages; an editor finds the new one.
  expect((await visitor.request.get("/api/contact-messages")).status()).toBe(
    403,
  );
  await visitor.close();

  const stored = await request.get(
    `/api/contact-messages?where[email][equals]=${encodeURIComponent(email)}`,
    { headers },
  );
  const list: unknown = await stored.json();
  const docs =
    typeof list === "object" && list !== null && "docs" in list
      ? list.docs
      : [];
  expect(Array.isArray(docs) ? docs.length : 0).toBe(1);

  expect((await request.delete(`/api/pages/${pageId}`, { headers })).ok()).toBe(
    true,
  );
});
