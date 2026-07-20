# Idea board, AI toolkit, and sessions library — design

**Date:** 2026-07-17
**Source:** July 17 AI Incubator meeting (`docs/meetings/2026-07-17-ai-incubator.md`)
**Status:** Approved direction; spec pending user review. No implementation yet.

## Context

The July 17 meeting committed the website to three expansions ("agreed directions, not yet scoped"):

1. A place to post ideas, research opportunities, and requests for collaborators.
2. A practical AI toolkit — prompts, project setups, verification checks, reusable workflows.
3. A permanent home for recorded talks with speaker credit (July 31 "AI for knowledge work" session will be recorded and posted).

Plus routine schedule/content updates (July 24 cancelled; July 31 session added; drone project stage change).

Decisions already made with Tama:

- **First release:** idea board + toolkit thin slice. Talks surface ships with backfill; July 31 recording lands when it exists.
- **Contribution model:** hybrid. Board rides the existing `/pitch` → Postgres → `/admin` lane with a new publish step. Toolkit is curated repo content in `content/site.ts`.
- **Talks:** a sessions library page driven by `meetings[]`, not folded into `studentWork`.
- **Interest CTA:** on-site "Raise your hand" form stored in the DB (not `mailto:`).
- Design approved as presented, including legacy Supabase cleanup.

## Principles

- **Honesty contract** (inherited from the site): nothing on the public site fakes maturity or activity. The board shows only curated, published entries; the toolkit only real resources; sessions only real recordings.
- **Privacy:** raw submitter text and emails never reach the public site. Public copy is written by the admin at publish time. Attribution is deliberate, never automatic.
- **Two lanes, no third:** curated content lives in `content/site.ts` (PR-reviewed, agent-editable); community input flows through forms → Neon Postgres → `/admin`. No new databases, no new intake mechanisms.
- **Credit everywhere:** toolkit entries carry author lines; sessions carry speaker lines; published ideas may carry attribution. This is the meeting's "resume-worthy" principle applied uniformly.

## 0 · Retire the legacy Supabase iteration

The v1 site (commit `1665b74`) had a Supabase-backed ideas board, orphaned by PR #10 ("Simplify the Incubator site"). Remove:

- `components/IdeasMap.tsx`, `IdeasGrid.tsx`, `IdeaIntakeDrawer.tsx`, `IdeaDetailPanel.tsx`, `IdeasCountChip.tsx`
- `lib/ideas.ts` (legacy types/parser), `lib/supabase.ts`
- `@supabase/supabase-js` and `d3-force` / `@types/d3-force` dependencies (d3 was only used by `IdeasMap`)
- `docs/supabase/` (README + `ideas-setup.sql`)
- Stale `.env.local.example` entries (Cloudflare Worker URL, Supabase vars); replace with the four real vars from the README (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `ADMIN_PASSWORD_HASH`)

Ideas salvaged into the new design: `lookingFor[]` tags, moderation-before-visibility, curated public titles. The d3 cluster map stays retired; revisit only if the board grows past ~10 concurrent entries.

Verify before deleting: `git grep` each symbol to confirm nothing else imports it.

## 1 · Release 0 — content updates (ships immediately, no code)

Edits to `content/site.ts` only:

- `meetings[]`: update the 2026-07-17 entry to record what happened (drone hardware-assessment plan; student-org and website direction). Add `{ date: "2026-07-24", kind: "cancelled", title: "No meeting" }`. Add `{ date: "2026-07-31", kind: "presentation", title: "AI for knowledge work — Claude Projects and Codex", presenters: "Peng / Thé", blurb: "How Andrew sets up Claude Projects for a research effort, and how Tama uses Codex for knowledge work. Recorded." }`.
- `session.agenda`: refresh to reflect the July 31 session.
- `projects[]`: `whole-blood-drone` stage → "Scheduling an in-person hardware assessment"; `updated: "2026-07-17"`.
- `log[]`: new entry (2026-07-17) — Andrew meeting Dr. Bailey to inspect drone/drop hardware before the first nonclinical flight test.
- `lastUpdated: "2026-07-17"`.

## 2 · Idea board

### Data model (Prisma migration)

```prisma
model Pitch {
  // ...existing fields unchanged...
  publishedAt       DateTime?
  publicTitle       String?
  publicSummary     String?
  publicAttribution String?
  lookingFor        String[]       @default([])
  interests         IdeaInterest[]
}

model IdeaInterest {
  id        String   @id @default(cuid())
  pitchId   String
  pitch     Pitch    @relation(fields: [pitchId], references: [id], onDelete: Cascade)
  name      String
  email     String
  note      String?
  createdAt DateTime @default(now())
  ipAddress String?

  @@index([pitchId, createdAt])
}
```

Publish invariants (enforced in the server action, tested as a pure helper):

- `publishedAt` may be set only when `status ∈ {accepted, converted}` and `publicTitle` + `publicSummary` are nonempty.
- Unpublishing clears `publishedAt` but keeps the drafted public copy.
- Changing status away from accepted/converted on a published pitch unpublishes it.

### Admin (`/admin/pitches`)

Accepted/converted pitches gain a publish panel: fields for `publicTitle`, `publicSummary`, `publicAttribution` (optional, deliberate), `lookingFor` tags (freeform, comma-separated), and a Publish/Unpublish toggle. Server actions follow the existing `setPitchStatus`/`setPitchNotes` pattern (`requireAdmin`, `revalidatePath`); publish/unpublish (and any status change that unpublishes) additionally calls `revalidatePath("/ideas")` so the board updates immediately rather than waiting out the 300s revalidate window. Interest responses render per pitch (name, email, note, date) — admin-only, used to broker introductions by email.

### Public page (`/ideas`)

- Server component; `export const revalidate = 300`.
- Data via a guarded helper (new `lib/idea-board.ts`): returns `null` when `DATABASE_URL` is unset (page falls back to static content — same soft-fail philosophy as `/api/pitch`), else published pitches ordered `publishedAt` desc, mapped to a public DTO: `{ id, title, summary, attribution?, lookingFor, publishedAt }`. **Never** expose submitter fields or raw pitch text.
- Card: title, summary, `lookingFor` chips, attribution line if present, "Raise your hand" affordance expanding to an inline form (name, email, optional note) — a client component posting to `/api/idea-interest`.
- The six existing static questions become the inspiration strip at the bottom of the page (and the whole page when the board is empty or DB is unavailable), with the `/pitch` form as the single intake CTA.
- Visual language: reuse existing card/chip patterns (`idea-topic-card`, project-card chips); the dashed-border "new/kickoff" convention applies to board cards — they are open invitations by definition.

### API (`/api/idea-interest`)

Mirrors `/api/pitch` exactly:

- `POST` JSON `{ pitchId, name, email, note?, website }` (`website` = honeypot → silent 204).
- Zod `ideaInterestSchema` in `lib/schemas.ts` (pitchId cuid, name 1–120, valid email, note ≤ 2000).
- Rate limit `interest:${ip}`, max 5 per 10 min.
- 503 when `DATABASE_URL` missing; 404 when the pitch doesn't exist **or isn't published** (don't leak unpublished ids); 204 on success.

## 3 · Toolkit

### Content schema (`content/site.ts`)

```ts
export type ResourceKind = "prompt" | "setup" | "workflow" | "check" | "guide";

export interface Resource {
  id: string;          // slug; doubles as the anchor (/toolkit#verification-checks)
  title: string;
  kind: ResourceKind;
  authors: string;     // freeform credit line — always populated
  summary: string;     // one-liner for the card
  body: string[];      // paragraphs or numbered steps
  tags?: string[];
  link?: { label: string; url: string };
  /** ISO date */
  updated: string;
}
```

`resources: Resource[]` added to `SiteContent`. Structured deliberately flat so entries can port to the sandbox later.

### Page (`/toolkit`)

Kind-filter chips (client component mirroring `ProjectsFilteredList`), article cards with anchored ids, author + updated line, body rendered as paragraphs/steps. No per-resource routes yet; revisit if entries outgrow the card format.

### Seed content (drafted for Tama's edit before merge — not published as-is)

1. `verification-checks` — "Checks and balances for AI output" — Clinton Ayres
2. `start-small-fail-fast` — "Getting unstuck: iterating with AI" — Clinton Ayres (framing), with Grace's "where do I even start" as the problem statement
3. `claude-projects-setup` — "Setting up a Claude Project for a research effort" — Andrew Peng (stub until July 31 session provides substance)
4. `codex-knowledge-work` — "Codex for knowledge work" — Tama Thé (stub until July 31)

## 4 · Sessions library

### Schema

`MeetingSession` gains `recordingUrl?: string` and `recordingLabel?: string`.

### Page (`/sessions`)

- "Upcoming" — future `meetings[]` entries (and the weekly cadence from `session`), cancelled Fridays shown as such.
- "Recorded" — past entries with `recordingUrl`, newest first: title, date, presenters credit, link/embed. This is the permanent, citable talk archive.
- YouTube links (site pattern: `studentWork` already links YouTube; raw `Media/` files are not served directly).

### Backfill (content task for Tama — needs dates + YouTube uploads)

- Alex Dripchak — Agentic Engineering (YouTube link exists in `studentWork`; needs its session date)
- Hunter Colson — image segmentation lecture (raw file in `Media/`; needs upload + date)
- Sully Chen — Innovator's Grand Rounds (raw file in `Media/`; needs upload + date)
- July 31 session added once recorded.

`studentWork` stays as-is (builds/stories); sessions are talks. An entry may reference both surfaces (Alex's) — acceptable duplication, different framings.

## 5 · Navigation

- Top nav (+ `MobileNav`): add **Ideas** (`/ideas`) and **Toolkit** (`/toolkit`); add `"toolkit"` to `NavKey`.
- `/sessions`: linked from the homepage Fridays section and the footer; not in the top nav until it earns it.
- Footer: add Toolkit and Sessions links to the appropriate column.

## 6 · Testing

- `lib/schemas.test.ts`: `ideaInterestSchema` cases (valid, bad email, missing pitchId, oversized note).
- `app/api/idea-interest/route.test.ts`: mirrors the pitch route suite — honeypot 204, rate-limit 429, invalid JSON 400, schema 400, no-DB 503, unpublished 404, success 204.
- Publish invariant helper (pure function, e.g. `lib/publish-guard.ts`): unit tests for the status/copy rules in §2.
- `npx tsc --noEmit` clean; existing suite passes.

## 7 · Rollout

Independently deployable stages, in order:

| Stage | Content | Deploy note |
|---|---|---|
| A | Release 0 `site.ts` edits | Content-only; today |
| B | Supabase/legacy cleanup | Code-only; no behavior change |
| C | Migration + board (admin publish, `/ideas`, interest API) | `npm run db:migrate` locally; `npm run db:deploy` against Neon before Vercel deploy |
| D | Toolkit page + seeds | Seeds merge only after Tama edits |
| E | Sessions page + nav changes | Backfill entries as uploads/dates arrive |

## Addendum — approved 2026-07-17 after external/history review

**A1 · Operations content goes live (stage A).** Populate `actions[]`, `blockers[]`, and `decisions[]` from the July 17 meeting brief (its actions table, the queued saline-only protocol decision, the cooler-shipment dependency). The schema, `lib/derive.ts`, and `/open-problems` already support all of it — the arrays have just never been filled. Ongoing rule: every Friday brief populates these three alongside `log[]`. Existing schema privacy rules apply (no individual names in blockers; initials for action owners).

**A2 · "What Fridays look like" strip (stage E).** The `/sessions` page opens with a short explainer of the meeting rhythm — pitch / learning session / roundtable / flex — using the existing `SessionKind` vocabulary.

**A3 · Faculty-inbound copy (stage C).** `/ideas` and `/pitch` copy explicitly addresses faculty ("Have a problem? Students here build things") alongside students. Copy-level only; the pitch form's existing `role` field needs no schema change.

**A4 · Toolkit conventions (stage D).** Every `kind: "prompt"` resource ends its `body` with a "Verify it" section (Clinton's checks-and-balances as structure, not just a standalone entry). The `claude-projects-setup` seed includes durable-workspace guidance: sources of truth live in the shared repo; the Claude project is a rebuildable view (Andrew's lost-project lesson).

**A5 · `lookingFor` suggested vocabulary (stage C).** Admin publish panel offers suggested tags — Clinical review, Literature scan, Data, Design, Writing, Outreach, Testing, Engineering — freeform still allowed. Deliberately includes non-code roles (Code for America brigade pattern; Grace's persona).

**A6 · The site as its own artifact (stage A).** Add an `artifacts[]` entry for this website (kind `live-demo`, production URL, note pointing at `/changelog` as the public build log). It is the group's most complete proof of "agentic AI ships real things." Add the repo link if/when the repo goes public.

**A7 · `docs/content-voice.md` (stage B).** Half-page voice rules for agent-edited content: plainspoken language (per the `ee0a525` rewrite), the honesty contract, blocker/attribution privacy rules. Future transcript-ingesting agents follow it.

**A8 · Homepage & IA policy.** The site has two rings. **Ring 1 (story):** the homepage scroll narrative — hero, Fridays chapter, student stories, featured projects, join. It converts visitors into Friday attendees and does not change in this release, except: the "We meet once a week" chapter gains a `primaryLink` to `/sessions`. **Ring 2 (operations):** `/projects`, `/ideas`, `/toolkit`, `/sessions`, `/open-problems`, `/built`, `/outcomes`, `/join` — plainspoken operational pages one level deep, reached via nav and footer. All new surfaces land in Ring 2. The homepage earns a new section only when a Ring 2 surface has demonstrated content volume (e.g., a semester of active board entries) — never speculatively. Footer becomes the full sitemap (add Ideas, Toolkit, Sessions).

**A9 · Recover the PM inbox spec (user action).** `lib/inbox-types.ts` and `lib/derive.ts` reference `docs/superpowers/specs/2026-05-26-pm-inbox-design.md`, which only exists in the pre-move OneDrive copy of this repo (`...\OneDrive - University of Kentucky\Projects\Incubator\Website\AI INcubator`). Copy it over. It remains the future "third lane" (member-submitted actions/blockers/decisions with curator writeback) — out of scope for this release.

## Out of scope (explicitly)

- d3 cluster map revival; per-resource toolkit routes; DB-backed toolkit submissions
- CMS "Stage 2" migration of `site.ts` into the database; transcript-ingestion GitHub Action (README loose end #3)
- Sandbox port tooling (the toolkit schema merely stays port-friendly)
- Student-org pages (officers, charter) — not yet decided in the meeting

## Open items for Tama

1. Review/edit the four toolkit seed drafts before they merge.
2. YouTube uploads + dates for Hunter's and Sully's talks; date for Alex's session.
3. July 31: record, upload, send the link (becomes the first new sessions entry).
4. First board entries: publish copy for any accepted pitches already in the admin, or seed the board by submitting the Matthew Bernard trauma-surge idea through `/pitch` yourself.
5. Decide whether Release 0 (stage A) should go out today ahead of everything else.
6. Copy `2026-05-26-pm-inbox-design.md` from the OneDrive repo copy into `docs/superpowers/specs/` (see A9).
7. Revert or confirm the uncommitted footer edit adding a personal "Lenario22 on GitHub" link — repo access for Lenario is a GitHub collaborator setting, not a public footer link.
