import { beforeEach, describe, expect, it, vi } from "vitest";

const memberUpsertMock = vi.fn();
const subscriberUpsertMock = vi.fn();
const transactionMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    member: { upsert: memberUpsertMock },
    subscriber: { upsert: subscriberUpsertMock },
    $transaction: transactionMock,
  },
}));

async function post(body: unknown, ip = "10.0.0.1") {
  const { POST } = await import("./route");
  return POST(
    new Request("http://localhost/api/members/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": ip,
        "user-agent": "vitest",
      },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  memberUpsertMock.mockReset().mockResolvedValue({});
  subscriberUpsertMock.mockReset().mockResolvedValue({});
  transactionMock.mockReset().mockResolvedValue([]);
});

describe("POST /api/members/register", () => {
  it("adds an active member and Friday-updates subscriber", async () => {
    const response = await post({ email: "NewMember@UKY.edu" });

    expect(response.status).toBe(204);
    expect(memberUpsertMock).toHaveBeenCalledWith({
      where: { email: "newmember@uky.edu" },
      create: expect.objectContaining({
        email: "newmember@uky.edu",
        status: "active",
      }),
      update: expect.objectContaining({ status: "active" }),
    });
    expect(subscriberUpsertMock).toHaveBeenCalledWith({
      where: { email: "newmember@uky.edu" },
      create: expect.objectContaining({ source: "member-registration" }),
      update: expect.objectContaining({
        source: "member-registration",
        status: "active",
      }),
    });
    expect(transactionMock).toHaveBeenCalledOnce();
  });

  it("silently accepts honeypot submissions without writing", async () => {
    const response = await post({ email: "bot@example.com", website: "spam" });

    expect(response.status).toBe(204);
    expect(memberUpsertMock).not.toHaveBeenCalled();
    expect(subscriberUpsertMock).not.toHaveBeenCalled();
  });

  it("rejects invalid email", async () => {
    const response = await post({ email: "not-an-email" });

    expect(response.status).toBe(400);
    expect(memberUpsertMock).not.toHaveBeenCalled();
  });

  it("returns 503 when the database is unavailable", async () => {
    delete process.env.DATABASE_URL;
    const response = await post({ email: "member@example.com" }, "10.0.0.2");

    expect(response.status).toBe(503);
    expect(memberUpsertMock).not.toHaveBeenCalled();
  });
});
