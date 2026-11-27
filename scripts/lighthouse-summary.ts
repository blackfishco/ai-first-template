import { appendFileSync, existsSync, readFileSync } from "node:fs";

/**
 * Prints the Lighthouse scores of the representative runs as a Markdown
 * table, to the GitHub job summary when there is one, else to stdout.
 * Run after `lhci autorun`: `node scripts/lighthouse-summary.ts`.
 */
interface ManifestEntry {
  url: string;
  isRepresentativeRun: boolean;
  summary: Record<string, number>;
}

const MANIFEST = ".lighthouseci/reports/manifest.json";
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

if (!existsSync(MANIFEST)) {
  console.error(`No Lighthouse results at ${MANIFEST}.`);
  process.exit(1);
}

const entries = JSON.parse(readFileSync(MANIFEST, "utf8")) as ManifestEntry[];
const rows = entries
  .filter((entry) => entry.isRepresentativeRun)
  .map((entry) => {
    const scores = CATEGORIES.map((category) =>
      String(Math.round((entry.summary[category] ?? 0) * 100)),
    );
    return `| ${new URL(entry.url).pathname} | ${scores.join(" | ")} |`;
  });

const table = [
  "### Lighthouse",
  "",
  `| Page | ${CATEGORIES.join(" | ")} |`,
  `| --- | ${CATEGORIES.map(() => "---").join(" | ")} |`,
  ...rows,
  "",
  "Budgets: accessibility, best practices and SEO 100, performance at least 95; see docs/verification.md. Full reports are in the job's artifacts.",
  "",
].join("\n");

const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (summaryFile) appendFileSync(summaryFile, table);
console.log(table);
