/** Upload rules for the media collection. Pure, shared by the CMS config and tests. */

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
export const DOCUMENT_MIME_TYPES = ["application/pdf"] as const;
export const ALLOWED_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  ...DOCUMENT_MIME_TYPES,
] as const;

const MB = 1024 * 1024;
export const MAX_IMAGE_BYTES = 15 * MB;
export const MAX_DOCUMENT_BYTES = 20 * MB;

export function isImageMimeType(mimeType: string | null | undefined): boolean {
  return IMAGE_MIME_TYPES.some((type) => type === mimeType);
}

export function isDocumentMimeType(
  mimeType: string | null | undefined,
): boolean {
  return DOCUMENT_MIME_TYPES.some((type) => type === mimeType);
}

export type UploadProblem = "type" | "size";

/** Returns what is wrong with an upload, or `null` when it is allowed. */
export function uploadProblem(
  mimeType: string | null | undefined,
  bytes: number | null | undefined,
): UploadProblem | null {
  if (!isImageMimeType(mimeType) && !isDocumentMimeType(mimeType)) {
    return "type";
  }
  const limit = isDocumentMimeType(mimeType)
    ? MAX_DOCUMENT_BYTES
    : MAX_IMAGE_BYTES;
  if (typeof bytes === "number" && bytes > limit) return "size";
  return null;
}

/** Alt text is required for images and optional for documents. */
export function isAltMissing(
  alt: string | null | undefined,
  mimeType: string | null | undefined,
): boolean {
  return isImageMimeType(mimeType) && !alt?.trim();
}
