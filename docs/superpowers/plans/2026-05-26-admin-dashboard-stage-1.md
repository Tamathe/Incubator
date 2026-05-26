# Admin Dashboard — Stage 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static-export site's no-op forms and the worker-emailed pitch flow with a self-contained dynamic Next.js app: three public forms write to Postgres, a password-gated `/admin` dashboard manages all submissions, no emails sent to the curator.

**Architecture:** Drop `output: 'export'` and deploy dynamic Next.js to Vercel. Neon Postgres via Prisma v7 with PrismaPg adapter. JWT cookie auth for `/admin/*` and `/api/admin/*`. Three new DB tables (Subscriber, Rsvp, Pitch). Form components rewired to POST, dashboard shows three queues plus an overview.

**Tech Stack:** Next.js 15 (dynamic), Prisma 7 + `@prisma/adapter-pg`, Neon Postgres, `jose` (JWT), `bcryptjs`, `zod`, `lru-cache`, Vitest.

**Spec reference:** [`docs/superpowers/specs/2026-05-26-admin-dashboard-design.md`](../specs/2026-05-26-admin-dashboard-design.md)

**Conventions:**
- New library files go in root `lib/` (matches existing `lib/session.ts`), not `app/lib/`.
- Generated Prisma client lives at `app/generated/prisma`.
- Middleware lives at project root (`middleware.ts`) per Next.js convention.
- Test files colocated as `<source>.test.ts`.
- Vitest, Node env. No component tests in Stage 1 (manual smoke covers UI).
- Commit messages: conventional-ish (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`). Direct commits to `master`.

---

## Task 1: Install dependencies & add scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add runtime and dev dependencies**

Run:
```bash
npm install @prisma/client@^7.4.2 @prisma/adapter-pg@^7.4.2 pg@^8.13.1 jose@^5.9.6 bcryptjs@^2.4.3 zod@^3.23.8 lru-cache@^11.0.2
npm install -D prisma@^7.4.2 @types/pg@^8.11.10 @types/bcryptjs@^2.4.6 vitest@^2.1.5 @vitest/coverage-v8@^2.1.5 dotenv@^16.4.5
```

- [ ] **Step 2: Add scripts to `package.json`**

Open `package.json` and replace the `scripts` block with:

```json
"scripts": {
  "dev": "node scripts/build-changelog.mjs && next dev",
  "build": "node scripts/build-changelog.mjs && prisma generate && next build",
  "start": "next start",
  "preview": "npx serve@latest out",
  "changelog": "node scripts/build-changelog.mjs",
  "db:generate": "prisma generate",
  "db:migrate": "prisma migrate dev",
  "db:deploy": "prisma migrate deploy",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

(`prisma generate` is added to `build` so Vercel builds always regenerate the client against the deployed schema.)

- [ ] **Step 3: Verify install**

Run: `npm install`
Expected: no errors, `node_modules/.bin/prisma` exists.

Run: `npx prisma --version`
Expected: shows Prisma CLI 7.x.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add Prisma, auth, validation, and test dependencies"
```

---

## Task 2: Drop static export & set up Vitest

**Files:**
- Modify: `next.config.mjs`
- Create: `vitest.config.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Update `next.config.mjs`**

Replace the entire file with:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

(Removed `output: 'export'`, `images.unoptimized`, `trailingSlash`. The site goes dynamic from here.)

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "app/api/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```ts
import "dotenv/config";

process.env.JWT_SECRET ||= "test-secret-do-not-use-in-prod-min-32-chars-long-xx";
process.env.ADMIN_PASSWORD_HASH ||= "$2a$10$placeholder.hash.replaced.in.individual.tests.000000000000";
process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";
```

- [ ] **Step 4: Update `.gitignore`**

Append:

```
# prisma generated client
app/generated/

# vitest
coverage/
```

- [ ] **Step 5: Verify Vitest runs**

Run: `npx vitest run --reporter=basic`
Expected: "No test files found" — and exits 0 (or non-zero exit ok; verify no install errors).

- [ ] **Step 6: Commit**

```bash
git add next.config.mjs vitest.config.ts vitest.setup.ts .gitignore
git commit -m "chore: drop static export, add vitest scaffolding"
```

---

## Task 3: Prisma schema + initial migration

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma.config.ts`
- Create: `prisma/.env.example`

- [ ] **Step 1: Create `prisma/schema.prisma`**

```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "../app/generated/prisma"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
}

model Subscriber {
  id              String              @id @default(cuid())
  email           String              @unique
  status          SubscriberStatus    @default(active)
  source          String?
  createdAt       DateTime            @default(now())
  unsubscribedAt  DateTime?
  ipAddress       String?
  userAgent       String?

  @@index([createdAt])
}

enum SubscriberStatus {
  active
  unsubscribed
}

model Rsvp {
  id            String   @id @default(cuid())
  name          String
  email         String
  role          String?
  motivations   String[]
  note          String?
  joinListserv  Boolean  @default(false)
  meetingDate   DateTime
  reviewed      Boolean  @default(false)
  createdAt     DateTime @default(now())
  ipAddress     String?

  @@index([meetingDate])
  @@index([createdAt])
}

model Pitch {
  id              String       @id @default(cuid())
  submitterName   String
  submitterEmail  String
  role            String?
  problem         String
  affected        String
  firstBuild      String
  status          PitchStatus  @default(new)
  notes           String?
  createdAt       DateTime     @default(now())
  reviewedAt      DateTime?

  @@index([status, createdAt])
  @@index([createdAt])
}

enum PitchStatus {
  new
  reviewing
  accepted
  declined
  converted
}
```

- [ ] **Step 2: Create `prisma.config.ts`** at project root

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    adapter: async (env) =>
      new PrismaPg({
        connectionString: env.DIRECT_URL ?? env.DATABASE_URL,
      }),
  },
});
```

- [ ] **Step 3: Create `prisma/.env.example`**

```
# Pooled connection (used by app at runtime, via PrismaPg + pg.Pool)
DATABASE_URL="postgresql://USER:PASS@HOST/db?sslmode=require&pgbouncer=true"

# Direct connection (used by prisma migrate)
DIRECT_URL="postgresql://USER:PASS@HOST/db?sslmode=require"
```

- [ ] **Step 4: Create local `.env.local` for development** (NOT committed)

This file is gitignored via `.env*.local` in `.gitignore`. Add to it:

```
DATABASE_URL="<your Neon pooled connection string>"
DIRECT_URL="<your Neon direct connection string>"
JWT_SECRET="<32+ random chars; openssl rand -hex 32>"
ADMIN_PASSWORD_HASH="<bcrypt hash; generated in Task 5>"
```

Skip this step if a Neon project isn't provisioned yet; the migration command in Step 5 will fail loudly, which is fine. Provision Neon when ready, then re-run.

- [ ] **Step 5: Run the initial migration** (only if `.env.local` is configured)

Run: `npx prisma migrate dev --name init`
Expected: creates `prisma/migrations/<timestamp>_init/migration.sql` and applies it to the database. Generates the client at `app/generated/prisma/`.

If no DB is available yet, skip to Step 6 and run this later.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma.config.ts prisma/.env.example
# Also commit the migration if it was generated:
git add prisma/migrations/ 2>/dev/null || true
git commit -m "feat: prisma schema for subscriber/rsvp/pitch + initial migration"
```

---

## Task 4: Prisma client + pg pool singletons

**Files:**
- Create: `lib/pg-pool.ts`
- Create: `lib/prisma.ts`

- [ ] **Step 1: Create `lib/pg-pool.ts`**

```ts
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __incubatorPgPool: Pool | undefined;
}

export const pool: Pool =
  globalThis.__incubatorPgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__incubatorPgPool = pool;
}
```

- [ ] **Step 2: Create `lib/prisma.ts`**

```ts
import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { pool } from "./pg-pool";

declare global {
  // eslint-disable-next-line no-var
  var __incubatorPrisma: PrismaClient | undefined;
}

const adapter = new PrismaPg(pool);

export const prisma: PrismaClient =
  globalThis.__incubatorPrisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.__incubatorPrisma = prisma;
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: clean (assumes `app/generated/prisma` exists from Task 3 Step 5; if migration wasn't run yet, run `npx prisma generate` first).

- [ ] **Step 4: Commit**

```bash
git add lib/pg-pool.ts lib/prisma.ts
git commit -m "feat: prisma client + shared pg pool singletons"
```

---

## Task 5: Password hashing script

**Files:**
- Create: `scripts/hash-password.mjs`

- [ ] **Step 1: Create the script**

```js
#!/usr/bin/env node
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const rl = createInterface({ input: stdin, output: stdout });
const pw = (await rl.question("Admin password: ")).trim();
rl.close();

if (pw.length < 12) {
  console.error("Password must be at least 12 characters.");
  process.exit(1);
}

const hash = await bcrypt.hash(pw, 10);
console.log("\nPaste this into Vercel env var ADMIN_PASSWORD_HASH:\n");
console.log(hash);
```

- [ ] **Step 2: Run it and store the result**

Run: `node scripts/hash-password.mjs`
Enter a password (12+ chars) at the prompt.
Copy the printed hash into your local `.env.local` as `ADMIN_PASSWORD_HASH=<hash>`. Also save it somewhere safe for Vercel later.

- [ ] **Step 3: Commit**

```bash
git add scripts/hash-password.mjs
git commit -m "feat: scripts/hash-password.mjs bootstrap helper"
```

---

## Task 6: Zod schemas + tests

**Files:**
- Create: `lib/schemas.ts`
- Test: `lib/schemas.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `lib/schemas.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  subscribeSchema,
  rsvpSchema,
  pitchSchema,
  loginSchema,
} from "./schemas";

describe("subscribeSchema", () => {
  it("accepts a valid email", () => {
    const r = subscribeSchema.parse({ email: "Foo@UKY.edu" });
    expect(r.email).toBe("foo@uky.edu");
  });

  it("rejects malformed email", () => {
    expect(() => subscribeSchema.parse({ email: "nope" })).toThrow();
  });

  it("rejects oversize email", () => {
    const long = "a".repeat(250) + "@uky.edu";
    expect(() => subscribeSchema.parse({ email: long })).toThrow();
  });

  it("accepts optional source", () => {
    const r = subscribeSchema.parse({ email: "x@uky.edu", source: "footer" });
    expect(r.source).toBe("footer");
  });

  it("drops honeypot 'website' from output (it lives at the route level)", () => {
    // Honeypot is checked in the route, not the schema. Schema rejects unknown keys.
    expect(() =>
      subscribeSchema.parse({ email: "x@uky.edu", website: "bot" }),
    ).toThrow();
  });
});

describe("rsvpSchema", () => {
  it("accepts a complete RSVP", () => {
    const r = rsvpSchema.parse({
      name: "Tama Thé",
      email: "tama@uky.edu",
      role: "Faculty",
      motivations: ["Curious about the group"],
      note: "Excited",
      joinListserv: true,
    });
    expect(r.email).toBe("tama@uky.edu");
    expect(r.motivations).toHaveLength(1);
  });

  it("trims name and note", () => {
    const r = rsvpSchema.parse({
      name: "  Tama  ",
      email: "t@uky.edu",
      motivations: [],
      joinListserv: false,
      note: "  hi  ",
    });
    expect(r.name).toBe("Tama");
    expect(r.note).toBe("hi");
  });

  it("caps motivations at 10", () => {
    const motivations = Array(11).fill("x");
    expect(() =>
      rsvpSchema.parse({
        name: "X",
        email: "x@uky.edu",
        motivations,
        joinListserv: false,
      }),
    ).toThrow();
  });

  it("requires non-empty name", () => {
    expect(() =>
      rsvpSchema.parse({
        name: "",
        email: "x@uky.edu",
        motivations: [],
        joinListserv: false,
      }),
    ).toThrow();
  });
});

describe("pitchSchema", () => {
  it("accepts a complete pitch", () => {
    const r = pitchSchema.parse({
      submitterName: "X",
      submitterEmail: "x@uky.edu",
      problem: "Problem text",
      affected: "Affected group",
      firstBuild: "Build idea",
    });
    expect(r.problem).toBe("Problem text");
  });

  it("requires all three structured fields", () => {
    expect(() =>
      pitchSchema.parse({
        submitterName: "X",
        submitterEmail: "x@uky.edu",
        problem: "",
        affected: "Group",
        firstBuild: "Build",
      }),
    ).toThrow();
  });

  it("caps problem at 2000 chars", () => {
    expect(() =>
      pitchSchema.parse({
        submitterName: "X",
        submitterEmail: "x@uky.edu",
        problem: "a".repeat(2001),
        affected: "Group",
        firstBuild: "Build",
      }),
    ).toThrow();
  });
});

describe("loginSchema", () => {
  it("accepts a string password", () => {
    const r = loginSchema.parse({ password: "hunter2hunter2" });
    expect(r.password).toBe("hunter2hunter2");
  });

  it("rejects missing password", () => {
    expect(() => loginSchema.parse({})).toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/schemas.test.ts`
Expected: FAIL with "Cannot find module './schemas'" or similar.

- [ ] **Step 3: Implement `lib/schemas.ts`**

```ts
import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

const shortText = (max = 200) => z.string().trim().min(1).max(max);
const optionalText = (max = 2000) => z.string().trim().max(max).optional();

export const subscribeSchema = z
  .object({
    email: emailField,
    source: z.string().trim().max(50).optional(),
  })
  .strict();

export const rsvpSchema = z
  .object({
    name: shortText(200),
    email: emailField,
    role: z.string().trim().max(100).optional(),
    motivations: z.array(z.string().trim().min(1).max(100)).max(10),
    note: optionalText(5000),
    joinListserv: z.boolean(),
  })
  .strict();

export const pitchSchema = z
  .object({
    submitterName: shortText(200),
    submitterEmail: emailField,
    role: z.string().trim().max(100).optional(),
    problem: shortText(2000),
    affected: shortText(1000),
    firstBuild: shortText(2000),
  })
  .strict();

export const loginSchema = z
  .object({
    password: z.string().min(1).max(500),
  })
  .strict();

export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type RsvpInput = z.infer<typeof rsvpSchema>;
export type PitchInput = z.infer<typeof pitchSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/schemas.test.ts`
Expected: PASS (all 13 cases).

- [ ] **Step 5: Commit**

```bash
git add lib/schemas.ts lib/schemas.test.ts
git commit -m "feat: zod schemas for subscribe/rsvp/pitch/login with tests"
```

---

## Task 7: In-memory rate limiter + tests

**Files:**
- Create: `lib/rate-limit.ts`
- Test: `lib/rate-limit.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/rate-limit.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  it("allows up to the configured number of requests", () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit("test:1.2.3.4", { max: 5, windowMs: 60_000 })).toBe(true);
    }
  });

  it("blocks the next request after the cap", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test:1.2.3.5", { max: 5, windowMs: 60_000 });
    }
    expect(checkRateLimit("test:1.2.3.5", { max: 5, windowMs: 60_000 })).toBe(false);
  });

  it("resets after the window expires", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test:1.2.3.6", { max: 5, windowMs: 60_000 });
    }
    expect(checkRateLimit("test:1.2.3.6", { max: 5, windowMs: 60_000 })).toBe(false);
    vi.advanceTimersByTime(60_001);
    expect(checkRateLimit("test:1.2.3.6", { max: 5, windowMs: 60_000 })).toBe(true);
  });

  it("tracks different keys independently", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test:a", { max: 5, windowMs: 60_000 });
    }
    expect(checkRateLimit("test:a", { max: 5, windowMs: 60_000 })).toBe(false);
    expect(checkRateLimit("test:b", { max: 5, windowMs: 60_000 })).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/rate-limit.test.ts`
Expected: FAIL with "Cannot find module './rate-limit'".

- [ ] **Step 3: Implement `lib/rate-limit.ts`**

```ts
import { LRUCache } from "lru-cache";

interface Entry {
  count: number;
  resetAt: number;
}

const cache = new LRUCache<string, Entry>({ max: 5000 });

export interface RateLimitConfig {
  max: number;
  windowMs: number;
}

/**
 * Returns true if the request is allowed, false if rate limited.
 * Keys should include both route and IP, e.g. `"subscribe:1.2.3.4"`.
 */
export function checkRateLimit(key: string, cfg: RateLimitConfig): boolean {
  const now = Date.now();
  const existing = cache.get(key);
  if (!existing || existing.resetAt < now) {
    cache.set(key, { count: 1, resetAt: now + cfg.windowMs });
    return true;
  }
  if (existing.count >= cfg.max) return false;
  existing.count += 1;
  cache.set(key, existing);
  return true;
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/rate-limit.test.ts`
Expected: PASS (4 cases).

- [ ] **Step 5: Commit**

```bash
git add lib/rate-limit.ts lib/rate-limit.test.ts
git commit -m "feat: in-memory LRU rate limiter for public forms"
```

---

## Task 8: JWT auth helpers + tests

**Files:**
- Create: `lib/auth.ts`
- Test: `lib/auth.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/auth.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { mintAdminToken, verifyAdminToken } from "./auth";

const ORIGINAL_SECRET = process.env.JWT_SECRET;

afterAll(() => {
  if (ORIGINAL_SECRET) process.env.JWT_SECRET = ORIGINAL_SECRET;
});

describe("admin JWT helpers", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-must-be-at-least-32-characters-long";
  });

  it("mints a token that verifies under the same secret", async () => {
    const token = await mintAdminToken();
    const payload = await verifyAdminToken(token);
    expect(payload.role).toBe("admin");
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await mintAdminToken();
    process.env.JWT_SECRET = "different-secret-also-at-least-32-chars-yes-yes";
    await expect(verifyAdminToken(token)).rejects.toThrow();
  });

  it("rejects garbage tokens", async () => {
    await expect(verifyAdminToken("not-a-jwt")).rejects.toThrow();
  });

  it("rejects an expired token", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const token = await mintAdminToken();
    vi.setSystemTime(new Date("2026-03-01T00:00:00Z"));
    await expect(verifyAdminToken(token)).rejects.toThrow();
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run lib/auth.test.ts`
Expected: FAIL ("Cannot find module './auth'").

- [ ] **Step 3: Implement `lib/auth.ts`**

```ts
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
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run lib/auth.test.ts`
Expected: PASS (4 cases).

- [ ] **Step 5: Commit**

```bash
git add lib/auth.ts lib/auth.test.ts
git commit -m "feat: jose JWT helpers + requireAdmin for cookie-based admin auth"
```

---

## Task 9: Edge middleware (gates /admin and /api/admin)

**Files:**
- Create: `middleware.ts` (project root)

> **Note on testing:** Middleware runs in Next.js Edge runtime; unit-testing it requires mocking `NextRequest` and is brittle. We rely on the manual smoke checklist (Task 23) for coverage.

- [ ] **Step 1: Create `middleware.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE = "incubator-admin";

const EXEMPT_PATHS = new Set([
  "/admin-login",
  "/api/admin/login",
  "/api/admin/logout",
]);

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return new TextEncoder().encode(secret);
}

async function isValidAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (EXEMPT_PATHS.has(pathname)) return NextResponse.next();

  if (await isValidAdmin(req)) return NextResponse.next();

  if (pathname.startsWith("/api/admin/")) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const loginUrl = new URL("/admin-login", req.url);
  loginUrl.searchParams.set("next", pathname + req.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: edge middleware gating /admin and /api/admin"
```

---

## Task 10: Admin login + logout routes

**Files:**
- Create: `app/api/admin/login/route.ts`
- Create: `app/api/admin/logout/route.ts`
- Test: `app/api/admin/login/route.test.ts`

- [ ] **Step 1: Write failing test**

Create `app/api/admin/login/route.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

beforeEach(() => {
  vi.resetModules();
  process.env.JWT_SECRET = "test-secret-must-be-at-least-32-characters-long";
});

async function postLogin(body: unknown) {
  const { POST } = await import("./route");
  return POST(
    new Request("http://localhost/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "9.9.9.9" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/admin/login", () => {
  it("returns 200 + sets cookie when password matches", async () => {
    process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash("hunter2hunter2", 4);
    const res = await postLogin({ password: "hunter2hunter2" });
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(/incubator-admin=/);
    expect(setCookie).toMatch(/HttpOnly/i);
  });

  it("returns 401 when password is wrong", async () => {
    process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash("correct", 4);
    const res = await postLogin({ password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("returns 400 when body is malformed", async () => {
    process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash("x", 4);
    const res = await postLogin({});
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run app/api/admin/login/route.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `app/api/admin/login/route.ts`**

```ts
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
```

- [ ] **Step 4: Implement `app/api/admin/logout/route.ts`**

```ts
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
```

- [ ] **Step 5: Run tests to verify pass**

Run: `npx vitest run app/api/admin/login/route.test.ts`
Expected: PASS (3 cases).

- [ ] **Step 6: Commit**

```bash
git add app/api/admin/login/route.ts app/api/admin/login/route.test.ts app/api/admin/logout/route.ts
git commit -m "feat: admin login/logout routes with JWT cookie"
```

---

## Task 11: POST /api/subscribe + tests

**Files:**
- Create: `app/api/subscribe/route.ts`
- Test: `app/api/subscribe/route.test.ts`

- [ ] **Step 1: Write failing tests**

Create `app/api/subscribe/route.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const upsertMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    subscriber: { upsert: upsertMock },
  },
}));

async function post(body: unknown, headers: Record<string, string> = {}) {
  const { POST } = await import("./route");
  return POST(
    new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4", ...headers },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  upsertMock.mockReset();
  upsertMock.mockResolvedValue({});
});

describe("POST /api/subscribe", () => {
  it("returns 204 and upserts a subscriber", async () => {
    const res = await post({ email: "x@uky.edu", source: "footer" });
    expect(res.status).toBe(204);
    expect(upsertMock).toHaveBeenCalledOnce();
    expect(upsertMock.mock.calls[0][0]).toMatchObject({
      where: { email: "x@uky.edu" },
      create: expect.objectContaining({ email: "x@uky.edu", source: "footer", status: "active" }),
      update: { status: "active", unsubscribedAt: null },
    });
  });

  it("silently drops honeypot submissions (returns 204, no upsert)", async () => {
    const res = await post({ email: "bot@bots.dev", website: "spam" });
    expect(res.status).toBe(204);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("returns 400 on validation failure", async () => {
    const res = await post({ email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("rate-limits after 5 requests per IP", async () => {
    for (let i = 0; i < 5; i++) {
      await post({ email: `x${i}@uky.edu` }, { "x-forwarded-for": "5.5.5.5" });
    }
    const res = await post({ email: "z@uky.edu" }, { "x-forwarded-for": "5.5.5.5" });
    expect(res.status).toBe(429);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run app/api/subscribe/route.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `app/api/subscribe/route.ts`**

```ts
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
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run app/api/subscribe/route.test.ts`
Expected: PASS (4 cases).

- [ ] **Step 5: Commit**

```bash
git add app/api/subscribe/route.ts app/api/subscribe/route.test.ts
git commit -m "feat: POST /api/subscribe with honeypot, rate limit, upsert"
```

---

## Task 12: POST /api/rsvp + tests

**Files:**
- Create: `app/api/rsvp/route.ts`
- Test: `app/api/rsvp/route.test.ts`

- [ ] **Step 1: Write failing tests**

Create `app/api/rsvp/route.test.ts`:

```ts
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
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run app/api/rsvp/route.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `app/api/rsvp/route.ts`**

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

  try {
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
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run app/api/rsvp/route.test.ts`
Expected: PASS (4 cases).

- [ ] **Step 5: Commit**

```bash
git add app/api/rsvp/route.ts app/api/rsvp/route.test.ts
git commit -m "feat: POST /api/rsvp with server-computed meetingDate + listserv upsert"
```

---

## Task 13: POST /api/pitch + tests

**Files:**
- Create: `app/api/pitch/route.ts`
- Test: `app/api/pitch/route.test.ts`

- [ ] **Step 1: Write failing tests**

Create `app/api/pitch/route.test.ts`:

```ts
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
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run app/api/pitch/route.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `app/api/pitch/route.ts`**

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pitchSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

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

  try {
    await prisma.pitch.create({
      data: {
        submitterName: parsed.data.submitterName,
        submitterEmail: parsed.data.submitterEmail,
        role: parsed.data.role ?? null,
        problem: parsed.data.problem,
        affected: parsed.data.affected,
        firstBuild: parsed.data.firstBuild,
        status: "new",
      },
    });
  } catch (err) {
    console.error("pitch create failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run app/api/pitch/route.test.ts`
Expected: PASS (3 cases).

- [ ] **Step 5: Commit**

```bash
git add app/api/pitch/route.ts app/api/pitch/route.test.ts
git commit -m "feat: POST /api/pitch for structured pitch submissions"
```

---

## Task 14: Rewire SubscribeForm

**Files:**
- Modify: `components/SubscribeForm.tsx`

- [ ] **Step 1: Replace the file with the rewired version**

```tsx
"use client";

import { useState } from "react";

interface Props {
  /** Identifies where the form is mounted, stored on the Subscriber row. */
  source?: string;
}

export default function SubscribeForm({ source = "footer" }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [email, setEmail] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const formData = new FormData(e.currentTarget);
    const honeypot = formData.get("website");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source, website: honeypot ?? "" }),
      });
      if (!res.ok && res.status !== 204) {
        setState("error");
        return;
      }
      setState("done");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  return (
    <form className="field" onSubmit={onSubmit}>
      <input
        type="email"
        placeholder="name@uky.edu"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={state === "sending" || state === "done"}
      />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ display: "none" }}
      />
      <button className="btn primary sm" type="submit" disabled={state === "sending"}>
        {state === "done" ? "Sent ✓" : state === "sending" ? "Sending…" : "Subscribe"}
      </button>
      {state === "error" && (
        <span className="small" style={{ color: "var(--danger, #c0392b)", marginLeft: 8 }}>
          Something went wrong. Try again.
        </span>
      )}
    </form>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/SubscribeForm.tsx
git commit -m "feat: wire SubscribeForm to POST /api/subscribe with honeypot"
```

---

## Task 15: Rewire RsvpForm

**Files:**
- Modify: `components/RsvpForm.tsx`

- [ ] **Step 1: Replace the file**

```tsx
"use client";

import { useState } from "react";

const MOTIVATIONS = [
  "Curious about the group",
  "Have a problem to pitch",
  "Want to join a team",
  "Looking to collaborate (faculty)",
  "Bringing a colleague",
];

const ROLES = [
  "Undergrad student",
  "Graduate / Medical student",
  "Resident / Fellow",
  "Faculty",
  "Staff",
  "Community partner",
];

export default function RsvpForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [picked, setPicked] = useState<Set<string>>(new Set());

  function togglePick(m: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const fd = new FormData(e.currentTarget);
    const body = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      role: String(fd.get("role") ?? "") || undefined,
      motivations: Array.from(picked),
      note: String(fd.get("note") ?? "") || undefined,
      joinListserv: fd.get("joinListserv") === "on",
      website: String(fd.get("website") ?? ""),
    };
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok && res.status !== 204) {
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setState("error");
    }
  }

  const submitted = state === "done";

  return (
    <div className="card" style={{ padding: 32 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 18 }}>
          <div>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>
              Your name
            </label>
            <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
              <input name="name" placeholder="First Last" required />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            <div>
              <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>
                UK email
              </label>
              <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
                <input name="email" type="email" placeholder="name@uky.edu" required />
              </div>
            </div>
            <div>
              <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>
                Role
              </label>
              <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
                <input name="role" list="roles" placeholder="Student / Faculty / Other" />
                <datalist id="roles">
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </datalist>
              </div>
            </div>
          </div>
          <div>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>
              What brings you in?
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {MOTIVATIONS.map((m) => (
                <button
                  type="button"
                  key={m}
                  className={`filter-chip ${picked.has(m) ? "active" : ""}`}
                  onClick={() => togglePick(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>
              Anything else?{" "}
              <span style={{ color: "var(--ink-4)", textTransform: "none", letterSpacing: 0 }}>
                (optional)
              </span>
            </label>
            <textarea
              name="note"
              rows={3}
              style={{
                width: "100%",
                resize: "vertical",
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: "12px 16px",
                fontFamily: "var(--sans)",
                fontSize: 14,
                color: "var(--ink)",
                outline: "none",
              }}
              placeholder="What you're working on, what you'd like help with, what you can contribute."
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--ink-3)" }}>
            <input type="checkbox" id="ls" name="joinListserv" defaultChecked style={{ accentColor: "var(--accent)" }} />
            <label htmlFor="ls">Add me to the weekly listserv</label>
          </div>
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ display: "none" }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="submit"
              disabled={state === "sending" || submitted}
              className={`btn lg ${submitted ? "" : "primary"}`}
              style={submitted ? { background: "var(--signal)", color: "var(--bg)", borderColor: "var(--signal)" } : undefined}
            >
              {submitted ? "Confirmed ✓" : state === "sending" ? "Sending…" : <>RSVP for Friday <span className="arrow">→</span></>}
            </button>
            <span className="small">We&apos;ll never share your email.</span>
          </div>
          {state === "error" && (
            <div className="small" style={{ color: "var(--danger, #c0392b)" }}>
              Something went wrong. Try again in a minute.
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/RsvpForm.tsx
git commit -m "feat: wire RsvpForm to POST /api/rsvp with honeypot + listserv opt-in"
```

---

## Task 16: PitchForm component

**Files:**
- Create: `components/PitchForm.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useState } from "react";

const ROLES = [
  "Undergrad student",
  "Graduate / Medical student",
  "Resident / Fellow",
  "Faculty",
  "Staff",
  "Community partner",
];

const textareaStyle: React.CSSProperties = {
  width: "100%",
  resize: "vertical",
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: "12px 16px",
  fontFamily: "var(--sans)",
  fontSize: 14,
  color: "var(--ink)",
  outline: "none",
};

export default function PitchForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const fd = new FormData(e.currentTarget);
    const body = {
      submitterName: String(fd.get("submitterName") ?? ""),
      submitterEmail: String(fd.get("submitterEmail") ?? ""),
      role: String(fd.get("role") ?? "") || undefined,
      problem: String(fd.get("problem") ?? ""),
      affected: String(fd.get("affected") ?? ""),
      firstBuild: String(fd.get("firstBuild") ?? ""),
      website: String(fd.get("website") ?? ""),
    };
    try {
      const res = await fetch("/api/pitch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok && res.status !== 204) {
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setState("error");
    }
  }

  const submitted = state === "done";

  return (
    <div className="card" style={{ padding: 32 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
            <div>
              <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Your name</label>
              <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
                <input name="submitterName" placeholder="First Last" required />
              </div>
            </div>
            <div>
              <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Role (optional)</label>
              <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
                <input name="role" list="pitch-roles" placeholder="Student / Faculty / Other" />
                <datalist id="pitch-roles">
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </datalist>
              </div>
            </div>
          </div>
          <div>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Email</label>
            <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
              <input name="submitterEmail" type="email" placeholder="name@uky.edu" required />
            </div>
          </div>
          <div>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>The problem</label>
            <textarea
              name="problem"
              rows={3}
              required
              maxLength={2000}
              style={textareaStyle}
              placeholder="What's broken? Two to three sentences."
            />
          </div>
          <div>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>Who it affects</label>
            <textarea
              name="affected"
              rows={2}
              required
              maxLength={1000}
              style={textareaStyle}
              placeholder="Which patients, students, staff, or community."
            />
          </div>
          <div>
            <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>What you&apos;d build first</label>
            <textarea
              name="firstBuild"
              rows={3}
              required
              maxLength={2000}
              style={textareaStyle}
              placeholder="The smallest first thing that would prove or disprove the idea."
            />
          </div>
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ display: "none" }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="submit"
              disabled={state === "sending" || submitted}
              className={`btn lg ${submitted ? "" : "primary"}`}
              style={submitted ? { background: "var(--signal)", color: "var(--bg)", borderColor: "var(--signal)" } : undefined}
            >
              {submitted ? "Submitted ✓" : state === "sending" ? "Submitting…" : <>Submit pitch <span className="arrow">→</span></>}
            </button>
            <span className="small">We read every pitch. We&apos;ll be in touch within a week.</span>
          </div>
          {state === "error" && (
            <div className="small" style={{ color: "var(--danger, #c0392b)" }}>
              Something went wrong. Try again in a minute.
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/PitchForm.tsx
git commit -m "feat: PitchForm with three structured fields, POSTs to /api/pitch"
```

---

## Task 17: Mount PitchForm on /join + tweak copy

**Files:**
- Modify: `app/join/page.tsx`

- [ ] **Step 1: Update Path 02 CTA**

Find the block (around line 146-156):

```tsx
            <a
              href="#rsvp"
              className="cta"
              style={{
                color: "var(--accent)",
                borderTopColor:
                  "color-mix(in oklab, var(--bg) 20%, transparent)",
              }}
            >
              Submit a pitch <span>→</span>
            </a>
```

Replace `href="#rsvp"` with `href="#pitch"`.

- [ ] **Step 2: Update RSVP intro copy**

Find (around line 191-194):

```tsx
            <p className="body" style={{ marginTop: 18, maxWidth: "36ch" }}>
              Tell us a bit about yourself and we&apos;ll send you the Teams
              link and that week&apos;s agenda.
            </p>
```

Replace with:

```tsx
            <p className="body" style={{ marginTop: 18, maxWidth: "36ch" }}>
              See you Friday. The Teams link is in the weekly listserv — opt in
              below if you&apos;re not on it yet.
            </p>
```

- [ ] **Step 3: Add PitchForm import**

At the top of the file, after `import RsvpForm from "@/components/RsvpForm";`, add:

```tsx
import PitchForm from "@/components/PitchForm";
```

- [ ] **Step 4: Add the pitch section**

Find the closing `</section>` of the RSVP form section (around line 219, just before the FAQ section).

Insert this new section immediately AFTER that closing `</section>` and BEFORE the FAQ section:

```tsx
      {/* ───── Pitch form ───── */}
      <section className="section container" id="pitch">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
            gap: "calc(64px * var(--d))",
            alignItems: "start",
          }}
        >
          <div>
            <div className="section-label">
              <span className="idx">PITCH</span>{" "}
              <span>Bring a problem to the group</span>
            </div>
            <h2 className="h1" style={{ maxWidth: "14ch" }}>
              Pitch a project.
            </h2>
            <p className="body" style={{ marginTop: 18, maxWidth: "36ch" }}>
              Sixty seconds at a Friday meeting works too. If you&apos;d rather
              write it down first, this form gives the group a structured one-pager
              to read before you arrive.
            </p>
            <div
              style={{
                marginTop: 28,
                padding: 18,
                background: "var(--surface-2)",
                borderRadius: 12,
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: "var(--ink-3)",
                lineHeight: 1.7,
              }}
            >
              <div style={{ color: "var(--ink)", marginBottom: 6 }}>
                A GOOD PITCH ANSWERS
              </div>
              <div>① The problem</div>
              <div>② Who it affects</div>
              <div>③ What you&apos;d build first</div>
            </div>
          </div>
          <PitchForm />
        </div>
      </section>
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add app/join/page.tsx
git commit -m "feat: mount PitchForm on /join, point Path 02 at #pitch, update RSVP copy"
```

---

## Task 18: Admin login page + shell layout

**Why login lives at `/admin-login`, not `/admin/login`:** anything under `app/admin/*` inherits the admin shell layout (sidebar with Sign out, etc.), which would render confusingly for an unauthenticated visitor. Keeping the login page in a sibling route segment (`app/admin-login/`) means it gets its own layout (just the centered card) and the admin shell only wraps the gated pages.

**Files:**
- Create: `app/admin-login/page.tsx`
- Create: `app/admin/layout.tsx`
- Create: `app/admin/admin.css`

- [ ] **Step 1: Create `app/admin/admin.css`**

```css
/* Admin shell — scoped styles for /admin/* pages */

.admin-shell {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
}

.admin-shell aside {
  border-right: 1px solid var(--line);
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--surface);
}

.admin-shell aside .brand {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--ink-3);
  margin-bottom: 18px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.admin-shell aside a {
  display: block;
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--ink-2);
  text-decoration: none;
  font-size: 14px;
}

.admin-shell aside a:hover {
  background: var(--surface-2);
  color: var(--ink);
}

.admin-shell aside a.active {
  background: var(--ink);
  color: var(--bg);
}

.admin-shell main {
  padding: 32px 40px;
  overflow-x: auto;
}

.admin-shell .topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.admin-shell .topbar h1 {
  font-size: 22px;
  font-weight: 800;
  margin: 0;
}

.admin-shell .topbar form {
  display: inline;
}

.admin-shell .topbar button {
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 6px 12px;
  color: var(--ink-2);
  cursor: pointer;
  font-size: 13px;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.admin-table th,
.admin-table td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
}

.admin-table th {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.admin-login-wrap {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--bg);
}

.admin-login-card {
  width: 360px;
  padding: 32px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
}
```

- [ ] **Step 2: Create `app/admin-login/page.tsx`**

```tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../admin/admin.css";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace(next);
        return;
      }
      const body = await res.json().catch(() => ({}));
      setErrorMsg(body.error ?? "Login failed");
      setState("error");
    } catch {
      setErrorMsg("Network error");
      setState("error");
    }
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)", marginBottom: 18, textTransform: "uppercase", letterSpacing: 0.05 }}>
          AI Incubator · Admin
        </div>
        <h1 style={{ margin: 0, marginBottom: 18, fontSize: 20, fontWeight: 800 }}>Sign in</h1>
        <form onSubmit={onSubmit}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "var(--bg)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              color: "var(--ink)",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={state === "sending"}
            className="btn primary"
            style={{ width: "100%", marginTop: 14 }}
          >
            {state === "sending" ? "Signing in…" : "Sign in"}
          </button>
          {errorMsg && (
            <div className="small" style={{ marginTop: 12, color: "var(--danger, #c0392b)" }}>
              {errorMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
```

- [ ] **Step 3: Create `app/admin/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "./admin.css";

async function logoutAction() {
  "use server";
  const store = await cookies();
  store.set("incubator-admin", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  redirect("/admin-login");
}

interface Props {
  children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
  return (
    <div className="admin-shell">
      <aside>
        <div className="brand">AI Incubator</div>
        <Link href="/admin">Overview</Link>
        <Link href="/admin/subscribers">Subscribers</Link>
        <Link href="/admin/rsvps">RSVPs</Link>
        <Link href="/admin/pitches">Pitches</Link>
        <div style={{ flex: 1 }} />
        <form action={logoutAction}>
          <button type="submit" className="small" style={{ background: "transparent", border: 0, color: "var(--ink-3)", cursor: "pointer", padding: "8px 12px" }}>
            Sign out
          </button>
        </form>
      </aside>
      <main>{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add app/admin/layout.tsx app/admin/admin.css app/admin-login/
git commit -m "feat: admin shell layout + /admin-login page outside gated route segment"
```

---

## Task 19: Admin overview page

**Files:**
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { nextSession } from "@/lib/session";

export const dynamic = "force-dynamic";

async function loadStats() {
  const upcomingMeeting = nextSession();
  const [subscriberCount, latestSubscribers, unreviewedRsvps, newPitches] = await Promise.all([
    prisma.subscriber.count({ where: { status: "active" } }),
    prisma.subscriber.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { email: true, createdAt: true, source: true },
    }),
    prisma.rsvp.count({ where: { reviewed: false, meetingDate: { gte: new Date() } } }),
    prisma.pitch.count({ where: { status: "new" } }),
  ]);
  return { subscriberCount, latestSubscribers, upcomingMeeting, unreviewedRsvps, newPitches };
}

export default async function AdminOverview() {
  const s = await loadStats();
  return (
    <>
      <div className="topbar">
        <h1>Overview</h1>
        <button type="button" title="Coming in Stage 3" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
          Draft this week&apos;s digest
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <Link href="/admin/subscribers" className="card" style={{ padding: 20, textDecoration: "none", color: "inherit" }}>
          <div className="eyebrow">Subscribers</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>{s.subscriberCount}</div>
          <div className="small" style={{ marginTop: 6, color: "var(--ink-3)" }}>active</div>
        </Link>
        <Link href="/admin/rsvps" className="card" style={{ padding: 20, textDecoration: "none", color: "inherit" }}>
          <div className="eyebrow">Unreviewed RSVPs</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>{s.unreviewedRsvps}</div>
          <div className="small" style={{ marginTop: 6, color: "var(--ink-3)" }}>for upcoming meetings</div>
        </Link>
        <Link href="/admin/pitches" className="card" style={{ padding: 20, textDecoration: "none", color: "inherit" }}>
          <div className="eyebrow">New pitches</div>
          <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>{s.newPitches}</div>
          <div className="small" style={{ marginTop: 6, color: "var(--ink-3)" }}>awaiting review</div>
        </Link>
      </div>
      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Latest subscribers</h2>
        {s.latestSubscribers.length === 0 ? (
          <p className="small" style={{ color: "var(--ink-3)" }}>No subscribers yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Email</th><th>Source</th><th>Signed up</th></tr>
            </thead>
            <tbody>
              {s.latestSubscribers.map((row) => (
                <tr key={row.email}>
                  <td>{row.email}</td>
                  <td>{row.source ?? "—"}</td>
                  <td>{row.createdAt.toISOString().slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: admin overview page with queue counts + latest subscribers"
```

---

## Task 20: Admin subscribers page + actions + CSV

**Files:**
- Create: `app/admin/subscribers/page.tsx`
- Create: `app/admin/subscribers/actions.ts`
- Create: `app/api/admin/subscribers.csv/route.ts`

- [ ] **Step 1: Create `app/admin/subscribers/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { subscribeSchema } from "@/lib/schemas";

export async function addSubscriber(formData: FormData) {
  await requireAdmin();
  const parsed = subscribeSchema.safeParse({
    email: formData.get("email"),
    source: "manual",
  });
  if (!parsed.success) {
    return { error: "Invalid email" };
  }
  await prisma.subscriber.upsert({
    where: { email: parsed.data.email },
    create: {
      email: parsed.data.email,
      source: "manual",
      status: "active",
    },
    update: { status: "active", unsubscribedAt: null },
  });
  revalidatePath("/admin/subscribers");
  revalidatePath("/admin");
  return { ok: true };
}

export async function setSubscriberStatus(id: string, status: "active" | "unsubscribed") {
  await requireAdmin();
  await prisma.subscriber.update({
    where: { id },
    data: {
      status,
      unsubscribedAt: status === "unsubscribed" ? new Date() : null,
    },
  });
  revalidatePath("/admin/subscribers");
  revalidatePath("/admin");
}
```

- [ ] **Step 2: Create `app/admin/subscribers/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";
import { addSubscriber, setSubscriberStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const subs = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <div className="topbar">
        <h1>Subscribers</h1>
        <a href="/api/admin/subscribers.csv" className="btn sm" download>Export CSV</a>
      </div>

      <form action={addSubscriber} style={{ marginBottom: 20, display: "flex", gap: 8 }}>
        <input
          name="email"
          type="email"
          placeholder="add@email.com"
          required
          style={{
            padding: "8px 12px",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 8,
            color: "var(--ink)",
            fontSize: 14,
            minWidth: 280,
          }}
        />
        <button type="submit" className="btn primary sm">Add subscriber</button>
      </form>

      {subs.length === 0 ? (
        <p className="small" style={{ color: "var(--ink-3)" }}>
          No subscribers yet. Add one above, or wait for signups from the footer / <code>/join</code> form.
        </p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Source</th>
              <th>Status</th>
              <th>Signed up</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {subs.map((row) => (
              <tr key={row.id}>
                <td>{row.email}</td>
                <td>{row.source ?? "—"}</td>
                <td>
                  <span style={{ color: row.status === "active" ? "var(--signal, #2ecc71)" : "var(--ink-3)" }}>
                    {row.status}
                  </span>
                </td>
                <td>{row.createdAt.toISOString().slice(0, 10)}</td>
                <td>
                  <ToggleStatusForm id={row.id} current={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function ToggleStatusForm({ id, current }: { id: string; current: "active" | "unsubscribed" }) {
  const next = current === "active" ? "unsubscribed" : "active";
  return (
    <form action={async () => { "use server"; await setSubscriberStatus(id, next); }}>
      <button type="submit" className="small" style={{ background: "transparent", border: "1px solid var(--line)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: "var(--ink-2)" }}>
        {current === "active" ? "Unsubscribe" : "Reactivate"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create `app/api/admin/subscribers.csv/route.ts`**

```ts
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(v: string | null | undefined): string {
  if (v == null) return "";
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export async function GET() {
  await requireAdmin();
  const rows = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });

  const header = ["id", "email", "status", "source", "createdAt", "unsubscribedAt"].join(",");
  const lines = rows.map((r) =>
    [
      r.id,
      r.email,
      r.status,
      r.source,
      r.createdAt.toISOString(),
      r.unsubscribedAt?.toISOString() ?? "",
    ].map(csvEscape).join(","),
  );
  const body = [header, ...lines].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="subscribers.csv"',
    },
  });
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add app/admin/subscribers/ app/api/admin/subscribers.csv/
git commit -m "feat: admin subscribers page (table, add, status toggle, csv export)"
```

---

## Task 21: Admin RSVPs page + actions + CSV

**Files:**
- Create: `app/admin/rsvps/page.tsx`
- Create: `app/admin/rsvps/actions.ts`
- Create: `app/api/admin/rsvps.csv/route.ts`

- [ ] **Step 1: Create `app/admin/rsvps/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function setRsvpReviewed(id: string, reviewed: boolean) {
  await requireAdmin();
  await prisma.rsvp.update({ where: { id }, data: { reviewed } });
  revalidatePath("/admin/rsvps");
  revalidatePath("/admin");
}
```

- [ ] **Step 2: Create `app/admin/rsvps/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";
import { setRsvpReviewed } from "./actions";

export const dynamic = "force-dynamic";

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function RsvpsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = params.filter;

  const where = filter === "unreviewed" ? { reviewed: false } : {};
  const rsvps = await prisma.rsvp.findMany({
    where,
    orderBy: [{ meetingDate: "desc" }, { createdAt: "desc" }],
  });

  const grouped = new Map<string, typeof rsvps>();
  for (const r of rsvps) {
    const key = r.meetingDate.toISOString().slice(0, 10);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r);
  }

  return (
    <>
      <div className="topbar">
        <h1>RSVPs</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <a href={filter === "unreviewed" ? "/admin/rsvps" : "/admin/rsvps?filter=unreviewed"} className="btn sm">
            {filter === "unreviewed" ? "Show all" : "Unreviewed only"}
          </a>
          <a href="/api/admin/rsvps.csv" className="btn sm" download>Export CSV</a>
        </div>
      </div>

      {grouped.size === 0 ? (
        <p className="small" style={{ color: "var(--ink-3)" }}>
          No RSVPs yet. The form is live on <code>/join</code>.
        </p>
      ) : (
        Array.from(grouped.entries()).map(([dateIso, rows]) => (
          <section key={dateIso} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 14, fontFamily: "var(--mono)", color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.05, marginBottom: 12 }}>
              {fmtDate(rows[0]!.meetingDate)} · {rows.length} {rows.length === 1 ? "RSVP" : "RSVPs"}
            </h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Motivations</th>
                  <th>Note</th>
                  <th>Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.email}</td>
                    <td>{r.role ?? "—"}</td>
                    <td style={{ fontSize: 12 }}>
                      {r.motivations.length === 0
                        ? "—"
                        : r.motivations.map((m) => <span key={m} className="chip" style={{ fontSize: 11, marginRight: 4 }}>{m}</span>)}
                    </td>
                    <td style={{ maxWidth: 320, fontSize: 13, color: "var(--ink-2)" }}>{r.note ?? "—"}</td>
                    <td>
                      <ReviewedToggle id={r.id} reviewed={r.reviewed} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))
      )}
    </>
  );
}

function ReviewedToggle({ id, reviewed }: { id: string; reviewed: boolean }) {
  return (
    <form action={async () => { "use server"; await setRsvpReviewed(id, !reviewed); }}>
      <button type="submit" className="small" style={{ background: "transparent", border: "1px solid var(--line)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: reviewed ? "var(--signal, #2ecc71)" : "var(--ink-2)" }}>
        {reviewed ? "✓ Reviewed" : "Mark reviewed"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create `app/api/admin/rsvps.csv/route.ts`**

```ts
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(v: string | null | undefined): string {
  if (v == null) return "";
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export async function GET() {
  await requireAdmin();
  const rows = await prisma.rsvp.findMany({ orderBy: [{ meetingDate: "desc" }, { createdAt: "desc" }] });

  const header = ["id", "name", "email", "role", "motivations", "note", "joinListserv", "meetingDate", "reviewed", "createdAt"].join(",");
  const lines = rows.map((r) =>
    [
      r.id,
      r.name,
      r.email,
      r.role,
      r.motivations.join("; "),
      r.note,
      r.joinListserv ? "true" : "false",
      r.meetingDate.toISOString(),
      r.reviewed ? "true" : "false",
      r.createdAt.toISOString(),
    ].map((v) => csvEscape(typeof v === "string" ? v : String(v))).join(","),
  );
  const body = [header, ...lines].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="rsvps.csv"',
    },
  });
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add app/admin/rsvps/ app/api/admin/rsvps.csv/
git commit -m "feat: admin rsvps page grouped by meeting date, reviewed toggle, csv export"
```

---

## Task 22: Admin pitches page + actions + CSV

**Files:**
- Create: `app/admin/pitches/page.tsx`
- Create: `app/admin/pitches/actions.ts`
- Create: `app/api/admin/pitches.csv/route.ts`

- [ ] **Step 1: Create `app/admin/pitches/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { PitchStatus } from "@/app/generated/prisma";

const VALID = new Set<PitchStatus>([
  PitchStatus.new,
  PitchStatus.reviewing,
  PitchStatus.accepted,
  PitchStatus.declined,
  PitchStatus.converted,
]);

export async function setPitchStatus(id: string, status: string) {
  await requireAdmin();
  if (!VALID.has(status as PitchStatus)) throw new Error("invalid status");
  const next = status as PitchStatus;
  const current = await prisma.pitch.findUnique({ where: { id }, select: { status: true } });
  await prisma.pitch.update({
    where: { id },
    data: {
      status: next,
      reviewedAt:
        current?.status === PitchStatus.new && next !== PitchStatus.new
          ? new Date()
          : undefined,
    },
  });
  revalidatePath("/admin/pitches");
  revalidatePath("/admin");
}

export async function setPitchNotes(id: string, notes: string) {
  await requireAdmin();
  await prisma.pitch.update({ where: { id }, data: { notes: notes || null } });
  revalidatePath("/admin/pitches");
}
```

- [ ] **Step 2: Create `app/admin/pitches/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";
import { setPitchStatus, setPitchNotes } from "./actions";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "reviewing", "accepted", "declined", "converted"] as const;
type StatusKey = (typeof STATUSES)[number];

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function PitchesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedId = params.id;

  const pitches = await prisma.pitch.findMany({ orderBy: { createdAt: "desc" } });
  const selected = selectedId ? pitches.find((p) => p.id === selectedId) : undefined;

  const byStatus: Record<StatusKey, typeof pitches> = {
    new: [], reviewing: [], accepted: [], declined: [], converted: [],
  };
  for (const p of pitches) byStatus[p.status as StatusKey].push(p);

  return (
    <>
      <div className="topbar">
        <h1>Pitches</h1>
        <a href="/api/admin/pitches.csv" className="btn sm" download>Export CSV</a>
      </div>

      {pitches.length === 0 ? (
        <p className="small" style={{ color: "var(--ink-3)" }}>
          No pitches yet. The form is live on <code>/join</code> (Path 02).
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr", gap: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {STATUSES.map((s) => (
              <div key={s} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: 10, minHeight: 200 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>{s} · {byStatus[s].length}</div>
                {byStatus[s].map((p) => (
                  <a
                    key={p.id}
                    href={`/admin/pitches?id=${p.id}`}
                    className="card"
                    style={{
                      display: "block",
                      padding: 10,
                      marginBottom: 8,
                      textDecoration: "none",
                      color: "inherit",
                      fontSize: 12,
                      border: selectedId === p.id ? "1px solid var(--accent)" : undefined,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{p.submitterName}</div>
                    <div className="small" style={{ color: "var(--ink-3)" }}>{p.role ?? ""}</div>
                    <div style={{ marginTop: 6, color: "var(--ink-2)", lineHeight: 1.4 }}>
                      {p.problem.length > 80 ? p.problem.slice(0, 80) + "…" : p.problem}
                    </div>
                  </a>
                ))}
              </div>
            ))}
          </div>

          {selected && (
            <aside style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: 20, position: "sticky", top: 20, alignSelf: "start", maxHeight: "calc(100vh - 40px)", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: 18 }}>{selected.submitterName}</h2>
                <a href="/admin/pitches" className="small" style={{ color: "var(--ink-3)" }}>close ✕</a>
              </div>
              <div className="small" style={{ color: "var(--ink-3)", marginBottom: 14 }}>
                {selected.submitterEmail} {selected.role ? `· ${selected.role}` : ""}
              </div>

              <form action={async (fd) => { "use server"; await setPitchStatus(selected.id, String(fd.get("status") ?? "new")); }} style={{ marginBottom: 18 }}>
                <label className="eyebrow" style={{ display: "block", marginBottom: 6 }}>Status</label>
                <select name="status" defaultValue={selected.status} style={{ width: "100%", padding: "8px 12px", background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--ink)" }}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button type="submit" className="btn sm primary" style={{ marginTop: 8 }}>Save status</button>
              </form>

              <h3 className="eyebrow">The problem</h3>
              <p style={{ margin: "6px 0 16px 0", fontSize: 14, whiteSpace: "pre-wrap" }}>{selected.problem}</p>
              <h3 className="eyebrow">Who it affects</h3>
              <p style={{ margin: "6px 0 16px 0", fontSize: 14, whiteSpace: "pre-wrap" }}>{selected.affected}</p>
              <h3 className="eyebrow">What they&apos;d build first</h3>
              <p style={{ margin: "6px 0 16px 0", fontSize: 14, whiteSpace: "pre-wrap" }}>{selected.firstBuild}</p>

              <form action={async (fd) => { "use server"; await setPitchNotes(selected.id, String(fd.get("notes") ?? "")); }}>
                <label className="eyebrow" style={{ display: "block", marginBottom: 6 }}>Private notes</label>
                <textarea
                  name="notes"
                  defaultValue={selected.notes ?? ""}
                  rows={5}
                  style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--ink)", padding: 10, fontSize: 13, fontFamily: "var(--sans)", resize: "vertical" }}
                />
                <button type="submit" className="btn sm primary" style={{ marginTop: 8 }}>Save notes</button>
              </form>

              <div className="small" style={{ color: "var(--ink-3)", marginTop: 18 }}>
                Submitted {selected.createdAt.toLocaleString("en-US")}
              </div>
            </aside>
          )}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Create `app/api/admin/pitches.csv/route.ts`**

```ts
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(v: string | null | undefined): string {
  if (v == null) return "";
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export async function GET() {
  await requireAdmin();
  const rows = await prisma.pitch.findMany({ orderBy: { createdAt: "desc" } });

  const header = ["id", "submitterName", "submitterEmail", "role", "problem", "affected", "firstBuild", "status", "notes", "createdAt", "reviewedAt"].join(",");
  const lines = rows.map((r) =>
    [
      r.id,
      r.submitterName,
      r.submitterEmail,
      r.role,
      r.problem,
      r.affected,
      r.firstBuild,
      r.status,
      r.notes,
      r.createdAt.toISOString(),
      r.reviewedAt?.toISOString() ?? "",
    ].map(csvEscape).join(","),
  );
  const body = [header, ...lines].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="pitches.csv"',
    },
  });
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add app/admin/pitches/ app/api/admin/pitches.csv/
git commit -m "feat: admin pitches kanban with detail panel, status, notes, csv export"
```

---

## Task 23: Delete legacy worker + update README + smoke test doc

**Files:**
- Delete: `worker/pitch-intake/` (whole directory)
- Modify: `README.md`
- Create: `docs/admin-smoke-test.md`

- [ ] **Step 1: Delete the worker**

Run:
```bash
git rm -rf worker/pitch-intake/
rmdir worker 2>/dev/null || true
```

(If the directory still exists with untracked files, manually remove with `rm -rf worker/pitch-intake/` and then `rmdir worker` if empty.)

- [ ] **Step 2: Update `README.md`**

Find the "Loose ends to pick up" section and replace items 2 and 3 with:

```markdown
1. **`session.teamsUrl` is a placeholder** (`#teams-link`). Replace in
   `content/site.ts` with the real Microsoft Teams join URL.
2. ~~Subscribe + RSVP forms are no-op.~~ **Wired in Stage 1** — see
   [`docs/superpowers/specs/2026-05-26-admin-dashboard-design.md`](docs/superpowers/specs/2026-05-26-admin-dashboard-design.md).
   Submissions land in Postgres and surface in `/admin`.
3. ~~No CMS / agent integration yet.~~ **Stage 2 work** — content migrates
   from `content/site.ts` to the database; dashboard becomes the edit
   surface.
```

Find and update the **Stack** section to reflect dynamic:

```markdown
## Stack

- **Next.js 15** App Router with React 19, TypeScript strict mode
- **Dynamic deployment** on Vercel (formerly static export)
- **Neon Postgres** via Prisma 7 + PrismaPg adapter
- **`/admin` dashboard** (password-protected) for subscribers, RSVPs, pitches
- **No CMS yet.** Site content still in `content/site.ts` (Stage 2 will migrate this)
```

Find and update the **Deploying** section:

```markdown
## Deploying

Dynamic Next.js on Vercel.

### Required env vars

| Var | Value |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string |
| `DIRECT_URL` | Neon **direct** connection string (used by migrations) |
| `JWT_SECRET` | 32+ random chars; `openssl rand -hex 32` |
| `ADMIN_PASSWORD_HASH` | bcrypt hash from `node scripts/hash-password.mjs` |

### One-time setup

1. Provision a Neon project; copy both connection strings.
2. Locally: `cp prisma/.env.example .env.local`, fill in the values.
3. Run the initial migration: `npx prisma migrate deploy` (or `npm run db:deploy`).
4. Generate the client: `npm run db:generate`.
5. Generate an admin password hash: `node scripts/hash-password.mjs`.
6. Paste all four vars into Vercel's project Environment Variables.
7. Push to `master` — Vercel deploys.

### Smoke test

After deploy, run through [`docs/admin-smoke-test.md`](docs/admin-smoke-test.md).
```

- [ ] **Step 3: Create `docs/admin-smoke-test.md`**

```markdown
# Admin smoke test

Manual checklist for verifying Stage 1 after deploy. ~10 minutes.

## Public forms

- [ ] Visit `/` — page loads, no console errors.
- [ ] Footer subscribe form: enter a fresh email, click Subscribe → "Sent ✓".
- [ ] Visit `/join`:
  - [ ] Path 02 CTA "Submit a pitch" scrolls to the pitch section.
  - [ ] RSVP form: fill in name, email, pick a chip, check "Add me to the listserv" → "Confirmed ✓".
  - [ ] Pitch form: fill in name, email, problem/affected/firstBuild → "Submitted ✓".

## Admin auth

- [ ] Visit `/admin` while logged out → redirected to `/admin-login`.
- [ ] Enter the wrong password → "Incorrect password" error, still on login.
- [ ] Enter the right password → land on `/admin` overview.
- [ ] Refresh `/admin` — stays logged in (cookie persists).
- [ ] Open `/admin-login` directly while logged in — page renders (acceptable; clicking Sign in again no-ops).

## Admin dashboards

- [ ] Overview shows correct counts:
  - Subscribers count matches DB.
  - Unreviewed RSVPs count matches DB.
  - New pitches count matches DB.
  - Latest subscribers table shows the email submitted above.
- [ ] `/admin/subscribers`:
  - [ ] Table shows all subscribers ordered newest-first.
  - [ ] "Add subscriber" form adds a row.
  - [ ] "Unsubscribe" toggles status and hides from public counts.
  - [ ] "Export CSV" downloads a valid CSV with all columns.
- [ ] `/admin/rsvps`:
  - [ ] RSVPs grouped by meeting date, newest first.
  - [ ] Filter "Unreviewed only" hides reviewed rows.
  - [ ] Click "Mark reviewed" → flips to "✓ Reviewed", count drops on overview.
  - [ ] CSV export works.
- [ ] `/admin/pitches`:
  - [ ] Kanban columns: new, reviewing, accepted, declined, converted.
  - [ ] Click a card → detail panel opens on the right.
  - [ ] Change status → card moves columns.
  - [ ] Add a note, click "Save notes" → persists after reload.
  - [ ] CSV export works.

## Spam guards

- [ ] Open browser devtools, manually POST to `/api/subscribe` with `{ email, website: "spam" }` → 204, no DB row.
- [ ] POST `/api/subscribe` with garbage email → 400.
- [ ] POST `/api/subscribe` six times within 10 minutes from the same IP → 6th returns 429.

## Logout

- [ ] Click "Sign out" in the admin sidebar → redirected to `/admin-login`.
- [ ] Visit `/admin` again → redirected back to login (cookie cleared).
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove worker/pitch-intake, document admin smoke test, update README"
```

---

## Task 24: Type-check + full test run + dev smoke

**Files:** none (verification only)

- [ ] **Step 1: Full type-check**

Run: `npx tsc --noEmit`
Expected: clean (no errors).

- [ ] **Step 2: Full test run**

Run: `npm test`
Expected: all suites pass.

Tally: 14 schemas + 4 rate-limit + 4 auth + 3 login route + 4 subscribe + 4 rsvp + 3 pitch = 36 tests passing.

- [ ] **Step 3: Local dev smoke (requires `.env.local` with a working Neon connection)**

Run: `npm run dev`

In another terminal:
```bash
curl -s -X POST http://localhost:3000/api/subscribe -H 'content-type: application/json' -d '{"email":"smoke@example.com","source":"smoke"}' -i | head -1
```

Expected: `HTTP/1.1 204 No Content`.

Open http://localhost:3000/admin → redirected to `/admin-login` → enter password → land on overview, see the smoke email.

- [ ] **Step 4: Final commit (only if any fixes were needed)**

If the dev smoke surfaced bugs that needed fixing, commit those:

```bash
git add <paths>
git commit -m "fix: <whatever the bug was>"
```

If everything passed clean, skip this step.

---

## Self-Review

Re-read the spec [`docs/superpowers/specs/2026-05-26-admin-dashboard-design.md`](../specs/2026-05-26-admin-dashboard-design.md) and confirm every Stage 1 requirement maps to a task:

| Spec section | Tasks |
|---|---|
| Stack & config changes | Task 1, 2 |
| `next.config.mjs` updates | Task 2 |
| Repository: add/modify/delete | Tasks 1–23 |
| Data model: Subscriber/Rsvp/Pitch schema | Task 3 |
| Auth: env vars, bcrypt script, JWT, login/logout, middleware | Tasks 5, 8, 9, 10 |
| Public POST endpoints | Tasks 11, 12, 13 |
| Spam mitigation (honeypot + rate limit) | Tasks 7, 11, 12, 13 |
| SubscribeForm rewire | Task 14 |
| RsvpForm rewire | Task 15 |
| PitchForm new | Task 16 |
| `/join` page updates | Task 17 |
| `/admin/login` | Task 18 |
| `/admin` overview | Task 19 |
| `/admin/subscribers` page + actions + CSV | Task 20 |
| `/admin/rsvps` page + actions + CSV | Task 21 |
| `/admin/pitches` page + actions + CSV | Task 22 |
| Error handling | Tasks 11–13, 18 |
| Testing | Tasks 6, 7, 8, 10, 11, 12, 13 |
| Deployment / env vars / smoke test | Tasks 5, 23, 24 |
| Worker cleanup | Task 23 |

Coverage looks complete.
