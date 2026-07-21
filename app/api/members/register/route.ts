import { NextResponse } from "next/server";
import { memberRegistrationSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`member-register:${ip}`, { max: 5, windowMs: 10 * 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof raw.website === "string" && raw.website.trim().length > 0) {
    return new NextResponse(null, { status: 204 });
  }
  delete raw.website;

  const parsed = memberRegistrationSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Member database is not configured" },
      { status: 503 },
    );
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const now = new Date();
    await prisma.$transaction([
      prisma.member.upsert({
        where: { email: parsed.data.email },
        create: {
          email: parsed.data.email,
          status: "active",
          ipAddress: ip,
          userAgent: request.headers.get("user-agent") ?? null,
        },
        update: {
          status: "active",
          lastConfirmedAt: now,
          ipAddress: ip,
          userAgent: request.headers.get("user-agent") ?? null,
        },
      }),
      prisma.subscriber.upsert({
        where: { email: parsed.data.email },
        create: {
          email: parsed.data.email,
          source: "member-registration",
          status: "active",
          ipAddress: ip,
          userAgent: request.headers.get("user-agent") ?? null,
        },
        update: {
          source: "member-registration",
          status: "active",
          unsubscribedAt: null,
        },
      }),
    ]);
  } catch (error) {
    console.error("member registration failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
