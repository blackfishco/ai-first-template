import { expect, test } from "@playwright/test";

import { authHeaders, signIn } from "./cms";

// Matches PREVIEW_SECRET in playwright.config.ts.
const PREVIEW_SECRET = "e2e-preview-secret-0000000000000000";

test("a draft is hidden from visitors and shown to a signed-in editor in preview", async ({
  browser,
  request,
}) => {
  const headers = authHeaders(await signIn(request));
  const slug = `draft-${Date.now()}`;

  const created = await request.post("/api/pages?locale=cs", {
    headers,
    data: {
      title: "Koncept",
      slug,
      _status: "draft",
      layout: [{ blockType: "hero", heading: "Nepublikovaný nadpis" }],
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

  const previewUrl = (secret: string, path = `/${slug}`) =>
    `/api/preview?secret=${secret}&path=${encodeURIComponent(path)}`;

  // A visitor does not see the draft, with or without the preview link.
  const visitor = await browser.newContext({ locale: "cs-CZ" });
  const visitorPage = await visitor.newPage();
  expect((await visitorPage.goto(`/${slug}`))?.status()).toBe(404);
  expect((await visitor.request.get(previewUrl("wrong-secret"))).status()).toBe(
    401,
  );
  // The right secret without a signed-in editor is still refused.
  expect((await visitor.request.get(previewUrl(PREVIEW_SECRET))).status()).toBe(
    403,
  );
  expect((await visitorPage.goto(`/${slug}`))?.status()).toBe(404);
  await visitor.close();

  // A signed-in editor with the secret sees the draft.
  const editor = await browser.newContext({ locale: "cs-CZ" });
  await signIn(editor.request);
  const editorPage = await editor.newPage();

  // The preview route refuses to redirect off the site.
  expect(
    (
      await editor.request.get(previewUrl(PREVIEW_SECRET, "//evil.example"))
    ).status(),
  ).toBe(400);

  await editorPage.goto(previewUrl(PREVIEW_SECRET));
  await expect(editorPage).toHaveURL(new RegExp(`/${slug}$`));
  await expect(editorPage.getByRole("heading", { level: 1 })).toHaveText(
    "Nepublikovaný nadpis",
  );

  // Leaving preview hides the draft again.
  await editorPage.goto(
    `/api/preview/exit?path=${encodeURIComponent(`/${slug}`)}`,
  );
  expect((await editorPage.reload())?.status()).toBe(404);
  await editor.close();

  const deleted = await request.delete(`/api/pages/${id}`, { headers });
  expect(deleted.ok()).toBe(true);
});

test("the jobs endpoint refuses callers without the cron token", async ({
  browser,
}) => {
  const visitor = await browser.newContext();

  const response = await visitor.request.get("/api/payload-jobs/run");

  expect(response.status()).toBe(401);
  await visitor.close();
});
