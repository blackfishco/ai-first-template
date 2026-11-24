import type { Block } from "payload";

/** Opening section of a page: heading, lead text, and an optional image. */
export const HeroBlock: Block = {
  slug: "hero",
  interfaceName: "HeroBlock",
  labels: {
    singular: { cs: "Úvodní sekce", en: "Hero" },
    plural: { cs: "Úvodní sekce", en: "Heroes" },
  },
  fields: [
    {
      name: "heading",
      label: { cs: "Nadpis", en: "Heading" },
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "lead",
      label: { cs: "Úvodní text", en: "Lead text" },
      type: "textarea",
      localized: true,
    },
    {
      name: "image",
      label: { cs: "Obrázek", en: "Image" },
      type: "upload",
      relationTo: "media",
    },
  ],
};
