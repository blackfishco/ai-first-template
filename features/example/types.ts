export interface Task {
  id: string;
  text: string;
}

export type CreateTaskError = "INVALID_INPUT" | "DEMO_FAILURE";

export type CreateTaskResult =
  | { success: true; task: Task }
  | { success: false; code: CreateTaskError };
