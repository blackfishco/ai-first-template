import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import type { User } from "@/payload-types";

let payload: Payload;
let editor: User;

// The tests change shared settings with these system calls and reset them afterwards.
const context = { disableRevalidate: true };

beforeAll(async () => {
  payload = await getPayload({ config });
  await payload.delete({
    collection: "users",
    where: { email: { equals: "settings-editor@example.com" } },
  });
  editor = await payload.create({
    collection: "users",
    data: {
      email: "settings-editor@example.com",
      password: "correct-horse-battery",
      role: "editor",
    },
  });
});

afterEach(async () => {
  await payload.updateGlobal({
    slug: "site-settings",
    data: { analyticsTagId: null },
    context,
  });
});

afterAll(async () => {
  await payload.delete({
    collection: "users",
    where: { email: { equals: "settings-editor@example.com" } },
  });
  await payload.destroy();
});

describe("site settings: analytics tag", () => {
  it("lets an editor set a Tag Manager or GA4 ID", async () => {
    for (const id of ["GTM-ABC1234", "G-ABCDE12345"]) {
      const saved = await payload.updateGlobal({
        slug: "site-settings",
        data: { analyticsTagId: id },
        overrideAccess: false,
        user: editor,
        context,
      });
      expect(saved.analyticsTagId).toBe(id);
    }
  });

  it("rejects anything that is not a Google tag ID", async () => {
    await expect(
      payload.updateGlobal({
        slug: "site-settings",
        data: { analyticsTagId: 'GTM-1"><script>alert(1)</script>' },
        overrideAccess: false,
        user: editor,
        context,
      }),
    ).rejects.toThrow();
  });

  it("does not let a visitor change it", async () => {
    await expect(
      payload.updateGlobal({
        slug: "site-settings",
        data: { analyticsTagId: "GTM-EVIL123" },
        overrideAccess: false,
        context,
      }),
    ).rejects.toThrow();
  });
});
