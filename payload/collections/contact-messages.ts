import type { CollectionConfig } from "payload";

import { isAdmin, isEditor } from "../access/roles";

/**
 * Messages visitors send through the contact form. The site writes them with
 * a system call after validating the input (features/contact); the public API
 * cannot create, read, or change them.
 */
export const ContactMessages: CollectionConfig = {
  slug: "contact-messages",
  labels: {
    singular: { cs: "Zpráva z webu", en: "Contact message" },
    plural: { cs: "Zprávy z webu", en: "Contact messages" },
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "createdAt"],
  },
  access: {
    read: isEditor,
    create: () => false,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    { name: "name", label: { cs: "Jméno", en: "Name" }, type: "text", required: true },
    { name: "email", label: { cs: "E-mail", en: "E-mail" }, type: "email", required: true },
    {
      name: "message",
      label: { cs: "Zpráva", en: "Message" },
      type: "textarea",
      required: true,
    },
    {
      name: "locale",
      label: { cs: "Jazyk webu", en: "Site language" },
      type: "text",
      admin: { position: "sidebar", readOnly: true },
    },
  ],
};
