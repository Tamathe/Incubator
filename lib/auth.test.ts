import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { mintAdminToken, verifyAdminToken } from "./auth";

const ORIGINAL_SECRET = process.env.JWT_SECRET;

afterAll(() => {
  if (ORIGINAL_SECRET) process.env.JWT_SECRET = ORIGINAL_SECRET;
});

describe("admin JWT helpers", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-must-be-at-least-32-characters-long";
  });

  it("mints a token that verifies under the same secret", async () => {
    const token = await mintAdminToken();
    const payload = await verifyAdminToken(token);
    expect(payload.role).toBe("admin");
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await mintAdminToken();
    process.env.JWT_SECRET = "different-secret-also-at-least-32-chars-yes-yes";
    await expect(verifyAdminToken(token)).rejects.toThrow();
  });

  it("rejects garbage tokens", async () => {
    await expect(verifyAdminToken("not-a-jwt")).rejects.toThrow();
  });

  it("rejects an expired token", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = await mintAdminToken();
    vi.setSystemTime(new Date("2026-03-01T00:00:00Z"));
    await expect(verifyAdminToken(token)).rejects.toThrow();
    vi.useRealTimers();
  });
});
