import { describe, expect, it } from "vitest";

import { validateCredentials, AUTH_USERNAME, AUTH_PASSWORD } from "@/lib/auth";

describe("validateCredentials", () => {
  it("returns true for the fixed credentials", () => {
    expect(validateCredentials(AUTH_USERNAME, AUTH_PASSWORD)).toBe(true);
  });

  it("returns false for invalid username", () => {
    expect(validateCredentials("wrong", AUTH_PASSWORD)).toBe(false);
  });

  it("returns false for invalid password", () => {
    expect(validateCredentials(AUTH_USERNAME, "wrong")).toBe(false);
  });
});
