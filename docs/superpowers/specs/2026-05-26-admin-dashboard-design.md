# Admin Dashboard — design spec

**Date:** 2026-05-26
**Status:** Draft, awaiting build approval
**Author:** Tama Thé (with Claude)
**Scope:** Stage 1 of a 3-stage rollout. Stages 2 & 3 sketched at the end.

---

## ⚠ Supersedes prior in-flight work

This spec explicitly redirects three earlier in-flight designs/work-streams:

| Prior artifact | What it does today | Status after this spec |
|---|---|---|
| `worker/pitch-intake/` (Cloudflare Worker + Resend) | Emails pitches to `tama.the@uky.edu` | **Removed.** Pitches land in the DB and surface in `/admin/pitches`. No email is sent. |
| `docs/superpowers/specs/2026-05-26-pitch-intake-design.md` | Worker-based pitch flow, emails the lead | **Superseded.** New pitch flow is a structured form in this spec. The conversational AI intake is deferred (could return as a Stage 4). |
| `docs/superpowers/plans/2026-05-26-pm-inbox.md` (Worker + GitHub Issues) | Public `/inbox` form writes to GitHub Issues; admin reviews issues, manually merges into `content/site.ts` | **Superseded by Stage 2** of this spec (content migration to DB). PM Inbox doesn't ship in its planned form. |
| `docs/superpowers/specs/2026-05-26-phase-1-operating-surface-design.md` (Phase 1a reduction) | Public surfaces (open-problems, outcomes, built) on static export | **Compatible.** Those surfaces continue to ship on the static path; this spec is what eventually replaces the static path entirely. |

Driving principle behind the redirect: **everything manageable from the website itself, in a single password-protected dashboard, with zero emails landing in the curator's inbox.** Workers + GitHub Issues + transactional email were the prior approach; this replaces them with a conventional dynamic Next.js app on Vercel + Neon Postgres.

---

## Goal

Replace the current static-export site's no-op forms (listserv subscribe, RSVP) and the worker-emailed pitch flow with a single self-contained operating surface:

1. Three public forms write directly to the site's database.
2. A password-gated `/admin` dashboard lets the curator review everything from one place.
3. No emails are sent to the curator. The only outbound email (added in Stage 3) is the weekly digest the curator composes from the dashboard.

---

## Non-goals

- No multi-admin RBAC. One curator, one password.
- No user accounts for submitters. Email is captured as a string, not a login.
- No confirmation / welcome / thank-you emails sent to submitters.
- No real-time push to the live site — pages read DB on render (ISR is fine).
- No mobile-specific design for the dashboard. Desktop-only acceptable.
- No conversational AI intake in Stage 1 (deferred indefinitely; structured form covers the need).

---

## Rollout (3 stages, separate spec each)

| Stage | Scope | Outcome |
|---|---|---|
| **1 (this spec)** | Drop static export. DB tables for Subscriber / Rsvp / Pitch. Public forms wired to DB. `/admin/login`, `/admin`, `/admin/subscribers`, `/admin/rsvps`, `/admin/pitches`. Remove worker/pitch-intake. | Curator's inbox stops getting form submissions. All three queues visible in one place. Site still reads content from `content/site.ts`. |
| **2** (sketched) | DB tables mirroring `content/site.ts` types. Migration seed. Public pages read DB. Content-editing UI under `/admin/content/*`. Delete `content/site.ts`. | Curator never edits a file to update the site. |
| **3** (sketched) | `WeeklyDigest` table. Claude-drafted digest from this week's DB activity. Send via Resend. Unsubscribe link. | Curator sends Monday digest from the dashboard. |

Each stage ships independently. This spec covers **Stage 1 only.**

---

## Stage 1 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Public site (existing pages, still reads content/site.ts)   │
│  ├── /          ─┐                                          │
│  ├── /projects   ├─ unchanged in Stage 1                    │
│  └── /join      ─┘                                          │
│                                                             │
│  Forms POST to:                                             │
│  ├── /api/subscribe  → Subscriber row                       │
│  ├── /api/rsvp       → Rsvp row (+ Subscriber if checked)   │
│  └── /api/pitch      → Pitch row                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Admin (JWT-gated)                                           │
│  ├── /admin/login    → POST /api/admin/login → JWT cookie   │
│  ├── /admin          → overview                             │
│  ├── /admin/subscribers                                     │
│  ├── /admin/rsvps                                           │
│  └── /admin/pitches                                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Data: Neon Postgres via Prisma v7 + PrismaPg adapter        │
│  Tables: Subscriber, Rsvp, Pitch                            │
└─────────────────────────────────────────────────────────────┘
```

### Stack

- **Next.js 15** dynamic (not static export). Deployed to Vercel.
- **Prisma v7.4+** with `@prisma/adapter-pg` (PrismaPg) — same pattern as the curator's day-job project. Generated client at `app/generated/prisma`, import via `../generated/prisma`. Shared `pg.Pool` in `app/lib/pg-pool.ts`. Connection string in `prisma.config.ts`, **not** in `datasource` block.
- **Postgres** on Neon (free tier).
- **Auth:** `jose` for JWT, `bcryptjs` for password hash. No `next-auth`.
- **Validation:** `zod`.
- **TypeScript strict** (already on).

### Config changes

- `next.config.mjs`:
  - Remove `output: 'export'`.
  - Remove `images.unoptimized` (optional — keep if no remote images yet).
  - Keep `trailingSlash: true` only if it doesn't break API routes; verify during implementation.
- `package.json`:
  - Add: `@prisma/client`, `prisma`, `@prisma/adapter-pg`, `pg`, `@types/pg`, `bcryptjs`, `@types/bcryptjs`, `jose`, `zod`.
  - Add scripts: `"db:generate": "prisma generate"`, `"db:migrate": "prisma migrate dev"`.

### Repository changes

- **Add:** `prisma/schema.prisma`, `prisma.config.ts`, `app/lib/prisma.ts`, `app/lib/pg-pool.ts`, `app/lib/auth.ts`, `app/lib/schemas.ts`, `app/lib/rate-limit.ts`, `app/middleware.ts`, `app/api/subscribe/route.ts`, `app/api/rsvp/route.ts`, `app/api/pitch/route.ts`, `app/api/admin/login/route.ts`, `app/api/admin/logout/route.ts`, `app/admin/layout.tsx`, `app/admin/login/page.tsx`, `app/admin/page.tsx`, `app/admin/subscribers/page.tsx`, `app/admin/subscribers/actions.ts`, `app/admin/rsvps/page.tsx`, `app/admin/rsvps/actions.ts`, `app/admin/pitches/page.tsx`, `app/admin/pitches/actions.ts`, `app/api/admin/subscribers.csv/route.ts`, `app/api/admin/rsvps.csv/route.ts`, `app/api/admin/pitches.csv/route.ts`, `components/PitchForm.tsx`, `scripts/hash-password.mjs`.
- **Modify:** `components/SubscribeForm.tsx`, `components/RsvpForm.tsx`, `app/join/page.tsx` (Path 02 scrolls to `#pitch` and renders `<PitchForm />`), `next.config.mjs`, `package.json`, `README.md` (remove "Subscribe + RSVP forms are no-op" loose end, document new env vars).
- **Delete:** `worker/pitch-intake/` (whole subdir), and references to it in any README. The worker is unbuilt, so no production teardown — just remove from repo.

---

## Stage 1 Data Model

`prisma/schema.prisma`:

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
  source          String?             // "footer" | "join-path-03" | "rsvp-checkbox" | "manual"
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
  motivations   String[]                // chip values from RsvpForm
  note          String?                 // free-text textarea
  joinListserv  Boolean  @default(false)
  meetingDate   DateTime                // computed server-side from lib/session.nextSession()
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
  problem         String       // "The problem"
  affected        String       // "Who it affects"
  firstBuild      String       // "What you'd build first"
  status          PitchStatus  @default(new)
  notes           String?      // curator's private notes (markdown)
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

Notes:

- `email` is unique only on `Subscriber`. Rsvp/Pitch may have repeat submitters across time.
- `meetingDate` is computed server-side using `lib/session.ts`'s `nextSession()` — the client cannot lie about which Friday it's for.
- `reviewed` / `status` / `notes` are admin-only flags, never accepted from the public POST body.
- `joinListserv` true on RSVP → upsert `Subscriber` with source `"rsvp-checkbox"`.

---

## Stage 1 Auth

**Single-password + JWT cookie.**

### Bootstrap

```bash
node scripts/hash-password.mjs            # prompts for password, prints bcrypt hash
```

Paste hash into Vercel env var `ADMIN_PASSWORD_HASH`. Generate a 32+ char `JWT_SECRET` and paste into env var. Both required at runtime.

### Login

- `app/admin/login/page.tsx` — minimal password form. Self-submits to `POST /api/admin/login`.
- `POST /api/admin/login`:
  - Body: `{ password: string }`. Validated via zod.
  - `bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH!)`.
  - On success: mint JWT `{ role: "admin", iat, exp }` (30-day expiry) via `jose`. Set cookie `incubator-admin` with `httpOnly`, `Secure` (in prod), `SameSite=Lax`, `Path=/`.
  - On failure: 401 with generic `{ error: "Incorrect password" }`. No rate-limit reveal.
- `POST /api/admin/logout` — clears cookie. Idempotent.

### Middleware

`app/middleware.ts` (Edge runtime):

- Match paths: `/admin/:path*` and `/api/admin/:path*`.
- Exempt: `/admin/login`, `/api/admin/login`, `/api/admin/logout`.
- Verify `incubator-admin` cookie via `jose.jwtVerify`. On fail:
  - For `/admin/*` HTML routes → 302 to `/admin/login?next=<encoded current URL>`.
  - For `/api/admin/*` routes → 401 JSON.

### Threat model

- One curator, one password. Acceptable for a single-tenant tool.
- Brute force: 5-attempts-per-IP-per-10min rate limit on `/api/admin/login` via the same in-memory LRU as the public forms (see "Spam mitigation" below).
- Token theft: `httpOnly` + `Secure` cookies + short-ish expiry (30 days). Logout invalidates by deleting cookie client-side; server doesn't keep a token blacklist (acceptable at this scale).

---

## Stage 1 Forms

### Public POST endpoints (no auth, IP rate limited)

| Route | Zod body | Side effects | Response |
|---|---|---|---|
| `POST /api/subscribe` | `{ email: string, source?: string }` | Upsert Subscriber (`@@unique` on email). If row exists with `status: unsubscribed`, flip to `active` and clear `unsubscribedAt`. | 204 No Content |
| `POST /api/rsvp` | `{ name, email, role?, motivations: string[], note?, joinListserv: boolean }` | Insert Rsvp with server-computed `meetingDate`. If `joinListserv`, upsert Subscriber with source `"rsvp-checkbox"`. | 204 No Content |
| `POST /api/pitch` | `{ submitterName, submitterEmail, role?, problem, affected, firstBuild }` | Insert Pitch with default status `new`. | 204 No Content |

Validation rules (zod, defined in `app/lib/schemas.ts`):

- Trim all strings.
- Lowercase email.
- Email format check.
- Length caps: email 254, names 200, role 100, short free-text 2000, long free-text 5000.
- `motivations[]` capped at 10 items, each ≤100 chars.

All endpoints return **204 on both success and silently-dropped honeypot triggers** so bots can't distinguish.

### Spam mitigation (no external services in Stage 1)

- **Honeypot field** in each form: `<input name="website" tabIndex={-1} aria-hidden style={{display:"none"}} autoComplete="off" />`. If non-empty in POST body → return 204 immediately, no DB write, no log.
- **Per-IP rate limit:** `app/lib/rate-limit.ts` — in-memory `LRUCache` keyed by `${route}:${ip}`. 5 requests / 10 min per route per IP. Acceptable at this scale; a single Vercel instance handles all traffic. If we see real abuse, swap for Upstash Redis (one-line change).
- **No CAPTCHA day one.** Cloudflare Turnstile is on the list for Stage 1.5 if we get bot traffic.

### Form components

- **`components/SubscribeForm.tsx`:** Replace no-op handler with `fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email, source }) })`. Keep the existing "Sent ✓" success state. Add hidden honeypot field. Add error state (red helper text under input) on non-2xx.
- **`components/RsvpForm.tsx`:** Same rewire pattern. Capture chip selections from existing `picked` state into `motivations[]`. Capture textarea into `note`. Capture "Add me to the weekly listserv" checkbox into `joinListserv` (currently `defaultChecked` — keep). Honeypot. Error banner above form on non-2xx.
- **New `components/PitchForm.tsx`:** Three structured fields plus contact:
  - Submitter name (required)
  - Submitter email (required, UK email allowed but not required)
  - Role (optional, datalist matching RSVP roles)
  - **The problem** (required textarea, 2-3 sentences hint, 2000 char cap)
  - **Who it affects** (required textarea, 1-2 sentences hint, 1000 char cap)
  - **What you'd build first** (required textarea, 2-3 sentences hint, 2000 char cap)
  - Honeypot, submit button, error banner, "Submitted ✓" success state.

### `/join` page changes

- Path 02 card CTA: change `href="#rsvp"` to `href="#pitch"`.
- Add new `<section className="section container" id="pitch">` rendering `<PitchForm />` immediately after the RSVP section. Header copy mirrors the Path 02 card ("Pitch a project at Friday's meeting").

### Form copy changes (curator-facing impact)

- `RsvpForm.tsx`: keep "We'll never share your email" but **remove any UI suggesting the curator gets emailed** (none currently — fine).
- Originally the RSVP intro copy says "we'll send you the Teams link and that week's agenda" (in `app/join/page.tsx`). Since we decided **no auto-emails**, change this to: *"We'll see you Friday. The Teams link is in the listserv (or just ask if you need it)."* Alternative considered: **show the Teams link on the success state**. Implementation chooses this if `content.session.teamsUrl` is set to a real URL by then; otherwise falls back to the listserv pointer.

---

## Stage 1 Dashboard

Five admin routes. Same layout shell (`app/admin/layout.tsx`) with sidebar + top bar. Visual tokens reuse the existing site's CSS variables (UK blue, mono accents, card pattern). No new design system.

### `/admin/login`
Minimal centered password form. Logo top-left. Submits to `/api/admin/login`. Honors `?next=` query param to redirect post-login.

### `/admin`
Overview page (default landing). Three "queue cards":

- Subscribers: total count, last 5 emails added, "View all →"
- RSVPs: count of unreviewed for the next meeting, link to `/admin/rsvps`
- Pitches: count of `status=new` pitches, link to `/admin/pitches`

Also a **"Draft this week's digest"** button — stubbed in Stage 1 (shows toast "Digest composer ships in Stage 3"). Reserves the spot.

### `/admin/subscribers`
- Table: email, source, status, signup date.
- Search input (client-side, filters table).
- "Export CSV" button → `GET /api/admin/subscribers.csv`.
- "Add subscriber" button → modal with email input, source defaults to `"manual"`.
- Each row has a kebab menu: "Mark unsubscribed" (sets `status=unsubscribed`, `unsubscribedAt=now`) or "Reactivate."

### `/admin/rsvps`
- Grouped by `meetingDate` (most recent Friday first, then upcoming, then past).
- Each row: name, email, role, motivations (as chips), note (truncated, expand on click), reviewed toggle.
- Filters: unreviewed only / by role.
- "Export CSV" → all RSVPs.
- No edit on submitter content. Only `reviewed` flag is mutable.

### `/admin/pitches`
- Kanban-ish: 5 columns matching `PitchStatus` (new, reviewing, accepted, declined, converted).
- Cards show submitter name + role + first ~80 chars of "the problem."
- Click a card → detail panel (right drawer or modal) showing all three structured fields verbatim, submitter contact, and a markdown editor for curator's `notes`.
- Status change via dropdown in the detail panel. `reviewedAt` set on first transition off `new`.
- "Export CSV" → all pitches with notes.
- No edit on submitter content.

### Mutations: server actions, not REST

All admin mutations (mark reviewed, change pitch status, save notes, add/remove subscriber) are Next.js server actions in `app/admin/<route>/actions.ts`. Each action calls a single auth helper at the top:

```ts
import { requireAdmin } from "@/app/lib/auth";

export async function markRsvpReviewed(id: string, reviewed: boolean) {
  await requireAdmin();
  await prisma.rsvp.update({ where: { id }, data: { reviewed } });
  revalidatePath("/admin/rsvps");
}
```

`requireAdmin()` reads the cookie via `next/headers`, verifies JWT, throws on fail. This is defense-in-depth — middleware has already redirected unauthed navigation requests before any server action can run; `requireAdmin()` covers the rare race where a cookie expires between page load and action invocation (action throws → client gets a generic error → next navigation hits middleware → login redirect).

### CSV export

Three routes: `/api/admin/subscribers.csv`, `/api/admin/rsvps.csv`, `/api/admin/pitches.csv`. Each:

- Auth-gated (middleware).
- Streams rows via `Response` with `Content-Type: text/csv` and `Content-Disposition: attachment; filename="...".csv`.
- Columns mirror DB schema, one row per record, ISO dates.
- Empty state → file with header row only.

### Empty states

Every dashboard route renders a friendly empty state for first-launch:
- Subscribers: "No subscribers yet. Add one manually or wait for signups from the footer / `/join` form."
- RSVPs: "No RSVPs yet. The form is live on `/join`."
- Pitches: "No pitches yet. The form is live on `/join` (Path 02)."

---

## Stage 1 Error Handling

| Failure | UX | Logging |
|---|---|---|
| Public form validation fail | Field-level error helper text, focus on offender, no banner | None |
| Public form DB fail | `<ErrorBanner>` "Something went wrong on our end. Try again in a minute." | Vercel logs full error |
| Subscribe with already-active email | Treated as success (return 204) | None |
| Admin login wrong password | Generic "Incorrect password" | Vercel logs IP + timestamp |
| Admin login rate-limit hit | 429 with "Too many attempts. Wait 10 minutes." | Vercel logs IP |
| Admin route, no/invalid cookie | Redirect `/admin/login?next=...` for HTML, 401 JSON for API | None |
| Server action throws | Next.js error boundary; user sees "Action failed. Try again." | Vercel logs full error |
| Honeypot tripped | 204 (identical to success) | None — silent |

No PII in error messages exposed to client. No raw error stacks ever shipped to client.

---

## Stage 1 Testing

Stage 1 has limited business logic — most risk is in auth and validation. Test bar:

- **`app/lib/auth.test.ts`** — JWT mint with secret, verify with same secret, reject with wrong secret, reject expired token, `requireAdmin()` happy/throw paths.
- **`app/lib/schemas.test.ts`** — zod parse on each schema: happy, missing required, oversized fields, malformed email, motivations cap.
- **`app/lib/rate-limit.test.ts`** — under limit allows, over limit blocks, window slides correctly.
- **`app/api/subscribe/route.test.ts`** — happy path inserts, duplicate email is idempotent + reactivates, honeypot returns 204 + no insert, validation fail returns 400. Mock Prisma via `vi.mock`.
- **`app/api/rsvp/route.test.ts`** — same shape, plus: `joinListserv=true` upserts Subscriber, `meetingDate` computed correctly (mock `nextSession` and assert).
- **`app/api/pitch/route.test.ts`** — same shape.
- **`app/api/admin/login/route.test.ts`** — correct password sets cookie + 200, wrong password 401, rate-limit after 5 attempts.

**Manual smoke checklist** (document in `docs/admin-smoke-test.md`):

1. `npm run dev`, visit `/`, submit footer subscribe → 204 → row in DB.
2. Visit `/join`, submit RSVP with listserv checkbox → both Rsvp and Subscriber rows.
3. Submit pitch form → Pitch row.
4. Visit `/admin` → redirected to login.
5. Wrong password → error. Correct password → land on overview.
6. Counts on overview match DB.
7. Each dashboard page renders, search/filter work, export CSV downloads.
8. Mark RSVP reviewed, change pitch status, add note → persists across reload.
9. Logout → cookie cleared → re-visit `/admin` → back to login.

No Playwright e2e in Stage 1; manual smoke is sufficient at this scope.

---

## Stage 1 Deployment

### Env vars (Vercel project settings)

| Var | Purpose | Source |
|---|---|---|
| `DATABASE_URL` | Neon pooled connection string | Neon dashboard |
| `DIRECT_URL` | Neon direct connection (for migrations) | Neon dashboard |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of curator password | `node scripts/hash-password.mjs` locally |
| `JWT_SECRET` | 32+ random chars | `openssl rand -hex 32` or similar |

### Deploy steps (one-time)

1. Create Neon project, copy connection strings.
2. Run `scripts/hash-password.mjs` locally → paste hash into Vercel.
3. Generate JWT secret → paste into Vercel.
4. `npx prisma migrate deploy` against Neon (one-time, run from local with env vars).
5. Vercel auto-deploys from `master`.
6. Verify `/admin/login` works in prod.

### Rollback

- Static-export `out/` is preserved in git history (last working static build). If the dynamic deployment goes sideways during Stage 1, revert to the static-export commit and redeploy. Forms go back to no-op but the site stays up.

---

## Stages 2 & 3 (sketched only — separate spec each)

### Stage 2 — Content migration

- New Prisma tables mirroring `content/site.ts` types: `Project`, `LogEntry`, `Lead`, `ActionItem`, `Blocker`, `Decision`, `SessionConfig` (singleton, 1 row), `CohortInfo` (singleton).
- `scripts/migrate-content.mjs` reads `content/site.ts` exports and seeds the DB.
- New `app/lib/content.ts` returns the current content object built from DB queries. Pages refactored to `await getContent()` instead of `import { content } from "@/content/site"`.
- Pages become server components reading DB at request time (or ISR with on-demand revalidation when admin saves).
- Content-editing UI under `/admin/content/projects`, `/admin/content/log`, `/admin/content/agenda`, `/admin/content/leads`, etc.
- After verification, delete `content/site.ts` and the legacy import path.
- Caching: pages opt into ISR with `revalidate: 60`, OR server actions call `revalidatePath('/')` on save. Pick during Stage 2 spec.

### Stage 3 — Digest

- New tables: `WeeklyDigest` (id, draftedAt, sentAt?, markdown, html, subject, recipientCount), `DigestRecipient` (digestId, subscriberId, sentAt, openedAt?, unsubscribedAt?).
- `/admin/digest/new`:
  - Button "Draft this week's digest" → server action calls Claude (Sonnet) with this week's `LogEntry`s, agenda for the upcoming session, project changes since last digest. Returns markdown.
  - Markdown editor (CodeMirror or simple textarea + preview).
  - Preview tab renders markdown → HTML using same theme as the site.
  - "Send" button → enqueues sends via Resend.
- Resend integration:
  - `RESEND_API_KEY` env var.
  - Sender domain TBD (probably `digest@aiincubator.uky.edu` if DNS achievable; fall back to a Resend onboarding domain initially).
  - Unsubscribe link in every email → `GET /unsubscribe/:token` → sets `Subscriber.status=unsubscribed`.
- Suppression: `status=unsubscribed` subscribers are skipped on send.

---

## Open questions for Stage 1 implementation

These are TBD-during-implementation, not blockers:

1. Should `next.config.mjs`'s `trailingSlash: true` stay or go? Static export needs it; dynamic doesn't. Verify both `/admin` and `/admin/` resolve correctly before deciding.
2. Markdown editor for pitch notes: textarea + minimal preview, or pull in a real editor (`@uiw/react-md-editor`)? Default to textarea, upgrade if it feels rough.
3. Pitch dashboard: true kanban (drag-drop) or status dropdown in detail panel? Default to dropdown — drag-drop is a nice-to-have that can land later.
4. Should we capture `ipAddress` and `userAgent` on every form submit? Spec says yes for abuse forensics, but adds PII. **Decision: yes, store in DB but never display in dashboard. Drop after 90 days via a cron (Stage 1.5).**
