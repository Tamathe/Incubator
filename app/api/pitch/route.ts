import { NextResponse } from "next/server";
import { pitchSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  bookingDateFromIso,
  bookingHoldUntil,
  validateBookableFriday,
} from "@/lib/friday-booking";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`pitch:${ip}`, { max: 5, windowMs: 10 * 60_000 })) {
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

  const parsed = pitchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Pitch database is not configured" },
      { status: 503 },
    );
  }

  if (parsed.data.preferredFriday) {
    const bookingError = validateBookableFriday(parsed.data.preferredFriday);
    if (bookingError) {
      return NextResponse.json({ error: bookingError }, { status: 409 });
    }
  }
  if (parsed.data.alternateFriday) {
    const alternateError = validateBookableFriday(parsed.data.alternateFriday);
    if (alternateError) {
      return NextResponse.json({ error: alternateError }, { status: 400 });
    }
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const now = new Date();
    await prisma.pitch.updateMany({
      where: {
        bookingStatus: "requested",
        bookingHoldUntil: { lte: now },
      },
      data: {
        scheduledFriday: null,
        bookingStatus: "expired",
        bookingHoldUntil: null,
      },
    });

    const preferredFriday = parsed.data.preferredFriday
      ? bookingDateFromIso(parsed.data.preferredFriday)
      : null;
    await prisma.pitch.create({
      data: {
        submitterName: parsed.data.submitterName,
        submitterEmail: parsed.data.submitterEmail,
        role: parsed.data.role ?? null,
        problem: parsed.data.problem,
        affected: parsed.data.affected,
        firstBuild: parsed.data.firstBuild ?? "",
        preferredFriday,
        alternateFriday: parsed.data.alternateFriday
          ? bookingDateFromIso(parsed.data.alternateFriday)
          : null,
        scheduledFriday: preferredFriday,
        bookingStatus: preferredFriday ? "requested" : null,
        bookingHoldUntil: preferredFriday ? bookingHoldUntil(now) : null,
        status: "new",
      },
    });
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That Friday was just taken. Please choose another date." },
        { status: 409 },
      );
    }
    console.error("pitch create failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
