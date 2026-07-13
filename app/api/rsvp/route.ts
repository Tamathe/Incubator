import { NextResponse } from "next/server";
import { rsvpSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { nextSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`rsvp:${ip}`, { max: 5, windowMs: 10 * 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof raw.website === "string" && raw.website.trim().length > 0) {
    return new NextResponse(null, { status: 204 });
  }
  delete raw.website;

  const parsed = rsvpSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const meetingDate = nextSession();

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "RSVP database is not configured" },
      { status: 503 },
    );
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.rsvp.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role ?? null,
        motivations: parsed.data.motivations,
        note: parsed.data.note ?? null,
        joinListserv: parsed.data.joinListserv,
        meetingDate,
        ipAddress: ip,
      },
    });

    if (parsed.data.joinListserv) {
      await prisma.subscriber.upsert({
        where: { email: parsed.data.email },
        create: {
          email: parsed.data.email,
          source: "rsvp-checkbox",
          status: "active",
          ipAddress: ip,
          userAgent: req.headers.get("user-agent") ?? null,
        },
        update: { status: "active", unsubscribedAt: null },
      });
    }
  } catch (err) {
    console.error("rsvp create failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
