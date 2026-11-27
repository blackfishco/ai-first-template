import { err, ok, type Result } from "neverthrow";
import { z } from "zod";

import {
  CONTACT_FIELDS,
  type ContactField,
  EMAIL_MAX_LENGTH,
  FIELD_ERROR_CODES,
  type FieldErrorCode,
  MESSAGE_MAX_LENGTH,
  MESSAGE_MIN_LENGTH,
  NAME_MAX_LENGTH,
} from "./fields";

/**
 * Validation messages are error codes, not text. The form translates them, so
 * the server never sends wording to the browser.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "REQUIRED").max(NAME_MAX_LENGTH, "TOO_LONG"),
  email: z
    .string()
    .trim()
    .min(1, "REQUIRED")
    .max(EMAIL_MAX_LENGTH, "TOO_LONG")
    .pipe(z.email("INVALID_EMAIL")),
  message: z
    .string()
    .trim()
    .min(MESSAGE_MIN_LENGTH, "TOO_SHORT")
    .max(MESSAGE_MAX_LENGTH, "TOO_LONG"),
  /** Honeypot: hidden from people, filled by bots. */
  website: z.string().max(0, "REJECTED").default(""),
});

export type ContactInput = z.output<typeof contactSchema>;

export interface InvalidContactInput {
  code: "INVALID_INPUT";
  fields: Partial<Record<ContactField, FieldErrorCode>>;
  /** The hidden field was filled: treat the sender as a bot. */
  rejected: boolean;
}

function isFieldErrorCode(value: string): value is FieldErrorCode {
  return FIELD_ERROR_CODES.some((code) => code === value);
}

function isContactField(value: unknown): value is ContactField {
  return CONTACT_FIELDS.some((field) => field === value);
}

/** Validates untrusted input. A Server Action can receive anything at runtime. */
export function parseContactInput(
  input: unknown,
): Result<ContactInput, InvalidContactInput> {
  const parsed = contactSchema.safeParse(input);
  if (parsed.success) return ok(parsed.data);

  const fields: InvalidContactInput["fields"] = {};
  let rejected = false;
  for (const issue of parsed.error.issues) {
    const [field] = issue.path;
    if (field === "website") rejected = true;
    // The first problem of a field is the one worth showing.
    if (isContactField(field) && fields[field] === undefined) {
      fields[field] = isFieldErrorCode(issue.message)
        ? issue.message
        : "REQUIRED";
    }
  }
  return err({ code: "INVALID_INPUT", fields, rejected });
}
