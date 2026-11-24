import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import type { Plugin } from "payload";

/**
 * File storage for the media collection, the one place to swap the provider.
 *
 * With a Vercel Blob token, files go to Blob and the browser uploads them
 * directly, which avoids the 4.5 MB request limit of serverless functions.
 * Without a token the plugin is disabled and files stay on local disk
 * (`/media`, ignored by git). `alwaysInsertFields` keeps the database schema
 * and generated types the same in both cases.
 */
export function mediaStorage(token: string | undefined): Plugin {
  return vercelBlobStorage({
    enabled: Boolean(token),
    alwaysInsertFields: true,
    collections: { media: true },
    token,
    clientUploads: true,
  });
}
