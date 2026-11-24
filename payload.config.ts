import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { cs } from "@payloadcms/translations/languages/cs";
import { en } from "@payloadcms/translations/languages/en";
import { buildConfig } from "payload";
import sharp from "sharp";

import { DEFAULT_LOCALE, LOCALE_LABELS, LOCALES } from "./i18n/config";
import { loadServerEnv } from "./lib/env-schema";
import { Users } from "./payload/collections/users";

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
  },
  collections: [Users],
  editor: lexicalEditor(),
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
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  sharp,
});
