import { describe, expect, it } from "vitest";

import { createDemoTask, getDemoTasks } from "./demo-tasks";

describe("createDemoTask", () => {
  it("returns a task with a fresh id", () => {
    const first = createDemoTask({ text: "Task", simulateFailure: false });
    const second = createDemoTask({ text: "Task", simulateFailure: false });

    expect(first._unsafeUnwrap().text).toBe("Task");
    expect(first._unsafeUnwrap().id).not.toBe(second._unsafeUnwrap().id);
  });

  it("returns a typed error for the demo failure", () => {
    const result = createDemoTask({ text: "Task", simulateFailure: true });

    expect(result._unsafeUnwrapErr()).toBe("DEMO_FAILURE");
  });
});

describe("getDemoTasks", () => {
  it("returns a new list on every read", () => {
    expect(getDemoTasks("cs")).not.toBe(getDemoTasks("cs"));
    expect(getDemoTasks("cs")).toEqual(getDemoTasks("cs"));
  });

  it("returns the tasks in the requested language", () => {
    expect(getDemoTasks("en").map((task) => task.text)).not.toEqual(
      getDemoTasks("cs").map((task) => task.text),
    );
  });
});
