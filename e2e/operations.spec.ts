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
