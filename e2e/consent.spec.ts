import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

// These tests start as a first-time visitor, without the consent cookie the
// other tests get from playwright.config.ts.
test.use({ storageState: { cookies: [], origins: [] } });

const NECESSARY_COOKIES = new Set(["consent", "NEXT_LOCALE"]);

function banner(page: Page) {
  return page.getByRole("region", { name: "Souhlas s cookies" });
}

async function consentValue(page: Page) {
  const cookies = await page.context().cookies();
  return cookies.find((cookie) => cookie.name === "consent")?.value;
}

/** Opens the settings from the footer; it works only once the page is interactive. */
async function openSettings(page: Page) {
  await page
    .getByRole("contentinfo")
    .getByRole("button", { name: "Nastavení cookies" })
    .click();
  const dialog = page.getByRole("dialog", { name: "Nastavení cookies" });
  await expect(dialog).toBeVisible();
  return dialog;
}

test("a first visit asks for consent, and rejecting keeps only necessary cookies", async ({
  page,
}) => {
  await page.goto("/");
  await expect(banner(page)).toBeVisible();

  const accessibility = await new AxeBuilder({ page })
    .include('section[aria-label="Souhlas s cookies"]')
    .analyze();
  expect(
    accessibility.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    ),
  ).toEqual([]);

  // Rejecting is as easy as accepting: a button of the same kind, next to it.
  const accept = banner(page).getByRole("button", { name: "Přijmout vše" });
  const reject = banner(page).getByRole("button", { name: "Odmítnout vše" });
  await expect(reject).toHaveAttribute(
    "class",
    (await accept.getAttribute("class")) ?? "",
  );

  await reject.click();
  await expect(banner(page)).toBeHidden();
  expect(await consentValue(page)).toBe("1.00");
  const cookies = await page.context().cookies();
  expect(cookies.filter((cookie) => !NECESSARY_COOKIES.has(cookie.name))).toEqual(
    [],
  );

  // The choice is remembered: after a reload the page becomes interactive
  // (the footer link works) and the banner stays away.
  await page.reload();
  const dialog = await openSettings(page);
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(banner(page)).toBeHidden();
});

test("accepting all and changing the choice later from the footer", async ({
  page,
}) => {
  await page.goto("/");
  await banner(page).getByRole("button", { name: "Přijmout vše" }).click();
  await expect(banner(page)).toBeHidden();
  expect(await consentValue(page)).toBe("1.11");

  let dialog = await openSettings(page);
  await expect(dialog.getByRole("switch", { name: "Analytické" })).toBeChecked();
  await expect(dialog.getByRole("switch", { name: "Nutné" })).toBeDisabled();

  const accessibility = await new AxeBuilder({ page })
    .include('[data-slot="dialog-content"]')
    .analyze();
  expect(
    accessibility.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    ),
  ).toEqual([]);

  await dialog.getByRole("switch", { name: "Marketingové" }).click();
  await dialog.getByRole("button", { name: "Uložit nastavení" }).click();
  await expect(dialog).toBeHidden();
  expect(await consentValue(page)).toBe("1.10");

  dialog = await openSettings(page);
  await expect(dialog.getByRole("switch", { name: "Marketingové" })).not.toBeChecked();
});

test("a visitor can choose categories straight from the banner", async ({
  page,
}) => {
  await page.goto("/");
  await banner(page).getByRole("button", { name: "Nastavit" }).click();

  const dialog = page.getByRole("dialog", { name: "Nastavení cookies" });
  await expect(dialog.getByRole("switch", { name: "Analytické" })).not.toBeChecked();
  await dialog.getByRole("switch", { name: "Analytické" }).click();
  await dialog.getByRole("button", { name: "Uložit nastavení" }).click();

  await expect(dialog).toBeHidden();
  await expect(banner(page)).toBeHidden();
  expect(await consentValue(page)).toBe("1.10");
});
