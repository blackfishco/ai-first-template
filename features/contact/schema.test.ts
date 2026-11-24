import { describe, expect, it } from "vitest";

import {
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
  parseContactInput,
} from "./schema";

const valid = {
  name: "  Jana Nováková ",
  email: " jana@example.com ",
  message: "Dobrý den, mám dotaz k vašim službám.",
};

describe("parseContactInput", () => {
  it("accepts a valid message and trims it", () => {
    expect(parseContactInput(valid)._unsafeUnwrap()).toEqual({
      name: "Jana Nováková",
      email: "jana@example.com",
      message: "Dobrý den, mám dotaz k vašim službám.",
      website: "",
    });
  });

  it("reports one code per invalid field", () => {
    const error = parseContactInput({
      name: "   ",
      email: "not-an-email",
      message: "krátké",
    })._unsafeUnwrapErr();

    expect(error.code).toBe("INVALID_INPUT");
    expect(error.fields).toEqual({
      name: "REQUIRED",
      email: "INVALID_EMAIL",
      message: "TOO_SHORT",
    });
    expect(error.rejected).toBe(false);
  });

  it("rejects values that are too long", () => {
    const error = parseContactInput({
      ...valid,
      name: "a".repeat(NAME_MAX_LENGTH + 1),
      message: "a".repeat(MESSAGE_MAX_LENGTH + 1),
    })._unsafeUnwrapErr();

    expect(error.fields).toEqual({ name: "TOO_LONG", message: "TOO_LONG" });
  });

  it("flags a filled hidden field as a bot", () => {
    const error = parseContactInput({
      ...valid,
      website: "https://spam.example",
    })._unsafeUnwrapErr();

    expect(error.rejected).toBe(true);
    expect(error.fields).toEqual({});
  });

  it.each([null, undefined, "text", 42, [], { name: 1, email: {}, message: [] }])(
    "rejects malformed input %o without throwing",
    (input) => {
      expect(parseContactInput(input).isErr()).toBe(true);
    },
  );

  it("never echoes the submitted values in the error", () => {
    const error = parseContactInput({
      name: "",
      email: "secret@example",
      message: "x",
    })._unsafeUnwrapErr();

    expect(JSON.stringify(error)).not.toContain("secret");
  });
});
