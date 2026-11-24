/**
 * Guards the integration suite. The tests delete data, so they only run
 * against a database whose name ends with `_test`. `pnpm test:int` applies the
 * committed migrations to it before the suite starts.
 */
export default function setup(): void {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Integration tests need DATABASE_URL.");
  }

  const database = new URL(url).pathname.slice(1);
  if (!database.endsWith("_test")) {
    throw new Error(
      `Integration tests delete data and only run against a database named *_test (got "${database}").`,
    );
  }
}
