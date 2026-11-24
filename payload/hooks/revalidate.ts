import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload";

import type { CacheTag } from "../../lib/cache-tags";
import {
  affectsPublishedContent,
  revalidateCms,
} from "../../lib/cms/revalidate";

interface Doc {
  slug?: string | null;
  _status?: "draft" | "published" | null;
}

type TagsFor = (doc: Doc, previous?: Doc) => CacheTag[];

/**
 * `afterChange` and `afterDelete` hooks that revalidate the cache tags of a
 * collection document. Tags only, never a blind `revalidatePath("/")`.
 */
export function revalidateCollection(tagsFor: TagsFor): {
  afterChange: CollectionAfterChangeHook<Doc & { id: number | string }>;
  afterDelete: CollectionAfterDeleteHook<Doc & { id: number | string }>;
} {
  return {
    afterChange: ({ doc, previousDoc, req }) => {
      if (affectsPublishedContent(doc, previousDoc)) {
        revalidateCms(tagsFor(doc, previousDoc), req.context);
      }
      return doc;
    },
    afterDelete: ({ doc, req }) => {
      revalidateCms(tagsFor(doc), req.context);
      return doc;
    },
  };
}

function statusOf(value: unknown): Doc {
  if (typeof value !== "object" || value === null || !("_status" in value)) {
    return {};
  }
  const status = value._status;
  return status === "draft" || status === "published"
    ? { _status: status }
    : {};
}

/** `afterChange` hook for a global. Drafts do not reach visitors. */
export function revalidateGlobal(
  tags: readonly CacheTag[],
): GlobalAfterChangeHook {
  return ({ doc, previousDoc, req }) => {
    const current: unknown = doc;
    const previous: unknown = previousDoc;
    if (affectsPublishedContent(statusOf(current), statusOf(previous))) {
      revalidateCms(tags, req.context);
    }
  };
}
