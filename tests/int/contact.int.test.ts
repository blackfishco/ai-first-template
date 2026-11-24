import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { submitContactMessage } from "@/features/contact/server/submit-message";

let payload: Payload;

beforeAll(async () => {
  payload = await getPayload({ config });
  await payload.delete({ collection: "contact-messages", where: {} });
});

afterAll(async () => {
  await payload.delete({ collection: "contact-messages", where: {} });
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
    const result = await submitContactMessage(message, "en");

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
