import type { Block } from "payload";

/** Free text: headings, paragraphs, lists, and links. */
export const RichTextBlock: Block = {
  slug: "richText",
  interfaceName: "RichTextBlock",
  labels: {
    singular: { cs: "Text", en: "Text" },
    plural: { cs: "Texty", en: "Texts" },
  },
  fields: [
    {
      name: "content",
      label: { cs: "Obsah", en: "Content" },
      type: "richText",
      required: true,
      localized: true,
    },
  ],
};
