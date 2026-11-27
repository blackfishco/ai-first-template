import { expect, test } from "@playwright/test";

test("the health endpoint reports a reachable database without details", async ({
  request,
}) => {
  const response = await request.get("/api/health");

  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
  expect(response.headers()["cache-control"]).toBe("no-store");
});

test("every response carries the security headers", async ({ request }) => {
  const headers = (await request.get("/")).headers();

  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("the CMS client-hint headers stay on the admin", async ({ request }) => {
  const site = (await request.get("/")).headers();
  const admin = (await request.get("/admin/login")).headers();

  // On the site, Critical-CH would make browsers request every first page twice.
  expect(site["critical-ch"]).toBeUndefined();
  expect(admin["critical-ch"]).toContain("Sec-CH-Prefers-Color-Scheme");
});

test("the site sends the Content Security Policy CSP_MODE asks for, and nothing breaks it", async ({
  page,
}) => {
  // Set for the server by the CI job that runs the suite with a policy.
  const mode = process.env.CSP_MODE ?? "off";
  const violations: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /Content.Security.Policy/i.test(message.text())) {
      violations.push(message.text());
    }
  });

  const response = await page.goto("/");
  const headers = response?.headers() ?? {};

  if (mode === "off") {
    expect(headers["content-security-policy"]).toBeUndefined();
    expect(headers["content-security-policy-report-only"]).toBeUndefined();
  } else {
    const name =
      mode === "enforce"
        ? "content-security-policy"
        : "content-security-policy-report-only";
    const nonce = /'nonce-([^']+)'/.exec(headers[name] ?? "")?.[1];
    expect(nonce).toBeTruthy();
    // Every script on the page carries this request's nonce.
    const scriptNonces = await page
      .locator("script")
      .evaluateAll((scripts) =>
        scripts.map((script) => (script as HTMLScriptElement).nonce),
      );
    expect(scriptNonces.length).toBeGreaterThan(0);
    expect(new Set(scriptNonces)).toEqual(new Set([nonce]));
  }

  // The page is interactive: the footer opens the cookie settings.
  await page
    .getByRole("contentinfo")
    .getByRole("button", { name: "Nastavení cookies" })
    .click();
  await expect(page.getByRole("dialog", { name: "Nastavení cookies" })).toBeVisible();

  // The CMS admin is outside the policy and keeps working.
  const admin = await page.goto("/admin");
  expect(admin?.headers()["content-security-policy"]).toBeUndefined();
  await expect(page.locator('input[name="email"]')).toBeVisible();

  expect(violations).toEqual([]);
});
