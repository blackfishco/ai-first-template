import type { Block } from "payload";

import { linkField } from "../fields/link";

/** A short prompt with one button. */
export const CallToActionBlock: Block = {
  slug: "callToAction",
  interfaceName: "CallToActionBlock",
  // Short table name: Postgres truncates identifiers at 63 characters.
  dbName: "cta",
  labels: {
    singular: { cs: "Výzva k akci", en: "Call to action" },
    plural: { cs: "Výzvy k akci", en: "Calls to action" },
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
      name: "text",
      label: { cs: "Text", en: "Text" },
      type: "textarea",
      localized: true,
    },
    linkField(),
  ],
};
