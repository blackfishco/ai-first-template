import { expect, test } from "@playwright/test";

test("home page renders and links to the example", async ({ page }) => {
  await page.goto("/cs");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.getByRole("link", { name: "Otevřít ukázku" }).click();
  await expect(page).toHaveURL(/\/cs\/example$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("CMS admin loads outside locale routing", async ({ page }) => {
  await page.goto("/admin");

  // A fresh database offers to create the first user; otherwise the login form shows.
  await expect(page).toHaveURL(/\/admin\/(create-first-user|login)$/);
  await expect(page.locator('input[name="email"]')).toBeVisible();
});
