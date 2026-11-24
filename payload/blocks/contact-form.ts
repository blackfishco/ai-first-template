import type { Block } from "payload";

/** The contact form with an optional heading and introduction. */
export const ContactFormBlock: Block = {
  slug: "contactForm",
  interfaceName: "ContactFormBlock",
  labels: {
    singular: { cs: "Kontaktní formulář", en: "Contact form" },
    plural: { cs: "Kontaktní formuláře", en: "Contact forms" },
  },
  fields: [
    {
      name: "heading",
      label: { cs: "Nadpis", en: "Heading" },
      type: "text",
      localized: true,
    },
    {
      name: "text",
      label: { cs: "Úvodní text", en: "Introduction" },
      type: "textarea",
      localized: true,
    },
  ],
};
