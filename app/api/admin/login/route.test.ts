import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

beforeEach(() => {
  vi.resetModules();
  process.env.JWT_SECRET = "test-secret-must-be-at-least-32-characters-long";
});

async function postLogin(body: unknown) {
  const { POST } = await import("./route");
  return POST(
    new Request("http://localhost/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "9.9.9.9" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/admin/login", () => {
  it("returns 200 + sets cookie when password matches", async () => {
    process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash("hunter2hunter2", 4);
    const res = await postLogin({ password: "hunter2hunter2" });
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(/incubator-admin=/);
    expect(setCookie).toMatch(/HttpOnly/i);
  });

  it("returns 401 when password is wrong", async () => {
    process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash("correct", 4);
    const res = await postLogin({ password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("returns 400 when body is malformed", async () => {
    process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash("x", 4);
    const res = await postLogin({});
    expect(res.status).toBe(400);
  });
});
