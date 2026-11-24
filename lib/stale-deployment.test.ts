import { describe, expect, it, vi } from "vitest";

import {
  isStaleDeploymentError,
  reloadOnStaleDeployment,
} from "./stale-deployment";

const stale = new Error(
  'Server Action "40abc" was not found on the server. Read more: https://nextjs.org',
);

describe("isStaleDeploymentError", () => {
  it("recognises the error by its message and by its name", () => {
    expect(isStaleDeploymentError(stale)).toBe(true);
    expect(isStaleDeploymentError({ name: "UnrecognizedActionError" })).toBe(
      true,
    );
  });

  it.each([new Error("Network error"), "text", null, undefined, {}])(
    "ignores %o",
    (error) => {
      expect(isStaleDeploymentError(error)).toBe(false);
    },
  );
});

describe("reloadOnStaleDeployment", () => {
  it("reloads once for a stale deployment", () => {
    const reload = vi.fn();

    expect(reloadOnStaleDeployment(stale, reload)).toBe(true);
    expect(reload).toHaveBeenCalledOnce();
  });

  it("does nothing for any other error", () => {
    const reload = vi.fn();

    expect(reloadOnStaleDeployment(new Error("boom"), reload)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});
