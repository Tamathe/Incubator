import { describe, it, expect, vi, beforeEach } from "vitest";

const upsertMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    subscriber: { upsert: upsertMock },
  },
}));

async function post(body: unknown, headers: Record<string, string> = {}) {
  const { POST } = await import("./route");
  return POST(
    new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4", ...headers },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  upsertMock.mockReset();
  upsertMock.mockResolvedValue({});
});

describe("POST /api/subscribe", () => {
  it("returns 204 and upserts a subscriber", async () => {
    const res = await post({ email: "x@uky.edu", source: "footer" });
    expect(res.status).toBe(204);
    expect(upsertMock).toHaveBeenCalledOnce();
    expect(upsertMock.mock.calls[0][0]).toMatchObject({
      where: { email: "x@uky.edu" },
      create: expect.objectContaining({ email: "x@uky.edu", source: "footer", status: "active" }),
      update: { status: "active", unsubscribedAt: null },
    });
  });

  it("silently drops honeypot submissions (returns 204, no upsert)", async () => {
    const res = await post({ email: "bot@bots.dev", website: "spam" });
    expect(res.status).toBe(204);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("returns 400 on validation failure", async () => {
    const res = await post({ email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("returns 503 when the database is not configured", async () => {
    const previousDatabaseUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const res = await post(
        { email: "missing-db@uky.edu", source: "footer" },
        { "x-forwarded-for": "6.6.6.6" },
      );
      expect(res.status).toBe(503);
      expect(upsertMock).not.toHaveBeenCalled();
    } finally {
      if (previousDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = previousDatabaseUrl;
      }
    }
  });

  it("rate-limits after 5 requests per IP", async () => {
    for (let i = 0; i < 5; i++) {
      await post({ email: `x${i}@uky.edu` }, { "x-forwarded-for": "5.5.5.5" });
    }
    const res = await post({ email: "z@uky.edu" }, { "x-forwarded-for": "5.5.5.5" });
    expect(res.status).toBe(429);
  });
});
