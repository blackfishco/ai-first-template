import { type APIRequestContext, expect } from "@playwright/test";

/**
 * Account the end-to-end tests use to write content through the CMS API. On an
 * empty database it becomes the first user (an admin); afterwards it signs in.
 */
const ACCOUNT = {
  email: "e2e@example.com",
  password: "e2e-only-password-0000",
};

export async function signIn(request: APIRequestContext): Promise<string> {
  const registered = await request.post("/api/users/first-register", {
    data: ACCOUNT,
  });
  const response = registered.ok()
    ? registered
    : await request.post("/api/users/login", { data: ACCOUNT });

  expect(
    response.ok(),
    "The end-to-end account could not sign in. Run the tests against a database it owns, for example a *_test database.",
  ).toBe(true);

  const body: unknown = await response.json();
  const token =
    typeof body === "object" && body !== null && "token" in body
      ? body.token
      : undefined;
  expect(typeof token).toBe("string");
  return String(token);
}

export function authHeaders(token: string): Record<string, string> {
  return { Authorization: `JWT ${token}` };
}
