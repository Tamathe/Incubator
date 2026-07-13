# Phase 1a: Public Operating Surfaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add public read surfaces and schema enrichments to the AI Incubator site **without changing the static export pattern or adding backend infrastructure**. Six small features that make the work touchable for all three audiences (team, collaborators, stakeholders) at zero infra cost.

**Architecture:** Pure content + components. Static export (`output: 'export'`) preserved. New schema fields (`outcomes[]`, `partners[]`, `artifacts[]`) added to `content/site.ts` and rendered through new React components and three new pages. Existing `/pitch` flow handles intake. PM Inbox plan handles writeback. No new backend dependencies.

**Tech Stack:** Next.js 15 static export, TypeScript strict, React 19, Vitest for derive helpers.

**Working directory:** `C:\Users\tamat\OneDrive - University of Kentucky\Projects\Incubator\Website\AI INcubator`

**Spec:** [`../specs/2026-05-26-phase-1-operating-surface-design.md`](../specs/2026-05-26-phase-1-operating-surface-design.md) (read the "Scope reduction note" at the top — only Phase 1a parts apply)

**Coupling note for executor:** Components in this plan read `content` from `@/content/site` directly. When the PM Inbox plan (`docs/superpowers/plans/2026-05-26-pm-inbox.md`) ships, its Task 6 needs to also swap the new components in this plan to `mergedContent`. Out of scope here; flag in commit message.

---

## File map

**New files**
- `lib/derive.ts` — EXTENDED with `deriveActiveBlockers`, `deriveDecisionsForSession`, `deriveOpenCalls`
- `components/StuckList.tsx` — renders `Blocker[]`
- `components/DecisionList.tsx` — renders `Decision[]`
- `components/OpenCallList.tsx` — renders kickoff `open` lines as cards
- `components/OnTheTableSection.tsx` — homepage section `05 What's on the table`
- `components/PartnersStrip.tsx` — partners strip above footer
- `components/OutcomesTable.tsx` — `/outcomes` ledger with kind filter
- `components/ArtifactCard.tsx` — `/built` page card
- `app/open-problems/page.tsx` — `/open-problems`
- `app/outcomes/page.tsx` — `/outcomes`
- `app/built/page.tsx` — `/built`
- `tests/derive-phase1a.test.ts` — Vitest coverage for new derive helpers

**Modified files**
- `content/site.ts` — `Blocker.blockedBy` → `waitingOn` rename (schema + values); add `Outcome`, `Partner`, `Artifact` types; add `outcomes[]`, `partners[]`, `artifacts[]` to `SiteContent`; seed values
- `components/ProjectCard.tsx` — stuck-chip in top row; "Get involved →" in hover reveal
- `components/KickoffCard.tsx` — primary CTA `Get involved with <Name> →` → `/pitch?project=<id>`
- `components/Nav.tsx` — add `/open-problems`, `/outcomes`, `/built` links
- `components/Footer.tsx` — add explore links
- `app/page.tsx` — insert `<OnTheTableSection />` after `<LogList />` block and before `<PitchSection />`; insert `<PartnersStrip />` after `<CTABanner />`
- `app/globals.css` — minimal styles matching existing patterns
- `package.json` — add `vitest` dev dep + `test` script (if not already added by PM Inbox plan)
- `vitest.config.ts` — Vitest config (if not already added)

---

## Task 0: Pre-flight checkpoint

The repo has uncommitted in-flight work (pitch intake, PM Inbox plan, etc.). This plan modifies some of the same files. Commit or stash before starting.

- [ ] **Step 1: Confirm baseline**

Run: `git status --short`

Expected: see the modified + untracked files. **Read the list before proceeding.** If anything looks unexpected, stop and ask.

- [ ] **Step 2: Commit the in-flight work as its own checkpoint**

If the in-flight changes are coherent (pitch intake build + PM inbox plan + spec updates), commit them so Phase 1a starts from a clean baseline:

```bash
git add -A
git commit -m "wip: pitch intake build + pm inbox plan + spec updates

Snapshot before Phase 1a (public operating surfaces) work begins.
Includes:
- app/pitch/, components/PitchChat.tsx, components/PitchSection.tsx, worker/pitch-intake/
- docs/superpowers/plans/2026-05-26-pm-inbox.md
- docs/superpowers/specs/2026-05-26-pitch-intake-design.md
- docs/superpowers/specs/2026-05-26-phase-1-operating-surface-design.md (with Phase 1a scope reduction note)
- content/site.ts anonymization
- assorted reference/, css, join page tweaks"
```

If the executor isn't certain the in-flight changes form a coherent commit, **stop and ask the user** how to handle the snapshot. Do not start Phase 1a tasks on top of an unclear baseline.

- [ ] **Step 3: Verify clean state**

Run: `git status`
Expected: "nothing to commit, working tree clean".

---

## Task 1: Rename Blocker.blockedBy → waitingOn (schema)

**Files:**
- Modify: `content/site.ts:82-93`

- [ ] **Step 1: Rewrite the Blocker interface**

In `content/site.ts`, replace the `Blocker` interface (lines 82-93) with:

```typescript
export interface Blocker {
  id: string;
  /** project id */
  project: string;
  body: string;
  /**
   * What's needed to unstick — process, document, approval, or capability.
   * NEVER name an individual. Use roles, departments, processes, artifacts.
   * Examples: "DSA legal review", "IRB approval", "Baseline communication rubric"
   */
  waitingOn?: string;
  /** ISO date */
  created: string;
  /** ISO date when no longer blocking */
  resolved?: string;
}
```

- [ ] **Step 2: Update blocker values**

In the same file, find the `blockers:` array (around line 325) and rewrite each entry's `blockedBy` field to `waitingOn`, sharpening the value to describe **what's needed** rather than **who has it**:

Replace:
```typescript
blockers: [
  {
    id: "ahead-dsa-review",
    project: "ahead",
    body: "DSA stuck in KCR legal review",
    blockedBy: "KCR legal",
    created: "2026-05-16",
  },
  {
    id: "vc-rubric-template",
    project: "virtual-clinic",
    body: "Need a baseline communication rubric to anchor scenarios",
    blockedBy: "Sim center",
    created: "2026-05-19",
  },
],
```

with:
```typescript
blockers: [
  {
    id: "ahead-dsa-review",
    project: "ahead",
    body: "DSA stuck in KCR legal review",
    waitingOn: "DSA legal review",
    created: "2026-05-16",
  },
  {
    id: "vc-rubric-template",
    project: "virtual-clinic",
    body: "Need a baseline communication rubric to anchor scenarios",
    waitingOn: "Baseline communication rubric",
    created: "2026-05-19",
  },
],
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS. (If any other file consumes `blockedBy`, the type error will surface here. None should — `blockers[]` isn't read anywhere yet.)

- [ ] **Step 4: Commit**

```bash
git add content/site.ts
git commit -m "refactor(content): rename Blocker.blockedBy to waitingOn

Action-oriented framing: describe what's needed (process/document/approval),
never who is holding things up. Honesty contract preserved without naming
individuals. Updates two existing entries:
- 'KCR legal' → 'DSA legal review'
- 'Sim center' → 'Baseline communication rubric'"
```

---

## Task 2: Add Outcome / Partner / Artifact types to content/site.ts

**Files:**
- Modify: `content/site.ts` (append types after `Decision`, extend `SiteContent`)

- [ ] **Step 1: Append the new type definitions**

In `content/site.ts`, immediately after the `Decision` interface (around line 111), insert:

```typescript
export type OutcomeKind = "grant" | "paper" | "product" | "student" | "media" | "talk";

export interface Outcome {
  id: string;
  kind: OutcomeKind;
  /** Optional — links to a project in projects[] */
  project?: string;
  title: string;
  /** Free-text. Grants: "$475K". Students: "8 trained". Papers: leave blank. */
  value?: string;
  /** ISO date */
  date: string;
  /** Optional public link */
  link?: string;
  /** Optional one-sentence context */
  note?: string;
}

export interface Partner {
  id: string;
  /** Public name */
  name: string;
  /** "Funder", "Data partner", "Clinical partner", "Home institution" */
  role: string;
  /** Optional — for project-specific partnerships */
  project?: string;
  /** Public-facing one-sentence relationship summary */
  note?: string;
  /** Optional path under public/ for logo image */
  logo?: string;
}

export type ArtifactKind = "live-demo" | "prototype" | "repo" | "paper" | "deck";

export interface Artifact {
  id: string;
  /** project id from projects[] */
  project: string;
  name: string;
  /** Public URL — required */
  url: string;
  kind: ArtifactKind;
  /** Optional path under public/ for a thumbnail */
  thumb?: string;
  /** Short one-liner shown under the card title */
  note?: string;
}
```

- [ ] **Step 2: Extend SiteContent**

Find the `SiteContent` interface (around line 113). Add the three new arrays at the end:

```typescript
export interface SiteContent {
  /** ISO date */
  lastUpdated: string;
  cohort: string;
  session: Session;
  projects: Project[];
  log: LogEntry[];
  leads: Lead[];
  actions: ActionItem[];
  blockers: Blocker[];
  decisions: Decision[];
  outcomes: Outcome[];
  partners: Partner[];
  artifacts: Artifact[];
}
```

- [ ] **Step 3: Type-check (expected to fail)**

Run: `npx tsc --noEmit`
Expected: FAIL — `content` does not satisfy `SiteContent` because `outcomes`, `partners`, `artifacts` are missing. Good — confirms the type contract is enforced.

- [ ] **Step 4: Add seed data to the `content` literal**

In the same file, after the `decisions: [...]` block at the end of `content`, append the three new arrays. Use the seed values below:

```typescript
  outcomes: [
    {
      id: "ahead-chfs-grant-2026",
      kind: "grant",
      project: "ahead",
      title: "CHFS SUP grant · KY-AHEAD launch",
      value: "$475K",
      date: "2026-04-13",
      note: "Funded the data-linkage phase. Kentucky Cabinet for Health & Family Services.",
    },
    {
      id: "ncipp-phase2",
      kind: "product",
      project: "ncipp",
      title: "NCIPP Phase 2 — 15 screens across 4 roles",
      date: "2026-05-02",
      link: "https://ncipp-prototype.onrender.com",
      note: "Teacher · Coach · Admin · Family role views shipped.",
    },
    {
      id: "socratic-tutor-v14",
      kind: "product",
      project: "socratic-tutor",
      title: "Socratic Tutor v1.4 — reasoning-trace pass",
      value: "300+ sessions",
      date: "2026-05-10",
      note: "Pilot inside UKCOM Foundations curriculum.",
    },
  ],
  partners: [
    {
      id: "chfs",
      name: "KY Cabinet for Health & Family Services",
      role: "Funder",
      project: "ahead",
      note: "Funded KY-AHEAD Phase 1 via the SUP grant.",
    },
    {
      id: "kcr",
      name: "Kentucky Cancer Registry",
      role: "Data partner",
      project: "ahead",
      note: "Patient identification and data linkage.",
    },
    {
      id: "markey",
      name: "Markey Cancer Center",
      role: "Clinical partner",
      note: "Oncology projects — KY-AHEAD and Patient Ed.",
    },
    {
      id: "ukcom",
      name: "UK College of Medicine",
      role: "Home institution",
      note: "The working group lives here.",
    },
  ],
  artifacts: [
    {
      id: "ncipp-render",
      project: "ncipp",
      name: "NCIPP Phase 2 prototype",
      url: "https://ncipp-prototype.onrender.com",
      kind: "live-demo",
      note: "React + Babel-standalone · no build step. Four role-specific views.",
    },
  ],
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Update the schema comment block**

At the top of `content/site.ts`, in the JSDoc comment listing the schema, add the three new arrays after `decisions`:

```typescript
 *   outcomes[]  Grants, papers, products, students, media, talks. /outcomes.
 *   partners[]  Real institutional relationships. Sponsors strip on homepage.
 *   artifacts[] Working products with public URLs. /built.
```

- [ ] **Step 7: Commit**

```bash
git add content/site.ts
git commit -m "feat(content): add outcomes, partners, artifacts schema + seed data

Three new arrays support the new public surfaces:
- outcomes[]   → /outcomes ledger (grants, papers, products, students)
- partners[]   → sponsors strip above footer
- artifacts[]  → /built page (working products)

Seeded from known facts: CHFS grant, NCIPP Phase 2, Socratic Tutor v1.4."
```

---

## Task 3: Install Vitest (skip if already installed)

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Check if Vitest is already installed**

Run: `npx vitest --version 2>&1 | head -1`

If it prints a version number (e.g. `vitest/1.2.0`), Vitest is already set up — **skip to Task 4**.

If it errors (`couldn't find package`), continue with Step 2.

- [ ] **Step 2: Install Vitest**

Run: `npm install --save-dev vitest`
Expected: installs, updates `package.json` + `package-lock.json`.

- [ ] **Step 3: Create vitest.config.ts**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
```

- [ ] **Step 4: Add test script to package.json**

In `package.json` `scripts` block, add `"test": "vitest run"` as the last entry:

```json
"scripts": {
  "dev": "node scripts/build-changelog.mjs && next dev",
  "build": "node scripts/build-changelog.mjs && next build",
  "start": "next start",
  "preview": "npx serve@latest out",
  "changelog": "node scripts/build-changelog.mjs",
  "test": "vitest run"
}
```

If other scripts have been added by an earlier plan (e.g., `inbox`, `snapshot`), leave them in place and add `test` after the existing list.

- [ ] **Step 5: Smoke-test the config**

Run: `npx vitest run --reporter=verbose`
Expected: "No test files found" — config valid, no tests yet.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest for unit tests"
```

---

## Task 4: Add derive helpers for Phase 1a surfaces

**Files:**
- Modify: `lib/derive.ts` (append)

- [ ] **Step 1: Read current derive.ts**

Open `lib/derive.ts` to confirm existing exports (`deriveActivityLog`, `deriveAgenda`, `stalenessLabel`). Do not modify them. Append new helpers at the end of the file.

- [ ] **Step 2: Append three new helpers**

Append to `lib/derive.ts`:

```typescript
import type {
  Blocker,
  Decision,
  Project,
  SiteContent,
} from "@/content/site";

/**
 * Return all blockers that have NOT been resolved, newest-created first.
 * Used by /open-problems and the homepage "What's on the table" section.
 */
export function deriveActiveBlockers(content: SiteContent): Blocker[] {
  return content.blockers
    .filter((b) => !b.resolved)
    .slice()
    .sort((a, b) => (a.created < b.created ? 1 : a.created > b.created ? -1 : 0));
}

/**
 * Return decisions queued for a specific session date (ISO yyyy-mm-dd).
 * If sessionDateIso is omitted, returns all queued decisions, newest-created first.
 */
export function deriveDecisionsForSession(
  content: SiteContent,
  sessionDateIso?: string
): Decision[] {
  const queued = content.decisions.filter((d) => d.status === "queued");
  const filtered = sessionDateIso
    ? queued.filter((d) => d.forSession === sessionDateIso)
    : queued;
  return filtered
    .slice()
    .sort((a, b) => (a.created < b.created ? 1 : a.created > b.created ? -1 : 0));
}

/**
 * Return all projects in kickoff status that have an `open` collaborator-call line.
 * Used by /open-problems "Looking for collaborators" section.
 */
export function deriveOpenCalls(content: SiteContent): Project[] {
  return content.projects.filter((p) => p.status === "kickoff" && !!p.open);
}
```

If `Blocker`, `Decision`, `Project`, `SiteContent` are already imported at the top of `derive.ts`, deduplicate the import — don't add a second import line for the same module. Otherwise add the import at the top.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/derive.ts
git commit -m "feat(derive): add deriveActiveBlockers, deriveDecisionsForSession, deriveOpenCalls

Pure helpers for Phase 1a public surfaces. No mutation, no DB."
```

---

## Task 5: Vitest tests for new derive helpers

**Files:**
- Create: `tests/derive-phase1a.test.ts`

- [ ] **Step 1: Write the test file**

Create `tests/derive-phase1a.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  deriveActiveBlockers,
  deriveDecisionsForSession,
  deriveOpenCalls,
} from "@/lib/derive";
import type {
  SiteContent,
  Blocker,
  Decision,
  Project,
} from "@/content/site";

function makeContent(overrides: Partial<SiteContent> = {}): SiteContent {
  return {
    lastUpdated: "2026-05-26",
    cohort: "Test",
    session: { dayOfWeek: 5, hour: 12, minute: 0, venue: "T", teamsUrl: "", agenda: [] },
    projects: [],
    log: [],
    leads: [],
    actions: [],
    blockers: [],
    decisions: [],
    outcomes: [],
    partners: [],
    artifacts: [],
    ...overrides,
  };
}

describe("deriveActiveBlockers", () => {
  it("returns empty when no blockers", () => {
    expect(deriveActiveBlockers(makeContent())).toEqual([]);
  });

  it("filters out resolved blockers", () => {
    const blockers: Blocker[] = [
      { id: "b1", project: "p", body: "stuck", created: "2026-05-10" },
      { id: "b2", project: "p", body: "done",  created: "2026-05-11", resolved: "2026-05-15" },
    ];
    const result = deriveActiveBlockers(makeContent({ blockers }));
    expect(result.map((b) => b.id)).toEqual(["b1"]);
  });

  it("sorts by created date descending", () => {
    const blockers: Blocker[] = [
      { id: "b1", project: "p", body: "old",   created: "2026-05-10" },
      { id: "b2", project: "p", body: "newer", created: "2026-05-20" },
      { id: "b3", project: "p", body: "mid",   created: "2026-05-15" },
    ];
    const result = deriveActiveBlockers(makeContent({ blockers }));
    expect(result.map((b) => b.id)).toEqual(["b2", "b3", "b1"]);
  });
});

describe("deriveDecisionsForSession", () => {
  const d: (id: string, status: "queued" | "decided", forSession: string, created?: string) => Decision = (
    id, status, forSession, created = "2026-05-20"
  ) => ({ id, project: "p", question: "Q?", created, forSession, status });

  it("returns only queued decisions when no date filter", () => {
    const decisions = [d("a", "queued", "2026-05-29"), d("b", "decided", "2026-05-22")];
    const result = deriveDecisionsForSession(makeContent({ decisions }));
    expect(result.map((x) => x.id)).toEqual(["a"]);
  });

  it("filters by session date when provided", () => {
    const decisions = [
      d("a", "queued", "2026-05-29"),
      d("b", "queued", "2026-06-05"),
    ];
    const result = deriveDecisionsForSession(makeContent({ decisions }), "2026-05-29");
    expect(result.map((x) => x.id)).toEqual(["a"]);
  });

  it("sorts queued items by created date desc", () => {
    const decisions = [
      d("a", "queued", "2026-05-29", "2026-05-22"),
      d("b", "queued", "2026-05-29", "2026-05-24"),
    ];
    const result = deriveDecisionsForSession(makeContent({ decisions }));
    expect(result.map((x) => x.id)).toEqual(["b", "a"]);
  });
});

describe("deriveOpenCalls", () => {
  const p: (id: string, status: Project["status"], open?: string) => Project = (id, status, open) => ({
    id,
    name: id,
    status,
    stage: "",
    area: "",
    leads: "",
    summary: "",
    open,
    updated: "2026-05-20",
  });

  it("returns only kickoff projects with an open line", () => {
    const projects = [
      p("a", "active", "should be excluded"),
      p("b", "kickoff", "looking for help"),
      p("c", "kickoff"),
    ];
    const result = deriveOpenCalls(makeContent({ projects }));
    expect(result.map((x) => x.id)).toEqual(["b"]);
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npm test`
Expected: all PASS (3 describe blocks, 7 it blocks).

- [ ] **Step 3: Commit**

```bash
git add tests/derive-phase1a.test.ts
git commit -m "test(derive): cover phase 1a helpers"
```

---

## Task 6: StuckList component

**Files:**
- Create: `components/StuckList.tsx`

- [ ] **Step 1: Write the component**

Create `components/StuckList.tsx`:

```typescript
import type { Blocker } from "@/content/site";
import { fmtIsoDate } from "@/lib/session";
import { content } from "@/content/site";

interface StuckListProps {
  blockers: Blocker[];
  /** When true, show the project chip (used on /open-problems). When false, hide it (used in project-specific contexts). */
  showProject?: boolean;
  /** Empty-state copy. Required — empty states are part of the honesty contract. */
  emptyText: string;
}

export default function StuckList({ blockers, showProject = true, emptyText }: StuckListProps) {
  if (blockers.length === 0) {
    return <div className="stuck-empty small">{emptyText}</div>;
  }

  const projectName = (id: string) => content.projects.find((p) => p.id === id)?.name ?? id;

  return (
    <ul className="stuck-list">
      {blockers.map((b) => (
        <li className="stuck-row" key={b.id}>
          {showProject && (
            <span className="stuck-proj chip mono">{projectName(b.project)}</span>
          )}
          <span className="stuck-body">{b.body}</span>
          {b.waitingOn && (
            <span className="stuck-waiting chip mono">
              waiting on: {b.waitingOn}
            </span>
          )}
          <span className="stuck-since mono">
            since {fmtIsoDate(b.created)}
          </span>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/StuckList.tsx
git commit -m "feat: StuckList component"
```

---

## Task 7: DecisionList component

**Files:**
- Create: `components/DecisionList.tsx`

- [ ] **Step 1: Write the component**

Create `components/DecisionList.tsx`:

```typescript
import type { Decision } from "@/content/site";
import { fmtIsoDate } from "@/lib/session";
import { content } from "@/content/site";

interface DecisionListProps {
  decisions: Decision[];
  /** When true, show the session-date chip ("for FRI MAY 29"). On the homepage section we already know the session, so hide. */
  showSession?: boolean;
  emptyText: string;
}

export default function DecisionList({ decisions, showSession = true, emptyText }: DecisionListProps) {
  if (decisions.length === 0) {
    return <div className="dec-empty small">{emptyText}</div>;
  }

  const projectName = (id?: string) =>
    id ? content.projects.find((p) => p.id === id)?.name ?? id : "general";

  return (
    <ul className="dec-list">
      {decisions.map((d) => (
        <li className="dec-row" key={d.id}>
          <span className={`dec-proj chip mono ${d.project ? "" : "muted"}`}>
            {projectName(d.project)}
          </span>
          <span className="dec-q">{d.question}</span>
          {showSession && (
            <span className="dec-when mono">
              for {fmtIsoDate(d.forSession, { weekday: "short", month: "short", day: "numeric" })}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/DecisionList.tsx
git commit -m "feat: DecisionList component"
```

---

## Task 8: OpenCallList component

**Files:**
- Create: `components/OpenCallList.tsx`

- [ ] **Step 1: Write the component**

Create `components/OpenCallList.tsx`:

```typescript
import type { Project } from "@/content/site";

interface OpenCallListProps {
  projects: Project[];
  emptyText: string;
}

export default function OpenCallList({ projects, emptyText }: OpenCallListProps) {
  if (projects.length === 0) {
    return <div className="opencall-empty small">{emptyText}</div>;
  }
  return (
    <div className="opencall-grid">
      {projects.map((p) => (
        <article className="opencall-card card" key={p.id}>
          <div className="top">
            <span className="chip kick">Kickoff</span>
            <span className="area mono">{p.area}</span>
          </div>
          <div className="title" style={{ marginTop: 8 }}>{p.name}</div>
          {p.tagline && <div className="tagline">{p.tagline}</div>}
          <p className="kick-open" style={{ marginTop: 10 }}>{p.open}</p>
          <a
            className="btn primary"
            href={`/pitch?project=${encodeURIComponent(p.id)}`}
            style={{ marginTop: 14 }}
          >
            Get involved with {p.name} <span className="arrow">→</span>
          </a>
        </article>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/OpenCallList.tsx
git commit -m "feat: OpenCallList component"
```

---

## Task 9: /open-problems page

**Files:**
- Create: `app/open-problems/page.tsx`

- [ ] **Step 1: Write the page**

Create `app/open-problems/page.tsx`:

```typescript
import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import StuckList from "@/components/StuckList";
import DecisionList from "@/components/DecisionList";
import OpenCallList from "@/components/OpenCallList";
import {
  deriveActiveBlockers,
  deriveDecisionsForSession,
  deriveOpenCalls,
} from "@/lib/derive";

export const metadata = {
  title: "Open problems · AI Incubator",
  description:
    "Where this group is stuck, what we're about to decide, and where we need help. We keep this public on purpose.",
};

export default function OpenProblemsPage() {
  const stuck = deriveActiveBlockers(content);
  const queued = deriveDecisionsForSession(content);
  const openCalls = deriveOpenCalls(content);

  return (
    <>
      <Nav active="open-problems" />

      <header className="join-hero container">
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="hero-meta">
            <span className="chip live">
              <span>Open · public on purpose</span>
            </span>
          </div>
          <h1 className="h-display" style={{ maxWidth: "20ch" }}>
            Open <em>problems.</em>
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: "62ch" }}>
            Where this group is stuck, what we&apos;re about to decide, and where
            we need help. We keep this public on purpose. If you see something
            you can move, get involved.
          </p>
        </div>
      </header>

      <section className="section container">
        <div className="section-label">
          <span className="idx">01</span> <span>Stuck on</span>
        </div>
        <h2 className="h1" style={{ maxWidth: "20ch" }}>What&apos;s in the way.</h2>
        <StuckList
          blockers={stuck}
          emptyText="Nothing currently blocked. (That's either a good week or a bad memory.)"
        />
      </section>

      <section className="section container">
        <div className="section-label">
          <span className="idx">02</span> <span>Queued for decision</span>
        </div>
        <h2 className="h1" style={{ maxWidth: "22ch" }}>What we&apos;re about to choose.</h2>
        <DecisionList
          decisions={queued}
          emptyText="No decisions queued. Quiet week, or we deferred them all."
        />
      </section>

      <section className="section container">
        <div className="section-label">
          <span className="idx">03</span> <span>Looking for collaborators</span>
        </div>
        <h2 className="h1" style={{ maxWidth: "22ch" }}>Where we need help.</h2>
        <OpenCallList
          projects={openCalls}
          emptyText="No active kickoff calls — all current projects are staffed."
        />
      </section>

      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS. `out/open-problems/index.html` exists.

- [ ] **Step 3: Visual smoke test**

Run: `npm run dev`
Open `http://localhost:3000/open-problems`.

Verify:
- Page renders with three sections.
- "Stuck on" shows 2 entries (KY-AHEAD DSA, Virtual Clinic rubric) with `waiting on: DSA legal review` and `waiting on: Baseline communication rubric`.
- "Queued for decision" shows 2 entries (ahead-ems-scope, publish-cohort-retro) with the Friday May 29 chip.
- "Looking for collaborators" shows 3 cards (DROME, Virtual Clinic, Markey · Patient Ed). Each has a "Get involved with X →" button linking to `/pitch?project=<id>`.

Click one "Get involved" button → confirm it lands on `/pitch?project=drome` (or similar) without error.

Stop the dev server (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
git add app/open-problems/page.tsx
git commit -m "feat: /open-problems page

Three sections: stuck blockers, queued decisions, kickoff open-calls.
Honest empty states. Get-involved buttons route to /pitch with project context."
```

---

## Task 10: OutcomesTable component

**Files:**
- Create: `components/OutcomesTable.tsx`

- [ ] **Step 1: Write the component**

Create `components/OutcomesTable.tsx`:

```typescript
"use client";

import { useMemo, useState } from "react";
import type { Outcome, OutcomeKind } from "@/content/site";
import { content } from "@/content/site";
import { fmtIsoDate } from "@/lib/session";

interface OutcomesTableProps {
  outcomes: Outcome[];
}

const KINDS: { value: OutcomeKind | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "grant", label: "Grants" },
  { value: "paper", label: "Papers" },
  { value: "product", label: "Products" },
  { value: "student", label: "Students" },
  { value: "media", label: "Media" },
  { value: "talk", label: "Talks" },
];

export default function OutcomesTable({ outcomes }: OutcomesTableProps) {
  const [filter, setFilter] = useState<OutcomeKind | "all">("all");

  const sorted = useMemo(
    () =>
      outcomes
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [outcomes]
  );

  const visible = filter === "all" ? sorted : sorted.filter((o) => o.kind === filter);
  const projectName = (id?: string) =>
    id ? content.projects.find((p) => p.id === id)?.name ?? id : null;

  return (
    <div className="outcomes">
      <div className="outcomes-filters" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {KINDS.map((k) => (
          <button
            key={k.value}
            type="button"
            className={`filter-chip ${filter === k.value ? "active" : ""}`}
            onClick={() => setFilter(k.value)}
          >
            {k.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="small">Nothing logged in this category yet.</div>
      ) : (
        <ul className="outcomes-list">
          {visible.map((o) => (
            <li className="outcome-row" key={o.id}>
              <span className="outcome-date mono">{fmtIsoDate(o.date)}</span>
              <span className={`outcome-kind chip mono kind-${o.kind}`}>{o.kind}</span>
              <span className="outcome-title">
                {o.link ? (
                  <a href={o.link} target="_blank" rel="noopener noreferrer">
                    {o.title}
                  </a>
                ) : (
                  o.title
                )}
                {o.note && <span className="outcome-note small"> — {o.note}</span>}
              </span>
              {projectName(o.project) && (
                <span className="outcome-proj chip mono">{projectName(o.project)}</span>
              )}
              {o.value && <span className="outcome-value mono">{o.value}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/OutcomesTable.tsx
git commit -m "feat: OutcomesTable component with kind filter"
```

---

## Task 11: /outcomes page

**Files:**
- Create: `app/outcomes/page.tsx`

- [ ] **Step 1: Write the page**

Create `app/outcomes/page.tsx`:

```typescript
import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import OutcomesTable from "@/components/OutcomesTable";

export const metadata = {
  title: "Outcomes · AI Incubator",
  description:
    "What the AI Incubator has produced: grants, papers, products, students trained, talks given. Numbers and dates.",
};

function countByKind(outcomes: typeof content.outcomes, kind: typeof content.outcomes[number]["kind"]) {
  return outcomes.filter((o) => o.kind === kind).length;
}

function sumGrantValues(outcomes: typeof content.outcomes) {
  // value strings like "$475K", "$1.2M" — naive sum for headline display.
  // If the parser can't read a value, skip it. Headline is for vibe, not audit.
  let cents = 0;
  for (const o of outcomes.filter((x) => x.kind === "grant")) {
    if (!o.value) continue;
    const m = o.value.match(/\$([\d.]+)\s*([KM]?)/i);
    if (!m) continue;
    const n = parseFloat(m[1]);
    const mult = m[2]?.toUpperCase() === "M" ? 1_000_000 : m[2]?.toUpperCase() === "K" ? 1_000 : 1;
    cents += n * mult;
  }
  if (cents >= 1_000_000) return `$${(cents / 1_000_000).toFixed(1)}M`;
  if (cents >= 1_000) return `$${Math.round(cents / 1_000)}K`;
  if (cents > 0) return `$${cents}`;
  return null;
}

export default function OutcomesPage() {
  const o = content.outcomes;
  const grantsTotal = sumGrantValues(o);

  return (
    <>
      <Nav active="outcomes" />

      <header className="join-hero container">
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="hero-meta">
            <span className="chip live">
              <span>{o.length} outcomes logged</span>
            </span>
          </div>
          <h1 className="h-display" style={{ maxWidth: "22ch" }}>
            What we&apos;ve <em>made.</em>
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: "60ch" }}>
            Grants, papers, products, students trained, talks. Numbers and dates.
            We don&apos;t dress this up.
          </p>
        </div>
      </header>

      <section className="section container">
        <div className="outcomes-counters mono" style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 28 }}>
          {grantsTotal && <span><strong>{grantsTotal}</strong> · grants funded</span>}
          <span><strong>{countByKind(o, "grant")}</strong> · grants</span>
          <span><strong>{countByKind(o, "paper")}</strong> · papers</span>
          <span><strong>{countByKind(o, "product")}</strong> · products</span>
          <span><strong>{countByKind(o, "student")}</strong> · students</span>
          <span><strong>{countByKind(o, "media")}</strong> · media</span>
          <span><strong>{countByKind(o, "talk")}</strong> · talks</span>
        </div>
        <OutcomesTable outcomes={o} />
      </section>

      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS. `out/outcomes/index.html` exists.

- [ ] **Step 3: Visual smoke test**

Run: `npm run dev`
Open `http://localhost:3000/outcomes`.

Verify:
- Counters strip shows non-zero values for grants, products.
- `$475K · grants funded` total appears.
- Filter chips work: clicking "Grants" shows only the CHFS row; "Products" shows NCIPP + Socratic.
- NCIPP outcome has a clickable link to ncipp-prototype.onrender.com.
- Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add app/outcomes/page.tsx
git commit -m "feat: /outcomes ledger page

Counters + filterable list. Numbers and dates, no brochure copy."
```

---

## Task 12: ArtifactCard component

**Files:**
- Create: `components/ArtifactCard.tsx`

- [ ] **Step 1: Write the component**

Create `components/ArtifactCard.tsx`:

```typescript
import type { Artifact } from "@/content/site";
import { content } from "@/content/site";

interface ArtifactCardProps {
  artifact: Artifact;
}

export default function ArtifactCard({ artifact: a }: ArtifactCardProps) {
  const projectName = content.projects.find((p) => p.id === a.project)?.name ?? a.project;

  return (
    <article className="artifact-card card">
      {a.thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.thumb} alt={`${a.name} thumbnail`} className="artifact-thumb" />
      )}
      <div className="top">
        <span className={`chip mono kind-${a.kind}`}>{a.kind.replace("-", " ")}</span>
        <span className="area mono">{projectName}</span>
      </div>
      <div className="title" style={{ marginTop: 8 }}>{a.name}</div>
      {a.note && <p className="kick-summary" style={{ marginTop: 8 }}>{a.note}</p>}
      <a
        className="btn primary"
        href={a.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ marginTop: 14 }}
      >
        Try it <span className="arrow">→</span>
      </a>
    </article>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/ArtifactCard.tsx
git commit -m "feat: ArtifactCard component"
```

---

## Task 13: /built page

**Files:**
- Create: `app/built/page.tsx`

- [ ] **Step 1: Write the page**

Create `app/built/page.tsx`:

```typescript
import { content } from "@/content/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import ArtifactCard from "@/components/ArtifactCard";

export const metadata = {
  title: "Built · AI Incubator",
  description:
    "Working products and prototypes shipped by the AI Incubator. Real artifacts you can poke at.",
};

export default function BuiltPage() {
  const artifacts = content.artifacts;

  return (
    <>
      <Nav active="built" />

      <header className="join-hero container">
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="hero-meta">
            <span className="chip live">
              <span>{artifacts.length} live artifact{artifacts.length === 1 ? "" : "s"}</span>
            </span>
          </div>
          <h1 className="h-display" style={{ maxWidth: "22ch" }}>
            Built <em>and shipped.</em>
          </h1>
          <p className="lead" style={{ marginTop: 28, maxWidth: "62ch" }}>
            Working products and prototypes. Real artifacts you can poke at — not
            screenshots, not slides. Working products earn a slot here.
          </p>
        </div>
      </header>

      <section className="section container">
        {artifacts.length === 0 ? (
          <p className="small">Nothing shipped yet — but the group is building. Check the projects page.</p>
        ) : (
          <div className="proj-grid">
            {artifacts.map((a) => (
              <ArtifactCard key={a.id} artifact={a} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS. `out/built/index.html` exists.

- [ ] **Step 3: Visual smoke test**

Run: `npm run dev`
Open `http://localhost:3000/built`.

Verify:
- One artifact card (NCIPP) with "Try it →" button.
- Click button → opens `https://ncipp-prototype.onrender.com` in new tab.
- Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add app/built/page.tsx
git commit -m "feat: /built page

Wall of working artifacts. NCIPP seeded; more land as projects ship."
```

---

## Task 14: PartnersStrip component

**Files:**
- Create: `components/PartnersStrip.tsx`

- [ ] **Step 1: Write the component**

Create `components/PartnersStrip.tsx`:

```typescript
import { content } from "@/content/site";

export default function PartnersStrip() {
  const partners = content.partners;
  if (partners.length === 0) return null;

  return (
    <section className="partners-strip container" aria-label="Partners">
      <div className="section-label">
        <span className="idx">·</span> <span>With</span>
      </div>
      <div className="partners-row">
        {partners.map((p) => (
          <div className="partner-item" key={p.id}>
            <div className="partner-name">{p.name}</div>
            <div className="partner-role mono">{p.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/PartnersStrip.tsx
git commit -m "feat: PartnersStrip component"
```

---

## Task 15: OnTheTableSection component

**Files:**
- Create: `components/OnTheTableSection.tsx`

- [ ] **Step 1: Write the component**

Create `components/OnTheTableSection.tsx`:

```typescript
import { content } from "@/content/site";
import { fmtIsoDate, nextSession } from "@/lib/session";
import {
  deriveActiveBlockers,
  deriveDecisionsForSession,
} from "@/lib/derive";
import StuckList from "./StuckList";
import DecisionList from "./DecisionList";

export default function OnTheTableSection() {
  const stuck = deriveActiveBlockers(content);
  const next = nextSession();
  const nextIso = next.toISOString().slice(0, 10);
  const queued = deriveDecisionsForSession(content, nextIso);
  const fridayLabel = fmtIsoDate(nextIso, { weekday: "short", month: "short", day: "numeric" });

  return (
    <section className="section container" id="on-the-table">
      <div className="section-label">
        <span className="idx">05</span> <span>What&apos;s on the table</span>
      </div>
      <div className="section-head">
        <h2 className="h1" style={{ maxWidth: "20ch" }}>
          What we&apos;re stuck on, what&apos;s queued for {fridayLabel}.
        </h2>
        <a href="/open-problems" className="btn ghost">
          See all open problems <span className="arrow">→</span>
        </a>
      </div>

      <div className="on-the-table-grid">
        <div>
          <div className="rn-eyebrow" style={{ marginBottom: 12 }}>Stuck on</div>
          <StuckList
            blockers={stuck}
            emptyText="Nothing currently blocked. (That's either a good week or a bad memory.)"
          />
        </div>
        <div>
          <div className="rn-eyebrow" style={{ marginBottom: 12 }}>On the table this Friday</div>
          <DecisionList
            decisions={queued}
            showSession={false}
            emptyText="No decisions queued for Friday. Quiet week, or we deferred them all."
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/OnTheTableSection.tsx
git commit -m "feat: OnTheTableSection (homepage section 05)"
```

---

## Task 16: Wire OnTheTableSection + PartnersStrip into homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Read current app/page.tsx**

Open `app/page.tsx`. Confirm it currently imports `PitchSection`, renders `<LogList />` inside the `04 Activity log` section, and renders `<PitchSection />` between the activity log section close and `<CTABanner />`.

- [ ] **Step 2: Add imports**

Add two import lines to the top of `app/page.tsx`, alongside existing imports:

```typescript
import OnTheTableSection from "@/components/OnTheTableSection";
import PartnersStrip from "@/components/PartnersStrip";
```

- [ ] **Step 3: Insert OnTheTableSection between activity log and pitch section**

Find the JSX block that ends the activity log section (the `</section>` closing tag right before `<PitchSection />`). Insert `<OnTheTableSection />` immediately after the `</section>` close and before `<PitchSection />`:

```jsx
      </section>

      {/* ───── What's on the table ───── */}
      <OnTheTableSection />

      {/* ───── Pitch a project ───── */}
      <PitchSection />
```

(The pitch section will visually become "06" in the eye — `PitchSection` should be updated to use `06` if it currently shows `05`; defer to Task 17 if `PitchSection` hard-codes a number.)

- [ ] **Step 4: Insert PartnersStrip after CTABanner**

Find `<CTABanner />`. Insert `<PartnersStrip />` immediately after it, before `<Footer />`:

```jsx
      {/* ───── CTA banner ───── */}
      <CTABanner />

      {/* ───── Partners ───── */}
      <PartnersStrip />

      <Footer />
```

- [ ] **Step 5: Type-check + build**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS. Site builds with new sections.

- [ ] **Step 6: Visual smoke test**

Run: `npm run dev`
Open `http://localhost:3000/`.

Verify:
- Section `05 What's on the table` appears between Activity log and Pitch section.
- Two columns: "Stuck on" (2 entries) and "On the table this Friday" (2 entries for May 29 — `ahead-ems-scope` and `publish-cohort-retro`).
- "See all open problems →" link goes to `/open-problems`.
- Partners strip appears at the very bottom above the footer with the four seeded partners.
- Pitch section still works. Stop dev server.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire OnTheTableSection + PartnersStrip into homepage

Section 05 'What's on the table' sits between activity log and pitch.
PartnersStrip below CTA banner, above footer."
```

---

## Task 17: PitchSection renumber (if needed)

**Files:**
- Modify: `components/PitchSection.tsx` (if it hard-codes `05`)

- [ ] **Step 1: Inspect PitchSection's section number**

Run: `grep -n 'idx' components/PitchSection.tsx`
Expected: shows either a hard-coded "05" / "06" etc., or no idx at all.

- [ ] **Step 2: If PitchSection uses "05", update to "06"**

Edit the file: change `<span className="idx">05</span>` to `<span className="idx">06</span>`.

If it uses any other number or no idx, leave it alone — Task 16 only inserts OnTheTable as `05`; the renumbering is only needed if there's a direct conflict.

- [ ] **Step 3: Type-check + visual smoke**

Run: `npx tsc --noEmit && npm run dev`
Open homepage. Confirm numbering reads coherently (01 → 02 → 03 → 04 → 05 → 06 → CTA → partners).

- [ ] **Step 4: Commit (skip if no edit was needed)**

```bash
git add components/PitchSection.tsx
git commit -m "chore: renumber pitch section to 06 (OnTheTable is now 05)"
```

---

## Task 18: ProjectCard — stuck chip + Get involved link

**Files:**
- Modify: `components/ProjectCard.tsx`

- [ ] **Step 1: Read current ProjectCard**

Confirm structure: import block, `StatusChip`, `ProjectCard` default export with top row, data block, title row, reveal panel. The reveal panel currently shows actions when present.

- [ ] **Step 2: Compute stuckCount near openActions**

In the `ProjectCard` function, after the line:
```typescript
const openActions = content.actions.filter(
  (a) => a.project === p.id && a.status === "open"
);
```
add:
```typescript
const stuckCount = content.blockers.filter(
  (b) => b.project === p.id && !b.resolved
).length;
```

- [ ] **Step 3: Add stuck chip to the top row**

In the same component, find the `<div className="top">` block. After the `<span className="area mono">` block, append:

```jsx
{stuckCount > 0 && (
  <a
    className="stuck-chip chip mono"
    href={`/open-problems#${p.id}`}
    title="Open blockers for this project"
  >
    ⚠ {stuckCount} stuck
  </a>
)}
```

- [ ] **Step 4: Add "Get involved" link in the reveal panel**

In the reveal panel JSX, after the `{openActions.length > 0 && ...}` block, add (still inside the first reveal column):

```jsx
<a
  className="reveal-cta"
  href={`/pitch?project=${encodeURIComponent(p.id)}`}
  style={{ display: "inline-block", marginTop: 14, color: "var(--bg)" }}
>
  Get involved with {p.name} <span className="arrow">→</span>
</a>
```

- [ ] **Step 5: Type-check + visual smoke**

Run: `npx tsc --noEmit && npm run dev`
Open `/`. Hover the KY-AHEAD card — confirm:
- A `⚠ 1 stuck` chip appears in the top row.
- Hover reveal shows existing open actions + a new "Get involved with KY-AHEAD →" link.

Click the stuck chip — should anchor jump to `/open-problems#ahead`.

Stop dev server.

- [ ] **Step 6: Commit**

```bash
git add components/ProjectCard.tsx
git commit -m "feat(ProjectCard): stuck chip + Get involved link"
```

---

## Task 19: KickoffCard — primary CTA → /pitch

**Files:**
- Modify: `components/KickoffCard.tsx`

- [ ] **Step 1: Replace the kick-cta block**

Find the existing `kick-cta` block in `components/KickoffCard.tsx`:

```jsx
<div className="kick-cta">
  <div className="kick-open">{p.open ?? "Looking for collaborators."}</div>
  <a className="kick-link" href="/#rightnow">
    Discuss at the next meeting <span className="arrow">→</span>
  </a>
</div>
```

Replace with:

```jsx
<div className="kick-cta">
  <div className="kick-open">{p.open ?? "Looking for collaborators."}</div>
  <a
    className="btn primary"
    href={`/pitch?project=${encodeURIComponent(p.id)}`}
    style={{ marginTop: 8 }}
  >
    Get involved with {p.name} <span className="arrow">→</span>
  </a>
  <a className="kick-link" href="/#rightnow" style={{ marginTop: 4 }}>
    Or discuss at the next meeting <span className="arrow">→</span>
  </a>
</div>
```

- [ ] **Step 2: Type-check + visual smoke**

Run: `npx tsc --noEmit && npm run dev`
Open `/`. Scroll to "Recently started · looking for collaborators".

Verify:
- Each kickoff card now has two stacked CTAs. Primary: "Get involved with DROME → / Virtual Clinic → / Markey · Patient Ed →"
- Click primary → goes to `/pitch?project=drome` (etc.).

Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add components/KickoffCard.tsx
git commit -m "feat(KickoffCard): primary 'Get involved' CTA routes to /pitch"
```

---

## Task 20: Nav additions

**Files:**
- Modify: `components/Nav.tsx`

- [ ] **Step 1: Read current Nav**

Open `components/Nav.tsx`. Identify the existing nav-item list and the `active` prop type. Note the `active` keys currently in use (likely `"overview" | "projects" | "join"`).

- [ ] **Step 2: Extend the active prop type**

Update the `active` prop type to include the three new pages:

```typescript
type NavActive = "overview" | "projects" | "open-problems" | "outcomes" | "built" | "join";
```

(Or whatever the existing type alias is — extend it; don't replace it.)

- [ ] **Step 3: Add three new nav items**

Find the JSX list of nav links. After the `Projects` link, before `Join`, insert:

```jsx
<Link href="/open-problems" className={`nav-item ${active === "open-problems" ? "active" : ""}`}>
  Open problems
</Link>
<Link href="/outcomes" className={`nav-item ${active === "outcomes" ? "active" : ""}`}>
  Outcomes
</Link>
<Link href="/built" className={`nav-item ${active === "built" ? "active" : ""}`}>
  Built
</Link>
```

Adjust the class-name pattern to match whatever Nav currently uses — if it uses a different active-marker, match that.

- [ ] **Step 4: Type-check + visual smoke**

Run: `npx tsc --noEmit && npm run dev`
Navigate `/`, `/projects`, `/open-problems`, `/outcomes`, `/built`, `/join` — confirm:
- All three new links appear in the nav.
- The correct one is marked `active` on each page (visual cue per existing pattern).

Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add components/Nav.tsx
git commit -m "feat(Nav): add Open problems, Outcomes, Built links"
```

---

## Task 21: Footer additions

**Files:**
- Modify: `components/Footer.tsx`

- [ ] **Step 1: Add new links to the Explore column**

In `components/Footer.tsx`, find the Explore `<ul>`:

```jsx
<ul>
  <li><Link href="/projects">Projects</Link></li>
  <li><Link href="/#team">Team</Link></li>
  <li><Link href="/#log">Activity log</Link></li>
  <li><Link href="/changelog">Changelog</Link></li>
  <li><Link href="/join">Get involved</Link></li>
</ul>
```

Replace with:

```jsx
<ul>
  <li><Link href="/projects">Projects</Link></li>
  <li><Link href="/open-problems">Open problems</Link></li>
  <li><Link href="/outcomes">Outcomes</Link></li>
  <li><Link href="/built">Built</Link></li>
  <li><Link href="/#team">Team</Link></li>
  <li><Link href="/#log">Activity log</Link></li>
  <li><Link href="/changelog">Changelog</Link></li>
  <li><Link href="/join">Get involved</Link></li>
</ul>
```

- [ ] **Step 2: Type-check + visual smoke**

Run: `npx tsc --noEmit && npm run dev`
Confirm footer Explore column has the three new entries with working links.
Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add components/Footer.tsx
git commit -m "feat(Footer): add Open problems, Outcomes, Built links"
```

---

## Task 22: Styles for new components

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Append styles**

Append the following block to the end of `app/globals.css`. These styles are intentionally minimal — they piggyback on existing tokens (`--bg`, `--card`, `--ink`, `--ink-3`, `--signal`, `--alert`, etc.) so the new components inherit the site's look.

```css
/* ────────── Phase 1a public surfaces ────────── */

/* StuckList */
.stuck-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.stuck-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: baseline; padding: 12px 14px; border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 10px; background: var(--card, rgba(255,255,255,0.03)); }
.stuck-proj { background: var(--chip-area-bg, rgba(255,255,255,0.06)); padding: 2px 8px; border-radius: 999px; font-size: 11px; }
.stuck-body { flex: 1 1 auto; min-width: 200px; }
.stuck-waiting { padding: 2px 8px; border-radius: 999px; font-size: 11px; background: rgba(255, 200, 90, 0.12); color: rgba(255, 200, 90, 0.95); }
.stuck-since { font-size: 11px; color: var(--ink-3, rgba(255,255,255,0.5)); }
.stuck-empty, .dec-empty, .opencall-empty { padding: 14px 0; color: var(--ink-3, rgba(255,255,255,0.55)); font-style: italic; }

/* DecisionList */
.dec-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.dec-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: baseline; padding: 12px 14px; border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 10px; background: var(--card, rgba(255,255,255,0.03)); }
.dec-proj { padding: 2px 8px; border-radius: 999px; font-size: 11px; background: var(--chip-area-bg, rgba(255,255,255,0.06)); }
.dec-proj.muted { color: var(--ink-3, rgba(255,255,255,0.55)); }
.dec-q { flex: 1 1 auto; min-width: 200px; }
.dec-when { font-size: 11px; color: var(--ink-3, rgba(255,255,255,0.6)); }

/* OnTheTableSection grid */
.on-the-table-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
@media (max-width: 900px) { .on-the-table-grid { grid-template-columns: 1fr; } }

/* OpenCallList */
.opencall-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }
.opencall-card { padding: 20px; }
.opencall-card .kick-open { color: var(--ink-2, rgba(255,255,255,0.85)); }

/* ProjectCard stuck chip */
.stuck-chip { background: rgba(255, 100, 100, 0.12); color: rgba(255, 140, 140, 0.95); padding: 2px 8px; border-radius: 999px; font-size: 11px; text-decoration: none; }
.stuck-chip:hover { background: rgba(255, 100, 100, 0.22); }

/* Reveal CTA inside ProjectCard hover panel */
.reveal-cta { display: inline-block; text-decoration: underline; font-size: 13px; }

/* OutcomesTable */
.outcomes-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.outcome-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: baseline; padding: 10px 14px; border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 8px; background: var(--card, rgba(255,255,255,0.03)); }
.outcome-date { font-size: 12px; color: var(--ink-3, rgba(255,255,255,0.6)); min-width: 70px; }
.outcome-kind { padding: 2px 8px; border-radius: 999px; font-size: 11px; }
.outcome-title { flex: 1 1 auto; min-width: 220px; }
.outcome-note { color: var(--ink-3, rgba(255,255,255,0.65)); }
.outcome-proj { padding: 2px 8px; border-radius: 999px; font-size: 11px; }
.outcome-value { font-size: 12px; color: var(--signal, #6cd97e); }
.kind-grant { background: rgba(100, 200, 100, 0.12); color: rgba(140, 220, 140, 0.95); }
.kind-paper { background: rgba(100, 160, 255, 0.12); color: rgba(150, 190, 255, 0.95); }
.kind-product { background: rgba(255, 180, 60, 0.12); color: rgba(255, 200, 120, 0.95); }
.kind-student { background: rgba(200, 120, 220, 0.12); color: rgba(220, 160, 240, 0.95); }
.kind-media { background: rgba(255, 100, 160, 0.12); color: rgba(255, 150, 190, 0.95); }
.kind-talk { background: rgba(100, 220, 200, 0.12); color: rgba(140, 230, 220, 0.95); }
.kind-live-demo { background: rgba(255, 180, 60, 0.12); color: rgba(255, 200, 120, 0.95); }
.kind-prototype { background: rgba(100, 200, 255, 0.12); color: rgba(140, 220, 255, 0.95); }
.kind-repo { background: rgba(200, 200, 200, 0.12); color: rgba(220, 220, 220, 0.95); }
.kind-deck { background: rgba(255, 200, 100, 0.12); color: rgba(255, 220, 140, 0.95); }

.filter-chip { background: transparent; color: inherit; border: 1px solid var(--border, rgba(255,255,255,0.15)); padding: 4px 12px; border-radius: 999px; font-size: 12px; cursor: pointer; }
.filter-chip.active { background: var(--ink, white); color: var(--bg, black); }

/* ArtifactCard */
.artifact-card { padding: 20px; display: flex; flex-direction: column; }
.artifact-thumb { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 8px; margin-bottom: 12px; }

/* PartnersStrip */
.partners-strip { padding: 32px 0; border-top: 1px solid var(--border, rgba(255,255,255,0.08)); }
.partners-row { display: flex; gap: 32px; flex-wrap: wrap; margin-top: 12px; }
.partner-item { display: flex; flex-direction: column; gap: 2px; }
.partner-name { font-size: 14px; font-weight: 500; }
.partner-role { font-size: 11px; color: var(--ink-3, rgba(255,255,255,0.55)); text-transform: uppercase; letter-spacing: 0.04em; }
```

If `app/globals.css` already defines a `--card`, `--ink-3`, or `--border` variable, the `var(..., fallback)` lets the new rules degrade safely if not. If existing variable names differ (e.g., the site uses `--surface` not `--card`), keep the fallbacks — the spec doesn't require pixel-perfect matching, just coherent rendering.

- [ ] **Step 2: Visual smoke test on all surfaces**

Run: `npm run dev`. Walk through each surface:

1. `/` — partners strip readable, "What's on the table" two-column grid readable.
2. `/open-problems` — three sections render. Empty state copy visible if you mutate `content/site.ts` to test (optional).
3. `/outcomes` — filter chips visible; clicking changes the list. Counters readable.
4. `/built` — single NCIPP card visible with "Try it →" button.
5. Hover a project card — stuck chip visible if blockers exist; reveal panel shows Get involved link.

If anything reads as broken (overflow, unreadable text, missing borders), tweak `app/globals.css` until it doesn't. Don't chase visual perfection — coherent is enough.

Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: phase 1a component styling

Minimal styles for StuckList, DecisionList, OpenCallList, OutcomesTable,
ArtifactCard, PartnersStrip, ProjectCard stuck chip. Uses existing tokens
with fallbacks."
```

---

## Task 23: README + final verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the project structure section in README**

Find the "## Project structure" block in `README.md`. Add the new files to the tree under their respective directories:

```
├── app/
│   ├── built/page.tsx        # /built (working artifacts)
│   ├── open-problems/page.tsx # /open-problems
│   ├── outcomes/page.tsx     # /outcomes (ledger)
│   ...
├── components/
│   ├── ArtifactCard.tsx
│   ├── DecisionList.tsx
│   ├── OnTheTableSection.tsx
│   ├── OpenCallList.tsx
│   ├── OutcomesTable.tsx
│   ├── PartnersStrip.tsx
│   ├── StuckList.tsx
│   ...
```

- [ ] **Step 2: Add a "Phase 1a surfaces" note**

Below the project structure section, add a small subsection:

```markdown
### Public operating surfaces (Phase 1a)

Six features add public read surfaces over the existing content schema:

| Surface | What |
|---|---|
| Homepage `05` | "What's on the table" — active blockers + decisions queued for Friday |
| `/open-problems` | Stuck, queued for decision, kickoff open-calls |
| `/outcomes` | Filterable ledger of grants, papers, products, students, media, talks |
| `/built` | Working artifacts with "Try it →" links |
| Sponsors strip | Partners row above the footer |
| KickoffCard CTA | Primary "Get involved with X →" routes to `/pitch?project=<id>` |

All powered by `content/site.ts` — no backend, no DB. Edits still happen via PR to that file (or via PM Inbox writeback when that ships).
```

- [ ] **Step 3: Final full-stack verification**

Run, in order:

```bash
npm test
npx tsc --noEmit
npm run build
```

Expected: all PASS. `out/` contains `open-problems/`, `outcomes/`, `built/` directories with `index.html` files.

- [ ] **Step 4: Final visual smoke (preview the built output)**

Run: `npm run preview`
Open `http://localhost:3000/` (or whichever port `serve` picks).

Walk through:
- Homepage — section 05 visible, partners visible.
- `/open-problems` — all three sections.
- `/outcomes` — filter works.
- `/built` — NCIPP card opens external link.
- `/projects` — stuck chips visible on KY-AHEAD and Virtual Clinic.

If anything looks off, fix and re-build before committing.

Stop the preview server.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: Phase 1a surfaces in README"
```

---

## Task 24: Final cleanup commit

- [ ] **Step 1: Review the entire branch**

Run: `git log --oneline -25`
Expected: ~22 commits since pre-flight, each scoped to one task.

- [ ] **Step 2: Confirm working tree clean**

Run: `git status`
Expected: "nothing to commit, working tree clean".

- [ ] **Step 3: Phase 1a is complete**

Phase 1a ships these six features as a coherent slice over the existing static site. No infra changes. PM Inbox plan and `/pitch` flow remain unchanged.

When PM Inbox plan executes, remind the executor to add the new Phase 1a components to its Task 6 component-swap list:
- `StuckList.tsx`, `DecisionList.tsx`, `OnTheTableSection.tsx` — need to read `mergedContent` (they currently read `content` directly) so curator-approved inbox items surface immediately on the homepage.
- `OpenCallList.tsx`, `OutcomesTable.tsx`, `ArtifactCard.tsx`, `PartnersStrip.tsx` — read fields (`outcomes`, `partners`, `artifacts`, `projects.open`) that the current PM Inbox plan does NOT write to. Either extend the inbox to support these kinds, or leave them as direct-PR-edited surfaces.

---

## Out of scope for Phase 1a (deferred to other plans / phases)

- `/admin` site management → handled by PM Inbox plan (separate)
- `/apply` form → superseded by `/pitch` conversational intake
- Auth, Postgres, Octokit → not happening; the original Phase 1 spec deferred these
- Transcript → PR pipeline → Phase 2
- Embedded live demos inside project cards → Phase 2
- Sandy-on-site widget → Phase 3
- Office hours scheduling → Phase 3
- Monday digest emails → Phase 3

See [`docs/superpowers/specs/2026-05-26-phase-1-operating-surface-design.md`](../specs/2026-05-26-phase-1-operating-surface-design.md) "Scope reduction note" for context.
