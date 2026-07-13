import { describe, it, expect, vi, beforeEach } from "vitest";

const pitchCreateMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { pitch: { create: pitchCreateMock } },
}));

async function post(body: unknown, headers: Record<string, string> = {}) {
  const { POST } = await import("./route");
  return POST(
    new Request("http://localhost/api/pitch", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "3.3.3.3", ...headers },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  pitchCreateMock.mockReset();
  pitchCreateMock.mockResolvedValue({});
});

const valid = {
  submitterName: "X",
  submitterEmail: "x@uky.edu",
  problem: "There is a problem",
  affected: "Affected group",
  firstBuild: "First build idea",
};

describe("POST /api/pitch", () => {
  it("creates a Pitch", async () => {
    const res = await post(valid);
    expect(res.status).toBe(204);
    expect(pitchCreateMock).toHaveBeenCalledOnce();
    expect(pitchCreateMock.mock.calls[0][0].data).toMatchObject({
      submitterEmail: "x@uky.edu",
      problem: "There is a problem",
      status: "new",
    });
  });

  it("honeypot silently returns 204", async () => {
    const res = await post({ ...valid, website: "x" });
    expect(res.status).toBe(204);
    expect(pitchCreateMock).not.toHaveBeenCalled();
  });

  it("returns 400 when a structured field is missing", async () => {
    const res = await post({ ...valid, problem: "" });
    expect(res.status).toBe(400);
  });

  it("returns 503 when the database is not configured", async () => {
    const previousDatabaseUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const res = await post(valid, { "x-forwarded-for": "4.4.4.4" });
      expect(res.status).toBe(503);
      expect(pitchCreateMock).not.toHaveBeenCalled();
    } finally {
      if (previousDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = previousDatabaseUrl;
      }
    }
  });
});
