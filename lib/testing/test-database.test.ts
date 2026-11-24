import { describe, expect, it } from "vitest";

import { testDatabaseProblem } from "./test-database";

describe("testDatabaseProblem", () => {
  it("accepts a database named *_test", () => {
    expect(
      testDatabaseProblem("postgres://u:p@127.0.0.1:5432/template_test"),
    ).toBeNull();
    expect(
      testDatabaseProblem("postgres://u:p@host/app_test?sslmode=require"),
    ).toBeNull();
  });

  it("refuses any other database and names it", () => {
    expect(testDatabaseProblem("postgres://u:p@127.0.0.1:5432/template")).toMatch(
      /got "template"/,
    );
    expect(
      testDatabaseProblem("postgres://u:p@127.0.0.1:5432/test_production"),
    ).toMatch(/\*_test/);
  });

  it("refuses a missing or malformed address", () => {
    expect(testDatabaseProblem(undefined)).toMatch(/DATABASE_URL/);
    expect(testDatabaseProblem("")).toMatch(/DATABASE_URL/);
    expect(testDatabaseProblem("not a url")).toMatch(/not a valid/);
  });
});
