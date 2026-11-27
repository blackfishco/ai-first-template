import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import {
  CONTACT_RATE_LIMIT,
  submitContactMessage,
} from "@/features/contact/server/submit-message";

let payload: Payload;

async function clear() {
  await payload.delete({ collection: "contact-messages", where: {} });
  await payload.db.deleteMany({ collection: "rate-limit-hits", where: {} });
}

beforeAll(async () => {
  payload = await getPayload({ config });
  await clear();
});

afterAll(async () => {
  await clear();
  await payload.destroy();
});

const message = {
  name: "Jana Nováková",
  email: "jana@example.com",
  message: "Dobrý den, mám dotaz k vašim službám.",
  website: "",
};

describe("contact messages", () => {
  it("stores a submitted message with the site language", async () => {
    const result = await submitContactMessage(message, "en", null);

    expect(result.isOk()).toBe(true);
    const { docs } = await payload.find({ collection: "contact-messages" });
    expect(docs).toHaveLength(1);
    expect(docs[0]).toMatchObject({
      name: "Jana Nováková",
      email: "jana@example.com",
      message: "Dobrý den, mám dotaz k vašim službám.",
      locale: "en",
    });
  });

  it("keeps messages closed to the public API", async () => {
    await expect(
      payload.find({ collection: "contact-messages", overrideAccess: false }),
    ).rejects.toThrow();

    await expect(
      payload.create({
        collection: "contact-messages",
        data: { name: "Bot", email: "bot@example.com", message: "Spam" },
        overrideAccess: false,
      }),
    ).rejects.toThrow();
  });
});

describe("contact rate limit", () => {
  const ip = "203.0.113.7";

  beforeEach(clear);

  async function submitTimes(count: number, client: string) {
    const results = [];
    for (let index = 0; index < count; index += 1) {
      results.push(await submitContactMessage(message, "cs", client));
    }
    return results;
  }

  it("refuses a visitor over the limit and stores nothing more", async () => {
    const accepted = await submitTimes(CONTACT_RATE_LIMIT.limit, ip);
    expect(accepted.every((result) => result.isOk())).toBe(true);

    const refused = await submitContactMessage(message, "cs", ip);

    expect(refused.isErr() && refused.error).toEqual({ code: "TOO_MANY_REQUESTS" });
    const { totalDocs } = await payload.count({ collection: "contact-messages" });
    expect(totalDocs).toBe(CONTACT_RATE_LIMIT.limit);
  });

  it("counts each visitor separately", async () => {
    await submitTimes(CONTACT_RATE_LIMIT.limit, ip);

    const other = await submitContactMessage(message, "cs", "203.0.113.8");

    expect(other.isOk()).toBe(true);
  });

  it("accepts the visitor again once the window has passed", async () => {
    await submitTimes(CONTACT_RATE_LIMIT.limit, ip);
    const expired = new Date(
      Date.now() - CONTACT_RATE_LIMIT.windowMs - 1000,
    ).toISOString();
    await payload.db.updateMany({
      collection: "rate-limit-hits",
      where: {},
      data: { createdAt: expired },
    });

    const again = await submitContactMessage(message, "cs", ip);

    expect(again.isOk()).toBe(true);
  });

  it("stores no readable address", async () => {
    await submitContactMessage(message, "cs", ip);

    const { docs } = await payload.find({
      collection: "rate-limit-hits",
      overrideAccess: true,
    });
    expect(docs).toHaveLength(1);
    expect(JSON.stringify(docs)).not.toContain(ip);
  });

  it("keeps hits closed to the public API", async () => {
    await expect(
      payload.find({ collection: "rate-limit-hits", overrideAccess: false }),
    ).rejects.toThrow();
  });
});
