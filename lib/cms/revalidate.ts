import { revalidateTag } from "next/cache";

import type { CacheTag } from "../cache-tags";

/**
 * An editor's change must be visible right after saving, so the next request
 * waits for fresh data instead of getting the stale copy. Publishing is rare
 * and the blocking request is cheap.
 */
const AFTER_PUBLISH = { expire: 0 } as const;

/**
 * Marks cached CMS data stale after a save or delete. Pass
 * `context: { disableRevalidate: true }` wherever the CMS runs outside a
 * Next.js request: seeds, scripts, and tests.
 */
export function revalidateCms(
  tags: readonly CacheTag[],
  context: Record<string, unknown> | undefined,
): void {
  if (context?.disableRevalidate) return;
  for (const tag of new Set(tags)) revalidateTag(tag, AFTER_PUBLISH);
}

interface Versioned {
  _status?: "draft" | "published" | null;
}

/**
 * Only a change of the published version reaches visitors: a publish, an
 * unpublish, or a delete. Autosaved drafts of a never-published document
 * change nothing they can see.
 */
export function affectsPublishedContent(
  doc: Versioned | null | undefined,
  previousDoc?: Versioned | null,
): boolean {
  // A collection without drafts has no status; every save is public.
  if (!doc?._status) return true;
  return doc._status === "published" || previousDoc?._status === "published";
}
