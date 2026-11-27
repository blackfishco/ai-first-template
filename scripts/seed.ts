import { rm } from "node:fs/promises";
import path from "node:path";

import { getPayload, type Payload, type PayloadRequest } from "payload";
import sharp from "sharp";

import { DEFAULT_LOCALE, type Locale, LOCALES } from "../i18n/config";
import { loadServerEnv } from "../lib/env-schema";
import { isSeedAllowed } from "../lib/seed/is-seed-allowed";
import config from "../payload.config";
import {
  SEED_IMAGE_ALT,
  SEED_IMAGE_KEY,
  SEED_NAV_LABELS,
  SEED_SITE_NAME,
  type SeedPage,
  seedPages,
} from "./seed/content";

/**
 * Fills the CMS with demo content: `ALLOW_SEED=true pnpm seed`.
 *
 * - Runs in one transaction: a failure leaves the database as it was.
 * - Idempotent: it finds its own pages by slug and its image by key, and
 *   updates them instead of adding copies.
 * - It overwrites the pages it owns (`home`, `kontakt`) and the site settings.
 *   It touches nothing else.
 * - It writes outside a running site, so it cannot revalidate that site's
 *   cache. It deletes the local Next.js data cache instead; restart a running
 *   server to see the content. On a deployed site, redeploy.
 */

/** Where Next.js keeps cached data between runs, for production and development servers. */
const DATA_CACHE_DIRECTORIES = [".next/cache/fetch-cache", ".next/dev/cache/fetch-cache"];

async function clearLocalDataCache(): Promise<void> {
  await Promise.all(
    DATA_CACHE_DIRECTORIES.map((directory) =>
      rm(path.resolve(import.meta.dirname, "..", directory), {
        recursive: true,
        force: true,
      }),
    ),
  );
}

// Typed as a list of languages so the script also compiles with a single language.
const otherLocales: Locale[] = LOCALES.filter(
  (locale) => locale !== DEFAULT_LOCALE,
);

type SeedRequest = Partial<PayloadRequest>;

async function seedImage(payload: Payload, req: SeedRequest): Promise<number> {
  const existing = await payload.find({
    collection: "media",
    where: { seedKey: { equals: SEED_IMAGE_KEY } },
    limit: 1,
    depth: 0,
    req,
  });
  const found = existing.docs[0];
  if (found) return found.id;

  // Generated here so the repository carries no binary demo asset.
  const data = await sharp({
    create: { width: 1920, height: 960, channels: 3, background: "#1f2a44" },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="960"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset="1" stop-color="#9333ea"/></linearGradient></defs><rect width="1920" height="960" fill="url(#g)"/></svg>`,
        ),
      },
    ])
    .jpeg({ quality: 80 })
    .toBuffer();

  const created = await payload.create({
    collection: "media",
    locale: DEFAULT_LOCALE,
    data: { alt: SEED_IMAGE_ALT[DEFAULT_LOCALE], seedKey: SEED_IMAGE_KEY },
    file: {
      data,
      mimetype: "image/jpeg",
      name: `${SEED_IMAGE_KEY}.jpg`,
      size: data.length,
    },
    req,
  });
  for (const locale of otherLocales) {
    await payload.update({
      collection: "media",
      id: created.id,
      locale,
      data: { alt: SEED_IMAGE_ALT[locale] },
      req,
    });
  }
  return created.id;
}

/** Copies block ids from the saved default-language layout, so other languages update the same rows. */
function withBlockIds(
  layout: SeedPage["content"][Locale]["layout"],
  saved: { id?: string | null }[] | null | undefined,
) {
  return (layout ?? []).map((block, index) => ({
    ...block,
    id: saved?.[index]?.id ?? undefined,
  }));
}

async function seedPage(
  payload: Payload,
  req: SeedRequest,
  page: SeedPage,
): Promise<number> {
  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: page.slug } },
    limit: 1,
    depth: 0,
    req,
  });
  const base = page.content[DEFAULT_LOCALE];
  const data = { ...base, slug: page.slug, _status: "published" as const };
  const found = existing.docs[0];

  // The default language is written first; it creates the block rows.
  const saved = found
    ? await payload.update({
        collection: "pages",
        id: found.id,
        locale: DEFAULT_LOCALE,
        data,
        req,
      })
    : await payload.create({
        collection: "pages",
        locale: DEFAULT_LOCALE,
        data,
        req,
      });

  for (const locale of otherLocales) {
    const content = page.content[locale];
    await payload.update({
      collection: "pages",
      id: saved.id,
      locale,
      data: {
        ...content,
        layout: withBlockIds(content.layout, saved.layout),
        _status: "published",
      },
      req,
    });
  }
  return saved.id;
}

async function seedSiteSettings(
  payload: Payload,
  req: SeedRequest,
  pageIds: Record<string, number>,
  imageId: number,
): Promise<void> {
  const navigation = (locale: Locale) =>
    Object.entries(pageIds).map(([slug, id]) => ({
      link: {
        type: "reference" as const,
        reference: { relationTo: "pages" as const, value: id },
        label: SEED_NAV_LABELS[slug]?.[locale] ?? slug,
      },
    }));

  const saved = await payload.updateGlobal({
    slug: "site-settings",
    locale: DEFAULT_LOCALE,
    data: {
      siteName: SEED_SITE_NAME[DEFAULT_LOCALE],
      headerNav: navigation(DEFAULT_LOCALE),
      footerNav: [],
      defaultShareImage: imageId,
    },
    req,
  });

  for (const locale of otherLocales) {
    await payload.updateGlobal({
      slug: "site-settings",
      locale,
      data: {
        siteName: SEED_SITE_NAME[locale],
        headerNav: navigation(locale).map((item, index) => ({
          ...item,
          id: saved.headerNav?.[index]?.id ?? undefined,
        })),
      },
      req,
    });
  }
}

async function seed(): Promise<void> {
  if (!isSeedAllowed(loadServerEnv(process.env).ALLOW_SEED)) {
    console.error(
      "The seed is off. It overwrites the pages it owns and the site settings, so it runs only with ALLOW_SEED=true:\n\n  ALLOW_SEED=true pnpm seed\n",
    );
    // `payload run` exits with 0 on its own, so the failure is explicit.
    process.exit(1);
  }

  const payload = await getPayload({ config });
  const transactionID = await payload.db.beginTransaction();
  if (transactionID === null) {
    throw new Error("The database adapter did not start a transaction.");
  }
  // The script runs outside a Next.js request, where cache revalidation is unavailable.
  const req: SeedRequest = {
    transactionID,
    context: { disableRevalidate: true },
  };

  let failed = false;
  try {
    const imageId = await seedImage(payload, req);
    const pageIds: Record<string, number> = {};
    for (const page of seedPages()) {
      pageIds[page.slug] = await seedPage(payload, req, page);
    }
    await seedSiteSettings(payload, req, pageIds, imageId);

    await payload.db.commitTransaction(transactionID);
    await clearLocalDataCache();
    payload.logger.info(
      `Seeded ${Object.keys(pageIds).length} pages, 1 image and the site settings in ${LOCALES.length} languages. Restart a running server to see them.`,
    );
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID);
    payload.logger.error({
      err: error,
      msg: "The seed failed; nothing was changed.",
    });
    failed = true;
  } finally {
    await payload.destroy();
  }
  if (failed) process.exit(1);
}

await seed();
