import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subscribeSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`subscribe:${ip}`, { max: 5, windowMs: 10 * 60_000 })) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot: any non-empty "website" field → silent 204
  if (typeof raw.website === "string" && raw.website.trim().length > 0) {
    return new NextResponse(null, { status: 204 });
  }
  delete raw.website;

  const parsed = subscribeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    await prisma.subscriber.upsert({
      where: { email: parsed.data.email },
      create: {
        email: parsed.data.email,
        source: parsed.data.source ?? null,
        status: "active",
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") ?? null,
      },
      update: { status: "active", unsubscribedAt: null },
    });
  } catch (err) {
    console.error("subscribe upsert failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
