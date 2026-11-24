import {
  type CollectionBeforeValidateHook,
  type CollectionConfig,
  ValidationError,
} from "payload";

import { IMAGE_SIZES } from "../../lib/media/image-size";
import {
  ALLOWED_MIME_TYPES,
  isAltMissing,
  MAX_DOCUMENT_BYTES,
  MAX_IMAGE_BYTES,
  uploadProblem,
} from "../../lib/media/rules";
import type { Media as MediaDoc } from "../../payload-types";
import { isEditor } from "../access/roles";
import { storeBlurPlaceholder } from "../hooks/blur-placeholder";

const webp = { format: "webp", options: { quality: 80 } } as const;
const MB = 1024 * 1024;

const validateUpload: CollectionBeforeValidateHook<MediaDoc> = ({
  data,
  originalDoc,
  req,
}) => {
  const mimeType =
    data?.mimeType ?? req.file?.mimetype ?? originalDoc?.mimeType;
  const filesize = data?.filesize ?? req.file?.size ?? originalDoc?.filesize;
  const problem = uploadProblem(mimeType, filesize);

  if (problem) {
    throw new ValidationError({
      collection: "media",
      errors: [
        {
          path: "file",
          message:
            problem === "type"
              ? "Nepodporovaný typ souboru. Nahrajte JPG, PNG, WebP, AVIF nebo PDF."
              : `Soubor je příliš velký. Obrázek může mít nejvýše ${MAX_IMAGE_BYTES / MB} MB, PDF ${MAX_DOCUMENT_BYTES / MB} MB.`,
        },
      ],
      req,
    });
  }
  return data;
};

/**
 * Images and PDF documents for the site. Files go to the storage configured in
 * payload/plugins/storage.ts, or to local disk when none is configured. Sizes
 * are WebP; next/image serves AVIF or WebP at the right width on top of them.
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: { cs: "Médium", en: "Media" },
    plural: { cs: "Média", en: "Media" },
  },
  admin: {
    defaultColumns: ["filename", "alt", "mimeType", "filesize", "updatedAt"],
    description: {
      cs: `Obrázky (JPG, PNG, WebP, AVIF, max ${MAX_IMAGE_BYTES / MB} MB) a PDF (max ${MAX_DOCUMENT_BYTES / MB} MB). U obrázku je povinný alternativní text.`,
      en: `Images (JPG, PNG, WebP, AVIF, up to ${MAX_IMAGE_BYTES / MB} MB) and PDF (up to ${MAX_DOCUMENT_BYTES / MB} MB). Images need alternative text.`,
    },
  },
  access: {
    // Files are public once uploaded; drafts are protected on the documents that use them.
    read: () => true,
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  hooks: {
    beforeValidate: [validateUpload],
    beforeChange: [storeBlurPlaceholder],
  },
  fields: [
    {
      name: "alt",
      label: { cs: "Alternativní text", en: "Alternative text" },
      type: "text",
      localized: true,
      admin: {
        description: {
          cs: "Popište, co je na obrázku. Čtou ho čtečky obrazovky a vyhledávače. U PDF není potřeba.",
          en: "Describe what the image shows. Screen readers and search engines read it. Not needed for PDF.",
        },
      },
      validate: (
        value: string | null | undefined,
        { data }: { data: Partial<MediaDoc> },
      ) =>
        isAltMissing(value, data.mimeType)
          ? "Vyplňte alternativní text obrázku."
          : true,
    },
    {
      // Marks media the seed owns, so a second run reuses it. Never set by hand.
      name: "seedKey",
      type: "text",
      unique: true,
      index: true,
      admin: { hidden: true },
      access: { create: () => false, update: () => false },
    },
    {
      name: "blurDataUrl",
      type: "text",
      admin: { hidden: true },
      access: { create: () => false, update: () => false },
    },
  ],
  upload: {
    staticDir: "media",
    mimeTypes: [...ALLOWED_MIME_TYPES],
    focalPoint: true,
    crop: true,
    adminThumbnail: "thumb",
    imageSizes: [
      {
        name: "thumb",
        width: IMAGE_SIZES.thumb,
        withoutEnlargement: true,
        formatOptions: webp,
      },
      {
        name: "card",
        width: IMAGE_SIZES.card,
        withoutEnlargement: true,
        formatOptions: webp,
      },
      {
        name: "hero",
        width: IMAGE_SIZES.hero,
        withoutEnlargement: true,
        formatOptions: webp,
      },
    ],
  },
};
