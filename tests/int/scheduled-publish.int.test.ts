import config from "@payload-config";
import type * as NextCache from "next/cache";
import { getPayload, type Payload } from "payload";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// The jobs runner gives each task its own request, so the revalidation hook
// runs as it does on the server. Outside Next.js there is no cache: record the
// calls instead, and check that a scheduled publish clears the page cache.
const { revalidateTag } = vi.hoisted(() => ({ revalidateTag: vi.fn() }));
vi.mock("next/cache", async (importOriginal) => ({
  ...(await importOriginal<typeof NextCache>()),
  revalidateTag,
}));

let payload: Payload;

// Outside a Next.js request there is no cache to revalidate.
const context = { disableRevalidate: true };
const SLUG = "naplanovana-stranka";

beforeAll(async () => {
  payload = await getPayload({ config });
  await payload.delete({
    collection: "pages",
    where: { slug: { like: SLUG } },
    context,
  });
  await payload.delete({ collection: "payload-jobs", where: {} });
});

afterAll(async () => {
  await payload.delete({
    collection: "pages",
    where: { slug: { like: SLUG } },
    context,
  });
  await payload.delete({ collection: "payload-jobs", where: {} });
  await payload.destroy();
});

/** What /api/payload-jobs/run does when Vercel Cron calls it. */
async function runDueJobs(): Promise<void> {
  await payload.jobs.run();
}

async function visibleToVisitors(): Promise<number> {
  const { totalDocs } = await payload.find({
    collection: "pages",
    where: { slug: { equals: SLUG } },
    overrideAccess: false,
  });
  return totalDocs;
}

describe("scheduled publishing", () => {
  it("publishes a draft when its job is due and the jobs run", async () => {
    const draft = await payload.create({
      collection: "pages",
      data: { title: "Naplánovaná stránka", slug: SLUG, _status: "draft" },
      draft: true,
      context,
    });
    expect(await visibleToVisitors()).toBe(0);

    // What the admin's "Schedule publish" queues; due a second ago.
    await payload.jobs.queue({
      task: "schedulePublish",
      input: {
        type: "publish",
        doc: { relationTo: "pages", value: draft.id },
      },
      waitUntil: new Date(Date.now() - 1000),
    });

    revalidateTag.mockClear();
    await runDueJobs();

    expect(await visibleToVisitors()).toBe(1);
    expect(revalidateTag).toHaveBeenCalledWith("pages", { expire: 0 });
  });

  it("leaves a job that is not due yet", async () => {
    const draft = await payload.create({
      collection: "pages",
      data: { title: "Později", slug: `${SLUG}-pozdeji`, _status: "draft" },
      draft: true,
      context,
    });

    await payload.jobs.queue({
      task: "schedulePublish",
      input: { type: "publish", doc: { relationTo: "pages", value: draft.id } },
      waitUntil: new Date(Date.now() + 60 * 60 * 1000),
    });
    await runDueJobs();

    const { totalDocs } = await payload.find({
      collection: "pages",
      where: { slug: { equals: `${SLUG}-pozdeji` } },
      overrideAccess: false,
    });
    expect(totalDocs).toBe(0);
  });
});
