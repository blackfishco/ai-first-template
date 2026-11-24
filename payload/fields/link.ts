import type { Field, GroupField } from "payload";

/** Collections an internal link can point to. Extend it with every routable collection. */
export const LINKABLE_COLLECTIONS = ["pages"] as const;

interface LinkFieldOptions {
  name?: string;
  label?: GroupField["label"];
  /** Set to `false` when the surrounding field already provides the text. */
  withLabel?: boolean;
}

/**
 * A link to a document of the site or to any URL. Render it with `CmsLink`,
 * which resolves the real address including the language.
 */
export function linkField({
  name = "link",
  label = { cs: "Odkaz", en: "Link" },
  withLabel = true,
}: LinkFieldOptions = {}): GroupField {
  const fields: Field[] = [
    {
      type: "row",
      fields: [
        {
          name: "type",
          label: { cs: "Typ odkazu", en: "Link type" },
          type: "radio",
          defaultValue: "reference",
          options: [
            { label: { cs: "Stránka webu", en: "Page of the site" }, value: "reference" },
            { label: { cs: "Vlastní URL", en: "Custom URL" }, value: "custom" },
          ],
          admin: { layout: "horizontal", width: "50%" },
        },
        {
          name: "newTab",
          label: { cs: "Otevřít v novém panelu", en: "Open in a new tab" },
          type: "checkbox",
          admin: { width: "50%", style: { alignSelf: "flex-end" } },
        },
      ],
    },
    {
      name: "reference",
      label: { cs: "Stránka", en: "Page" },
      type: "relationship",
      relationTo: [...LINKABLE_COLLECTIONS],
      required: true,
      admin: {
        condition: (_data, siblingData) => siblingData?.type === "reference",
      },
    },
    {
      name: "url",
      label: { cs: "URL", en: "URL" },
      type: "text",
      required: true,
      admin: {
        condition: (_data, siblingData) => siblingData?.type === "custom",
      },
      validate: (value: string | null | undefined) =>
        !value || /^(https?:\/\/|mailto:|tel:|\/|#)/.test(value)
          ? true
          : "URL musí začínat https://, mailto:, tel:, / nebo #.",
    },
  ];

  if (withLabel) {
    fields.push({
      name: "label",
      label: { cs: "Text odkazu", en: "Link text" },
      type: "text",
      required: true,
      localized: true,
    });
  }

  return {
    name,
    label,
    type: "group",
    interfaceName: "CmsLinkField",
    admin: { hideGutter: true },
    fields,
  };
}
