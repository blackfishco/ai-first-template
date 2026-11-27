import { expect, type Page, test } from "@playwright/test";

import { authHeaders, signIn } from "./cms";

// A first-time visitor, without the consent cookie the other tests get.
test.use({ storageState: { cookies: [], origins: [] } });

const TAG_ID = "GTM-E2ETEST1";

/** Requests to Google, answered locally so nothing leaves the test. */
async function interceptGoogle(page: Page): Promise<string[]> {
  const requests: string[] = [];
  await page.route("https://www.googletagmanager.com/**", async (route) => {
    requests.push(route.request().url());
    await route.fulfill({ contentType: "text/javascript", body: "" });
  });
  return requests;
}

/** The data layer as plain JSON; gtag commands are `arguments` objects. */
function readDataLayer(page: Page): Promise<unknown[] | null> {
  return page.evaluate(() =>
    window.dataLayer
      ? window.dataLayer.map((entry) =>
          Object.prototype.toString.call(entry) === "[object Arguments]"
            ? Array.from(entry as ArrayLike<unknown>)
            : entry,
        )
      : null,
  );
}

/** Creates a published page and returns its slug. */
async function createPage(
  request: Parameters<typeof signIn>[0],
  slug: string,
  layout: unknown[],
): Promise<void> {
  const headers = authHeaders(await signIn(request));
  const created = await request.post("/api/pages?locale=cs", {
    headers,
    data: { title: slug, slug, _status: "published", layout },
  });
  expect(created.ok()).toBe(true);
}

async function setTagId(
  request: Parameters<typeof signIn>[0],
  id: string | null,
): Promise<void> {
  const headers = authHeaders(await signIn(request));
  const saved = await request.post("/api/globals/site-settings?locale=cs", {
    headers,
    data: { analyticsTagId: id },
  });
  expect(saved.ok()).toBe(true);
}

function banner(page: Page) {
  return page.getByRole("region", { name: "Souhlas s cookies" });
}

test.afterEach(async ({ request }) => {
  await setTagId(request, null);
});

test("without a tag ID nothing from Google loads, even with consent", async ({
  page,
  request,
}) => {
  await setTagId(request, null);
  const requests = await interceptGoogle(page);

  await page.goto("/");
  await banner(page).getByRole("button", { name: "Přijmout vše" }).click();
  await expect(banner(page)).toBeHidden();

  expect(requests).toEqual([]);
  expect(await readDataLayer(page)).toBeNull();
});

test("the tag loads only after consent, tracks navigation, and stops when consent is withdrawn", async ({
  page,
  request,
}) => {
  const stamp = Date.now();
  const first = `analytics-a-${stamp}`;
  const second = `analytics-b-${stamp}`;
  await createPage(request, second, [{ blockType: "hero", heading: "Druhá stránka" }]);
  await createPage(request, first, [
    {
      blockType: "callToAction",
      heading: "Pokračovat",
      link: { type: "custom", url: `/${second}`, label: "Na druhou stránku" },
    },
  ]);
  await setTagId(request, TAG_ID);
  const requests = await interceptGoogle(page);

  // Before consent: no script, no data layer.
  await page.goto(`/${first}`);
  await expect(banner(page)).toBeVisible();
  expect(requests).toEqual([]);
  expect(await readDataLayer(page)).toBeNull();

  await banner(page).getByRole("button", { name: "Přijmout vše" }).click();
  await expect
    .poll(() => requests)
    .toEqual([`https://www.googletagmanager.com/gtm.js?id=${TAG_ID}`]);

  const afterConsent = await readDataLayer(page);
  expect(afterConsent).toContainEqual([
    "consent",
    "default",
    expect.objectContaining({ analytics_storage: "denied" }),
  ]);
  expect(afterConsent).toContainEqual([
    "consent",
    "update",
    expect.objectContaining({ analytics_storage: "granted", ad_storage: "granted" }),
  ]);
  expect(afterConsent).toContainEqual(
    expect.objectContaining({ event: "page_view", page_path: `/${first}` }),
  );

  // Client-side navigation reports a page view without loading the script again.
  await page.getByRole("link", { name: "Na druhou stránku" }).click();
  await expect(page.getByRole("heading", { name: "Druhá stránka" })).toBeVisible();
  await expect
    .poll(() => readDataLayer(page))
    .toContainEqual(
      expect.objectContaining({ event: "page_view", page_path: `/${second}` }),
    );
  expect(requests).toHaveLength(1);

  // Withdrawing consent reloads the page; the tag does not come back.
  const settingsLink = page
    .getByRole("contentinfo")
    .getByRole("button", { name: "Nastavení cookies" });
  await settingsLink.click();
  const dialog = page.getByRole("dialog", { name: "Nastavení cookies" });
  await dialog.getByRole("switch", { name: "Analytické" }).click();
  await Promise.all([
    page.waitForEvent("load"),
    dialog.getByRole("button", { name: "Uložit nastavení" }).click(),
  ]);

  // Interactive again after the reload: the settings open, the tag stays away.
  await settingsLink.click();
  await expect(page.getByRole("dialog", { name: "Nastavení cookies" })).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(await readDataLayer(page)).toBeNull();
});
