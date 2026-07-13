# Ideas page — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public `/ideas` page that shows in-air ideas as a clustered, commitment-weighted concept map and lets visitors submit their own via an intake drawer. Submissions persist to Supabase with light moderation by the group lead.

**Architecture:** Site stays statically exported (`output: 'export'`). One vendor added: Supabase Postgres, queried directly from the browser via `@supabase/supabase-js` with RLS enforcing public-anon constraints. Desktop renders a D3-force physics map (SVG); mobile renders a clustered grid (same data, different surface).

**Tech Stack:** Next.js 15.1 (static export), React 19 client components, `@supabase/supabase-js` v2, `d3-force` v3, plain CSS in `app/globals.css`.

**Note on verification:** This repo has no test runner. Each task verifies with `npx tsc --noEmit` and (where the change affects the build pipeline) `npm run build`. The final task does a manual QA pass against the checklist in the spec.

**Spec:** [`docs/superpowers/specs/2026-05-26-ideas-page-design.md`](../specs/2026-05-26-ideas-page-design.md)

---

## Task 1: Document the Supabase setup (manual, one-time) and update env example

The actual Supabase project + table is created by the operator in the Supabase dashboard; this task ships the SQL they need to run and updates `.env.local.example` so the project doesn't break for fresh clones.

**Files:**
- Create: `docs/supabase/ideas-setup.sql`
- Create: `docs/supabase/README.md`
- Modify: `.env.local.example`

- [ ] **Step 1: Create the SQL setup file**

Create `docs/supabase/ideas-setup.sql` with:

```sql
-- Run this once in the Supabase SQL editor for the project that hosts the Ideas page.
-- After running, the public anon key can insert pending ideas and read approved/pending ideas
-- (without PII columns) via the ideas_public view. Rejected ideas and PII never leave the DB.

-- 1. Enums
create type idea_status as enum ('pending', 'approved', 'rejected');
create type idea_theme as enum ('med_ed', 'trauma', 'population_health', 'ed_tech', 'k12', 'other');
create type idea_commitment as enum ('curious', 'exploring', 'committed');

-- 2. Base table
create table ideas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status idea_status not null default 'pending',
  title text not null check (char_length(title) <= 60),
  theme idea_theme not null,
  commitment idea_commitment not null,
  problem text not null,
  affects text,
  build_first text,
  looking_for text[],
  submitter_name text not null,
  submitter_email text not null,
  submitter_role text,
  honeypot text
);

create index ideas_status_idx on ideas (status);
create index ideas_theme_idx on ideas (theme);
create index ideas_created_at_idx on ideas (created_at desc);

-- 3. Public view (no PII)
-- security_invoker = true so the RLS policies on the base table apply when anon reads through this view.
create view ideas_public
  with (security_invoker = true)
  as
  select
    id, created_at, status, title, theme, commitment,
    problem, affects, build_first, looking_for,
    submitter_name, submitter_role
  from ideas;

-- 4. RLS
alter table ideas enable row level security;

-- Anon can insert, but only as pending and only when honeypot is empty.
create policy "anon_insert_pending" on ideas
  for insert to anon
  with check (
    status = 'pending'
    and (honeypot is null or honeypot = '')
  );

-- Anon can read non-rejected rows (column scope is enforced by the ideas_public view).
create policy "anon_read_visible" on ideas
  for select to anon
  using (status in ('pending', 'approved'));

-- 5. Grants for the view
grant select on ideas_public to anon;
```

- [ ] **Step 2: Create the Supabase README**

Create `docs/supabase/README.md` with:

```markdown
# Supabase setup — Ideas page

The `/ideas` page reads and writes a single `ideas` table in Supabase. This is a one-time manual setup.

## First-time setup

1. Create a new Supabase project (free tier is fine).
2. Open the SQL editor and run [`ideas-setup.sql`](./ideas-setup.sql) end-to-end.
3. In Project Settings → API, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Add both to `.env.local` (local dev) and to Vercel project env vars (production).
5. In Database → Replication, enable realtime for the `ideas` table.

## Moderating submissions

Open Supabase dashboard → Table Editor → `ideas` → filter `status = pending`.
Flip `status` to `approved` (publishes) or `rejected` (hides). Submitters are not
notified either way. The "Reach out" button on approved ideas opens a mailto to
`tama.the@uky.edu` so the group lead is the relay; the submitter's email is never
exposed to the browser.

## Verifying RLS (one-time check)

In a SQL editor session, switch to the `anon` role and try the following — each should fail or return restricted results:

```sql
set role anon;

-- Should NOT return submitter_email (column not in view)
select * from ideas_public limit 1;

-- Should fail (anon cannot insert as approved)
insert into ideas (status, title, theme, commitment, problem, submitter_name, submitter_email)
  values ('approved', 'sneaky', 'other', 'curious', 'x', 'x', 'x@uky.edu');

-- Should fail (honeypot non-empty)
insert into ideas (status, title, theme, commitment, problem, submitter_name, submitter_email, honeypot)
  values ('pending', 'spam', 'other', 'curious', 'x', 'x', 'x@uky.edu', 'http://spam');

reset role;
```
```

- [ ] **Step 3: Update `.env.local.example`**

Append to `.env.local.example`:

```
# Supabase project for the /ideas page (see docs/supabase/README.md).
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

- [ ] **Step 4: Commit**

```bash
git add docs/supabase/ .env.local.example
git commit -m "docs: add Supabase setup SQL and env example for ideas page"
```

---

## Task 2: Install dependencies and create the Supabase client singleton

**Files:**
- Modify: `package.json` (via npm install)
- Create: `lib/supabase.ts`

- [ ] **Step 1: Install runtime deps**

Run:

```bash
npm install @supabase/supabase-js d3-force
npm install --save-dev @types/d3-force
```

Expected: package.json + package-lock.json updated with `@supabase/supabase-js@^2`, `d3-force@^3`, and the d3-force types in devDependencies.

- [ ] **Step 2: Create the Supabase client**

Create `lib/supabase.ts`:

```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Soft-fail at module load so a missing env var doesn't crash the static build.
  // Callers should handle a null client.
  console.warn(
    "Supabase env vars missing — /ideas page features will be disabled."
  );
}

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json lib/supabase.ts
git commit -m "feat: add supabase client + d3-force dependency"
```

---

## Task 3: Create `lib/ideas.ts` with types and pure utilities

**Files:**
- Create: `lib/ideas.ts`

- [ ] **Step 1: Write the file**

Create `lib/ideas.ts`:

```ts
export type IdeaStatus = "pending" | "approved" | "rejected";
export type IdeaTheme =
  | "med_ed"
  | "trauma"
  | "population_health"
  | "ed_tech"
  | "k12"
  | "other";
export type IdeaCommitment = "curious" | "exploring" | "committed";

export interface Idea {
  id: string;
  createdAt: string;
  status: IdeaStatus;
  title: string;
  theme: IdeaTheme;
  commitment: IdeaCommitment;
  problem: string;
  affects: string | null;
  buildFirst: string | null;
  lookingFor: string[];
  submitterName: string;
  submitterRole: string | null;
}

// Human-readable theme labels for chips and cluster anchors.
export const THEME_LABELS: Record<IdeaTheme, string> = {
  med_ed: "Med-Ed",
  trauma: "Trauma",
  population_health: "Population Health",
  ed_tech: "Ed-Tech",
  k12: "K–12",
  other: "Other",
};

export const COMMITMENT_LABELS: Record<IdeaCommitment, string> = {
  curious: "Curious",
  exploring: "Exploring",
  committed: "Committed",
};

// Cluster attractor positions, normalized 0–1 over the map canvas.
// Hexagonal arrangement; "other" sits bottom-right as the quieter bucket.
export function themeToCluster(theme: IdeaTheme): { x: number; y: number } {
  const map: Record<IdeaTheme, { x: number; y: number }> = {
    med_ed: { x: 0.25, y: 0.3 },
    trauma: { x: 0.75, y: 0.3 },
    population_health: { x: 0.5, y: 0.25 },
    ed_tech: { x: 0.25, y: 0.7 },
    k12: { x: 0.75, y: 0.7 },
    other: { x: 0.85, y: 0.85 },
  };
  return map[theme];
}

// Visual encoding for commitment level.
export function commitmentToVisual(commitment: IdeaCommitment): {
  radius: number;
  fillOpacity: number;
  halo: boolean;
} {
  switch (commitment) {
    case "curious":
      return { radius: 9, fillOpacity: 0.5, halo: false };
    case "exploring":
      return { radius: 14, fillOpacity: 0.8, halo: false };
    case "committed":
      return { radius: 20, fillOpacity: 1.0, halo: true };
  }
}

// Parse a row from the ideas_public view (snake_case) into the camelCase Idea shape.
export function parseIdeaRow(row: Record<string, unknown>): Idea {
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    status: row.status as IdeaStatus,
    title: String(row.title),
    theme: row.theme as IdeaTheme,
    commitment: row.commitment as IdeaCommitment,
    problem: String(row.problem),
    affects: row.affects == null ? null : String(row.affects),
    buildFirst: row.build_first == null ? null : String(row.build_first),
    lookingFor: Array.isArray(row.looking_for) ? (row.looking_for as string[]) : [],
    submitterName: String(row.submitter_name),
    submitterRole: row.submitter_role == null ? null : String(row.submitter_role),
  };
}

// UK email check used by the intake form.
export function isUkEmail(value: string): boolean {
  return /^[^\s@]+@uky\.edu$/i.test(value.trim());
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/ideas.ts
git commit -m "feat: add ideas domain types + pure utilities"
```

---

## Task 4: Add "Ideas" link to the global nav

**Files:**
- Modify: `components/Nav.tsx`

- [ ] **Step 1: Update `NavKey` and add the link**

Replace the contents of `components/Nav.tsx` with:

```tsx
import Link from "next/link";
import Logo from "./Logo";

type NavKey = "overview" | "projects" | "ideas" | "team" | "activity" | "join";

interface NavProps {
  active?: NavKey;
}

export default function Nav({ active }: NavProps) {
  const cls = (key: NavKey) => (active === key ? "active" : undefined);
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link className="nav-brand" href="/" aria-label="AI Incubator @ University of Kentucky — home">
          <Logo alt="" className="nav-logo" />
          <span className="tag">University of Kentucky</span>
        </Link>
        <div className="nav-links">
          <Link href="/" className={cls("overview")}>Overview</Link>
          <Link href="/projects" className={cls("projects")}>Projects</Link>
          <Link href="/ideas" className={cls("ideas")}>Ideas</Link>
          <Link href="/#team" className={cls("team")}>Team</Link>
          <Link href="/#log" className={cls("activity")}>Activity</Link>
          <Link href="/join" className={`btn primary sm ${active === "join" ? "active" : ""}`}>
            Join Friday <span className="arrow">→</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors. (Existing pages will still pass `<Nav active="projects" />` etc. — the union widened, none narrowed.)

- [ ] **Step 3: Commit**

```bash
git add components/Nav.tsx
git commit -m "feat(nav): add Ideas link"
```

---

## Task 5: Create the `/ideas` page shell

Initially the page just renders the header and a "Loading…" placeholder. The map and grid land in later tasks.

**Files:**
- Create: `app/ideas/page.tsx`

- [ ] **Step 1: Create the page**

Create `app/ideas/page.tsx`:

```tsx
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DotGrid from "@/components/DotGrid";
import { content } from "@/content/site";
import IdeasMap from "@/components/IdeasMap";
import IdeasGrid from "@/components/IdeasGrid";

export const metadata = {
  title: "Ideas · AI Incubator",
  description:
    "Ideas in the air at the AI Incubator @ University of Kentucky. Some are seeds, some are pitches. Add yours.",
};

export default function IdeasPage() {
  return (
    <>
      <Nav active="ideas" />

      <header
        className="ideas-hero container"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <DotGrid />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Ideas · {content.cohort.replace(/^Cohort\s+\d+\s+·\s+/, "")}
          </div>
          <h1 className="h-display" style={{ maxWidth: "22ch" }}>
            Ideas in the air.
          </h1>
          <p className="lead" style={{ marginTop: 28 }}>
            What people in the group are thinking about. Some are seeds, some are
            pitches. Add yours.
          </p>
        </div>
      </header>

      <div className="ideas-surface-desktop">
        <IdeasMap />
      </div>
      <div className="ideas-surface-mobile">
        <IdeasGrid />
      </div>

      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Create temporary stubs for IdeasMap and IdeasGrid**

So the page builds before later tasks land. Create `components/IdeasMap.tsx`:

```tsx
"use client";
export default function IdeasMap() {
  return (
    <div className="container" style={{ padding: "40px 0", color: "var(--ink-3)" }}>
      Map coming soon.
    </div>
  );
}
```

Create `components/IdeasGrid.tsx`:

```tsx
"use client";
export default function IdeasGrid() {
  return (
    <div className="container" style={{ padding: "40px 0", color: "var(--ink-3)" }}>
      Grid coming soon.
    </div>
  );
}
```

- [ ] **Step 3: Add the breakpoint switch CSS**

Append to `app/globals.css`:

```css
/* ── /ideas page surface switch ─────────────────── */
.ideas-surface-mobile { display: none; }
@media (max-width: 767px) {
  .ideas-surface-desktop { display: none; }
  .ideas-surface-mobile { display: block; }
}

.ideas-hero { padding-top: 80px; padding-bottom: 40px; }
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build succeeds, `out/ideas/index.html` exists.

- [ ] **Step 5: Commit**

```bash
git add app/ideas/page.tsx components/IdeasMap.tsx components/IdeasGrid.tsx app/globals.css
git commit -m "feat(ideas): page shell + surface stubs"
```

---

## Task 6: Wire `IdeasMap` to Supabase — fetch + render static SVG nodes

No physics yet, no panel, no filter. Nodes render at their cluster attractor positions with a small per-node random offset.

**Files:**
- Modify: `components/IdeasMap.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Replace the stub with the data-driven version**

Replace `components/IdeasMap.tsx` with:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  type Idea,
  THEME_LABELS,
  themeToCluster,
  commitmentToVisual,
  parseIdeaRow,
} from "@/lib/ideas";

type LoadState = "loading" | "ready" | "error" | "disabled";

export default function IdeasMap() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1000, h: 600 });

  useEffect(() => {
    if (!supabase) {
      setState("disabled");
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("ideas_public")
        .select("*")
        .in("status", ["pending", "approved"])
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error(error);
        setState("error");
        return;
      }
      setIdeas((data ?? []).map(parseIdeaRow));
      setState("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(320, r.width), h: Math.max(360, r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (state === "disabled") {
    return (
      <div className="ideas-map container" style={{ color: "var(--ink-3)", padding: 40 }}>
        Ideas page is not configured yet (missing Supabase env vars).
      </div>
    );
  }

  return (
    <div ref={containerRef} className="ideas-map container">
      {state === "loading" && <div className="ideas-state">Loading…</div>}
      {state === "error" && (
        <div className="ideas-state ideas-state--error">
          Couldn&apos;t load ideas — please refresh.
        </div>
      )}
      {state === "ready" && ideas.length === 0 && (
        <div className="ideas-state">No ideas yet — be the first.</div>
      )}
      {state === "ready" && ideas.length > 0 && (
        <svg className="ideas-canvas" viewBox={`0 0 ${size.w} ${size.h}`}>
          {/* Cluster labels */}
          {Object.entries(THEME_LABELS).map(([key, label]) => {
            const c = themeToCluster(key as keyof typeof THEME_LABELS);
            return (
              <text
                key={key}
                x={c.x * size.w}
                y={c.y * size.h - 60}
                className="ideas-cluster-label"
                textAnchor="middle"
              >
                {label.toUpperCase()}
              </text>
            );
          })}

          {/* Nodes */}
          {ideas.map((idea) => {
            const c = themeToCluster(idea.theme);
            // Deterministic jitter so re-renders don't shuffle nodes.
            const jitterX = ((hash(idea.id) % 100) - 50) * 1.2;
            const jitterY = ((hash(idea.id + "y") % 100) - 50) * 1.2;
            const v = commitmentToVisual(idea.commitment);
            const isPending = idea.status === "pending";
            return (
              <g
                key={idea.id}
                transform={`translate(${c.x * size.w + jitterX}, ${c.y * size.h + jitterY})`}
              >
                {v.halo && (
                  <circle
                    r={v.radius + 4}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    opacity={isPending ? 0.4 : 0.9}
                  />
                )}
                <circle
                  r={v.radius}
                  fill="var(--accent)"
                  fillOpacity={v.fillOpacity * (isPending ? 0.6 : 1)}
                  stroke={isPending ? "var(--accent)" : "none"}
                  strokeDasharray={isPending ? "3 3" : undefined}
                  strokeWidth={isPending ? 1 : 0}
                />
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

// Tiny string hash for deterministic per-id jitter.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
```

- [ ] **Step 2: Add CSS**

Append to `app/globals.css`:

```css
/* ── Ideas map ─────────────────────────────────── */
.ideas-map {
  position: relative;
  height: 70vh;
  min-height: 480px;
  padding: 0;
}
.ideas-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.ideas-cluster-label {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.15em;
  fill: var(--ink-4);
  user-select: none;
}
.ideas-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--ink-3);
  font-size: 14px;
}
.ideas-state--error { color: var(--alert); }
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: build succeeds. (Page will render loading state without Supabase configured, which is the soft-fail path.)

- [ ] **Step 4: Commit**

```bash
git add components/IdeasMap.tsx app/globals.css
git commit -m "feat(ideas): map fetches and renders nodes by cluster"
```

---

## Task 7: Add D3-force physics simulation to the map

Replaces the deterministic jitter with a real force-directed layout — nodes pulled toward their cluster attractor and repelled from siblings.

**Files:**
- Modify: `components/IdeasMap.tsx`

- [ ] **Step 1: Replace the static positioning with a simulation**

In `components/IdeasMap.tsx`, add this import alongside the existing imports:

```ts
import * as d3 from "d3-force";
```

Then add the simulation effect inside the component (after the existing useEffects, before the `if (state === "disabled")` early return):

```ts
type Pos = { x: number; y: number; vx?: number; vy?: number };
const [positions, setPositions] = useState<Record<string, Pos>>({});

useEffect(() => {
  if (state !== "ready" || ideas.length === 0) return;

  const nodes = ideas.map((idea) => {
    const c = themeToCluster(idea.theme);
    return {
      id: idea.id,
      theme: idea.theme,
      x: c.x * size.w,
      y: c.y * size.h,
    } as d3.SimulationNodeDatum & { id: string; theme: string };
  });

  const sim = d3
    .forceSimulation(nodes)
    .force(
      "x",
      d3.forceX<typeof nodes[0]>((d) => themeToCluster(d.theme as any).x * size.w).strength(0.08),
    )
    .force(
      "y",
      d3.forceY<typeof nodes[0]>((d) => themeToCluster(d.theme as any).y * size.h).strength(0.08),
    )
    .force(
      "collide",
      d3.forceCollide<typeof nodes[0]>((d) => {
        const idea = ideas.find((i) => i.id === d.id)!;
        return commitmentToVisual(idea.commitment).radius + 6;
      }),
    )
    .alphaDecay(0.05)
    .on("tick", () => {
      const next: Record<string, Pos> = {};
      for (const n of nodes) next[n.id] = { x: n.x ?? 0, y: n.y ?? 0 };
      setPositions(next);
    });

  return () => {
    sim.stop();
  };
}, [ideas, state, size.w, size.h]);
```

- [ ] **Step 2: Use positions when rendering nodes**

Replace the node-rendering block (the `{ideas.map((idea) => { ... })}` inside the SVG) with:

```tsx
{ideas.map((idea) => {
  const pos = positions[idea.id];
  if (!pos) return null;
  const v = commitmentToVisual(idea.commitment);
  const isPending = idea.status === "pending";
  return (
    <g key={idea.id} transform={`translate(${pos.x}, ${pos.y})`}>
      {v.halo && (
        <circle
          r={v.radius + 4}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2}
          opacity={isPending ? 0.4 : 0.9}
        />
      )}
      <circle
        r={v.radius}
        fill="var(--accent)"
        fillOpacity={v.fillOpacity * (isPending ? 0.6 : 1)}
        stroke={isPending ? "var(--accent)" : "none"}
        strokeDasharray={isPending ? "3 3" : undefined}
        strokeWidth={isPending ? 1 : 0}
      />
    </g>
  );
})}
```

Remove the now-unused `hash` helper at the bottom of the file.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors. Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/IdeasMap.tsx
git commit -m "feat(ideas): D3-force physics for map nodes"
```

---

## Task 8: Add hover affordance and click-to-open detail panel

**Files:**
- Create: `components/IdeaDetailPanel.tsx`
- Modify: `components/IdeasMap.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Create the detail panel**

Create `components/IdeaDetailPanel.tsx`:

```tsx
"use client";

import { type Idea, THEME_LABELS, COMMITMENT_LABELS } from "@/lib/ideas";

interface Props {
  idea: Idea | null;
  onClose: () => void;
}

export default function IdeaDetailPanel({ idea, onClose }: Props) {
  if (!idea) return null;
  const mailto = `mailto:tama.the@uky.edu?subject=${encodeURIComponent(
    `Re: ${idea.title}`,
  )}&body=${encodeURIComponent(
    `Hi — I'd like to be connected with the person who submitted "${idea.title}" on the Ideas page.\n\n`,
  )}`;
  return (
    <aside className="idea-panel" role="dialog" aria-label={idea.title}>
      <div className="idea-panel-head">
        <button className="idea-panel-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="idea-panel-chips">
          <span className="chip">{THEME_LABELS[idea.theme]}</span>
          <span className={`chip commit commit--${idea.commitment}`}>
            {COMMITMENT_LABELS[idea.commitment]}
          </span>
          {idea.status === "pending" && (
            <span className="chip pending">Pending review</span>
          )}
        </div>
        <h2 className="idea-panel-title">{idea.title}</h2>
        <div className="idea-panel-submitter">
          {idea.submitterName}
          {idea.submitterRole ? ` · ${idea.submitterRole}` : ""}
        </div>
      </div>
      <div className="idea-panel-body">
        <Section label="The problem" body={idea.problem} />
        {idea.affects && <Section label="Who it affects" body={idea.affects} />}
        {idea.buildFirst && <Section label="What they'd build first" body={idea.buildFirst} />}
        {idea.lookingFor.length > 0 && (
          <div className="idea-panel-section">
            <div className="eyebrow">Looking for</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {idea.lookingFor.map((tag) => (
                <span key={tag} className="chip">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="idea-panel-foot">
        <a className="btn primary" href={mailto}>
          Reach out <span className="arrow">→</span>
        </a>
      </div>
    </aside>
  );
}

function Section({ label, body }: { label: string; body: string }) {
  return (
    <div className="idea-panel-section">
      <div className="eyebrow">{label}</div>
      <p className="body" style={{ marginTop: 8 }}>{body}</p>
    </div>
  );
}
```

- [ ] **Step 2: Wire selection state and hover into `IdeasMap`**

In `components/IdeasMap.tsx`, add the import:

```ts
import IdeaDetailPanel from "./IdeaDetailPanel";
```

Add state inside the component:

```ts
const [selected, setSelected] = useState<Idea | null>(null);
const [hovered, setHovered] = useState<string | null>(null);
```

Replace the entire `{ideas.map(...)}` node-rendering block from Task 7 with this version that adds hover and click handlers plus the hover tooltip:

```tsx
{ideas.map((idea) => {
  const pos = positions[idea.id];
  if (!pos) return null;
  const v = commitmentToVisual(idea.commitment);
  const isPending = idea.status === "pending";
  return (
    <g
      key={idea.id}
      className={`idea-node ${hovered === idea.id ? "is-hovered" : ""}`}
      transform={`translate(${pos.x}, ${pos.y})`}
      onMouseEnter={() => setHovered(idea.id)}
      onMouseLeave={() => setHovered((h) => (h === idea.id ? null : h))}
      onClick={() => setSelected(idea)}
      style={{ cursor: "pointer" }}
    >
      {v.halo && (
        <circle
          r={v.radius + 4}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2}
          opacity={isPending ? 0.4 : 0.9}
        />
      )}
      <circle
        r={v.radius}
        fill="var(--accent)"
        fillOpacity={v.fillOpacity * (isPending ? 0.6 : 1)}
        stroke={isPending ? "var(--accent)" : "none"}
        strokeDasharray={isPending ? "3 3" : undefined}
        strokeWidth={isPending ? 1 : 0}
      />
      {hovered === idea.id && (
        <text y={-(v.radius + 10)} textAnchor="middle" className="idea-node-tip">
          {idea.title}
        </text>
      )}
    </g>
  );
})}
```

After the closing `</svg>`, mount the panel:

```tsx
<IdeaDetailPanel idea={selected} onClose={() => setSelected(null)} />
```

- [ ] **Step 3: CSS for panel + hover**

Append to `app/globals.css`:

```css
/* ── Idea node hover ───────────────────────────── */
.idea-node { transition: transform 120ms var(--ease); transform-box: fill-box; transform-origin: center; }
.idea-node.is-hovered { transform: scale(1.12); }
.idea-node-tip {
  font-family: var(--sans);
  font-size: 12px;
  fill: var(--ink);
  paint-order: stroke;
  stroke: var(--bg);
  stroke-width: 4px;
  stroke-linejoin: round;
  pointer-events: none;
}

/* ── Idea detail panel (desktop slide-in) ──────── */
.idea-panel {
  position: fixed;
  top: 80px;
  right: 0;
  width: 420px;
  max-width: 100vw;
  height: calc(100vh - 80px);
  background: var(--bg-elev);
  border-left: 1px solid var(--line);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  z-index: 50;
  animation: idea-panel-slide 200ms var(--ease);
}
@keyframes idea-panel-slide {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.idea-panel-head { padding: 24px 24px 16px; border-bottom: 1px solid var(--line); position: relative; }
.idea-panel-close {
  position: absolute; top: 16px; right: 16px;
  background: none; border: none; font-size: 24px; cursor: pointer; color: var(--ink-3);
}
.idea-panel-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.chip.commit { font-weight: 500; }
.chip.commit--committed { color: var(--accent); border-color: var(--accent); }
.chip.pending { color: var(--warn); border-style: dashed; }
.idea-panel-title { font-size: 22px; font-weight: 700; line-height: 1.2; margin: 0; }
.idea-panel-submitter { font-size: 13px; color: var(--ink-3); margin-top: 8px; font-family: var(--mono); }
.idea-panel-body { padding: 16px 24px; flex: 1; overflow-y: auto; }
.idea-panel-section + .idea-panel-section { margin-top: 20px; }
.idea-panel-foot { padding: 16px 24px; border-top: 1px solid var(--line); }

@media (max-width: 767px) {
  .idea-panel {
    top: auto; bottom: 0; right: 0; left: 0;
    width: 100vw; height: 85vh;
    border-left: none; border-top: 1px solid var(--line);
    animation: idea-panel-slide-up 200ms var(--ease);
  }
  @keyframes idea-panel-slide-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add components/IdeaDetailPanel.tsx components/IdeasMap.tsx app/globals.css
git commit -m "feat(ideas): hover affordance + detail panel"
```

---

## Task 9: Filter strip — theme + commitment

**Files:**
- Modify: `components/IdeasMap.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Extend the `@/lib/ideas` import**

In `components/IdeasMap.tsx`, update the existing `@/lib/ideas` import to add `IdeaTheme`, `IdeaCommitment`, and `COMMITMENT_LABELS`:

```ts
import {
  type Idea,
  type IdeaTheme,
  type IdeaCommitment,
  THEME_LABELS,
  COMMITMENT_LABELS,
  themeToCluster,
  commitmentToVisual,
  parseIdeaRow,
} from "@/lib/ideas";
```

- [ ] **Step 2: Add filter state and helpers**

Inside the `IdeasMap` component (near the existing `useState` declarations), add:

```ts
const [themeFilter, setThemeFilter] = useState<Set<IdeaTheme>>(new Set());
const [commitmentFilter, setCommitmentFilter] = useState<Set<IdeaCommitment>>(new Set());

function toggleTheme(t: IdeaTheme) {
  setThemeFilter((prev) => {
    const next = new Set(prev);
    next.has(t) ? next.delete(t) : next.add(t);
    return next;
  });
}
function toggleCommitment(c: IdeaCommitment) {
  setCommitmentFilter((prev) => {
    const next = new Set(prev);
    next.has(c) ? next.delete(c) : next.add(c);
    return next;
  });
}

function isFilteredOut(idea: Idea): boolean {
  if (themeFilter.size > 0 && !themeFilter.has(idea.theme)) return true;
  if (commitmentFilter.size > 0 && !commitmentFilter.has(idea.commitment)) return true;
  return false;
}
```

- [ ] **Step 3: Render the filter strip**

Inside the `<div ref={containerRef} className="ideas-map container">`, immediately before the `<svg className="ideas-canvas" ...>` element, insert:

```tsx
<div className="ideas-filter-strip">
  <div className="ideas-filter-group">
    {(Object.keys(THEME_LABELS) as IdeaTheme[]).map((t) => (
      <button
        key={t}
        className={`filter-chip ${themeFilter.has(t) ? "active" : ""}`}
        onClick={() => toggleTheme(t)}
      >
        {THEME_LABELS[t]}
      </button>
    ))}
  </div>
  <div className="ideas-filter-group">
    {(["curious", "exploring", "committed"] as IdeaCommitment[]).map((c) => (
      <button
        key={c}
        className={`filter-chip ${commitmentFilter.has(c) ? "active" : ""}`}
        onClick={() => toggleCommitment(c)}
      >
        {COMMITMENT_LABELS[c]}
      </button>
    ))}
  </div>
</div>
```

- [ ] **Step 4: Fade filtered-out nodes**

Replace the entire `{ideas.map(...)}` node-rendering block from Task 8 with the version below — the only change is the new `opacity` attribute on the outer `<g>`:

```tsx
{ideas.map((idea) => {
  const pos = positions[idea.id];
  if (!pos) return null;
  const v = commitmentToVisual(idea.commitment);
  const isPending = idea.status === "pending";
  return (
    <g
      key={idea.id}
      className={`idea-node ${hovered === idea.id ? "is-hovered" : ""}`}
      transform={`translate(${pos.x}, ${pos.y})`}
      opacity={isFilteredOut(idea) ? 0.1 : 1}
      onMouseEnter={() => setHovered(idea.id)}
      onMouseLeave={() => setHovered((h) => (h === idea.id ? null : h))}
      onClick={() => setSelected(idea)}
      style={{ cursor: "pointer" }}
    >
      {v.halo && (
        <circle
          r={v.radius + 4}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2}
          opacity={isPending ? 0.4 : 0.9}
        />
      )}
      <circle
        r={v.radius}
        fill="var(--accent)"
        fillOpacity={v.fillOpacity * (isPending ? 0.6 : 1)}
        stroke={isPending ? "var(--accent)" : "none"}
        strokeDasharray={isPending ? "3 3" : undefined}
        strokeWidth={isPending ? 1 : 0}
      />
      {hovered === idea.id && (
        <text y={-(v.radius + 10)} textAnchor="middle" className="idea-node-tip">
          {idea.title}
        </text>
      )}
    </g>
  );
})}
```

- [ ] **Step 5: CSS for the strip**

Append to `app/globals.css`:

```css
/* ── Ideas filter strip ─────────────────────────── */
.ideas-filter-strip {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  gap: 24px;
  z-index: 10;
  flex-wrap: wrap;
}
.ideas-filter-group { display: flex; gap: 6px; flex-wrap: wrap; }
```

The strip overlaps the add-idea pill at narrow widths; the pill has higher z-index (20 vs 10), so the pill stays clickable. If the strip wraps into the pill at very narrow widths, the next breakpoint (mobile) takes over.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors, build succeeds.

- [ ] **Step 7: Commit**

```bash
git add components/IdeasMap.tsx app/globals.css
git commit -m "feat(ideas): theme + commitment filter strip"
```

---

## Task 10: Intake drawer — form skeleton

The drawer exists but its submit handler is a no-op stub. Submission lands in Task 11.

**Files:**
- Create: `components/IdeaIntakeDrawer.tsx`
- Modify: `components/IdeasMap.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Create the drawer component**

Create `components/IdeaIntakeDrawer.tsx`:

```tsx
"use client";

import { useState } from "react";
import {
  type IdeaTheme,
  type IdeaCommitment,
  THEME_LABELS,
  COMMITMENT_LABELS,
  isUkEmail,
} from "@/lib/ideas";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

const LOOKING_FOR_OPTIONS = [
  "Clinician",
  "Coder",
  "Designer",
  "Writer",
  "Researcher",
  "Faculty sponsor",
];

const ROLE_OPTIONS = [
  "Undergrad student",
  "Graduate / Medical student",
  "Resident / Fellow",
  "Faculty",
  "Staff",
  "Community partner",
];

export default function IdeaIntakeDrawer({ open, onClose, onSubmitted }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optionalOpen, setOptionalOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState<IdeaTheme | null>(null);
  const [commitment, setCommitment] = useState<IdeaCommitment | null>(null);
  const [problem, setProblem] = useState("");
  const [affects, setAffects] = useState("");
  const [buildFirst, setBuildFirst] = useState("");
  const [lookingFor, setLookingFor] = useState<Set<string>>(new Set());
  const [role, setRole] = useState("");
  const [honeypot, setHoneypot] = useState("");

  if (!open) return null;

  function toggleLookingFor(opt: string) {
    setLookingFor((prev) => {
      const next = new Set(prev);
      next.has(opt) ? next.delete(opt) : next.add(opt);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isUkEmail(email)) {
      setError("Please use your @uky.edu email.");
      return;
    }
    if (!theme || !commitment) {
      setError("Pick a theme and a commitment level.");
      return;
    }
    setSubmitting(true);
    // Real submit lands in the next task.
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      onSubmitted();
      onClose();
    }, 1500);
  }

  return (
    <aside className="idea-drawer" role="dialog" aria-label="Add your idea">
      <div className="idea-drawer-head">
        <button className="idea-panel-close" onClick={onClose} aria-label="Close">×</button>
        <div className="eyebrow">Add your idea</div>
        <h2 className="idea-drawer-title">Drop a seed or pitch.</h2>
      </div>
      <form onSubmit={handleSubmit} className="idea-drawer-body">
        <Field label="Your name">
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="First Last" />
        </Field>
        <Field label="UK email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@uky.edu"
          />
        </Field>
        <Field label="Idea title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={60}
            placeholder="One line"
          />
        </Field>

        <FieldGroup label="Theme">
          {(Object.keys(THEME_LABELS) as IdeaTheme[]).map((t) => (
            <button
              type="button"
              key={t}
              className={`filter-chip ${theme === t ? "active" : ""}`}
              onClick={() => setTheme(t)}
            >
              {THEME_LABELS[t]}
            </button>
          ))}
        </FieldGroup>

        <FieldGroup label="Commitment">
          {(["curious", "exploring", "committed"] as IdeaCommitment[]).map((c) => (
            <button
              type="button"
              key={c}
              className={`filter-chip ${commitment === c ? "active" : ""}`}
              onClick={() => setCommitment(c)}
            >
              {COMMITMENT_LABELS[c]}
            </button>
          ))}
        </FieldGroup>

        <Field label="The problem">
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            required
            rows={3}
            placeholder="What's the problem you've noticed?"
          />
        </Field>

        <button
          type="button"
          className="idea-drawer-toggle"
          onClick={() => setOptionalOpen((o) => !o)}
        >
          {optionalOpen ? "− Hide" : "+ Tell us more (optional)"}
        </button>

        {optionalOpen && (
          <div className="idea-drawer-optional">
            <Field label="Who it affects">
              <input value={affects} onChange={(e) => setAffects(e.target.value)} placeholder="One line" />
            </Field>
            <Field label="What you'd build first">
              <input value={buildFirst} onChange={(e) => setBuildFirst(e.target.value)} placeholder="One line" />
            </Field>
            <FieldGroup label="Looking for collaborators">
              {LOOKING_FOR_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  className={`filter-chip ${lookingFor.has(opt) ? "active" : ""}`}
                  onClick={() => toggleLookingFor(opt)}
                >
                  {opt}
                </button>
              ))}
            </FieldGroup>
            <Field label="Role">
              <input list="idea-roles" value={role} onChange={(e) => setRole(e.target.value)} />
              <datalist id="idea-roles">
                {ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
              </datalist>
            </Field>
          </div>
        )}

        {/* Honeypot — invisible to humans */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        />

        {error && <div className="idea-drawer-error">{error}</div>}

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
          <button
            type="submit"
            disabled={submitting || submitted}
            className={`btn lg ${submitted ? "" : "primary"}`}
            style={
              submitted
                ? { background: "var(--signal)", color: "var(--bg)", borderColor: "var(--signal)" }
                : undefined
            }
          >
            {submitted ? "Submitted ✓ — pending review" : submitting ? "Submitting…" : "Add to the map"}
          </button>
        </div>
      </form>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>{label}</label>
      <div className="field" style={{ borderRadius: 10, paddingLeft: 16 }}>
        {children}
      </div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="eyebrow" style={{ display: "block", marginBottom: 8 }}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Add the "+ Add your idea" pill and drawer mount to `IdeasMap`**

In `components/IdeasMap.tsx` add:

```ts
import IdeaIntakeDrawer from "./IdeaIntakeDrawer";
const [intakeOpen, setIntakeOpen] = useState(false);
```

Add the sticky pill — place it inside the outer `<div className="ideas-map container">` right after the opening tag:

```tsx
<button className="add-idea-pill" onClick={() => setIntakeOpen(true)}>
  + Add your idea
</button>
```

Mount the drawer at the end of the component's returned JSX, alongside the `IdeaDetailPanel`:

```tsx
<IdeaIntakeDrawer
  open={intakeOpen}
  onClose={() => setIntakeOpen(false)}
  onSubmitted={() => { /* refetch lands in Task 11 */ }}
/>
```

- [ ] **Step 3: CSS for pill + drawer**

Append to `app/globals.css`:

```css
/* ── Add idea pill ─────────────────────────────── */
.add-idea-pill {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 20;
  background: var(--accent);
  color: var(--accent-ink);
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 51, 160, 0.2);
  transition: transform 120ms var(--ease);
}
.add-idea-pill:hover { transform: translateY(-1px); }

/* ── Idea intake drawer ────────────────────────── */
.idea-drawer {
  position: fixed;
  top: 80px;
  right: 0;
  width: 480px;
  max-width: 100vw;
  height: calc(100vh - 80px);
  background: var(--bg-elev);
  border-left: 1px solid var(--line);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  z-index: 60;
  animation: idea-panel-slide 200ms var(--ease);
}
.idea-drawer-head { padding: 24px 24px 16px; border-bottom: 1px solid var(--line); position: relative; }
.idea-drawer-title { font-size: 22px; font-weight: 700; line-height: 1.2; margin: 8px 0 0; }
.idea-drawer-body {
  padding: 16px 24px 24px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: relative;
}
.idea-drawer-toggle {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  padding: 0;
}
.idea-drawer-optional { display: flex; flex-direction: column; gap: 18px; }
.idea-drawer-error {
  color: var(--alert);
  font-size: 13px;
  background: rgba(185, 28, 28, 0.06);
  padding: 8px 12px;
  border-radius: 6px;
}

@media (max-width: 767px) {
  .idea-drawer {
    top: auto; bottom: 0; right: 0; left: 0;
    width: 100vw; height: 90vh;
    border-left: none; border-top: 1px solid var(--line);
    animation: idea-panel-slide-up 200ms var(--ease);
  }
}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add components/IdeaIntakeDrawer.tsx components/IdeasMap.tsx app/globals.css
git commit -m "feat(ideas): intake drawer (form only, no submit yet)"
```

---

## Task 11: Wire intake submit to Supabase + add optimistic node

**Files:**
- Modify: `components/IdeaIntakeDrawer.tsx`
- Modify: `components/IdeasMap.tsx`

- [ ] **Step 1: Update the drawer's submit handler**

In `components/IdeaIntakeDrawer.tsx`, add the import:

```ts
import { supabase } from "@/lib/supabase";
```

Change the props to include an `onInsert` callback that receives the row Supabase returned:

```ts
interface Props {
  open: boolean;
  onClose: () => void;
  onInsert: (row: Record<string, unknown>) => void;
}
```

(Remove the now-unused `onSubmitted` prop.)

Replace the body of `handleSubmit` with:

```ts
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError(null);
  if (!isUkEmail(email)) {
    setError("Please use your @uky.edu email.");
    return;
  }
  if (!theme || !commitment) {
    setError("Pick a theme and a commitment level.");
    return;
  }
  if (!supabase) {
    setError("Submissions are temporarily unavailable.");
    return;
  }
  setSubmitting(true);
  const { data, error: dbError } = await supabase
    .from("ideas")
    .insert({
      title: title.trim(),
      theme,
      commitment,
      problem: problem.trim(),
      affects: affects.trim() || null,
      build_first: buildFirst.trim() || null,
      looking_for: Array.from(lookingFor),
      submitter_name: name.trim(),
      submitter_email: email.trim(),
      submitter_role: role.trim() || null,
      honeypot: honeypot,
    })
    .select("id, created_at, status, title, theme, commitment, problem, affects, build_first, looking_for, submitter_name, submitter_role")
    .single();
  setSubmitting(false);
  if (dbError || !data) {
    setError("Couldn't submit — please try again.");
    return;
  }
  onInsert(data as Record<string, unknown>);
  setSubmitted(true);
  setTimeout(onClose, 1500);
}
```

- [ ] **Step 2: Update `IdeasMap` to wire the callback**

In `components/IdeasMap.tsx`, replace the drawer mount with:

```tsx
<IdeaIntakeDrawer
  open={intakeOpen}
  onClose={() => setIntakeOpen(false)}
  onInsert={(row) => setIdeas((prev) => [parseIdeaRow(row), ...prev])}
/>
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors, build succeeds. Manual smoke test (with real Supabase env vars): submit the form, see the node appear as pending.

- [ ] **Step 4: Commit**

```bash
git add components/IdeaIntakeDrawer.tsx components/IdeasMap.tsx
git commit -m "feat(ideas): submit intake to supabase + optimistic node"
```

---

## Task 12: Realtime — pick up new inserts from other browsers

Subscribes to inserts and re-queries via the public view so PII never crosses the realtime channel.

**Files:**
- Modify: `components/IdeasMap.tsx`

- [ ] **Step 1: Add the subscription effect**

Inside `IdeasMap`, after the existing data-fetch effect, add:

```ts
useEffect(() => {
  if (!supabase) return;
  const channel = supabase
    .channel("ideas-inserts")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "ideas" },
      async (payload) => {
        const id = (payload.new as { id?: string }).id;
        if (!id) return;
        const { data } = await supabase!
          .from("ideas_public")
          .select("*")
          .eq("id", id)
          .single();
        if (!data) return;
        const parsed = parseIdeaRow(data);
        setIdeas((prev) => (prev.some((i) => i.id === parsed.id) ? prev : [parsed, ...prev]));
      },
    )
    .subscribe();
  return () => {
    supabase!.removeChannel(channel);
  };
}, []);
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors, build succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/IdeasMap.tsx
git commit -m "feat(ideas): realtime subscription for new submissions"
```

---

## Task 13: Mobile clustered grid

**Files:**
- Modify: `components/IdeasGrid.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Replace the stub**

Replace `components/IdeasGrid.tsx` with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  type Idea,
  type IdeaTheme,
  THEME_LABELS,
  COMMITMENT_LABELS,
  parseIdeaRow,
} from "@/lib/ideas";
import IdeaIntakeDrawer from "./IdeaIntakeDrawer";
import IdeaDetailPanel from "./IdeaDetailPanel";

const COMMITMENT_ORDER: Record<string, number> = {
  committed: 0,
  exploring: 1,
  curious: 2,
};

export default function IdeasGrid() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selected, setSelected] = useState<Idea | null>(null);
  const [intakeOpen, setIntakeOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase
        .from("ideas_public")
        .select("*")
        .in("status", ["pending", "approved"])
        .order("created_at", { ascending: false });
      setIdeas((data ?? []).map(parseIdeaRow));
    })();
  }, []);

  return (
    <div className="container ideas-grid-wrap">
      <button className="btn primary lg" style={{ width: "100%" }} onClick={() => setIntakeOpen(true)}>
        + Add your idea
      </button>

      {(Object.keys(THEME_LABELS) as IdeaTheme[]).map((theme) => {
        const inTheme = ideas
          .filter((i) => i.theme === theme)
          .sort((a, b) => COMMITMENT_ORDER[a.commitment] - COMMITMENT_ORDER[b.commitment]);
        if (inTheme.length === 0) return null;
        return (
          <section key={theme} className="ideas-grid-section">
            <h3 className="h3">{THEME_LABELS[theme]}</h3>
            <div className="ideas-grid-cards">
              {inTheme.map((idea) => (
                <button
                  key={idea.id}
                  className={`ideas-grid-card ideas-grid-card--${idea.commitment} ${
                    idea.status === "pending" ? "is-pending" : ""
                  }`}
                  onClick={() => setSelected(idea)}
                >
                  <span className="ideas-grid-dot" />
                  <div className="ideas-grid-card-body">
                    <div className="ideas-grid-card-title">{idea.title}</div>
                    <div className="ideas-grid-card-meta">
                      {COMMITMENT_LABELS[idea.commitment]} · {idea.submitterName}
                      {idea.status === "pending" ? " · pending" : ""}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })}

      {ideas.length === 0 && (
        <div className="ideas-state">No ideas yet — be the first.</div>
      )}

      <IdeaDetailPanel idea={selected} onClose={() => setSelected(null)} />
      <IdeaIntakeDrawer
        open={intakeOpen}
        onClose={() => setIntakeOpen(false)}
        onInsert={(row) => setIdeas((prev) => [parseIdeaRow(row), ...prev])}
      />
    </div>
  );
}
```

- [ ] **Step 2: CSS**

Append to `app/globals.css`:

```css
/* ── Ideas grid (mobile) ───────────────────────── */
.ideas-grid-wrap { padding: 24px 20px 64px; display: flex; flex-direction: column; gap: 32px; }
.ideas-grid-section { display: flex; flex-direction: column; gap: 12px; }
.ideas-grid-cards { display: flex; flex-direction: column; gap: 10px; }
.ideas-grid-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  font-family: var(--sans);
  color: var(--ink);
}
.ideas-grid-card.is-pending { border-style: dashed; opacity: 0.7; }
.ideas-grid-dot {
  width: 10px; height: 10px; border-radius: 999px; background: var(--accent);
  margin-top: 5px; flex-shrink: 0;
}
.ideas-grid-card--curious .ideas-grid-dot { background: transparent; border: 1px solid var(--accent); }
.ideas-grid-card--exploring .ideas-grid-dot { background: color-mix(in oklab, var(--accent) 50%, transparent); }
.ideas-grid-card-body { flex: 1; min-width: 0; }
.ideas-grid-card-title { font-weight: 500; font-size: 15px; line-height: 1.3; }
.ideas-grid-card-meta {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--ink-3);
  margin-top: 4px;
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/IdeasGrid.tsx app/globals.css
git commit -m "feat(ideas): mobile clustered grid surface"
```

---

## Task 14: Add count chip to the page header

The spec calls for a header count chip ("{N} ideas · {M} looking for collaborators"). Best added now that both surfaces hold the data.

**Files:**
- Modify: `app/ideas/page.tsx`
- Create: `components/IdeasCountChip.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Create the chip (client, reads from Supabase)**

Create `components/IdeasCountChip.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function IdeasCountChip() {
  const [counts, setCounts] = useState<{ total: number; needsHelp: number } | null>(null);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data } = await supabase
        .from("ideas_public")
        .select("looking_for")
        .in("status", ["pending", "approved"]);
      if (!data) return;
      const total = data.length;
      const needsHelp = data.filter(
        (r: { looking_for: string[] | null }) =>
          Array.isArray(r.looking_for) && r.looking_for.length > 0,
      ).length;
      setCounts({ total, needsHelp });
    })();
  }, []);

  if (!counts) return null;
  return (
    <span className="chip ideas-count-chip">
      {counts.total} {counts.total === 1 ? "idea" : "ideas"}
      {counts.needsHelp > 0 && <> · {counts.needsHelp} looking for collaborators</>}
    </span>
  );
}
```

- [ ] **Step 2: Mount it in the page header**

In `app/ideas/page.tsx`, add the import and place the chip below the `<p className="lead">`:

```tsx
import IdeasCountChip from "@/components/IdeasCountChip";
```

After the lead paragraph:

```tsx
<div style={{ marginTop: 20 }}>
  <IdeasCountChip />
</div>
```

- [ ] **Step 3: CSS**

Append to `app/globals.css`:

```css
.ideas-count-chip { font-family: var(--mono); font-size: 12px; }
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add components/IdeasCountChip.tsx app/ideas/page.tsx app/globals.css
git commit -m "feat(ideas): live count chip in page header"
```

---

## Task 15: Manual QA pass

This task runs the spec's QA checklist against the deployed (or `npm run dev`-served) site. Fix anything that fails before declaring done.

- [ ] **Step 1: Confirm Supabase setup is complete**

Open the Supabase dashboard and verify:
- `ideas` table exists with all columns from `docs/supabase/ideas-setup.sql`
- `ideas_public` view exists and `security_invoker` is on
- RLS is enabled on `ideas` and both policies are present
- Realtime is enabled for the `ideas` table
- `.env.local` has both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- [ ] **Step 2: Run `npm run dev` and walk the QA checklist**

For each item below, perform the action in the browser and confirm the expected outcome. Fix any failures (committing fixes as their own commits) before continuing.

- [ ] Submit with only required fields → pending node appears, drawer closes after 1.5s
- [ ] Submit with all fields → click the new node, panel shows everything correctly
- [ ] Submit with non-`@uky.edu` email → inline error, no submission
- [ ] Inspect honeypot in DevTools → present in DOM, offscreen; fill it via console, submit → submission rejected at the DB
- [ ] Flip `status` from `pending` → `approved` in Supabase dashboard → reload page, dashed outline gone
- [ ] Flip `status` to `rejected` → reload page, node disappears
- [ ] Filter by single theme → other theme nodes fade to 0.1 opacity
- [ ] Filter by commitment → same behavior
- [ ] Combine theme + commitment filter → AND semantics
- [ ] Reach out button → opens default mail client with subject `Re: <title>` to `tama.the@uky.edu`
- [ ] Resize browser below 768px → grid view replaces map, "+ Add your idea" full-width
- [ ] Open intake drawer on mobile → slides up from the bottom
- [ ] Click an idea card on mobile → detail panel slides up from the bottom
- [ ] Empty state: temporarily mark all rows rejected → page shows "No ideas yet — be the first" that opens the drawer
- [ ] Error state: set `NEXT_PUBLIC_SUPABASE_URL` to an invalid value, reload → red error banner with retry hint
- [ ] Realtime: open two browser windows, submit in one → new node appears in the other within ~2s

- [ ] **Step 3: Run RLS smoke tests via the Supabase SQL editor**

Paste the verification block from `docs/supabase/README.md` into the SQL editor and confirm each statement behaves as documented.

- [ ] **Step 4: Final build + push**

```bash
npm run build
```

Expected: build succeeds, `out/ideas/index.html` exists.

When ready to publish:

```bash
git push
```

(Don't push without confirming with the user first.)
