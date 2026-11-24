import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

let payload: Payload;

// Tests run outside a Next.js request, where cache revalidation is unavailable.
const context = { disableRevalidate: true };

async function clear() {
  await payload.delete({ collection: "redirects", where: {}, context });
  await payload.delete({ collection: "pages", where: {}, context });
}

beforeAll(async () => {
  payload = await getPayload({ config });
});

beforeEach(clear);

afterAll(async () => {
  await clear();
  await payload.destroy();
});

function createRedirect(from: string, url: string) {
  return payload.create({
    collection: "redirects",
    data: { from, to: { type: "custom", url }, type: "301" },
    context,
  });
}

describe("redirects", () => {
  it("normalizes the source path", async () => {
    const redirect = await createRedirect("stara-adresa/?utm=1", "/nova");

    expect(redirect.from).toBe("/stara-adresa");
  });

  it("refuses a chain and a duplicate source", async () => {
    await createRedirect("/a", "/b");

    await expect(createRedirect("/b", "/c")).rejects.toThrow();
    await expect(createRedirect("/x", "/a")).rejects.toThrow();
    await expect(createRedirect("/a", "/z")).rejects.toThrow();
  });

  it("refuses a source that is a published page", async () => {
    await payload.create({
      collection: "pages",
      data: { title: "Kontakt", _status: "published" },
      context,
    });

    await expect(createRedirect("/kontakt", "/jinam")).rejects.toThrow();
  });

  it("redirects the old address when a published page is renamed", async () => {
    const page = await payload.create({
      collection: "pages",
      data: { title: "O nás", _status: "published" },
      context,
    });

    await payload.update({
      collection: "pages",
      id: page.id,
      data: { slug: "o-firme", _status: "published" },
      context,
    });

    const { docs } = await payload.find({ collection: "redirects", depth: 0 });
    expect(docs).toHaveLength(1);
    expect(docs[0]).toMatchObject({
      from: "/o-nas",
      type: "301",
      to: {
        type: "reference",
        reference: { relationTo: "pages", value: page.id },
      },
    });
  });

  it("keeps a single redirect per old address across several renames", async () => {
    const page = await payload.create({
      collection: "pages",
      data: { title: "Jedna", _status: "published" },
      context,
    });
    for (const slug of ["dva", "tri"]) {
      await payload.update({
        collection: "pages",
        id: page.id,
        data: { slug, _status: "published" },
        context,
      });
    }

    const { docs } = await payload.find({ collection: "redirects", depth: 0 });
    // Both old addresses point at the page itself, so there is no chain.
    expect(docs.map((redirect) => redirect.from).toSorted()).toEqual([
      "/dva",
      "/jedna",
    ]);
  });

  it("creates no redirect when a draft is renamed", async () => {
    const page = await payload.create({
      collection: "pages",
      data: { title: "Koncept", _status: "draft" },
      context,
    });

    await payload.update({
      collection: "pages",
      id: page.id,
      data: { slug: "jiny-koncept", _status: "draft" },
      context,
    });

    const { totalDocs } = await payload.count({ collection: "redirects" });
    expect(totalDocs).toBe(0);
  });

  it("hides redirects from visitors", async () => {
    await createRedirect("/a", "/b");

    await expect(
      payload.find({ collection: "redirects", overrideAccess: false }),
    ).rejects.toThrow();
  });
});
