import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "incubator-admin";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function mintAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(getSecret());
}

export interface AdminPayload {
  role: "admin";
  iat: number;
  exp: number;
}

export async function verifyAdminToken(token: string): Promise<AdminPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  if (payload.role !== "admin") throw new Error("not admin");
  return payload as unknown as AdminPayload;
}

/**
 * Server actions and admin API routes call this at the top.
 * Throws if the cookie is missing or invalid. Middleware should already
 * have redirected unauthed callers, but this is defense-in-depth for the
 * race where a cookie expires between page load and action invocation.
 */
export async function requireAdmin(): Promise<AdminPayload> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) throw new Error("unauthenticated");
  return verifyAdminToken(token);
}

export const TOKEN_TTL = TOKEN_TTL_SECONDS;
