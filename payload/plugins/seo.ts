import { seoPlugin } from "@payloadcms/plugin-seo";
import type { Field, Plugin } from "payload";

import {
  DESCRIPTION_MAX,
  TITLE_MAX,
  truncateDescription,
} from "../../lib/seo/fallbacks";

const LIMITS: Record<string, number> = {
  title: TITLE_MAX,
  description: DESCRIPTION_MAX,
};

function limitDescription(max: number) {
  return {
    cs: `Nejvýše ${max} znaků. Prázdné pole nahradí web automatickou hodnotou.`,
    en: `Up to ${max} characters. Left empty, the site uses an automatic value.`,
  };
}

/** Reads a property of a document whose shape the plugin does not type. */
function readProperty(doc: unknown, key: string): unknown {
  return typeof doc === "object" && doc !== null && key in doc
    ? Object.entries(doc).find(([name]) => name === key)?.[1]
    : undefined;
}

/** Adds the length limit search engines show to the title and description fields. */
function withLimit(field: Field): Field {
  if (field.type === "text" && field.name in LIMITS) {
    const max = LIMITS[field.name];
    return {
      ...field,
      maxLength: max,
      admin: { ...field.admin, description: limitDescription(max ?? 0) },
    };
  }
  if (field.type === "textarea" && field.name in LIMITS) {
    const max = LIMITS[field.name];
    return {
      ...field,
      maxLength: max,
      admin: { ...field.admin, description: limitDescription(max ?? 0) },
    };
  }
  return field;
}

/**
 * SEO fields on pages: title, description, share image, and a noindex switch.
 * The "generate" buttons use the same fallbacks as the site (lib/seo).
 */
export const seo: Plugin = seoPlugin({
  collections: ["pages"],
  uploadsCollection: "media",
  tabbedUI: false,
  fields: ({ defaultFields }) => [
    ...defaultFields.map((field) => withLimit(field)),
    {
      name: "noindex",
      label: {
        cs: "Skrýt před vyhledávači (noindex)",
        en: "Hide from search engines (noindex)",
      },
      type: "checkbox",
      defaultValue: false,
    },
  ],
  generateTitle: ({ doc }) => {
    const title = readProperty(doc, "title");
    return typeof title === "string" ? title.slice(0, TITLE_MAX) : "";
  },
  generateDescription: ({ doc }) => {
    const layout = readProperty(doc, "layout");
    if (!Array.isArray(layout)) return "";
    // The lead text of the first hero is the best summary a page has.
    for (const block of layout) {
      const candidate: unknown = block;
      if (
        typeof candidate === "object" &&
        candidate !== null &&
        "lead" in candidate &&
        typeof candidate.lead === "string"
      ) {
        return truncateDescription(candidate.lead);
      }
    }
    return "";
  },
});
