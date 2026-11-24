import type { Access } from "payload";

import { hasRole } from "./roles";

/**
 * Visitors read only published documents; editors and admins also read drafts.
 * Use it as `read` access on collections with drafts enabled, and call the
 * Local API with `overrideAccess: false` wherever a visitor's request is served.
 */
export const publishedOrEditor: Access = ({ req }) =>
  hasRole(req.user, "admin", "editor")
    ? true
    : { _status: { equals: "published" } };
