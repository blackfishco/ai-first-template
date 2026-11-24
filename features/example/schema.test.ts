import { describe, expect, it } from "vitest";

import { parseTaskFormData, TASK_TEXT_MAX_LENGTH } from "./schema";

function formData(entries: [string, string][]): FormData {
  const data = new FormData();
  for (const [key, value] of entries) data.append(key, value);
  return data;
}

describe("parseTaskFormData", () => {
  it("accepts a trimmed task", () => {
    const result = parseTaskFormData(formData([["text", "  Write tests  "]]));

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({
      text: "Write tests",
      simulateFailure: false,
    });
  });

  it("reads the demo-failure control", () => {
    const result = parseTaskFormData(
      formData([
        ["text", "Task"],
        ["simulateFailure", "on"],
      ]),
    );

    expect(result._unsafeUnwrap().simulateFailure).toBe(true);
  });

  it.each([
    ["missing text", []],
    ["blank text", [["text", "   "]]],
    ["too long text", [["text", "a".repeat(TASK_TEXT_MAX_LENGTH + 1)]]],
    [
      "repeated text field",
      [
        ["text", "one"],
        ["text", "two"],
      ],
    ],
    [
      "unexpected control value",
      [
        ["text", "Task"],
        ["simulateFailure", "yes"],
      ],
    ],
  ] satisfies [string, [string, string][]][])(
    "rejects %s",
    (_name, entries) => {
      const result = parseTaskFormData(formData(entries));

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBe("INVALID_INPUT");
    },
  );

  it("rejects input that is not FormData", () => {
    // SAFETY: an exported Server Action can receive anything at runtime.
    const result = parseTaskFormData({ text: "Task" } as unknown as FormData);

    expect(result._unsafeUnwrapErr()).toBe("INVALID_INPUT");
  });
});
