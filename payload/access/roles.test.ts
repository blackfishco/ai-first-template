import type { AccessArgs } from "payload";
import { describe, expect, it } from "vitest";

import { publishedOrEditor } from "./published";
import { adminOrSelf, hasRole, isAdmin, isEditor } from "./roles";

interface TestUser {
  id: number;
  role: string | null;
}

function args(user: TestUser | null): AccessArgs {
  // SAFETY: the access functions read only `req.user`.
  return { req: { user } } as unknown as AccessArgs;
}

const admin = { id: 1, role: "admin" };
const editor = { id: 2, role: "editor" };
const unknownRole = { id: 3, role: "owner" };
const noRole = { id: 4, role: null };

describe("hasRole", () => {
  it("matches only the listed roles", () => {
    expect(hasRole(admin, "admin")).toBe(true);
    expect(hasRole(editor, "admin")).toBe(false);
    expect(hasRole(editor, "admin", "editor")).toBe(true);
  });

  it.each([null, undefined, noRole, unknownRole])(
    "rejects %o",
    (user) => {
      expect(hasRole(user, "admin", "editor")).toBe(false);
    },
  );
});

describe("isAdmin and isEditor", () => {
  it("lets only admins pass isAdmin", async () => {
    expect(await isAdmin(args(admin))).toBe(true);
    expect(await isAdmin(args(editor))).toBe(false);
    expect(await isAdmin(args(null))).toBe(false);
  });

  it("lets admins and editors pass isEditor", async () => {
    expect(await isEditor(args(admin))).toBe(true);
    expect(await isEditor(args(editor))).toBe(true);
    expect(await isEditor(args(unknownRole))).toBe(false);
    expect(await isEditor(args(null))).toBe(false);
  });
});

describe("adminOrSelf", () => {
  it("gives admins every account", async () => {
    expect(await adminOrSelf(args(admin))).toBe(true);
  });

  it("limits editors to their own account", async () => {
    expect(await adminOrSelf(args(editor))).toEqual({ id: { equals: 2 } });
  });

  it("denies visitors and unknown roles", async () => {
    expect(await adminOrSelf(args(null))).toBe(false);
    expect(await adminOrSelf(args(unknownRole))).toBe(false);
  });
});

describe("publishedOrEditor", () => {
  it("lets editors and admins read drafts", async () => {
    expect(await publishedOrEditor(args(editor))).toBe(true);
    expect(await publishedOrEditor(args(admin))).toBe(true);
  });

  it.each([null, noRole, unknownRole])(
    "limits %o to published documents",
    async (user) => {
      expect(await publishedOrEditor(args(user))).toEqual({
        _status: { equals: "published" },
      });
    },
  );
});
