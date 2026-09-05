import { err, ok, type Result } from "neverthrow";
import { z } from "zod";

import { type CreateTaskError } from "./types";

export const TASK_TEXT_MAX_LENGTH = 120;

// getAll + tuple rejects missing, repeated, or file-valued text fields.
const taskFormSchema = z.object({
  text: z.tuple([z.string().trim().min(1).max(TASK_TEXT_MAX_LENGTH)])
    .transform(([text]) => text),
  simulateFailure: z.array(z.literal("on")).max(1)
    .transform((values) => values.length === 1),
});

export type CreateTaskInput = z.infer<typeof taskFormSchema>;

export function parseTaskFormData(
  formData: FormData,
): Result<CreateTaskInput, CreateTaskError> {
  // Types do not protect an exported Server Action from malformed runtime input.
  if (!(formData instanceof FormData)) return err("INVALID_INPUT");

  const parsed = taskFormSchema.safeParse({
    text: formData.getAll("text"),
    simulateFailure: formData.getAll("simulateFailure"),
  });

  if (!parsed.success) return err("INVALID_INPUT");
  return ok(parsed.data);
}
