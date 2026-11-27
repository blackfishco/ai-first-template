/**
 * The contact form's fields, limits, and error codes, without zod. The form
 * imports this module and loads the zod schema only when it validates, so a
 * page with the form does not pay for zod before anyone types.
 */

export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 200;
export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 2000;

/** What the form holds. `schema.test.ts` checks it matches the zod schema's input. */
export interface ContactFormValues {
  name: string;
  email: string;
  message: string;
  /** Honeypot: hidden from people, filled by bots. */
  website?: string | undefined;
}

export const CONTACT_FIELDS = ["name", "email", "message"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

export const FIELD_ERROR_CODES = [
  "REQUIRED",
  "TOO_SHORT",
  "TOO_LONG",
  "INVALID_EMAIL",
] as const;
export type FieldErrorCode = (typeof FIELD_ERROR_CODES)[number];
