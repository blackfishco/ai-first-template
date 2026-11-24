import { expect, test } from "@playwright/test";

test("home page renders and links to the example", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.getByRole("link", { name: "Otevřít ukázku" }).click();
  await expect(page).toHaveURL(/\/example$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("language switcher keeps the page and changes the language", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "cs");

  await page.getByRole("link", { name: "English" }).click();

  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("link", { name: "Open the example" }),
  ).toBeVisible();
});

test("CMS admin loads outside locale routing", async ({ page }) => {
  await page.goto("/admin");

  // A fresh database offers to create the first user; otherwise the login form shows.
  await expect(page).toHaveURL(/\/admin\/(create-first-user|login)$/);
  await expect(page.locator('input[name="email"]')).toBeVisible();
});

test("a browser in another configured language is sent to that language", async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: "en-US" });
  const page = await context.newPage();

  await page.goto("/");

  await expect(page).toHaveURL(/\/en$/);
  await context.close();
});
