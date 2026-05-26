import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/schemas";
import { mintAdminToken, ADMIN_COOKIE, TOKEN_TTL } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`admin-login:${ip}`, { max: 5, windowMs: 10 * 60_000 })) {
    return NextResponse.json(
      { error: "Too many attempts. Wait 10 minutes." },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const ok = await bcrypt.compare(parsed.data.password, hash);
  if (!ok) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await mintAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_TTL,
  });
  return res;
}
