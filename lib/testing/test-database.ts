/**
 * The integration suite migrates and deletes data, so it only runs against a
 * database whose name ends with `_test`. Returns the reason to refuse, or
 * `null` when the database is safe to use.
 */
export function testDatabaseProblem(url: string | undefined): string | null {
  if (!url) return "Integration tests need DATABASE_URL.";

  if (!URL.canParse(url)) return "DATABASE_URL is not a valid address.";

  const database = decodeURIComponent(new URL(url).pathname.slice(1));
  if (!database.endsWith("_test")) {
    return `Integration tests delete data and only run against a database named *_test (got "${database}"). Run them as DATABASE_URL=…/<name>_test pnpm test:int.`;
  }
  return null;
}
