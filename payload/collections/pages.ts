import type { CollectionConfig } from "payload";

import { tagsForPageChange } from "../../lib/cache-tags";
import { HOME_SLUG } from "../../lib/slug";
import { publishedOrEditor } from "../access/published";
import { isEditor } from "../access/roles";
import { PAGE_BLOCKS } from "../blocks/page-blocks";
import { slugField } from "../fields/slug";
import { revalidateCollection } from "../hooks/revalidate";
import { redirectAfterSlugChange } from "../hooks/slug-redirect";

const revalidate = revalidateCollection(tagsForPageChange);

/**
 * Pages of the site, composed from blocks. A published page is served at
 * `/<slug>`; the page with the slug `home` is the home page.
 */
export const Pages: CollectionConfig = {
  slug: "pages",
  labels: {
    singular: { cs: "Stránka", en: "Page" },
    plural: { cs: "Stránky", en: "Pages" },
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
    description: {
      cs: `Stránku složíte z bloků. Po publikaci je na adrese /<adresa>; stránka s adresou „${HOME_SLUG}“ je úvodní.`,
      en: `Compose a page from blocks. Once published it is served at /<address>; the page with the address "${HOME_SLUG}" is the home page.`,
    },
  },
  versions: {
    drafts: { autosave: { interval: 2000 }, schedulePublish: true },
    maxPerDoc: 50,
  },
  access: {
    read: publishedOrEditor,
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  hooks: {
    afterChange: [redirectAfterSlugChange, revalidate.afterChange],
    afterDelete: [revalidate.afterDelete],
  },
  fields: [
    {
      name: "title",
      label: { cs: "Název", en: "Title" },
      type: "text",
      required: true,
      localized: true,
    },
    slugField((data) =>
      typeof data.title === "string" ? data.title : undefined,
    ),
    {
      name: "layout",
      label: { cs: "Obsah stránky", en: "Page content" },
      type: "blocks",
      blocks: PAGE_BLOCKS,
      localized: false,
    },
  ],
};
