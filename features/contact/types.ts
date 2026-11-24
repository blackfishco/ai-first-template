import type { ContactField, FieldErrorCode } from "./schema";

/** What the contact Server Action returns to the browser: plain data, safe codes only. */
export type ContactResult =
  | { success: true }
  | {
      success: false;
      code: "INVALID_INPUT";
      fields: Partial<Record<ContactField, FieldErrorCode>>;
    }
  | { success: false; code: "UNAVAILABLE" };
