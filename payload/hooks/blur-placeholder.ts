import type { CollectionBeforeChangeHook } from "payload";
import sharp from "sharp";

import { isImageMimeType } from "../../lib/media/rules";

const PLACEHOLDER_WIDTH = 16;

/**
 * Stores a tiny blurred preview of an uploaded image as a data URL, shown
 * while the real image loads. It reads the upload from the request, so it adds
 * no second write. Direct-to-storage uploads carry no file data on the server;
 * those images keep an empty placeholder.
 */
export const storeBlurPlaceholder: CollectionBeforeChangeHook = async ({
  data,
  req,
}) => {
  const file = req.file;
  if (!file?.data?.length || !isImageMimeType(file.mimetype)) return data;

  const preview = await sharp(file.data)
    .resize(PLACEHOLDER_WIDTH)
    .webp({ quality: 40 })
    .toBuffer();

  return {
    ...data,
    blurDataUrl: `data:image/webp;base64,${preview.toString("base64")}`,
  };
};
