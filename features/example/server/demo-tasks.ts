import "server-only";

import { randomUUID } from "node:crypto";

import { err, ok, type Result } from "neverthrow";

import type { Locale } from "@/i18n/config";
import exampleCsMessages from "@/messages/example.cs.json";
import exampleEnMessages from "@/messages/example.en.json";

import { type CreateTaskInput } from "../schema";
import { type CreateTaskError, type Task } from "../types";

const INITIAL_TASKS = {
  cs: exampleCsMessages.Example.initialTasks,
  en: exampleEnMessages.Example.initialTasks,
} satisfies Record<Locale, { layout: string; mobile: string }>;

export function getDemoTasks(locale: Locale): Task[] {
  // Fresh values on each read; never a mutable module-global visitor store.
  return [
    { id: "demo-layout", text: INITIAL_TASKS[locale].layout },
    { id: "demo-mobile", text: INITIAL_TASKS[locale].mobile },
  ];
}

export function createDemoTask(
  input: CreateTaskInput,
): Result<Task, CreateTaskError> {
  if (input.simulateFailure) return err("DEMO_FAILURE");

  // This validates a task, but does not persist it anywhere.
  return ok({ id: randomUUID(), text: input.text });
}
