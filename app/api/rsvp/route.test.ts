import { describe, it, expect, vi, beforeEach } from "vitest";

const rsvpCreateMock = vi.fn();
const subscriberUpsertMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    rsvp: { create: rsvpCreateMock },
    subscriber: { upsert: subscriberUpsertMock },
  },
}));

vi.mock("@/lib/session", () => ({
  nextSession: () => new Date("2026-05-29T16:00:00Z"),
}));

async function post(body: unknown, headers: Record<string, string> = {}) {
  const { POST } = await import("./route");
  return POST(
    new Request("http://localhost/api/rsvp", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "2.2.2.2", ...headers },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  rsvpCreateMock.mockReset();
  subscriberUpsertMock.mockReset();
  rsvpCreateMock.mockResolvedValue({});
  subscriberUpsertMock.mockResolvedValue({});
});

const valid = {
  name: "Tama",
  email: "tama@uky.edu",
  role: "Faculty",
  motivations: ["Curious about the group"],
  note: "Excited",
  joinListserv: false,
};

describe("POST /api/rsvp", () => {
  it("creates an Rsvp with server-computed meetingDate", async () => {
    const res = await post(valid);
    expect(res.status).toBe(204);
    expect(rsvpCreateMock).toHaveBeenCalledOnce();
    const arg = rsvpCreateMock.mock.calls[0][0];
    expect(arg.data.meetingDate.toISOString()).toBe("2026-05-29T16:00:00.000Z");
    expect(arg.data.email).toBe("tama@uky.edu");
    expect(subscriberUpsertMock).not.toHaveBeenCalled();
  });

  it("upserts a Subscriber when joinListserv is true", async () => {
    await post({ ...valid, joinListserv: true });
    expect(subscriberUpsertMock).toHaveBeenCalledOnce();
    expect(subscriberUpsertMock.mock.calls[0][0]).toMatchObject({
      where: { email: "tama@uky.edu" },
      create: expect.objectContaining({ source: "rsvp-checkbox" }),
    });
  });

  it("honeypot silently returns 204 with no DB write", async () => {
    const res = await post({ ...valid, website: "spam" });
    expect(res.status).toBe(204);
    expect(rsvpCreateMock).not.toHaveBeenCalled();
  });

  it("returns 400 on validation failure", async () => {
    const res = await post({ ...valid, email: "bad" });
    expect(res.status).toBe(400);
  });

  it("returns 503 when the database is not configured", async () => {
    const previousDatabaseUrl = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const res = await post(valid, { "x-forwarded-for": "7.7.7.7" });
      expect(res.status).toBe(503);
      expect(rsvpCreateMock).not.toHaveBeenCalled();
      expect(subscriberUpsertMock).not.toHaveBeenCalled();
    } finally {
      if (previousDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = previousDatabaseUrl;
      }
    }
  });
});
