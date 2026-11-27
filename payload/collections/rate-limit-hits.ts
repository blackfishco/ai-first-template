import type { CollectionConfig } from "payload";

/**
 * One row per accepted request in a rate-limited scope (lib/rate-limit). The
 * key is an HMAC of the client address, never the address itself. Hidden in
 * the admin and closed to every API caller; only system calls touch it.
 */
export const RateLimitHits: CollectionConfig = {
  slug: "rate-limit-hits",
  labels: {
    singular: { cs: "Záznam limitu", en: "Rate limit hit" },
    plural: { cs: "Záznamy limitu", en: "Rate limit hits" },
  },
  admin: { hidden: true },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "scope", type: "text", required: true, index: true },
    { name: "key", type: "text", required: true, index: true },
  ],
};
