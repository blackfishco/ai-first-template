import { expect, test } from "@playwright/test";

test("home page renders and links to the example", async ({ page }) => {
  await page.goto("/cs");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.getByRole("link", { name: "Otevřít ukázku" }).click();
  await expect(page).toHaveURL(/\/cs\/example$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
