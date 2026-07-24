import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pitchCreateMock = vi.fn();
const pitchUpdateManyMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pitch: { create: pitchCreateMock, updateMany: pitchUpdateManyMock },
  },
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
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-07-21T14:00:00.000Z"));
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  pitchCreateMock.mockReset();
  pitchCreateMock.mockResolvedValue({});
  pitchUpdateManyMock.mockReset();
  pitchUpdateManyMock.mockResolvedValue({ count: 0 });
});

afterEach(() => vi.useRealTimers());

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

  it("places a seven-day hold on an available Friday", async () => {
    const res = await post(
      {
        ...valid,
        preferredFriday: "2026-09-18",
        alternateFriday: "2026-10-09",
      },
      { "x-forwarded-for": "3.3.3.5" },
    );
    expect(res.status).toBe(204);
    expect(pitchCreateMock.mock.calls[0][0].data).toMatchObject({
      bookingStatus: "requested",
      preferredFriday: new Date("2026-09-18T00:00:00.000Z"),
      alternateFriday: new Date("2026-10-09T00:00:00.000Z"),
      scheduledFriday: new Date("2026-09-18T00:00:00.000Z"),
      bookingHoldUntil: new Date("2026-07-28T14:00:00.000Z"),
    });
  });

  it("rejects the first Friday of a month", async () => {
    const res = await post(
      { ...valid, preferredFriday: "2026-08-07" },
      { "x-forwarded-for": "3.3.3.6" },
    );
    expect(res.status).toBe(409);
    expect(pitchCreateMock).not.toHaveBeenCalled();
  });

  it("returns 409 when another request takes the slot first", async () => {
    pitchCreateMock.mockRejectedValueOnce({ code: "P2002" });
    const res = await post(
      { ...valid, preferredFriday: "2026-09-18" },
      { "x-forwarded-for": "3.3.3.7" },
    );
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({
      error: expect.stringMatching(/taken/i),
    });
  });

  it("stores blank advance context when it is omitted", async () => {
    const { firstBuild: _firstBuild, ...withoutAdvanceContext } = valid;
    const res = await post(withoutAdvanceContext, { "x-forwarded-for": "3.3.3.4" });
    expect(res.status).toBe(204);
    expect(pitchCreateMock.mock.calls[0][0].data.firstBuild).toBe("");
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
