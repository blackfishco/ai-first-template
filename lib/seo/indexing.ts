/**
 * Whether search engines may index this deployment. Only the production
 * deployment is indexable; previews, development, and CI never are. On hosts
 * other than Vercel, set `ALLOW_INDEXING=true` on the production instance.
 *
 * Plain module without `server-only`, so next.config.ts can use it too.
 */
export function isIndexable(source: {
  VERCEL_ENV?: string;
  ALLOW_INDEXING?: string | boolean;
}): boolean {
  if (source.VERCEL_ENV) return source.VERCEL_ENV === "production";
  return source.ALLOW_INDEXING === true || source.ALLOW_INDEXING === "true";
}

export const NOINDEX_HEADER = {
  key: "X-Robots-Tag",
  value: "noindex, nofollow",
} as const;
