# Phase 1 — Operating Surface Design

**Status:** **REDUCED to Phase 1a after discovery of in-flight work.** See "Scope reduction note" below.
**Date:** 2026-05-26
**Author:** Tama Thé (with Claude)
**Scope (original):** One PR shipping six public surfaces + `/admin` to run the site

---

## ⚠ Scope reduction note (2026-05-26, post-spec)

After this spec was approved, discovery of uncommitted work in the repo (`worker/pitch-intake/`, `docs/superpowers/plans/2026-05-26-pm-inbox.md`) revealed that the user has already chosen a different architecture for the `/admin` and intake portions: **static export preserved, Cloudflare Workers + GitHub Issues as the writeback layer, token-in-URL admin auth, conversational `/pitch` intake (not a static form).**

The Phase 1 spec proposed contradictory choices (drop static export, Neon Postgres, Auth.js magic link, Octokit PRs, `/apply` static form). Those parts of this spec are now **deferred / archived** — the existing in-flight work supersedes them.

**What's actually shipping as Phase 1a** (covered by the implementation plan):

- ✅ Schema additions: `outcomes[]`, `partners[]`, `artifacts[]`, rename `Blocker.blockedBy` → `Blocker.waitingOn`
- ✅ Public surfaces: `/open-problems`, `/outcomes`, `/built`, sponsors strip, homepage "What's on the table" section, ProjectCard blocker chip, KickoffCard CTA (routes to existing `/pitch` not a new `/apply`)
- ✅ Stays fully static (`output: 'export'` preserved)
- ❌ NOT shipping: `/admin`, `/apply`, Postgres, Auth.js, hosting changes, Octokit — those parts of the original spec are deferred indefinitely (handled by existing PM Inbox plan + `/pitch` instead).

**Coupling note:** When the PM Inbox plan (`docs/superpowers/plans/2026-05-26-pm-inbox.md`) ships, its Task 6 ("switch components to mergedContent") needs to also include the new Phase 1a components that read `content/site.ts`. They currently read `content` directly; PM Inbox is responsible for the swap when it lands.

The original (full) spec below is preserved for reference. Read it as "what we considered and chose not to build right now."

---

---

## 1. Goal

Turn the AI Incubator site from a hand-edited content surface into a **legible operating system** for the group. Three audiences (internal team, potential collaborators, external stakeholders) are equally underserved today. Phase 1 ships features that serve all three by exposing the work honestly and giving the team a UI to keep it current.

**Non-goals (deferred to later phases):**
- Transcript → PR pipeline (Phase 2)
- Embedded live demos inside project cards (Phase 2)
- Sandy-on-site (Phase 3)
- Office hours scheduling (Phase 3)
- Monday digest emails (Phase 3)

---

## 2. Decisions snapshot

| Question | Decision |
|---|---|
| Audience priority | All three (internal / collaborators / external) — pick features that serve multiple. |
| Surface visibility | Fully public. Honesty contract applies. |
| Blocker framing | Action-oriented (`waitingOn: "DSA legal review"`), never person-named. |
| Persistence | Hybrid — `content/site.ts` canonical for projects/leads/sessions; DB for intake/audit/RSVP. |
| Hosting | Vercel hybrid (drop `output: 'export'`). |
| Database | Neon Postgres + Prisma. |
| Auth | Email magic link (Auth.js + Resend). Allowlist of admin emails. |
| `/admin` writes | Octokit → PR against `content/site.ts`. site.ts stays canonical. |
| Public form auth | None. Cloudflare Turnstile for spam gate. |
| Ship strategy | One PR — all surfaces + `/admin` together. |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            Vercel                                    │
│  ┌──────────────────────────┐    ┌──────────────────────────────┐   │
│  │  Public pages (SSG)      │    │  /admin/*   (server)         │   │
│  │  - /                     │    │  - dashboard                 │   │
│  │  - /projects             │    │  - editors for each schema   │   │
│  │  - /open-problems        │    │  - intake triage             │   │
│  │  - /outcomes             │    └──────────────────────────────┘   │
│  │  - /built                │    ┌──────────────────────────────┐   │
│  │  - /join, /apply         │    │  /api/*     (route handlers) │   │
│  │  - /changelog            │    │  - /api/intake  (public POST)│   │
│  │                          │    │  - /api/admin/*  (gated)     │   │
│  │  Reads from content/     │    │  - /api/auth/*   (Auth.js)   │   │
│  │  site.ts at build time   │    └──────────────────────────────┘   │
│  └──────────────────────────┘                                       │
└────────┬────────────────────────────────────┬───────────────────────┘
         │                                    │
         │  reads at build                    │  reads/writes
         ▼                                    ▼
   ┌─────────────────┐               ┌──────────────────────┐
   │ content/site.ts │◄──────PR──────│ /admin via Octokit   │
   │ (in repo)       │               │                      │
   └─────────────────┘               └──────────┬───────────┘
                                                │
                                                ▼
                                     ┌──────────────────────┐
                                     │   Neon Postgres      │
                                     │  - intake_submission │
                                     │  - admin_user        │
                                     │  - audit_log         │
                                     │  - rsvp              │
                                     └──────────────────────┘
```

**Why this shape:**
- Public site stays nearly as fast as today — most pages are pre-rendered.
- `content/site.ts` stays the single source of truth for project content; nothing duplicated in DB.
- Dynamic content (intake submissions, RSVPs, audit log) lives in DB where it belongs.
- `/admin` writes by opening PRs against `content/site.ts`. Edits are reviewable. Reverts are git reverts. Matches the README's stated intent for agent workflow.
- Auto-deploys on PR merge make `/admin` edits propagate to the site within ~1 minute.

**Trade-off accepted:**
- `/admin` edits don't show up on the public site until the PR auto-merges and Vercel rebuilds. That's ~1 min. For Phase 1 this is fine. If the team wants instant edits, Phase 2 can add an option to "merge immediately" for low-risk fields.

---

## 4. Schema changes

### 4.1 `content/site.ts` additions

```ts
// RENAME existing Blocker.blockedBy → Blocker.waitingOn
export interface Blocker {
  id: string;
  project: string;
  body: string;
  /** What's needed to unstick — process/document/state, NEVER a person */
  waitingOn?: string;
  created: string;
  resolved?: string;
}

// NEW
export type OutcomeKind = "grant" | "paper" | "product" | "student" | "media" | "talk";

export interface Outcome {
  id: string;
  kind: OutcomeKind;
  /** Optional — links to a project in projects[] */
  project?: string;
  title: string;
  /** Free-text. For grants: "$475K". For students: "8 trained". */
  value?: string;
  /** ISO date */
  date: string;
  /** Optional public link */
  link?: string;
  /** Optional 1-sentence context */
  note?: string;
}

export interface Partner {
  id: string;
  /** "CHFS", "Kentucky Cancer Registry", "Markey" */
  name: string;
  /** "Funder", "Data partner", "Clinical partner" */
  role: string;
  /** Optional — if the partnership is project-specific */
  project?: string;
  /** Public-facing 1-sentence relationship summary */
  note?: string;
  /** Optional path under /public */
  logo?: string;
}

export interface Artifact {
  id: string;
  /** project id */
  project: string;
  name: string;
  url: string;
  kind: "live-demo" | "prototype" | "repo" | "paper" | "deck";
  /** Optional path under /public for screenshot */
  thumb?: string;
  /** Short one-liner shown under the card title */
  note?: string;
}

// EXTEND SiteContent
export interface SiteContent {
  // ... existing
  outcomes: Outcome[];
  partners: Partner[];
  artifacts: Artifact[];
}
```

### 4.2 Prisma schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model IntakeSubmission {
  id           String   @id @default(cuid())
  projectId    String?
  name         String
  email        String
  contribution String   // "Where I think I can contribute"
  background   String
  availability String?
  source       String?  // "kickoff-card", "apply-page", "open-problems"
  status       IntakeStatus @default(new)
  triagedBy    String?
  triagedAt    DateTime?
  notes        String?
  createdAt    DateTime @default(now())

  @@index([status, createdAt])
}

enum IntakeStatus {
  new
  reviewing
  contacted
  joined
  declined
  spam
}

model Rsvp {
  id        String   @id @default(cuid())
  name      String
  email     String
  /** ISO date of the session they RSVP'd for */
  session   String
  createdAt DateTime @default(now())

  @@unique([email, session])
}

model AdminUser {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  lastSeen  DateTime?
}

model AuditLog {
  id        String   @id @default(cuid())
  actorEmail String
  action    String   // "edit-projects", "add-blocker", "resolve-decision", etc.
  payload   Json
  prUrl     String?  // GitHub PR URL when action commits to site.ts
  createdAt DateTime @default(now())

  @@index([createdAt])
}

// Auth.js tables (boilerplate)
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         AdminUser @relation(fields: [userId], references: [id])
}
```

---

## 5. Public surfaces (six features)

### 5.1 Homepage section `05 What's on the table`

Sits between current section `04 Activity log` and the CTA banner.

Two-column layout:
- **Stuck on** — renders `blockers[]` where the `resolved` field is unset (active blockers). Each row: project chip · body · `waitingOn` mono chip · `since DATE` mono (computed from `created`).
- **On the table this Friday** — renders `decisions[]` where `status === "queued"` AND `forSession === nextSessionDate`. Each row: project chip · question · `for FRI MAY 29` mono. Cross-cutting decisions render with `· general ·` chip.

**Empty states (voice — these are required, not optional. The wry tone IS the honesty contract):**
- Stuck on: *"Nothing currently blocked. (That's either a good week or a bad memory.)"*
- Queued for Friday: *"No decisions queued for Friday. Quiet week, or we deferred them all."*

**Components**
- `components/StuckList.tsx` — pure render of `Blocker[]`
- `components/DecisionList.tsx` — pure render of `Decision[]`
- `components/OnTheTableSection.tsx` — homepage section wrapping the above

**Derive helpers** (`lib/derive.ts`)
- `deriveActiveBlockers(content)` → `Blocker[]` (unresolved, newest first)
- `deriveDecisionsForSession(content, sessionDate)` → `Decision[]` (queued matching forSession)

---

### 5.2 `/open-problems`

Linked from main nav (between `Projects` and `Join`) and from each `KickoffCard`.

**Page sections:**
1. **Stuck on** — full unresolved blocker list, grouped by project. Same `StuckList` component.
2. **Queued for decision** — full queued decision list, grouped by target session.
3. **Looking for collaborators** — derived from `projects[]` where `status === "kickoff"`. Each kickoff's `open` line becomes a card.

**Page header copy:**
*"Where this group is stuck, what we're about to decide, and where we need help. We keep this public on purpose."*

**Route**: `app/open-problems/page.tsx`
**Components**: reuses `StuckList`, `DecisionList`, new `OpenCallList`

---

### 5.3 `/outcomes`

Public ledger of what this group has produced.

**Page layout:**
- Total counters at top: `N grants · $X funded · N papers · N products shipped · N students trained`
- Filterable list (filter chips: All · Grants · Papers · Products · Students · Media · Talks)
- Each row: date mono · kind chip · title · project chip (if any) · value mono · link icon (if any)

**Empty state:** *"Nothing logged yet — we're still building the artifact log."*

**Voice principle:** This page is the credibility surface, but we don't dress it up. Numbers and dates. No marketing copy.

**Route**: `app/outcomes/page.tsx`

---

### 5.4 `/built`

Wall of working artifacts someone can poke at.

**Layout:**
- Grid of artifact cards. Each card: thumb (if any) · name · kind chip · project chip · `note` · `Try it →` button.
- Cards are real links — clicking opens the artifact in a new tab.

**First three cards (existing artifacts to seed):**
- NCIPP — kind `live-demo` — url `https://ncipp-prototype.onrender.com` — project `ncipp`
- Socratic Tutor — kind `prototype` — url TBD — project `socratic-tutor`
- (rest seeded by team)

**Empty state per category:** *"No live demos yet for this project. (Working products earn a slot here.)"*

**Route**: `app/built/page.tsx`

---

### 5.5 Sponsors strip on homepage

Thin row sitting **above the footer, below the CTA banner**. Renders `partners[]`. Position chosen so partners read as legitimacy signal, not as a distraction from the project work above.

**Layout:** horizontal flex strip with each partner as `[Logo or wordmark] [Name · Role]`. No marketing copy.

**Inclusion rule:** Only entities with a real, named relationship (signed MOU, funded grant, formal data partnership). When in doubt, leave off.

**Seed data:**
- CHFS — Funder — KY-AHEAD
- Kentucky Cancer Registry — Data partner — KY-AHEAD
- Markey Cancer Center — Clinical partner — KY-AHEAD, Markey · Patient Ed
- UK College of Medicine — Home institution

---

### 5.6 KickoffCard CTA + blocker chips on cards

**KickoffCard** gains a primary CTA stacked above the existing "Discuss at the next meeting →":

```
[ Get involved with DROME → ]    ← primary, links to /apply?project=drome
[ Discuss at the next meeting → ]
```

**ProjectCard** gets a small chip in the top row when there are unresolved blockers:
```
[Stage] [Area · DATE] [⚠ 2 stuck]
```
Clicking the stuck chip jumps to `/open-problems#<project-id>`.

The hover reveal panel of `ProjectCard` gains a "Get involved →" link in the same place actions are surfaced today.

---

### 5.7 `/apply` (the destination for "get involved" CTAs)

**Form fields:**
- Name
- Email
- Project of interest (preselected from `?project=` query param, otherwise dropdown of all projects + "Open to suggestions")
- Where I think I can contribute (textarea)
- Brief background (textarea)
- Availability (optional)
- Cloudflare Turnstile widget

**On submit:**
- POST `/api/intake`
- Server: validate, run Turnstile verification, insert `IntakeSubmission`, return success
- Page shows confirmation: *"Got it. Someone on the team will reach out within a week. If it's been longer, email tama.the@uky.edu."*

**Route**: `app/apply/page.tsx`, `app/api/intake/route.ts`

---

## 6. `/admin` — operating cockpit

### 6.1 Auth flow

- `app/admin/layout.tsx` checks `auth()` from Auth.js. Unauthenticated → redirect to `/admin/sign-in`.
- `/admin/sign-in` shows an email input. Submit → magic link via Resend → user clicks link → Auth.js verifies, creates `Session`, redirects to `/admin`.
- Email must match `AdminUser.email`. Admins are seeded via `prisma db seed` or added via SQL.
- Optional: an `INITIAL_ADMIN_EMAIL` env var on first deploy that auto-creates the first admin record.

### 6.2 Routes

| Route | Read | Write |
|---|---|---|
| `/admin` | DB: intake counts, audit recent | — |
| `/admin/intake` | DB: `IntakeSubmission[]` | DB: triage status, notes |
| `/admin/rsvps` | DB: `Rsvp[]` for next session | — |
| `/admin/projects` | `content/site.ts` projects[] | Octokit → PR to site.ts |
| `/admin/projects/[id]` | one project | PR |
| `/admin/sessions` | session + agenda | PR |
| `/admin/log` | log[] | PR (append) |
| `/admin/blockers` | blockers[] | PR (add/resolve) |
| `/admin/decisions` | decisions[] | PR (queue/resolve) |
| `/admin/actions` | actions[] | PR (add/close) |
| `/admin/outcomes` | outcomes[] | PR (add/edit) |
| `/admin/partners` | partners[] | PR (add/edit) |
| `/admin/artifacts` | artifacts[] | PR (add/edit) |
| `/admin/leads` | leads[] | PR (add/edit) |
| `/admin/transcript` | — | Phase 2 placeholder; shows "coming soon" |
| `/admin/audit` | DB: AuditLog[] | — |

### 6.3 Edit-via-PR workflow

Each edit form:
1. User submits the form in `/admin`.
2. Server route handler:
   a. Validates payload with Zod.
   b. Reads current `content/site.ts` from GitHub main branch via Octokit (`repos.getContent`).
   c. Computes the patched TypeScript source using `ts-morph` (parses the AST so edits are safe across formatting changes — no string template fragility).
   d. Creates a branch `admin/{actor-slug}/{action}-{timestamp}`.
   e. Commits the patched file with message `admin: {action} ({actor})`.
   f. Opens a PR with auto-merge enabled (requires repo setting).
   g. Writes `AuditLog` row with actor, action, payload, PR URL.
3. Form shows: *"Submitted. PR opened — will be live within ~1 min after auto-merge."* with PR link.

**Special handling for risk:**
- Low-risk actions (append to `log[]`, add `action`, resolve `blocker`, add `outcome`) → auto-merge.
- High-risk actions (edit existing `Project`, change `Session.teamsUrl`, delete anything) → PR opened but **auto-merge disabled**, requires human review on GitHub.

A small enum `EditRisk = "auto" | "review"` determines this per action.

### 6.4 Audit log

Every `/admin` write records an `AuditLog` row. `/admin/audit` shows the log with filter by actor and action. Used to answer "who changed the agenda last Friday."

---

## 7. Migrations

### 7.1 Code migrations

| Change | File | Notes |
|---|---|---|
| Rename `Blocker.blockedBy` → `waitingOn` | `content/site.ts` (type + existing entries) | Update existing values: `"KCR legal"` → `"DSA legal review"`, `"Sim center"` → `"Baseline communication rubric"` |
| Add `outcomes`, `partners`, `artifacts` to `SiteContent` | `content/site.ts` | Seed with current known entries |
| Drop `output: 'export'` from `next.config.mjs` | `next.config.mjs` | Add `images.unoptimized: false` only if we add Next/Image; keep current value otherwise |
| Add `prisma/schema.prisma` | new file | |
| Add Auth.js setup | `app/api/auth/[...nextauth]/route.ts`, `lib/auth.ts` | |
| Add Octokit helper | `lib/github.ts` | wraps PR creation |
| Remove `npm run preview` script | `package.json` | no longer applicable when not static-exporting |

### 7.2 Data migrations

- Initial DB migration via `prisma migrate dev --name init`
- Seed first admin user with `INITIAL_ADMIN_EMAIL` env var on first boot
- Seed outcomes from known facts:
  - Outcome `grant` — KY-AHEAD — `$475K` — 2026-04-13 — CHFS SUP grant
  - Outcome `product` — NCIPP — Phase 2 shipped, ncipp-prototype.onrender.com — 2026-05-02
- Seed partners (as listed in 5.5)
- Seed artifacts from existing project anchors that contain URLs

---

## 8. Environment variables

Required on Vercel:

| Var | Source | Notes |
|---|---|---|
| `DATABASE_URL` | Neon | Pooled connection string |
| `DIRECT_URL` | Neon | Direct (non-pooled) for migrations |
| `AUTH_SECRET` | `openssl rand -base64 32` | Auth.js session secret |
| `AUTH_URL` | Vercel | e.g. `https://aiincubator.uky.edu` |
| `RESEND_API_KEY` | Resend dashboard | For magic-link emails |
| `EMAIL_FROM` | Resend verified domain | e.g. `noreply@aiincubator.uky.edu` |
| `GITHUB_APP_ID` | GitHub App | bot identity for PR commits |
| `GITHUB_APP_PRIVATE_KEY` | GitHub App | |
| `GITHUB_APP_INSTALLATION_ID` | GitHub App | |
| `GITHUB_REPO` | static | e.g. `tama-the/aiincubator-uky` |
| `TURNSTILE_SITE_KEY` | Cloudflare | Public; in client |
| `TURNSTILE_SECRET_KEY` | Cloudflare | Server-side verification |
| `INITIAL_ADMIN_EMAIL` | static | seeds first admin |

A `.env.example` file documents all of these.

---

## 9. File map (what's added vs. modified)

**Added (~30 files):**
```
prisma/schema.prisma
lib/auth.ts                            # Auth.js config
lib/github.ts                          # Octokit wrapper for PR-based writes
lib/db.ts                              # Prisma client singleton
lib/derive.ts                          # EXTENDED with deriveActiveBlockers, deriveDecisionsForSession
lib/site-ts-edit.ts                    # ts-morph-based site.ts patchers
app/api/auth/[...nextauth]/route.ts
app/api/intake/route.ts
app/api/admin/(edit each schema)       # ~10 handler files
app/admin/layout.tsx
app/admin/page.tsx                     # dashboard
app/admin/sign-in/page.tsx
app/admin/intake/page.tsx
app/admin/(other editors)              # ~10 page files
app/apply/page.tsx
app/open-problems/page.tsx
app/outcomes/page.tsx
app/built/page.tsx
components/StuckList.tsx
components/DecisionList.tsx
components/OnTheTableSection.tsx
components/OpenCallList.tsx
components/OutcomesTable.tsx
components/ArtifactCard.tsx
components/PartnersStrip.tsx
components/ApplyForm.tsx
components/admin/(shared)              # form scaffolds
.env.example
```

**Modified (~10 files):**
```
content/site.ts                # schema additions, blocker rename, seed data
next.config.mjs                # drop output: 'export'
package.json                   # add deps: prisma, @prisma/client, next-auth, @auth/prisma-adapter, octokit, resend, zod, react-hook-form, @marsidev/react-turnstile, ts-morph
app/page.tsx                   # add OnTheTableSection, PartnersStrip
app/projects/page.tsx          # add stuck-chip rendering
components/Nav.tsx             # add /open-problems, /outcomes, /built links
components/KickoffCard.tsx     # add primary "Get involved" CTA
components/ProjectCard.tsx     # add stuck chip in top row + "Get involved" in reveal
components/Footer.tsx          # add /open-problems link
app/globals.css                # styles for new components
README.md                      # update with new architecture + admin flow
```

---

## 10. Open questions

These are flagged but don't block writing the implementation plan. Resolved during implementation or punted to Phase 2:

1. **Domain for admin emails.** `noreply@aiincubator.uky.edu` requires SPF/DKIM on the subdomain. Fall back to `noreply@<vercel-domain>` if UK IT can't grant the records in time.
2. **GitHub App vs. PAT.** A GitHub App is cleaner (scoped install, audit), but a fine-grained PAT works for v1. Recommend App; if config time is tight, PAT to start.
3. **Sponsor logos.** Need image assets from the partner pages. If not available, render wordmarks.
4. **Socratic Tutor live demo URL.** Currently no public URL noted in `site.ts`. Phase 1's `/built` will list it with a note "no public demo yet" until one exists.
5. **PR auto-merge requires GitHub repo setting** ("Allow auto-merge" enabled, branch protection with no required reviews for the `admin/*` branch prefix). Document in README.
6. **Build-time dependency on DB.** Public pages don't need the DB at build, but `/admin/*` pages do at request time. Confirm Neon free tier handles cold-start latency or pin a region.

---

## 11. Out of scope for Phase 1

- Transcript ingestion automation
- AI-assisted PR drafts ("Sandy drafted this edit")
- Embedded live demos inside project cards
- Sandy chat widget on the public site
- Office hours scheduling
- Monday digest emails
- Slack/Teams integration
- Public RSS / iCal of upcoming sessions
- Theme toggle (deferred per README's loose ends)
- OG image generation

These all become Phase 2/3 candidates after Phase 1 lands.
