import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let payload: Payload;

// Tests run outside a Next.js request, where cache revalidation is unavailable.
const context = { disableRevalidate: true };

beforeAll(async () => {
  payload = await getPayload({ config });
  await payload.delete({ collection: "pages", where: {}, context });
});

afterAll(async () => {
  await payload.delete({ collection: "pages", where: {}, context });
  await payload.destroy();
});

describe("pages collection", () => {
  it("creates the slug from the title and keeps it unique", async () => {
    const first = await payload.create({
      collection: "pages",
      data: { title: "O nás", _status: "published" },
      context,
    });
    const second = await payload.create({
      collection: "pages",
      data: { title: "O nás", _status: "published" },
      context,
    });

    expect(first.slug).toBe("o-nas");
    expect(second.slug).toBe("o-nas-2");
  });

  it("rejects a slug owned by a fixed route", async () => {
    await expect(
      payload.create({
        collection: "pages",
        data: { title: "Admin", slug: "admin", _status: "published" },
        context,
      }),
    ).rejects.toThrow();
  });

  it("shows visitors published pages only", async () => {
    await payload.create({
      collection: "pages",
      data: { title: "Rozpracováno", _status: "draft" },
      context,
    });

    const visible = await payload.find({
      collection: "pages",
      overrideAccess: false,
      pagination: false,
    });

    expect(visible.docs.map((page) => page.slug).toSorted()).toEqual([
      "o-nas",
      "o-nas-2",
    ]);
  });

  it("stores block content per language with one shared layout", async () => {
    const page = await payload.create({
      collection: "pages",
      locale: "cs",
      data: {
        title: "Kontakt",
        _status: "published",
        layout: [{ blockType: "hero", heading: "Napište nám" }],
      },
      context,
    });
    const blockId = page.layout?.[0]?.id;

    await payload.update({
      collection: "pages",
      id: page.id,
      locale: "en",
      data: {
        title: "Contact",
        layout: [{ id: blockId, blockType: "hero", heading: "Write to us" }],
      },
      context,
    });

    const czech = await payload.findByID({
      collection: "pages",
      id: page.id,
      locale: "cs",
    });
    const english = await payload.findByID({
      collection: "pages",
      id: page.id,
      locale: "en",
    });

    expect(czech.title).toBe("Kontakt");
    expect(english.title).toBe("Contact");
    expect(czech.layout?.[0]).toMatchObject({ heading: "Napište nám" });
    expect(english.layout?.[0]).toMatchObject({ heading: "Write to us" });
    expect(english.slug).toBe(czech.slug);
  });

  it("stops visitors from writing pages", async () => {
    await expect(
      payload.create({
        collection: "pages",
        data: { title: "Visitor", _status: "published" },
        overrideAccess: false,
        context,
      }),
    ).rejects.toThrow();
  });
});
