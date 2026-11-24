import { describe, expect, it } from "vitest";

import {
  isAltMissing,
  MAX_DOCUMENT_BYTES,
  MAX_IMAGE_BYTES,
  uploadProblem,
} from "./rules";

describe("uploadProblem", () => {
  it("allows images and PDF documents within their limits", () => {
    expect(uploadProblem("image/jpeg", MAX_IMAGE_BYTES)).toBeNull();
    expect(uploadProblem("application/pdf", MAX_DOCUMENT_BYTES)).toBeNull();
  });

  it.each(["image/svg+xml", "text/html", "application/zip", "", null, undefined])(
    "rejects type %o",
    (type) => {
      expect(uploadProblem(type, 10)).toBe("type");
    },
  );

  it("rejects files over the limit of their kind", () => {
    expect(uploadProblem("image/png", MAX_IMAGE_BYTES + 1)).toBe("size");
    expect(uploadProblem("application/pdf", MAX_DOCUMENT_BYTES + 1)).toBe(
      "size",
    );
    expect(uploadProblem("application/pdf", MAX_IMAGE_BYTES + 1)).toBeNull();
  });

  it("allows an unknown size, which the storage reports later", () => {
    expect(uploadProblem("image/webp", undefined)).toBeNull();
  });
});

describe("isAltMissing", () => {
  it("requires alt text for images", () => {
    expect(isAltMissing("", "image/jpeg")).toBe(true);
    expect(isAltMissing("   ", "image/jpeg")).toBe(true);
    expect(isAltMissing(null, "image/png")).toBe(true);
    expect(isAltMissing("A lighthouse", "image/jpeg")).toBe(false);
  });

  it("does not require alt text for documents", () => {
    expect(isAltMissing("", "application/pdf")).toBe(false);
  });
});
