import { expect, test } from "@playwright/test";

// Same value as the webServer env in playwright.config.ts. Vercel Cron sends
// it as a bearer token when it calls the jobs endpoint (vercel.json).
const CRON_SECRET = "e2e-cron-secret-000000";

test("the jobs endpoint runs due jobs for a caller with the cron token", async ({
  request,
}) => {
  const wrong = await request.get("/api/payload-jobs/run", {
    headers: { Authorization: "Bearer not-the-cron-secret" },
  });
  expect(wrong.status()).toBe(401);

  const cron = await request.get("/api/payload-jobs/run", {
    headers: { Authorization: `Bearer ${CRON_SECRET}` },
  });
  expect(cron.status()).toBe(200);
});
