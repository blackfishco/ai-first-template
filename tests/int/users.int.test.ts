import config from "@payload-config";
import { getPayload, type Payload } from "payload";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { User } from "@/payload-types";

const PASSWORD = "correct-horse-battery";

let payload: Payload;
let admin: User;
let editor: User;

beforeAll(async () => {
  payload = await getPayload({ config });
  await payload.delete({ collection: "users", where: {} });

  // Created without a signed-in user, like Payload's "create first user" screen.
  admin = await payload.create({
    collection: "users",
    data: { email: "first@example.com", password: PASSWORD, role: "editor" },
  });
  editor = await payload.create({
    collection: "users",
    data: { email: "editor@example.com", password: PASSWORD, role: "editor" },
  });
});

afterAll(async () => {
  await payload.delete({ collection: "users", where: {} });
  await payload.destroy();
});

describe("users collection", () => {
  it("makes the first account an admin whatever role was sent", () => {
    expect(admin.role).toBe("admin");
    expect(editor.role).toBe("editor");
  });

  it("hides accounts from visitors", async () => {
    await expect(
      payload.find({ collection: "users", overrideAccess: false }),
    ).rejects.toThrow();
  });

  it("shows an editor only their own account", async () => {
    const result = await payload.find({
      collection: "users",
      overrideAccess: false,
      user: editor,
    });

    expect(result.docs.map((doc) => doc.email)).toEqual(["editor@example.com"]);
  });

  it("ignores an editor's attempt to change their own role", async () => {
    const updated = await payload.update({
      collection: "users",
      id: editor.id,
      data: { role: "admin", name: "Renamed" },
      overrideAccess: false,
      user: editor,
    });

    expect(updated.name).toBe("Renamed");
    expect(updated.role).toBe("editor");
  });

  it("stops an editor from creating or deleting accounts", async () => {
    await expect(
      payload.create({
        collection: "users",
        data: { email: "new@example.com", password: PASSWORD, role: "admin" },
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow();

    await expect(
      payload.delete({
        collection: "users",
        id: admin.id,
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow();
  });

  it("rejects a password shorter than the policy", async () => {
    await expect(
      payload.create({
        collection: "users",
        data: { email: "short@example.com", password: "short", role: "editor" },
      }),
    ).rejects.toThrow();
  });

  it("invites a user created by an admin with a reset token", async () => {
    const invited = await payload.create({
      collection: "users",
      data: { email: "invited@example.com", role: "editor" },
      overrideAccess: false,
      user: admin,
      showHiddenFields: true,
    });

    expect(invited.role).toBe("editor");
    expect(invited.resetPasswordToken).toMatch(/^[0-9a-f]{40}$/);
  });
});
