"use server";

import { parseTaskFormData } from "./schema";
import { createDemoTask } from "./server/demo-tasks";
import { type CreateTaskResult } from "./types";

export async function createTaskAction(
  formData: FormData,
): Promise<CreateTaskResult> {
  const result = parseTaskFormData(formData)
    .andThen(createDemoTask)
    .match<CreateTaskResult>(
      (task) => ({ success: true, task }),
      (code) => ({ success: false, code }),
    );

  return Promise.resolve(result);
}
