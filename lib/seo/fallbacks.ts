/** Limits search engines show before truncating. */
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;

/** "Page – Site", or just the site name for the home page. */
export function seoTitle(pageTitle: string | null | undefined, siteName: string): string {
  const title = pageTitle?.trim();
  if (!title || title === siteName) return siteName;
  return `${title} – ${siteName}`;
}

/** Cuts a description at a word boundary and marks the cut with an ellipsis. */
export function truncateDescription(
  text: string | null | undefined,
  max = DESCRIPTION_MAX,
): string {
  const clean = (text ?? "").replaceAll(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
