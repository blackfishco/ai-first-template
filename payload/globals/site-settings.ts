import type { GlobalConfig } from "payload";

import { validateTagId } from "../../lib/analytics/tag-id";
import { CACHE_TAGS } from "../../lib/cache-tags";
import { isEditor } from "../access/roles";
import { linkField } from "../fields/link";
import { revalidateGlobal } from "../hooks/revalidate";

const MAX_NAV_ITEMS = 8;

/** Site-wide content: the site name, header and footer navigation, default share image. */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: { cs: "Nastavení webu", en: "Site settings" },
  access: {
    read: () => true,
    update: isEditor,
  },
  hooks: {
    afterChange: [revalidateGlobal([CACHE_TAGS.siteSettings])],
  },
  fields: [
    {
      name: "siteName",
      label: { cs: "Název webu", en: "Site name" },
      type: "text",
      localized: true,
      admin: {
        description: {
          cs: "Zobrazuje se v hlavičce a v titulku stránek.",
          en: "Shown in the header and in page titles.",
        },
      },
    },
    {
      name: "headerNav",
      label: { cs: "Navigace v hlavičce", en: "Header navigation" },
      labels: {
        singular: { cs: "Položka", en: "Item" },
        plural: { cs: "Položky", en: "Items" },
      },
      type: "array",
      maxRows: MAX_NAV_ITEMS,
      // Short table names: Postgres truncates identifiers at 63 characters.
      dbName: "header_nav",
      fields: [linkField()],
    },
    {
      name: "footerNav",
      label: { cs: "Odkazy v patičce", en: "Footer links" },
      labels: {
        singular: { cs: "Položka", en: "Item" },
        plural: { cs: "Položky", en: "Items" },
      },
      type: "array",
      maxRows: MAX_NAV_ITEMS,
      dbName: "footer_nav",
      fields: [linkField()],
    },
    {
      name: "defaultShareImage",
      label: { cs: "Výchozí obrázek pro sdílení", en: "Default share image" },
      type: "upload",
      relationTo: "media",
      admin: {
        description: {
          cs: "Použije se při sdílení stránky, která nemá vlastní obrázek.",
          en: "Used when a shared page has no image of its own.",
        },
      },
    },
    {
      name: "analyticsTagId",
      label: { cs: "Google Tag Manager nebo GA4", en: "Google Tag Manager or GA4" },
      type: "text",
      validate: validateTagId,
      admin: {
        position: "sidebar",
        placeholder: "GTM-XXXXXXX",
        description: {
          cs: "ID kontejneru (GTM-…) nebo měřicí ID (G-…). Načte se jen na produkci a jen po souhlasu návštěvníka. Prázdné pole analytiku vypne.",
          en: "Container ID (GTM-…) or measurement ID (G-…). Loads only on production and only after the visitor consents. Leave empty to switch analytics off.",
        },
      },
    },
  ],
};
