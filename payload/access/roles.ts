import type { Access, FieldAccess } from "payload";

/**
 * Roles of CMS accounts:
 * - `admin` manages everything, including accounts and roles;
 * - `editor` manages content and only their own account.
 *
 * Site visitors have no account; see ./published.ts for what they can read.
 */
export const USER_ROLES = ["admin", "editor"] as const;
export type UserRole = (typeof USER_ROLES)[number];

interface RoleHolder {
  id?: number | string;
  role?: string | null;
}

export function hasRole(
  user: RoleHolder | null | undefined,
  ...roles: UserRole[]
): boolean {
  const role = user?.role;
  return roles.some((candidate) => candidate === role);
}

/** Admins only. */
export const isAdmin: Access = ({ req }) => hasRole(req.user, "admin");

/** Content work: editors and admins. */
export const isEditor: Access = ({ req }) =>
  hasRole(req.user, "admin", "editor");

/** Field writable (or visible) by admins only. */
export const isAdminField: FieldAccess = ({ req }) =>
  hasRole(req.user, "admin");

/** Admins reach every account; editors only their own. */
export const adminOrSelf: Access = ({ req }) => {
  if (hasRole(req.user, "admin")) return true;
  if (hasRole(req.user, "editor") && req.user?.id !== undefined) {
    return { id: { equals: req.user.id } };
  }
  return false;
};
