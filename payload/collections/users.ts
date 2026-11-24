import type { CollectionConfig } from "payload";

/**
 * Accounts that sign in to the CMS admin. Site visitors are not users of this
 * collection; see docs/architecture.md before adding end-user accounts.
 */
export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: { cs: "Uživatel", en: "User" },
    plural: { cs: "Uživatelé", en: "Users" },
  },
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  fields: [],
};
