import type { FieldHook, TextField } from "payload";

import { slugify, slugProblem, uniqueSlug } from "../../lib/slug";

/**
 * Slug field: generated from `source(data)` when left empty, editable, and
 * unique within the collection (collisions get `-2`, `-3`, …). An empty value
 * is stored as `null`, because a unique index allows many NULLs but only one
 * empty string.
 */
export function slugField(
  source: (data: Record<string, unknown>) => string | undefined,
): TextField {
  const generate: FieldHook = async ({
    collection,
    data,
    originalDoc,
    req,
    value,
  }) => {
    const original: unknown = originalDoc;
    const previous: Record<string, unknown> =
      typeof original === "object" && original !== null ? { ...original } : {};
    const merged = { ...previous, ...data };
    const typed = typeof value === "string" && value ? value : undefined;
    const base = slugify(typed ?? source(merged) ?? "");
    if (!base || !collection) return null;

    const id = previous.id;
    const hasId = typeof id === "number" || typeof id === "string";

    return uniqueSlug(base, async (candidate) => {
      const { totalDocs } = await req.payload.count({
        collection: collection.slug,
        where: hasId
          ? { and: [{ slug: { equals: candidate } }, { id: { not_equals: id } }] }
          : { slug: { equals: candidate } },
        req,
      });
      return totalDocs > 0;
    });
  };

  return {
    name: "slug",
    label: { cs: "Adresa (slug)", en: "Address (slug)" },
    type: "text",
    unique: true,
    index: true,
    admin: {
      position: "sidebar",
      description: {
        cs: "Část URL. Když ji necháte prázdnou, vytvoří se z názvu. Změna rozbije staré odkazy.",
        en: "Part of the URL. Left empty, it is created from the title. Changing it breaks old links.",
      },
    },
    hooks: { beforeValidate: [generate] },
    validate: (value: string | null | undefined) => {
      const problem = slugProblem(value);
      if (problem === "reserved") return "Tuto adresu používá pevná část webu.";
      if (problem === "format") {
        return "Adresa smí obsahovat jen malá písmena, číslice a pomlčky.";
      }
      return true;
    },
  };
}
