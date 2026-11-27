import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { resendAdapter } from "@payloadcms/email-resend";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { cs } from "@payloadcms/translations/languages/cs";
import { en } from "@payloadcms/translations/languages/en";
import { buildConfig } from "payload";
import sharp from "sharp";

import { DEFAULT_LOCALE, LOCALE_LABELS, LOCALES } from "./i18n/config";
import { isAuthorizedBearer, previewPath, previewUrl } from "./lib/cms/preview";
import { loadServerEnv } from "./lib/env-schema";
import { hasRole } from "./payload/access/roles";
import { ADMIN_TITLE_SUFFIX } from "./payload/admin/branding";
import { ContactMessages } from "./payload/collections/contact-messages";
import { Media } from "./payload/collections/media";
import { Pages } from "./payload/collections/pages";
import { RateLimitHits } from "./payload/collections/rate-limit-hits";
import { Users } from "./payload/collections/users";
import { SiteSettings } from "./payload/globals/site-settings";
import { redirects } from "./payload/plugins/redirects";
import { seo } from "./payload/plugins/seo";
import { mediaStorage } from "./payload/plugins/storage";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Same validation as lib/env.ts. That module is `server-only`, which the
// Payload CLI (migrate, generate:types) cannot load.
const env = loadServerEnv(process.env);

export default buildConfig({
  serverURL: env.SITE_URL,
  secret: env.PAYLOAD_SECRET,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: dirname,
    },
    meta: { titleSuffix: ` ${ADMIN_TITLE_SUFFIX}` },
    // Draft preview next to the editing form. Off without PREVIEW_SECRET.
    livePreview: {
      collections: [Pages.slug],
      breakpoints: [
        { name: "mobile", label: "Mobile", width: 375, height: 667 },
        { name: "tablet", label: "Tablet", width: 768, height: 1024 },
        { name: "desktop", label: "Desktop", width: 1440, height: 900 },
      ],
      url: ({ collectionConfig, data, locale }) => {
        const slug: unknown = data.slug;
        const path = previewPath({
          collection: collectionConfig?.slug,
          slug: typeof slug === "string" ? slug : null,
          locale: locale.code,
        });
        return env.PREVIEW_SECRET && path
          ? previewUrl(path, env.PREVIEW_SECRET, env.SITE_URL)
          : null;
      },
    },
    components: {
      graphics: {
        Logo: "/payload/admin/branding#Logo",
        Icon: "/payload/admin/branding#Icon",
      },
    },
  },
  collections: [Pages, Media, ContactMessages, Users, RateLimitHits],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  // E-mail through Resend when both variables are set. Without them Payload
  // writes every message to the server log, so local development needs no key.
  ...(env.RESEND_API_KEY && env.EMAIL_FROM
    ? {
        email: resendAdapter({
          apiKey: env.RESEND_API_KEY,
          defaultFromAddress: env.EMAIL_FROM,
          defaultFromName: env.EMAIL_FROM_NAME ?? "",
        }),
      }
    : {}),
  db: postgresAdapter({
    pool: { connectionString: env.DATABASE_URL },
    migrationDir: path.resolve(dirname, "payload/migrations"),
    // Development syncs the schema directly. Every other environment applies
    // committed migrations only; see docs/architecture.md.
    push: env.NODE_ENV === "development",
  }),
  // Content languages; the same list drives the site's routing.
  localization: {
    locales: LOCALES.map((code) => ({ code, label: LOCALE_LABELS[code] })),
    defaultLocale: DEFAULT_LOCALE,
    fallback: true,
  },
  // Languages of the admin interface.
  i18n: {
    supportedLanguages: { cs, en },
    fallbackLanguage: "cs",
  },
  // Scheduled publishing runs as a job. The endpoint accepts the cron bearer
  // token or a signed-in admin; see vercel.json for the schedule.
  jobs: {
    access: {
      run: ({ req }) =>
        hasRole(req.user, "admin") ||
        isAuthorizedBearer(req.headers.get("authorization"), env.CRON_SECRET),
    },
  },
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  sharp,
  plugins: [seo, redirects, mediaStorage(env.BLOB_READ_WRITE_TOKEN)],
});
