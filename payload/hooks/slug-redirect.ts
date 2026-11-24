import type { CollectionAfterChangeHook, PayloadRequest } from "payload";

import { pagePathFromSlug } from "../../lib/redirects/paths";
import type { Page } from "../../payload-types";

/**
 * The slug visitors knew: from the last published version before this save.
 * `previousDoc` is not enough, because with autosave it is the latest draft.
 */
async function lastPublishedSlug(
  req: PayloadRequest,
  doc: Page,
): Promise<string | null | undefined> {
  const { docs } = await req.payload.findVersions({
    collection: "pages",
    where: {
      and: [
        { parent: { equals: doc.id } },
        { "version._status": { equals: "published" } },
        { "version.updatedAt": { less_than: doc.updatedAt } },
      ],
    },
    sort: "-version.updatedAt",
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  });
  return docs[0]?.version.slug;
}

/**
 * When a published page gets a new slug, its old address redirects to it. The
 * redirect points to the page, not to a path, so later renames never form a
 * chain. A redirect from the new address is removed, because it would hide the
 * page, and custom redirects to the old address are pointed to the new one.
 */
export const redirectAfterSlugChange: CollectionAfterChangeHook<Page> = async ({
  doc,
  operation,
  req,
}) => {
  // Drafts are not on the site; only a published address can be linked from outside.
  if (operation !== "update" || doc._status !== "published" || !doc.slug) {
    return doc;
  }

  const oldSlug = await lastPublishedSlug(req, doc);
  if (!oldSlug || oldSlug === doc.slug) return doc;

  const oldPath = pagePathFromSlug(oldSlug);
  const newPath = pagePathFromSlug(doc.slug);
  // The redirect is a system write on behalf of the rename.
  const options = { req, overrideAccess: true, depth: 0 } as const;

  try {
    await req.payload.delete({
      collection: "redirects",
      where: { from: { equals: newPath } },
      ...options,
    });

    const pointingToOld = await req.payload.find({
      collection: "redirects",
      where: {
        and: [
          { "to.type": { equals: "custom" } },
          { "to.url": { equals: oldPath } },
        ],
      },
      pagination: false,
      ...options,
    });
    for (const redirect of pointingToOld.docs) {
      await req.payload.update({
        collection: "redirects",
        id: redirect.id,
        data: { to: { type: "custom", url: newPath } },
        ...options,
      });
    }

    const data = {
      from: oldPath,
      to: {
        type: "reference" as const,
        reference: { relationTo: "pages" as const, value: doc.id },
      },
      type: "301" as const,
    };
    const existing = await req.payload.find({
      collection: "redirects",
      where: { from: { equals: oldPath } },
      limit: 1,
      ...options,
    });
    const current = existing.docs[0];
    await (current
      ? req.payload.update({
          collection: "redirects",
          id: current.id,
          data,
          ...options,
        })
      : req.payload.create({ collection: "redirects", data, ...options }));
  } catch (error) {
    // The rename must not fail because of a redirect; an editor can add it by hand.
    req.payload.logger.warn({
      err: error,
      msg: `Could not create the redirect ${oldPath} → ${newPath}.`,
    });
  }

  return doc;
};
