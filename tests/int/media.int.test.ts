import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let payload: Payload;

async function pngFile(width: number, name: string) {
  const data = await sharp({
    create: { width, height: width / 2, channels: 3, background: "#3366cc" },
  })
    .png()
    .toBuffer();
  return { data, mimetype: "image/png", name, size: data.length };
}

beforeAll(async () => {
  payload = await getPayload({ config });
  await payload.delete({ collection: "media", where: {} });
});

afterAll(async () => {
  await payload.delete({ collection: "media", where: {} });
  await payload.destroy();
});

describe("media collection", () => {
  it("stores an image with WebP sizes and a blur placeholder", async () => {
    const media = await payload.create({
      collection: "media",
      data: { alt: "Modrý obdélník" },
      file: await pngFile(1000, "blue.png"),
    });

    expect(media.sizes?.thumb?.width).toBe(400);
    expect(media.sizes?.card?.width).toBe(800);
    expect(media.sizes?.thumb?.mimeType).toBe("image/webp");
    // The upload is narrower than the hero size and is never enlarged.
    expect(media.sizes?.hero?.width).toBe(1000);
    expect(media.blurDataUrl).toMatch(/^data:image\/webp;base64,/);
  });

  it("keeps alt text per language", async () => {
    const media = await payload.create({
      collection: "media",
      data: { alt: "Česky" },
      file: await pngFile(500, "localized.png"),
      locale: "cs",
    });
    await payload.update({
      collection: "media",
      id: media.id,
      data: { alt: "English" },
      locale: "en",
    });

    const czech = await payload.findByID({
      collection: "media",
      id: media.id,
      locale: "cs",
    });
    const english = await payload.findByID({
      collection: "media",
      id: media.id,
      locale: "en",
    });

    expect(czech.alt).toBe("Česky");
    expect(english.alt).toBe("English");
  });

  it("rejects an image without alt text", async () => {
    await expect(
      payload.create({
        collection: "media",
        data: {},
        file: await pngFile(500, "no-alt.png"),
      }),
    ).rejects.toThrow();
  });

  it("rejects a file type outside the allowed list", async () => {
    const data = Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>");

    await expect(
      payload.create({
        collection: "media",
        data: { alt: "Vector" },
        file: { data, mimetype: "image/svg+xml", name: "x.svg", size: data.length },
      }),
    ).rejects.toThrow();
  });

  it("lets visitors read files but not upload them", async () => {
    const visible = await payload.find({
      collection: "media",
      overrideAccess: false,
    });
    expect(visible.totalDocs).toBeGreaterThan(0);

    await expect(
      payload.create({
        collection: "media",
        data: { alt: "Visitor upload" },
        file: await pngFile(500, "visitor.png"),
        overrideAccess: false,
      }),
    ).rejects.toThrow();
  });
});
