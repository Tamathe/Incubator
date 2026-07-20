# Idea Board, Toolkit & Sessions Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the July 17 spec (`docs/superpowers/specs/2026-07-17-idea-board-toolkit-sessions-design.md`): a published idea board on the existing pitch flow, a curated AI toolkit, a sessions/recordings library, plus the Release 0 content updates and legacy Supabase cleanup.

**Architecture:** Two contribution lanes. Curated content stays in `content/site.ts` (toolkit, sessions, ops data). Community input flows through public forms → Neon Postgres (Prisma) → password-protected `/admin`, which gains a publish step that exposes curated copy on `/ideas`. No new databases; the legacy Supabase iteration is removed.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, Prisma 7 + Neon Postgres (`@prisma/adapter-pg`), zod, vitest.

---

## Preamble — read before Task 1

- **Branch/commits:** Tama works solo with direct commits. Start from an up-to-date `master` (the `agent/site-regression-fixes` branch is separate work — do not build on it). Commit after every task with the message given in the task.
- **Do not touch** the uncommitted `components/Footer.tsx` "Lenario22" edit if present in the working tree (Tama decides its fate — spec open item 7), the untracked `public/media/brand/`, or `tools/`. Task 16 edits Footer.tsx; if the Lenario edit is still uncommitted then, ask Tama before proceeding.
- **Environment:** Tasks 4+ need `.env.local` with `DATABASE_URL`/`DIRECT_URL` (Neon) for `prisma migrate dev`. Tests and tsc do not need a DB.
- **Verification commands used throughout:** `npx tsc --noEmit` (expect: no output, exit 0), `npm test` (expect: all vitest suites pass), `npm run dev` (expect: site on http://localhost:3000).

---

### Task 1 · Stage A: Release 0 content updates

**Files:**
- Modify: `content/site.ts`

- [ ] **Step 1: Update `lastUpdated`, `session.agenda`, drone project, `log`**

In `content/site.ts`:

1. `lastUpdated: "2026-07-16"` → `lastUpdated: "2026-07-17"`.
2. Replace the `session.agenda` array with:

```ts
    agenda: [
      "AI for knowledge work - how Andrew sets up Claude Projects",
      "AI for knowledge work - how Tama uses Codex",
      "Whole-blood drone delivery - hardware assessment report-out",
    ],
```

3. In the `whole-blood-drone` project entry, change `stage` and `updated`:

```ts
      stage: "Scheduling an in-person hardware assessment",
      // ...
      updated: "2026-07-17",
```

4. Prepend to `log`:

```ts
    {
      date: "2026-07-17",
      project: "Whole-blood drone delivery",
      note: "Andrew is arranging an in-person session with the drone lab to inspect hardware, sensors, and attachment options before the first nonclinical flight test.",
    },
```

- [ ] **Step 2: Populate `actions`, `blockers`, `decisions` (spec A1)**

Replace the three empty arrays:

```ts
  actions: [
    {
      id: "bailey-hardware-review",
      project: "whole-blood-drone",
      owner: "AP",
      body: "Set up an in-person meeting with the drone lab to inspect the drone, prior drop mechanism, sensors, and attachment options, then report the preparation required.",
      created: "2026-07-17",
      status: "open",
    },
    {
      id: "cooler-shipment-status",
      project: "whole-blood-drone",
      owner: "TT",
      body: "Track the cooler/insulator shipment and share the arrival date for fit and attachment planning.",
      created: "2026-07-17",
      status: "open",
    },
  ],
  blockers: [
    {
      id: "flight-test-date",
      project: "whole-blood-drone",
      body: "The first flight test cannot be scheduled until the team knows how much hardware preparation the drone and cooler attachment require.",
      waitingOn: "In-person hardware review at the drone lab",
      created: "2026-07-17",
    },
  ],
  decisions: [
    {
      id: "phase1-saline-protocol",
      project: "whole-blood-drone",
      question: "Confirm the Phase 1 test design: saline instead of blood, low-height drops, temperature and impact-force measurements only.",
      created: "2026-07-17",
      forSession: "2026-07-31",
      status: "queued",
    },
  ],
```

(Privacy rules hold: blocker names a process, not a person; action owners are initials. These flow automatically into `deriveActivityLog`, `deriveAgenda`, and `/open-problems` via `lib/derive.ts`.)

- [ ] **Step 3: Update `meetings`**

Replace the `meetings` array with:

```ts
  meetings: [
    {
      date: "2026-07-10",
      kind: "roundtable",
      title: "Featured-build portfolio check-in",
      blurb:
        "KY-AHEAD, rural diabetic retinopathy screening, and whole-blood drone delivery as the public story for the site.",
    },
    {
      date: "2026-07-17",
      kind: "roundtable",
      title: "Drone planning and the student-org website",
      blurb:
        "Andrew will meet the drone lab in person to assess hardware before the first flight test. The group set three website directions: an idea board, a practical toolkit, and recorded sessions.",
    },
    { date: "2026-07-24", kind: "cancelled", title: "No meeting" },
    {
      date: "2026-07-31",
      kind: "presentation",
      title: "AI for knowledge work — Claude Projects and Codex",
      blurb:
        "How Andrew sets up Claude Projects for a research effort, and how Tama uses Codex for knowledge work. Recorded for the website.",
      presenters: "Peng / Thé",
    },
  ],
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` → no output. Run: `npm test` → all pass.

- [ ] **Step 5: Commit**

```bash
git add content/site.ts
git commit -m "feat: record July 17 meeting outcomes and populate ops data"
```

---

### Task 2 · Stage B: remove the legacy Supabase iteration

**Files:**
- Delete: `components/IdeasMap.tsx`, `components/IdeasGrid.tsx`, `components/IdeaIntakeDrawer.tsx`, `components/IdeaDetailPanel.tsx`, `components/IdeasCountChip.tsx`, `lib/ideas.ts`, `lib/supabase.ts`, `docs/supabase/` (whole dir)
- Modify: `package.json` (via npm uninstall), `.env.local.example`

Keep `lib/inbox-types.ts` — it is imported by `lib/derive.ts`.

- [ ] **Step 1: Confirm nothing outside the legacy set imports these modules**

Run: `git grep -l -E "IdeasMap|IdeasGrid|IdeaIntakeDrawer|IdeaDetailPanel|IdeasCountChip|lib/supabase|from \"@/lib/ideas\"" -- "app" "components" "lib" "scripts"`

Expected: only the five `components/Idea*.tsx` files themselves. If anything else matches, stop and resolve first.

- [ ] **Step 2: Delete files and dependencies**

```bash
git rm components/IdeasMap.tsx components/IdeasGrid.tsx components/IdeaIntakeDrawer.tsx components/IdeaDetailPanel.tsx components/IdeasCountChip.tsx lib/ideas.ts lib/supabase.ts
git rm -r docs/supabase
npm uninstall @supabase/supabase-js d3-force @types/d3-force
```

- [ ] **Step 3: Replace `.env.local.example` with the real env surface**

```
# Copy this file to .env.local and fill in the values.
# .env.local is gitignored — do not commit real values here.

# Neon Postgres (see README "Deploying").
DATABASE_URL=
DIRECT_URL=

# Admin dashboard auth (see README for how to generate).
JWT_SECRET=
ADMIN_PASSWORD_HASH=
```

- [ ] **Step 4: Verify** — `npx tsc --noEmit` (no output), `npm test` (pass), `npm run build` (succeeds).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove legacy Supabase ideas iteration and stale env example"
```

---

### Task 3 · Stage B: content voice doc

**Files:**
- Create: `docs/content-voice.md`
- Modify: `README.md` (add one line to "See also")

- [ ] **Step 1: Write `docs/content-voice.md`**

```markdown
# Content voice — rules for anyone (or any agent) editing site content

The site's content is agent-editable by design (transcript → brief → `content/site.ts` PR).
These rules keep every edit on voice. They apply to `content/site.ts`, page copy, and
meeting briefs.

## Plainspoken

- Short sentences. Everyday words. No hype, no jargon, no "leveraging."
- Say who does what: "Clinicians review every result," not "results are reviewed."
- One idea per sentence.

## The honesty contract

- Never make new work look mature. Kickoff projects keep dashed borders and
  "looking for collaborators" copy.
- Describe unapproved or proposed work in conditional language: "would," "proposed,"
  "is planning." Only shipped, approved things get present tense.
- Nothing on the public site fakes activity: no placeholder ideas, resources, or
  recordings. Empty states are honest.

## Privacy and credit

- Blockers name processes, departments, or artifacts — never individuals.
- Action owners are initials.
- Public attribution (idea board, toolkit, sessions) is deliberate, never automatic.
  Contributor names appear because we chose to credit them, with their knowledge.
- Submitter text from forms never goes public unedited; the admin writes public copy.

## Clinical care

- Clinical decisions stay human-owned in every description. AI "supports," "drafts,"
  or "flags" — it does not "diagnose," "decide," or "treat."
```

- [ ] **Step 2: Add to README "See also" list**

```markdown
- [`docs/content-voice.md`](docs/content-voice.md) — voice rules for content edits
  (including agent-generated ones).
```

- [ ] **Step 3: Commit**

```bash
git add docs/content-voice.md README.md
git commit -m "docs: add content voice rules for agent-edited content"
```

---

### Task 4 · Stage C: Prisma schema + migration

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Extend the schema**

Add to `model Pitch` (after `reviewedAt`):

```prisma
  publishedAt       DateTime?
  publicTitle       String?
  publicSummary     String?
  publicAttribution String?
  lookingFor        String[]       @default([])
  interests         IdeaInterest[]
```

Add a new model at the end of the file:

```prisma
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

- [ ] **Step 2: Create the migration and regenerate the client**

Run: `npm run db:migrate -- --name idea-board` (needs `.env.local` with Neon URLs)
Expected: "Your database is now in sync with your schema", new folder under `prisma/migrations/`.
Then: `npm run db:generate` → "Generated Prisma Client".

- [ ] **Step 3: Verify** — `npx tsc --noEmit` (no output), `npm test` (pass).

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: add idea board publish fields and IdeaInterest model"
```

---

### Task 5 · Stage C: publish guard helper (TDD)

**Files:**
- Create: `lib/publish-guard.ts`
- Test: `lib/publish-guard.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from "vitest";
import { canPublish, statusKeepsPublished } from "./publish-guard";

describe("canPublish", () => {
  const copy = { publicTitle: "T", publicSummary: "S" };

  it("allows accepted with complete copy", () => {
    expect(canPublish("accepted", copy)).toEqual({ ok: true });
  });

  it("allows converted with complete copy", () => {
    expect(canPublish("converted", copy)).toEqual({ ok: true });
  });

  it("rejects non-accepted statuses", () => {
    for (const s of ["new", "reviewing", "declined"] as const) {
      expect(canPublish(s, copy).ok).toBe(false);
    }
  });

  it("rejects missing or blank title/summary", () => {
    expect(canPublish("accepted", { publicTitle: null, publicSummary: "S" }).ok).toBe(false);
    expect(canPublish("accepted", { publicTitle: "T", publicSummary: "  " }).ok).toBe(false);
  });
});

describe("statusKeepsPublished", () => {
  it("only accepted/converted keep a pitch published", () => {
    expect(statusKeepsPublished("accepted")).toBe(true);
    expect(statusKeepsPublished("converted")).toBe(true);
    expect(statusKeepsPublished("reviewing")).toBe(false);
    expect(statusKeepsPublished("declined")).toBe(false);
    expect(statusKeepsPublished("new")).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm test -- publish-guard` → FAIL (module not found).

- [ ] **Step 3: Implement `lib/publish-guard.ts`**

```ts
/** Kept as a string union (not the generated enum) so this stays a pure, DB-free helper. */
export type PitchStatusValue = "new" | "reviewing" | "accepted" | "declined" | "converted";

export interface PublishCopy {
  publicTitle: string | null;
  publicSummary: string | null;
}

export function statusKeepsPublished(status: PitchStatusValue): boolean {
  return status === "accepted" || status === "converted";
}

export function canPublish(
  status: PitchStatusValue,
  copy: PublishCopy,
): { ok: true } | { ok: false; reason: string } {
  if (!statusKeepsPublished(status)) {
    return { ok: false, reason: "Only accepted or converted pitches can be published." };
  }
  if (!copy.publicTitle?.trim()) return { ok: false, reason: "Public title is required." };
  if (!copy.publicSummary?.trim()) return { ok: false, reason: "Public summary is required." };
  return { ok: true };
}
```

- [ ] **Step 4: Run to verify pass** — `npm test -- publish-guard` → PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/publish-guard.ts lib/publish-guard.test.ts
git commit -m "feat: add publish guard for idea board invariants"
```

---

### Task 6 · Stage C: interest schema (TDD)

**Files:**
- Modify: `lib/schemas.ts`, `lib/schemas.test.ts`

- [ ] **Step 1: Append failing tests to `lib/schemas.test.ts`**

```ts
describe("ideaInterestSchema", () => {
  const valid = {
    pitchId: "clx0000000000000000000000",
    name: "Grace B",
    email: "grace@uky.edu",
    note: "I can help with the math.",
  };

  it("accepts a valid payload (note optional)", () => {
    expect(ideaInterestSchema.safeParse(valid).success).toBe(true);
    const { note: _note, ...noNote } = valid;
    expect(ideaInterestSchema.safeParse(noNote).success).toBe(true);
  });

  it("rejects bad email, missing pitchId, oversized note, unknown keys", () => {
    expect(ideaInterestSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
    expect(ideaInterestSchema.safeParse({ ...valid, pitchId: "" }).success).toBe(false);
    expect(ideaInterestSchema.safeParse({ ...valid, note: "x".repeat(2001) }).success).toBe(false);
    expect(ideaInterestSchema.safeParse({ ...valid, extra: 1 }).success).toBe(false);
  });
});
```

Add `ideaInterestSchema` to the existing import from `./schemas`.

- [ ] **Step 2: Run to verify failure** — `npm test -- schemas` → FAIL (no export).

- [ ] **Step 3: Implement in `lib/schemas.ts`** (before the type exports)

```ts
export const ideaInterestSchema = z
  .object({
    pitchId: z.string().trim().min(1).max(64),
    name: shortText(200),
    email: emailField,
    note: optionalText(2000),
  })
  .strict();
```

And with the other type exports:

```ts
export type IdeaInterestInput = z.infer<typeof ideaInterestSchema>;
```

- [ ] **Step 4: Run to verify pass** — `npm test -- schemas` → PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/schemas.ts lib/schemas.test.ts
git commit -m "feat: add idea interest schema"
```

---

### Task 7 · Stage C: `/api/idea-interest` route (TDD)

**Files:**
- Create: `app/api/idea-interest/route.ts`
- Test: `app/api/idea-interest/route.test.ts`

- [ ] **Step 1: Write the failing test** (mirrors `app/api/pitch/route.test.ts`)

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const findUniqueMock = vi.fn();
const createMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pitch: { findUnique: findUniqueMock },
    ideaInterest: { create: createMock },
  },
}));

async function post(body: unknown, headers: Record<string, string> = {}) {
  const { POST } = await import("./route");
  return POST(
    new Request("http://localhost/api/idea-interest", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "5.5.5.1", ...headers },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  findUniqueMock.mockReset();
  createMock.mockReset();
  findUniqueMock.mockResolvedValue({ publishedAt: new Date() });
  createMock.mockResolvedValue({});
});

const valid = {
  pitchId: "clx0000000000000000000000",
  name: "Grace B",
  email: "grace@uky.edu",
  note: "I can help.",
};

describe("POST /api/idea-interest", () => {
  it("stores interest for a published idea", async () => {
    const res = await post(valid);
    expect(res.status).toBe(204);
    expect(createMock).toHaveBeenCalledOnce();
    expect(createMock.mock.calls[0][0].data).toMatchObject({
      pitchId: valid.pitchId,
      email: "grace@uky.edu",
    });
  });

  it("honeypot silently returns 204 without writing", async () => {
    const res = await post({ ...valid, website: "x" }, { "x-forwarded-for": "5.5.5.2" });
    expect(res.status).toBe(204);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 400 on schema violation", async () => {
    const res = await post({ ...valid, email: "nope" }, { "x-forwarded-for": "5.5.5.3" });
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown or unpublished pitches", async () => {
    findUniqueMock.mockResolvedValueOnce(null);
    const res = await post(valid, { "x-forwarded-for": "5.5.5.4" });
    expect(res.status).toBe(404);

    findUniqueMock.mockResolvedValueOnce({ publishedAt: null });
    const res2 = await post(valid, { "x-forwarded-for": "5.5.5.5" });
    expect(res2.status).toBe(404);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 503 when the database is not configured", async () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const res = await post(valid, { "x-forwarded-for": "5.5.5.6" });
      expect(res.status).toBe(503);
    } finally {
      process.env.DATABASE_URL = prev;
    }
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm test -- idea-interest` → FAIL (route missing).

- [ ] **Step 3: Implement `app/api/idea-interest/route.ts`**

```ts
import { NextResponse } from "next/server";
import { ideaInterestSchema } from "@/lib/schemas";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`interest:${ip}`, { max: 5, windowMs: 10 * 60_000 })) {
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

  const parsed = ideaInterestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Idea board database is not configured" },
      { status: 503 },
    );
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const pitch = await prisma.pitch.findUnique({
      where: { id: parsed.data.pitchId },
      select: { publishedAt: true },
    });
    if (!pitch?.publishedAt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await prisma.ideaInterest.create({
      data: {
        pitchId: parsed.data.pitchId,
        name: parsed.data.name,
        email: parsed.data.email,
        note: parsed.data.note ?? null,
        ipAddress: ip,
      },
    });
  } catch (err) {
    console.error("idea interest create failed", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
```

- [ ] **Step 4: Run to verify pass** — `npm test -- idea-interest` → PASS. Then `npm test` → all pass.

- [ ] **Step 5: Commit**

```bash
git add app/api/idea-interest
git commit -m "feat: add idea interest API"
```

---

### Task 8 · Stage C: idea board data helper (TDD)

**Files:**
- Create: `lib/idea-board.ts`
- Test: `lib/idea-board.test.ts`

- [ ] **Step 1: Write the failing test for the pure mapper**

```ts
import { describe, it, expect } from "vitest";
import { toPublicIdea } from "./idea-board";

const row = {
  id: "p1",
  publicTitle: "Trauma surge prediction",
  publicSummary: "A model that flags likely surge days.",
  publicAttribution: "Pitched by a faculty member",
  lookingFor: ["Data", "Engineering"],
  publishedAt: new Date("2026-07-18T12:00:00Z"),
};

describe("toPublicIdea", () => {
  it("maps a published row to the public DTO", () => {
    expect(toPublicIdea(row)).toEqual({
      id: "p1",
      title: "Trauma surge prediction",
      summary: "A model that flags likely surge days.",
      attribution: "Pitched by a faculty member",
      lookingFor: ["Data", "Engineering"],
      publishedAt: "2026-07-18",
    });
  });

  it("returns null when unpublished or copy is incomplete", () => {
    expect(toPublicIdea({ ...row, publishedAt: null })).toBeNull();
    expect(toPublicIdea({ ...row, publicTitle: null })).toBeNull();
    expect(toPublicIdea({ ...row, publicSummary: null })).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify failure** — `npm test -- idea-board` → FAIL.

- [ ] **Step 3: Implement `lib/idea-board.ts`**

```ts
/** Public DTO for /ideas. NEVER include submitter fields or raw pitch text. */
export interface PublicIdea {
  id: string;
  title: string;
  summary: string;
  attribution: string | null;
  lookingFor: string[];
  /** ISO date (yyyy-mm-dd) */
  publishedAt: string;
}

/** Suggested lookingFor tags (spec A5) — shown as admin hints; freeform allowed. */
export const SUGGESTED_LOOKING_FOR = [
  "Clinical review",
  "Literature scan",
  "Data",
  "Design",
  "Writing",
  "Outreach",
  "Testing",
  "Engineering",
] as const;

interface PublishablePitchRow {
  id: string;
  publicTitle: string | null;
  publicSummary: string | null;
  publicAttribution: string | null;
  lookingFor: string[];
  publishedAt: Date | null;
}

export function toPublicIdea(p: PublishablePitchRow): PublicIdea | null {
  if (!p.publishedAt || !p.publicTitle || !p.publicSummary) return null;
  return {
    id: p.id,
    title: p.publicTitle,
    summary: p.publicSummary,
    attribution: p.publicAttribution,
    lookingFor: p.lookingFor,
    publishedAt: p.publishedAt.toISOString().slice(0, 10),
  };
}

/** null = database not configured (page renders its static fallback). */
export async function getPublishedIdeas(): Promise<PublicIdea[] | null> {
  if (!process.env.DATABASE_URL) return null;
  const { prisma } = await import("@/lib/prisma");
  const rows = await prisma.pitch.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(toPublicIdea).filter((x): x is PublicIdea => x !== null);
}
```

- [ ] **Step 4: Run to verify pass** — `npm test -- idea-board` → PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/idea-board.ts lib/idea-board.test.ts
git commit -m "feat: add idea board public DTO and query helper"
```

---

### Task 9 · Stage C: admin publish panel + interest list

**Files:**
- Modify: `app/admin/pitches/actions.ts`, `app/admin/pitches/page.tsx`

- [ ] **Step 1: Extend `actions.ts`**

Add imports at the top:

```ts
import { canPublish, statusKeepsPublished, type PitchStatusValue } from "@/lib/publish-guard";
```

Modify `setPitchStatus` so leaving accepted/converted unpublishes — replace the `prisma.pitch.update` call with:

```ts
  await prisma.pitch.update({
    where: { id },
    data: {
      status: next,
      reviewedAt:
        current?.status === PitchStatus.new && next !== PitchStatus.new
          ? new Date()
          : undefined,
      publishedAt: statusKeepsPublished(next as PitchStatusValue) ? undefined : null,
    },
  });
  revalidatePath("/ideas");
```

Append three actions:

```ts
export async function setPitchPublicCopy(
  id: string,
  publicTitle: string,
  publicSummary: string,
  publicAttribution: string,
  lookingForCsv: string,
) {
  await requireAdmin();
  const lookingFor = lookingForCsv
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);
  await prisma.pitch.update({
    where: { id },
    data: {
      publicTitle: publicTitle.trim() || null,
      publicSummary: publicSummary.trim() || null,
      publicAttribution: publicAttribution.trim() || null,
      lookingFor,
    },
  });
  revalidatePath("/admin/pitches");
  revalidatePath("/ideas");
}

export async function publishPitch(id: string) {
  await requireAdmin();
  const pitch = await prisma.pitch.findUnique({
    where: { id },
    select: { status: true, publicTitle: true, publicSummary: true },
  });
  if (!pitch) throw new Error("pitch not found");
  const verdict = canPublish(pitch.status as PitchStatusValue, pitch);
  if (!verdict.ok) throw new Error(verdict.reason);
  await prisma.pitch.update({ where: { id }, data: { publishedAt: new Date() } });
  revalidatePath("/admin/pitches");
  revalidatePath("/ideas");
}

export async function unpublishPitch(id: string) {
  await requireAdmin();
  await prisma.pitch.update({ where: { id }, data: { publishedAt: null } });
  revalidatePath("/admin/pitches");
  revalidatePath("/ideas");
}
```

- [ ] **Step 2: Add the publish panel + interests to `page.tsx`**

Update the imports:

```ts
import { setPitchStatus, setPitchNotes, setPitchPublicCopy, publishPitch, unpublishPitch } from "./actions";
import { canPublish, type PitchStatusValue } from "@/lib/publish-guard";
import { SUGGESTED_LOOKING_FOR } from "@/lib/idea-board";
```

After the `selected` lookup, fetch interests and compute the publish verdict:

```ts
  const interests = selected
    ? await prisma.ideaInterest.findMany({
        where: { pitchId: selected.id },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const publishVerdict = selected
    ? canPublish(selected.status as PitchStatusValue, selected)
    : null;
```

Inside the selected `<aside>`, after the private-notes form, insert:

```tsx
              <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "18px 0" }} />
              <h3 className="eyebrow">Idea board</h3>
              <div className="small" style={{ color: "var(--ink-3)", margin: "6px 0 10px" }}>
                {selected.publishedAt
                  ? `Published ${selected.publishedAt.toLocaleDateString("en-US")}`
                  : "Not published. Write public copy — submitter text never goes live unedited."}
              </div>

              <form
                action={async (fd) => {
                  "use server";
                  await setPitchPublicCopy(
                    selected.id,
                    String(fd.get("publicTitle") ?? ""),
                    String(fd.get("publicSummary") ?? ""),
                    String(fd.get("publicAttribution") ?? ""),
                    String(fd.get("lookingFor") ?? ""),
                  );
                }}
                style={{ display: "grid", gap: 8 }}
              >
                <input name="publicTitle" defaultValue={selected.publicTitle ?? ""} placeholder="Public title" style={{ width: "100%", padding: "8px 12px", background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--ink)" }} />
                <textarea name="publicSummary" defaultValue={selected.publicSummary ?? ""} placeholder="Public summary (2-3 sentences)" rows={4} style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--ink)", padding: 10, fontSize: 13, fontFamily: "var(--sans)", resize: "vertical" }} />
                <input name="publicAttribution" defaultValue={selected.publicAttribution ?? ""} placeholder="Attribution (optional, deliberate)" style={{ width: "100%", padding: "8px 12px", background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--ink)" }} />
                <input name="lookingFor" defaultValue={selected.lookingFor.join(", ")} placeholder={`Looking for (comma-separated), e.g. ${SUGGESTED_LOOKING_FOR.slice(0, 3).join(", ")}`} style={{ width: "100%", padding: "8px 12px", background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--ink)" }} />
                <button type="submit" className="btn sm primary">Save public copy</button>
              </form>

              {selected.publishedAt ? (
                <form action={async () => { "use server"; await unpublishPitch(selected.id); }} style={{ marginTop: 8 }}>
                  <button type="submit" className="btn sm">Unpublish</button>
                </form>
              ) : publishVerdict?.ok ? (
                <form action={async () => { "use server"; await publishPitch(selected.id); }} style={{ marginTop: 8 }}>
                  <button type="submit" className="btn sm primary">Publish to /ideas</button>
                </form>
              ) : (
                <div className="small" style={{ color: "var(--ink-3)", marginTop: 8 }}>
                  {publishVerdict && !publishVerdict.ok ? publishVerdict.reason : ""}
                </div>
              )}

              <h3 className="eyebrow" style={{ marginTop: 18 }}>
                Raised hands · {interests.length}
              </h3>
              {interests.length === 0 ? (
                <p className="small" style={{ color: "var(--ink-3)" }}>None yet.</p>
              ) : (
                interests.map((i) => (
                  <div key={i.id} className="small" style={{ borderTop: "1px solid var(--line)", padding: "8px 0" }}>
                    <strong>{i.name}</strong> · {i.email}
                    {i.note && <div style={{ color: "var(--ink-2)", marginTop: 4, whiteSpace: "pre-wrap" }}>{i.note}</div>}
                    <div style={{ color: "var(--ink-3)", marginTop: 2 }}>{i.createdAt.toLocaleString("en-US")}</div>
                  </div>
                ))
              )}
```

- [ ] **Step 3: Verify** — `npx tsc --noEmit` (no output), `npm test` (pass). With `.env.local` set, `npm run dev` → log into `/admin`, open a pitch, save public copy on an accepted pitch, publish, confirm the panel state flips.

- [ ] **Step 4: Commit**

```bash
git add app/admin/pitches
git commit -m "feat: add publish panel and raised hands to admin pitches"
```

---

### Task 10 · Stage C: public `/ideas` board

**Files:**
- Create: `components/RaiseHandForm.tsx`, `components/IdeaBoardCard.tsx`
- Modify: `app/ideas/page.tsx`, `app/globals.css` (append)

- [ ] **Step 1: Create `components/RaiseHandForm.tsx`** (modeled on `SubscribeForm`)

```tsx
"use client";

import { useState } from "react";

type FormState =
  | { kind: "collapsed" }
  | { kind: "open" }
  | { kind: "sending" }
  | { kind: "done" }
  | { kind: "error" };

export default function RaiseHandForm({ pitchId }: { pitchId: string }) {
  const [state, setState] = useState<FormState>({ kind: "collapsed" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/idea-interest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          pitchId,
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          note: String(formData.get("note") ?? "") || undefined,
          website: String(formData.get("website") ?? ""),
        }),
      });
      setState(res.ok || res.status === 204 ? { kind: "done" } : { kind: "error" });
    } catch {
      setState({ kind: "error" });
    }
  }

  if (state.kind === "collapsed") {
    return (
      <button className="btn ghost sm" onClick={() => setState({ kind: "open" })}>
        Raise your hand <span className="arrow">-&gt;</span>
      </button>
    );
  }

  if (state.kind === "done") {
    return (
      <p className="small idea-hand-done">
        Got it. We&apos;ll connect you with the idea&apos;s owner by email.
      </p>
    );
  }

  return (
    <form className="idea-hand-form" onSubmit={onSubmit}>
      <input name="name" placeholder="Your name" required aria-label="Your name" />
      <input name="email" type="email" placeholder="name@uky.edu" required aria-label="Your email" />
      <textarea name="note" rows={2} placeholder="What could you help with? (optional)" aria-label="How you could help" />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
      <button className="btn primary sm" type="submit" disabled={state.kind === "sending"}>
        {state.kind === "sending" ? "Sending..." : "I want to help"}
      </button>
      {state.kind === "error" && (
        <span className="small idea-hand-error">
          Could not send. <a href="mailto:incubator@uky.edu">Email us instead</a>.
        </span>
      )}
    </form>
  );
}
```

- [ ] **Step 2: Create `components/IdeaBoardCard.tsx`**

```tsx
import type { PublicIdea } from "@/lib/idea-board";
import RaiseHandForm from "./RaiseHandForm";

export default function IdeaBoardCard({ idea }: { idea: PublicIdea }) {
  return (
    <article className="idea-board-card card">
      <h3>{idea.title}</h3>
      <p className="kick-summary">{idea.summary}</p>
      {idea.lookingFor.length > 0 && (
        <div className="idea-tags">
          <span className="eyebrow">Looking for</span>
          {idea.lookingFor.map((tag) => (
            <span className="chip mono" key={tag}>{tag}</span>
          ))}
        </div>
      )}
      <div className="idea-board-meta small">
        {idea.attribution ? `${idea.attribution} · ` : ""}Posted {idea.publishedAt}
      </div>
      <RaiseHandForm pitchId={idea.id} />
    </article>
  );
}
```

- [ ] **Step 3: Rewrite `app/ideas/page.tsx`**

```tsx
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import IdeaBoardCard from "@/components/IdeaBoardCard";
import { getPublishedIdeas } from "@/lib/idea-board";

export const revalidate = 300;

export const metadata = {
  title: "Idea board - AI Incubator",
  description:
    "Ideas and research opportunities looking for collaborators at the University of Kentucky AI Incubator.",
};

const QUESTION_PROMPTS = [
  "How should students use AI without outsourcing the work?",
  "What makes an AI-assisted workflow trustworthy enough to pilot?",
  "How do we test prototypes before they touch real workflows?",
  "Where can AI support rural teams without adding another burden?",
  "What tool, skill, or AI policy should we cover next?",
  "What should never be automated?",
];

export default async function IdeasPage() {
  const boardIdeas = (await getPublishedIdeas()) ?? [];
  const hasBoard = boardIdeas.length > 0;

  return (
    <>
      <Nav active="ideas" />

      <header
        className="ideas-hero container"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <h1 className="h-display" style={{ maxWidth: "22ch" }}>
            Ideas looking for people.
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: "62ch" }}>
            Students post ideas they want to build. Faculty post problems they
            want built. Raise your hand and we&apos;ll connect you.
          </p>
        </div>
      </header>

      {hasBoard && (
        <section className="section container">
          <div className="section-head">
            <h2 className="h1" style={{ maxWidth: "20ch" }}>On the board.</h2>
            <a href="/pitch" className="btn ghost">
              Post an idea <span className="arrow">{"->"}</span>
            </a>
          </div>
          <div className="proj-grid">
            {boardIdeas.map((idea) => (
              <IdeaBoardCard key={idea.id} idea={idea} />
            ))}
          </div>
        </section>
      )}

      <section className="section container">
        <div className="section-head">
          <div>
            <h2 className="h1" style={{ maxWidth: "20ch" }}>
              {hasBoard ? "Questions people bring." : "What people are asking."}
            </h2>
          </div>
          <a href={hasBoard ? "/join" : "/pitch"} className="btn ghost">
            {hasBoard ? "Bring a question" : "Post the first idea"}{" "}
            <span className="arrow">{"->"}</span>
          </a>
        </div>

        <div className="ideas-static-grid">
          {QUESTION_PROMPTS.map((idea) => (
            <article className="idea-topic-card" key={idea}>
              <h3>{idea}</h3>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Append board styles to `app/globals.css`**

```css
/* ---- Idea board (/ideas) ---------------------------------------- */
.idea-board-card { display: flex; flex-direction: column; gap: 10px; padding: 20px; }
.idea-board-card h3 { margin: 0; }
.idea-tags { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.idea-board-meta { color: var(--ink-3); }
.idea-hand-form { display: grid; gap: 8px; margin-top: 4px; }
.idea-hand-form input,
.idea-hand-form textarea {
  width: 100%; padding: 8px 12px; background: var(--bg);
  border: 1px solid var(--line); border-radius: 8px; color: var(--ink);
  font-family: var(--sans); font-size: 13px;
}
.idea-hand-done { color: var(--ink-2); }
.idea-hand-error { color: var(--danger, #c0392b); }
```

- [ ] **Step 5: Verify** — `npx tsc --noEmit`, `npm test`, then `npm run dev`:
  - Without `.env.local` DB vars: `/ideas` shows only the questions strip ("Post the first idea" CTA).
  - With DB + a published pitch (from Task 9): board section renders, Raise-your-hand submits (check row lands in `/admin/pitches` panel).

- [ ] **Step 6: Commit**

```bash
git add components/RaiseHandForm.tsx components/IdeaBoardCard.tsx app/ideas/page.tsx app/globals.css
git commit -m "feat: replace static ideas page with the published idea board"
```

---

### Task 11 · Stage C: faculty-inbound copy on `/pitch` (spec A3)

**Files:**
- Modify: `app/pitch/page.tsx`

- [ ] **Step 1: Update the hero lead**

Replace the `<p className="lead">` block with:

```tsx
          <p className="lead" style={{ marginTop: 28, maxWidth: "62ch" }}>
            Tell us who it affects and what you would test first. Students and
            faculty both welcome — if you have a problem, students here can
            build with you.
          </p>
```

- [ ] **Step 2: Verify** — `npx tsc --noEmit`, visual check of `/pitch` in dev.

- [ ] **Step 3: Commit**

```bash
git add app/pitch/page.tsx
git commit -m "feat: address faculty explicitly in pitch copy"
```

---

### Task 12 · Stage D: `Resource` type + seed toolkit content

**Files:**
- Modify: `content/site.ts`

- [ ] **Step 1: Add the type** (after the `StudentWork` interface)

```ts
export type ResourceKind = "prompt" | "setup" | "workflow" | "check" | "guide";

export interface Resource {
  /** slug; doubles as the anchor (/toolkit#verification-checks) */
  id: string;
  title: string;
  kind: ResourceKind;
  /** Freeform credit line — always populated (credit principle). */
  authors: string;
  /** One-liner for the card. */
  summary: string;
  /** Paragraphs or numbered steps. kind "prompt" entries end with a "Verify it:" step. */
  body: string[];
  tags?: string[];
  link?: { label: string; url: string };
  /** ISO date */
  updated: string;
}
```

Add `resources: Resource[];` to `SiteContent` (after `studentWork`).

- [ ] **Step 2: Add seed entries** (after `studentWork` in the content object). **These are drafts from the July 17 transcript — Tama reviews/edits the text before this commit is pushed.**

```ts
  resources: [
    {
      id: "verification-checks",
      title: "Checks and balances for AI output",
      kind: "check",
      authors: "Clinton Ayres",
      summary: "The checks to run before you trust or share anything an AI produced.",
      body: [
        "AI output is a draft, not an answer. Before you use it, run these checks.",
        "1. Source check - ask where a claim comes from. If the model cannot point to a source you can open, treat the claim as unverified.",
        "2. Reversal check - ask the model to argue against its own output. Real findings survive; confabulated ones collapse.",
        "3. Spot check - pick two or three specifics (numbers, names, citations) and verify them by hand. Error rates cluster: if the specifics hold, confidence rises.",
        "4. Domain check - show the output to one person who knows the field. Five minutes of human expertise catches what all the prompting in the world misses.",
        "If output fails a check, do not patch it by hand and move on. Tell the model what failed and make it redo the work - that is how the next draft gets better.",
      ],
      tags: ["verification", "getting-started"],
      updated: "2026-07-17",
    },
    {
      id: "start-small-fail-fast",
      title: "Getting unstuck: iterating with AI",
      kind: "guide",
      authors: "Clinton Ayres",
      summary: "You do not need a plan. You need a first attempt and a willingness to iterate.",
      body: [
        "The most common blocker is not skill - it is having so many ideas you cannot pick one, or assuming everyone else knows something you do not. They do not. Everyone is figuring this out in real time.",
        "Pick the smallest version of the idea and ask the AI to build or draft it in one sitting. It will be wrong in places. That is the point - now you have something concrete to react to.",
        "Ask the model to help you frame the problem, not just solve it: 'If you were me trying to pursue this research, what framework would you build?' Then take that framework to a human who knows the field.",
        "Iterate in small loops: try, look at what is wrong, say what is wrong, try again. Ten small loops beat one big plan.",
        "It is okay to not know what you are doing. Getting in and failing is how you find out what the tools can do - and the group is the safe place to show the failed attempt.",
      ],
      tags: ["getting-started", "mindset"],
      updated: "2026-07-17",
    },
    {
      id: "claude-projects-setup",
      title: "Setting up a Claude Project for a research effort",
      kind: "setup",
      authors: "Andrew Peng",
      summary: "How Andrew organizes a multi-month effort in Claude Projects - and keeps it durable.",
      body: [
        "Draft - Andrew presents this at the July 31 session; this entry gets fleshed out from the recording.",
        "Create one Claude Project per real-world effort (one per research project, not one per question). Put the standing context - goals, constraints, key documents - in the project knowledge so every chat starts warm.",
        "Keep sources of truth outside the project: documents and emails live in the shared repo or a dedicated folder, and the project references them. A Claude Project is a rebuildable view, not an archive - if it is deleted, you should lose minutes, not months.",
      ],
      tags: ["claude", "knowledge-work"],
      updated: "2026-07-17",
    },
    {
      id: "codex-knowledge-work",
      title: "Codex for knowledge work",
      kind: "workflow",
      authors: "Tama Thé",
      summary: "Using Codex beyond code - organizing, drafting, and thinking work.",
      body: [
        "Draft - Tama presents this at the July 31 session; this entry gets fleshed out from the recording.",
        "Most people file Claude and Codex under coding tools. In practice they are knowledge-work tools: meeting synthesis, document drafting, project organization, option analysis.",
      ],
      tags: ["codex", "knowledge-work"],
      updated: "2026-07-17",
    },
  ],
```

- [ ] **Step 3: Verify** — `npx tsc --noEmit` (no output), `npm test` (pass).

- [ ] **Step 4: Commit** (only after Tama has reviewed the seed text)

```bash
git add content/site.ts
git commit -m "feat: add Resource type and seed toolkit content"
```

---

### Task 13 · Stage D: `/toolkit` page

**Files:**
- Create: `app/toolkit/page.tsx`, `components/ToolkitFilteredList.tsx`
- Modify: `app/globals.css` (append)

- [ ] **Step 1: Create `components/ToolkitFilteredList.tsx`** (client filter, mirroring the `/projects` pattern)

```tsx
"use client";

import { useState } from "react";
import type { Resource, ResourceKind } from "@/content/site";

const KIND_LABELS: Record<ResourceKind, string> = {
  prompt: "Prompts",
  setup: "Setups",
  workflow: "Workflows",
  check: "Checks",
  guide: "Guides",
};

export default function ToolkitFilteredList({ resources }: { resources: Resource[] }) {
  const [kind, setKind] = useState<ResourceKind | "all">("all");
  const kinds = Array.from(new Set(resources.map((r) => r.kind)));
  const visible = kind === "all" ? resources : resources.filter((r) => r.kind === kind);

  return (
    <>
      <div className="toolkit-filters">
        <button
          className={`chip mono${kind === "all" ? " is-active" : ""}`}
          onClick={() => setKind("all")}
        >
          All
        </button>
        {kinds.map((k) => (
          <button
            key={k}
            className={`chip mono${kind === k ? " is-active" : ""}`}
            onClick={() => setKind(k)}
          >
            {KIND_LABELS[k]}
          </button>
        ))}
      </div>

      <div className="toolkit-list">
        {visible.map((r) => (
          <article className="resource-card card" id={r.id} key={r.id}>
            <div className="top">
              <span className={`chip mono kind-${r.kind}`}>{KIND_LABELS[r.kind]}</span>
              <span className="small resource-updated">Updated {r.updated}</span>
            </div>
            <h3 style={{ marginTop: 8 }}>{r.title}</h3>
            <p className="kick-summary">{r.summary}</p>
            <div className="resource-body">
              {r.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            {r.link && (
              <a className="btn ghost sm" href={r.link.url} target="_blank" rel="noopener noreferrer">
                {r.link.label} <span className="arrow">-&gt;</span>
              </a>
            )}
            <div className="small resource-credit">By {r.authors}</div>
          </article>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Create `app/toolkit/page.tsx`**

```tsx
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import ToolkitFilteredList from "@/components/ToolkitFilteredList";
import { content } from "@/content/site";

export const metadata = {
  title: "Toolkit - AI Incubator",
  description:
    "Prompts, setups, workflows, and verification checks the University of Kentucky AI Incubator actually uses.",
};

export default function ToolkitPage() {
  return (
    <>
      <Nav active="toolkit" />

      <header className="join-hero container">
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <h1 className="h-display" style={{ maxWidth: "20ch" }}>
            The practical <em>toolkit.</em>
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: "62ch" }}>
            What we actually use: prompts, project setups, workflows, and the
            checks we run on AI output. Written by members, for members.
          </p>
        </div>
      </header>

      <section className="section container">
        {content.resources.length === 0 ? (
          <p className="small">Nothing here yet. The first entries land after the next learning session.</p>
        ) : (
          <ToolkitFilteredList resources={content.resources} />
        )}
      </section>

      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Append toolkit styles to `app/globals.css`**

```css
/* ---- Toolkit (/toolkit) ----------------------------------------- */
.toolkit-filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.toolkit-filters .chip { cursor: pointer; background: none; }
.toolkit-filters .chip.is-active { border-color: var(--accent); color: var(--accent); }
.toolkit-list { display: grid; gap: 20px; max-width: 780px; }
.resource-card { padding: 22px; scroll-margin-top: 90px; }
.resource-body p { margin: 8px 0; font-size: 14px; line-height: 1.55; color: var(--ink-2); }
.resource-updated, .resource-credit { color: var(--ink-3); }
.resource-credit { margin-top: 10px; }
```

- [ ] **Step 4: Verify** — `npx tsc --noEmit`, `npm test`, dev check: `/toolkit` renders four cards, filters work, `/toolkit#verification-checks` scrolls to the card.

- [ ] **Step 5: Commit**

```bash
git add app/toolkit components/ToolkitFilteredList.tsx app/globals.css
git commit -m "feat: add toolkit page with kind filters"
```

---

### Task 14 · Stage D: the site as its own artifact (spec A6)

**Files:**
- Modify: `content/site.ts`, `components/ArtifactCard.tsx`

- [ ] **Step 1: Make `Artifact.project` optional**

In `content/site.ts`:

```ts
export interface Artifact {
  id: string;
  /** project id from projects[] — omit for group-level artifacts */
  project?: string;
  ...
```

In `components/ArtifactCard.tsx`, replace the `projectName` line and its usage:

```tsx
  const projectName = a.project
    ? content.projects.find((p) => p.id === a.project)?.name ?? a.project
    : "AI Incubator";
```

- [ ] **Step 2: Add the artifact entry** to `artifacts: []` in `content/site.ts`:

```ts
  artifacts: [
    {
      id: "aiincubator-site",
      name: "This website",
      url: "https://aiincubator.uky.edu/changelog",
      kind: "live-demo",
      note: "Built and maintained with agentic AI from weekly meeting transcripts. The changelog is the public build log.",
    },
  ],
```

- [ ] **Step 3: Verify** — `npx tsc --noEmit`, `npm test`, dev check: `/built` shows the card ("Try it" opens the changelog).

- [ ] **Step 4: Commit**

```bash
git add content/site.ts components/ArtifactCard.tsx
git commit -m "feat: list the site itself as the first public artifact"
```

---

### Task 15 · Stage E: sessions library

**Files:**
- Modify: `content/site.ts`
- Create: `app/sessions/page.tsx`

- [ ] **Step 1: Extend `MeetingSession`** in `content/site.ts` (after `projectId`):

```ts
  /** Public recording URL (YouTube). Presence moves the session into the recorded archive. */
  recordingUrl?: string;
  /** Link label, e.g. "Watch the session". */
  recordingLabel?: string;
```

(No backfill entries yet — Hunter's and Sully's talks need YouTube uploads and dates from Tama, and Alex's session needs its date. They land as content edits when available; the July 31 entry gets `recordingUrl` after the session.)

- [ ] **Step 2: Create `app/sessions/page.tsx`**

```tsx
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import UpcomingSessions from "@/components/UpcomingSessions";
import { content } from "@/content/site";
import { KIND_LABEL } from "@/lib/calendar";

export const metadata = {
  title: "Sessions - AI Incubator",
  description:
    "The Friday meeting rhythm, upcoming sessions, and recorded talks from the University of Kentucky AI Incubator.",
};

const RHYTHM = [
  { label: "Pitch nights", copy: "Somebody brings an idea. The group crunches on it together." },
  { label: "Learning sessions", copy: "A member or guest teaches something practical. Recorded when we can." },
  { label: "Roundtables", copy: "Where is every project? Who is stalled? How can we help each other?" },
  { label: "Open builds", copy: "Bring what you are working on. No agenda, no slides required." },
];

export default function SessionsPage() {
  const recorded = content.meetings
    .filter((m) => m.kind !== "cancelled" && m.recordingUrl)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <>
      <Nav />

      <header className="join-hero container">
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <h1 className="h-display" style={{ maxWidth: "20ch" }}>
            Fridays, <em>on the record.</em>
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: "62ch" }}>
            What the weekly sessions look like, what is coming up, and every
            recorded talk - permanently, with credit.
          </p>
        </div>
      </header>

      <section className="section container">
        <h2 className="h1" style={{ maxWidth: "22ch" }}>What Fridays look like.</h2>
        <div className="steps">
          {RHYTHM.map((r) => (
            <div className="step" key={r.label}>
              <h3 className="h3">{r.label}</h3>
              <p>{r.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <UpcomingSessions />

      <section className="section container">
        <h2 className="h1" style={{ maxWidth: "22ch" }}>Recorded sessions.</h2>
        {recorded.length === 0 ? (
          <p className="small">
            The first recording lands after the July 31 session on AI for
            knowledge work. Invited talks live here permanently, with credit.
          </p>
        ) : (
          <div className="proj-grid">
            {recorded.map((m) => (
              <article className="card" key={`${m.date}-${m.title}`} style={{ padding: 20 }}>
                <div className="top">
                  <span className={`chip mono kind-${m.kind}`}>{KIND_LABEL[m.kind]}</span>
                  <span className="small" style={{ color: "var(--ink-3)" }}>{m.date}</span>
                </div>
                <h3 style={{ marginTop: 8 }}>{m.title}</h3>
                {m.presenters && <div className="small" style={{ marginTop: 4 }}>{m.presenters}</div>}
                {m.blurb && <p className="kick-summary" style={{ marginTop: 8 }}>{m.blurb}</p>}
                <a className="btn primary sm" href={m.recordingUrl} target="_blank" rel="noopener noreferrer" style={{ marginTop: 12 }}>
                  {m.recordingLabel ?? "Watch the session"} <span className="arrow">-&gt;</span>
                </a>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Verify** — `npx tsc --noEmit`, `npm test`, dev check: `/sessions` shows rhythm strip, upcoming Fridays (July 24 rendered as cancelled), honest empty recorded state.

- [ ] **Step 4: Commit**

```bash
git add content/site.ts app/sessions
git commit -m "feat: add sessions library with meeting rhythm and recordings"
```

---

### Task 16 · Stage E: navigation doorways (spec A8)

**Files:**
- Modify: `components/Nav.tsx`, `components/MobileNav.tsx`, `components/Footer.tsx`, `app/page.tsx`

Before editing `Footer.tsx`: if the uncommitted "Lenario22" link is still in the working tree, confirm its fate with Tama first (spec open item 7).

- [ ] **Step 1: `components/Nav.tsx`** — add `"toolkit"` to the `NavKey` union, and add two links after Projects:

```tsx
          <Link href="/projects" className={cls("projects")}>Projects</Link>
          <Link href="/ideas" className={cls("ideas")}>Ideas</Link>
          <Link href="/toolkit" className={cls("toolkit")}>Toolkit</Link>
          <Link href="/#student-work">Student work</Link>
```

- [ ] **Step 2: `components/MobileNav.tsx`** — add matching links after Projects:

```tsx
        <Link href="/ideas" onClick={closeMenu}>
          Ideas
        </Link>
        <Link href="/toolkit" onClick={closeMenu}>
          Toolkit
        </Link>
```

- [ ] **Step 3: `components/Footer.tsx`** — Explore column becomes the full sitemap:

```tsx
            <ul>
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/ideas">Ideas</Link></li>
              <li><Link href="/toolkit">Toolkit</Link></li>
              <li><Link href="/sessions">Sessions</Link></li>
              <li><Link href="/#fridays">Fridays</Link></li>
              <li><Link href="/#student-work">Student work</Link></li>
              <li><Link href="/join">Join us</Link></li>
            </ul>
```

- [ ] **Step 4: `app/page.tsx`** — the Fridays chapter gets its doorway. Add to the `StoryChapter` with `id="fridays"`:

```tsx
          primaryLink={{ href: "/sessions", label: "See the schedule and recordings" }}
```

- [ ] **Step 5: Verify** — `npx tsc --noEmit`, `npm test`, dev check: desktop nav shows 6 items without wrapping at 1024px; mobile menu lists Ideas/Toolkit; homepage Fridays chapter shows the link alongside the commercial player; footer links all resolve.

- [ ] **Step 6: Commit**

```bash
git add components/Nav.tsx components/MobileNav.tsx components/Footer.tsx app/page.tsx
git commit -m "feat: add ideas, toolkit, and sessions doorways to nav, footer, and homepage"
```

---

### Task 17 · Final verification, docs, deploy notes

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Full suite** — `npm test` (all pass), `npx tsc --noEmit` (no output), `npm run build` (succeeds).

- [ ] **Step 2: Preview walkthrough** (`npm run dev`, DB configured)

1. `/ideas` — board renders published pitch; raise-hand submission appears in admin.
2. `/admin/pitches` — publish → appears on `/ideas` immediately (revalidatePath); status → `reviewing` on a published pitch unpublishes it.
3. `/toolkit` — filters, anchors.
4. `/sessions` — rhythm, upcoming (7/24 cancelled), empty recorded state.
5. `/built` — site artifact card.
6. `/open-problems` — blocker, decision, and open-call sections populated from Task 1.
7. Homepage — unchanged except the Fridays chapter link; mobile nav OK.

- [ ] **Step 3: README updates** — in "Project structure," add `ideas/`, `toolkit/`, `sessions/`, `built/` page lines and `content/site.ts` mention of `resources`/`meetings`; in "Editing content," note that `resources[]` (toolkit) and `meetings[].recordingUrl` (sessions) are content-editable like everything else.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: document toolkit, ideas board, and sessions surfaces"
```

- [ ] **Step 5: Deploy sequence** (per spec §7 — stages are independently deployable)

1. Stage A/B commits can push anytime.
2. Before pushing Stage C: `npm run db:deploy` against Neon (uses `DIRECT_URL`).
3. Push → Vercel deploys → run `docs/admin-smoke-test.md` plus walkthrough items 1–2 against production.

## Post-plan content items (Tama, not code)

- Review/edit the four toolkit seeds (Task 12) before that commit pushes.
- July 31: record → upload to YouTube → add `recordingUrl`/`recordingLabel` to the 2026-07-31 meeting entry.
- Supply dates + YouTube links for Alex's, Hunter's, and Sully's talks → add as `meetings[]` entries.
- Publish the first idea: submit the trauma-surge pitch via `/pitch` (or use an existing accepted pitch), write public copy in admin, publish.
- Copy `2026-05-26-pm-inbox-design.md` from the OneDrive repo copy into `docs/superpowers/specs/`.
