import { defineConfig, devices } from "@playwright/test";

const port = 3000;
const baseURL = `http://127.0.0.1:${port}`;

// Set when the environment ships its own Chromium instead of Playwright's download.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: "./e2e",
  // The tests write to one CMS and read one site, so they run one at a time.
  // In parallel, a test that changes shared content (site settings) races
  // with tests that render the same pages.
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "off",
    // The site redirects by browser language; tests start in the default one.
    locale: "cs-CZ",
    // Visitors in tests have already answered the cookie banner (rejected
    // all), so it does not cover the page. e2e/consent.spec.ts starts clean.
    storageState: {
      cookies: [
        {
          name: "consent",
          value: "1.00",
          domain: "127.0.0.1",
          path: "/",
          expires: -1,
          httpOnly: false,
          secure: false,
          sameSite: "Lax",
        },
      ],
      origins: [],
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: executablePath ? { executablePath } : {},
      },
    },
  ],
  // Tests run against the production build, not the dev server.
  webServer: {
    command: `pnpm start --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    // Fixed test-only secret; e2e/preview.spec.ts uses the same value.
    env: {
      PREVIEW_SECRET: "e2e-preview-secret-0000000000000000",
      // e2e/analytics.spec.ts checks the Google tag; requests to Google are intercepted.
      ANALYTICS_ENABLED: "true",
    },
    timeout: 60_000,
  },
});
