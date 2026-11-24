import { redirectsPlugin } from "@payloadcms/plugin-redirects";
import {
  type CollectionBeforeValidateHook,
  type Plugin,
  ValidationError,
} from "payload";

import { CACHE_TAGS } from "../../lib/cache-tags";
import { revalidateCms } from "../../lib/cms/revalidate";
import { pagePathFromSlug } from "../../lib/redirects/paths";
import {
  normalizePath,
  type RedirectProblem,
  redirectProblem,
  type RedirectRule,
} from "../../lib/redirects/rules";
import type { Redirect } from "../../payload-types";
import { isAdmin, isEditor } from "../access/roles";

const MESSAGES = {
  format: "Zdroj musí být cesta na tomto webu, například /stara-adresa.",
  self: "Přesměrování nemůže vést samo na sebe.",
  duplicate: "Z této adresy už jedno přesměrování vede.",
  chain:
    "Vzniklo by zřetězené přesměrování. Nastavte cíl přímo na konečnou adresu.",
  page: "Na této adrese je publikovaná stránka. Přesměrování by se nikdy nepoužilo.",
} satisfies Record<RedirectProblem | "page", string>;

type Target = Redirect["to"];

/** Destination of a redirect as a site path or URL; `null` when the linked page is gone. */
function destinationOf(
  to: Target,
  slugById: ReadonlyMap<number, string>,
): string | null {
  if (to?.type === "custom") return to.url ?? null;
  const value = to?.reference?.value;
  const id = typeof value === "object" ? value.id : value;
  const slug =
    typeof value === "object" ? value.slug : slugById.get(Number(id));
  return slug ? pagePathFromSlug(slug) : null;
}

/** Normalizes the source and refuses loops, chains, duplicates, and sources that are live pages. */
const validate: CollectionBeforeValidateHook<Redirect> = async ({
  data,
  originalDoc,
  req,
}) => {
  const merged = { ...originalDoc, ...data };
  if (typeof merged.from !== "string") return data;
  const from = normalizePath(merged.from);

  const options = { req, overrideAccess: true, depth: 0, pagination: false };
  const [pages, redirects] = await Promise.all([
    req.payload.find({
      collection: "pages",
      ...options,
      select: { slug: true, _status: true },
    }),
    req.payload.find({ collection: "redirects", ...options }),
  ]);

  const slugById = new Map(
    pages.docs.flatMap((page) =>
      page.slug ? [[page.id, page.slug] as const] : [],
    ),
  );
  const existing: RedirectRule[] = redirects.docs.map((redirect) => ({
    id: redirect.id,
    from: redirect.from,
    to: destinationOf(redirect.to, slugById),
  }));

  const sourceIsLivePage = pages.docs.some(
    (page) =>
      page._status === "published" &&
      page.slug &&
      pagePathFromSlug(page.slug) === from,
  );
  const problem = sourceIsLivePage
    ? "page"
    : redirectProblem(
        { id: originalDoc?.id, from, to: destinationOf(merged.to, slugById) },
        existing,
      );

  if (problem) {
    throw new ValidationError({
      collection: "redirects",
      errors: [{ path: "from", message: MESSAGES[problem] }],
      req,
    });
  }

  return { ...data, from };
};

/**
 * Redirects managed by editors: from an old path to a page or a URL. They are
 * applied only where the site would answer 404 (lib/redirects/server.ts), so a
 * redirect never hides a page and takes effect without a deploy. Renaming a
 * published page creates one automatically (payload/hooks/slug-redirect.ts).
 */
export const redirects: Plugin = redirectsPlugin({
  collections: ["pages"],
  redirectTypes: ["301", "302"],
  redirectTypeFieldOverride: {
    label: { cs: "Druh přesměrování", en: "Redirect type" },
    defaultValue: "301",
    options: [
      { label: { cs: "Trvalé (301)", en: "Permanent (301)" }, value: "301" },
      { label: { cs: "Dočasné (302)", en: "Temporary (302)" }, value: "302" },
    ],
  },
  overrides: {
    labels: {
      singular: { cs: "Přesměrování", en: "Redirect" },
      plural: { cs: "Přesměrování", en: "Redirects" },
    },
    admin: {
      useAsTitle: "from",
      defaultColumns: ["from", "to.type", "type", "updatedAt"],
      description: {
        cs: "Stará adresa vede na novou stránku. Při změně adresy publikované stránky se přesměrování založí samo.",
        en: "An old address leads to a new page. Renaming a published page creates the redirect automatically.",
      },
    },
    access: {
      read: isEditor,
      create: isEditor,
      update: isEditor,
      delete: isAdmin,
    },
    hooks: {
      beforeValidate: [validate],
      afterChange: [
        ({ req }) => {
          revalidateCms([CACHE_TAGS.redirects], req.context);
        },
      ],
      afterDelete: [
        ({ req }) => {
          revalidateCms([CACHE_TAGS.redirects], req.context);
        },
      ],
    },
  },
});
