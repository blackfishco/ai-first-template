import "server-only";

import { randomUUID } from "node:crypto";
import { err, ok, type Result } from "neverthrow";

import exampleMessages from "@/messages/example.cs.json";

import { type CreateTaskInput } from "../schema";
import { type CreateTaskError, type Task } from "../types";

export function getDemoTasks(): Task[] {
  // Fresh values on each read; never a mutable module-global visitor store.
  return [
    { id: "demo-layout", text: exampleMessages.Example.initialTasks.layout },
    { id: "demo-mobile", text: exampleMessages.Example.initialTasks.mobile },
  ];
}

export function createDemoTask(
  input: CreateTaskInput,
): Result<Task, CreateTaskError> {
  if (input.simulateFailure) return err("DEMO_FAILURE");

  // This validates a task, but does not persist it anywhere.
  return ok({ id: randomUUID(), text: input.text });
}
