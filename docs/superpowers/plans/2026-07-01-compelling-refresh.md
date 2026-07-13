# Homepage Live-Refresh & Site Compellingness Implementation Plan

> **For agentic workers (Codex):** Execute this plan task-by-task, in order. Steps use checkbox (`- [ ]`) syntax — check them off as you complete them. Each task ends in a commit; never batch multiple tasks into one commit. If a step's verification fails, stop and fix before moving on.

**Goal:** Make aiincubator.uky.edu feel alive and evidence-led — live session data in the hero, receipts (funding/partners/outcomes) on the homepage, buried pages surfaced in the nav, staleness indicators re-tuned, tighter vertical rhythm, social share cards, an /ideas fallback, and light motion/theme polish.

**Architecture:** Next.js 15 App Router site where ALL mutable content lives in `content/site.ts` and pure derivation helpers live in `lib/derive.ts`. Pages are server components; anything time-dependent (countdown, next-session label) is a small client component that renders a placeholder pre-mount to avoid hydration mismatch. All styling is plain CSS in `app/globals.css` using CSS custom-property tokens — **no Tailwind, no CSS modules, no inline `<style>`**.

**Tech Stack:** Next.js 15.5 (App Router), React 19, TypeScript strict, vitest (node env), plain CSS with design tokens, Vercel deploy from `master`.

---

## Context you must read first

1. `README.md` — repo overview, content schema, deploy notes.
2. `reference/README.md` — the design brief. Fidelity rules, tokens, and the "honesty contract" (new projects must *look* new; never dress up kickoff work as mature work).
3. `content/site.ts` — the single content source. **Never invent content.** You may reformat/re-derive what's there; you may not add log entries, quotes, outcomes, or project claims that a human didn't supply.
4. `app/globals.css` lines 1–110 — the token set (`--bg`, `--ink-*`, `--line`, `--accent`, `--d` density multiplier, `--ease`).

House rules (from the repo owner's conventions):

- TypeScript strict; no `any`. Prefer `const`. No unnecessary abstractions.
- Conventional-ish commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`. Commit directly to `master` (solo repo). Do **not** push unless asked.
- Don't add docstrings/comments to code you didn't change. Match the existing comment density (this codebase comments module headers and non-obvious constraints only).
- CSS: append new component blocks at the end of `app/globals.css` with a `/* ── Section name ─── */` header comment, matching the existing style.

Environment notes:

- Commands below assume the repo root as CWD. The path contains spaces — always quote it.
- `npm run dev` runs a changelog script (needs `git` available) then `next dev` on port 3000.
- `.env.local` may lack `DATABASE_URL`/Supabase vars locally. The site must still build and render without them (the /ideas fallback task depends on this).

---

## Task 0: Baseline

**Files:** none (verification only)

- [ ] **Step 1: Install and verify the toolchain**

Run:
```bash
npm install
npm test
npx tsc --noEmit
```
Expected: install succeeds; vitest suite passes (route + lib tests); tsc reports no errors. If `npm test` fails on a pre-existing test, record which and continue — but do not break it further.

- [ ] **Step 2: Verify the site builds**

Run:
```bash
npm run build
```
Expected: `next build` completes. A console warning about missing Supabase env vars is normal and fine.

- [ ] **Step 3: No commit** (nothing changed).

---

## Task 1: Re-tune staleness thresholds (TDD)

The public /projects board currently shows red `STALE 47–60d` on every project because thresholds are `warn: 8, alert: 15` days — tuned for an internal dashboard, hostile on a public site. Re-tune and soften the copy.

**Files:**
- Create: `lib/derive.test.ts`
- Modify: `lib/derive.ts` (the `STALENESS_RULES` const and `stalenessLabel` function, currently near lines 173–219)

- [ ] **Step 1: Write the failing test**

Create `lib/derive.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { stalenessLabel } from "@/lib/derive";

const NOW = new Date("2026-07-01T12:00:00");

function daysAgo(n: number): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

describe("stalenessLabel", () => {
  it("shows a muted day-count for fresh active projects", () => {
    expect(stalenessLabel(daysAgo(5), "active", NOW)).toEqual({
      text: "5d",
      level: "muted",
    });
  });

  it("stays muted for active projects under 21 days", () => {
    expect(stalenessLabel(daysAgo(20), "active", NOW).level).toBe("muted");
  });

  it("warns with 'quiet' at 21 days for active projects", () => {
    expect(stalenessLabel(daysAgo(21), "active", NOW)).toEqual({
      text: "quiet 21d",
      level: "warn",
    });
  });

  it("alerts with 'stale' at 45 days for active projects", () => {
    expect(stalenessLabel(daysAgo(45), "building", NOW)).toEqual({
      text: "stale 45d",
      level: "alert",
    });
  });

  it("warns kickoff projects at 14 days and alerts at 30", () => {
    expect(stalenessLabel(daysAgo(14), "kickoff", NOW).level).toBe("warn");
    expect(stalenessLabel(daysAgo(30), "kickoff", NOW).level).toBe("alert");
  });

  it("always labels paused projects 'paused'", () => {
    expect(stalenessLabel(daysAgo(200), "paused", NOW)).toEqual({
      text: "paused",
      level: "paused",
    });
  });

  it("treats future dates as zero days", () => {
    expect(stalenessLabel(daysAgo(-3), "active", NOW)).toEqual({
      text: "0d",
      level: "muted",
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/derive.test.ts`
Expected: FAIL — the 21d case returns `{ text: "STALE 21d", level: "alert" }` under the current 8/15 rules.

- [ ] **Step 3: Update the rules and label copy**

In `lib/derive.ts`, replace the `STALENESS_RULES` const and the tail of `stalenessLabel` (leave `daysSince` and everything else untouched):

```ts
/** Staleness thresholds. Adjust here if the cadence changes. */
const STALENESS_RULES: Record<
  ProjectStatus,
  { warn: number; alert: number } | null
> = {
  active:   { warn: 21, alert: 45 },
  building: { warn: 21, alert: 45 },
  kickoff:  { warn: 14, alert: 30 },
  paused:   null,
};
```

and in `stalenessLabel`, replace the two threshold returns:

```ts
  const d = daysSince(updated, now);
  if (d >= rules.alert) return { text: `stale ${d}d`, level: "alert" };
  if (d >= rules.warn)  return { text: `quiet ${d}d`, level: "warn" };
  return { text: `${d}d`, level: "muted" };
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/derive.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Run the whole suite and typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: everything green. (`ProjectCard.tsx` consumes `stale.text`/`stale.level` generically — no component change needed; the CSS classes `stale-warn`/`stale-alert` in `app/globals.css:1607-1610` already style both levels.)

- [ ] **Step 6: Commit**

```bash
git add lib/derive.ts lib/derive.test.ts
git commit -m "feat: soften project staleness thresholds and copy for the public board"
```

---

## Task 2: Stats module (TDD)

Compute homepage marquee numbers from `content/site.ts` so they can never drift from reality.

**Files:**
- Create: `lib/stats.ts`
- Create: `lib/stats.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/stats.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { SiteContent } from "@/content/site";
import { buildHeroStats, fmtDollars, parseDollars } from "@/lib/stats";

function mkContent(overrides: Partial<SiteContent>): SiteContent {
  return {
    lastUpdated: "2026-06-01",
    cohort: "Cohort 03 · Spring 2026",
    session: {
      dayOfWeek: 5,
      hour: 12,
      minute: 0,
      venue: "Microsoft Teams",
      teamsUrl: "#",
      agenda: [],
    },
    projects: [],
    log: [],
    leads: [],
    actions: [],
    blockers: [],
    decisions: [],
    outcomes: [],
    partners: [],
    artifacts: [],
    meetings: [],
    ...overrides,
  };
}

const proj = (id: string, status: SiteContent["projects"][number]["status"]) => ({
  id,
  name: id,
  status,
  stage: "x",
  area: "x",
  leads: "x",
  summary: "x",
  updated: "2026-06-01",
});

describe("parseDollars", () => {
  it("parses $475K", () => expect(parseDollars("$475K")).toBe(475_000));
  it("parses $1.2M", () => expect(parseDollars("$1.2M")).toBe(1_200_000));
  it("parses bare dollars", () => expect(parseDollars("$900")).toBe(900));
  it("returns 0 for non-dollar text", () =>
    expect(parseDollars("300+ sessions")).toBe(0));
  it("returns 0 for undefined", () => expect(parseDollars(undefined)).toBe(0));
});

describe("fmtDollars", () => {
  it("formats thousands", () => expect(fmtDollars(475_000)).toBe("$475K"));
  it("formats millions", () => expect(fmtDollars(1_200_000)).toBe("$1.2M"));
  it("formats whole millions without decimals", () =>
    expect(fmtDollars(2_000_000)).toBe("$2M"));
});

describe("buildHeroStats", () => {
  it("sums grant outcomes, counts in-motion projects and partners, and formats the cadence", () => {
    const content = mkContent({
      outcomes: [
        { id: "g1", kind: "grant", title: "g1", value: "$475K", date: "2026-04-13" },
        { id: "g2", kind: "grant", title: "g2", value: "$25K", date: "2026-05-01" },
        { id: "p1", kind: "product", title: "p1", value: "300+ sessions", date: "2026-05-10" },
      ],
      projects: [
        proj("a", "active"),
        proj("b", "building"),
        proj("c", "kickoff"),
        proj("d", "paused"),
      ],
      partners: [
        { id: "x", name: "X", role: "Funder" },
        { id: "y", name: "Y", role: "Data partner" },
      ],
    });
    expect(buildHeroStats(content)).toEqual([
      { value: "$500K", label: "in funded work" },
      { value: "3", label: "projects in motion" },
      { value: "2", label: "institutional partners" },
      { value: "Fridays", label: "12:00 pm · Microsoft Teams" },
    ]);
  });

  it("omits the funding stat when no grants parse", () => {
    const content = mkContent({ projects: [proj("a", "active")] });
    const labels = buildHeroStats(content).map((s) => s.label);
    expect(labels).not.toContain("in funded work");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/stats.test.ts`
Expected: FAIL — `Cannot find module '@/lib/stats'` (or equivalent).

- [ ] **Step 3: Implement `lib/stats.ts`**

```ts
import type { SiteContent } from "@/content/site";

export interface HeroStat {
  value: string;
  label: string;
}

const DAY_NAMES = [
  "Sundays",
  "Mondays",
  "Tuesdays",
  "Wednesdays",
  "Thursdays",
  "Fridays",
  "Saturdays",
];

/** Parse a free-text outcome value like "$475K" or "$1.2M" into dollars. */
export function parseDollars(value: string | undefined): number {
  if (!value) return 0;
  const m = value.trim().match(/^\$(\d+(?:\.\d+)?)\s*([KM])?$/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const suffix = m[2]?.toUpperCase();
  const mult = suffix === "M" ? 1_000_000 : suffix === "K" ? 1_000 : 1;
  return Math.round(n * mult);
}

export function fmtDollars(total: number): string {
  if (total >= 1_000_000) {
    const millions = total / 1_000_000;
    return `$${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`;
  }
  if (total >= 1_000) return `$${Math.round(total / 1_000)}K`;
  return `$${total}`;
}

/** Homepage marquee numbers, derived so they can never drift from content. */
export function buildHeroStats(content: SiteContent): HeroStat[] {
  const funded = content.outcomes
    .filter((o) => o.kind === "grant")
    .reduce((sum, o) => sum + parseDollars(o.value), 0);
  const inMotion = content.projects.filter(
    (p) => p.status === "active" || p.status === "building" || p.status === "kickoff"
  ).length;
  const partners = content.partners.length;

  const { dayOfWeek, hour, minute, venue } = content.session;
  const h12 = ((hour + 11) % 12) + 1;
  const ampm = hour >= 12 ? "pm" : "am";
  const cadence = `${h12}:${String(minute).padStart(2, "0")} ${ampm} · ${venue}`;

  const stats: HeroStat[] = [];
  if (funded > 0) stats.push({ value: fmtDollars(funded), label: "in funded work" });
  stats.push({ value: String(inMotion), label: "projects in motion" });
  if (partners > 0)
    stats.push({ value: String(partners), label: "institutional partners" });
  stats.push({ value: DAY_NAMES[dayOfWeek], label: cadence });
  return stats;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/stats.test.ts`
Expected: PASS (10 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/stats.ts lib/stats.test.ts
git commit -m "feat: derive homepage hero stats from site content"
```

---

## Task 3: Hero copy fix, smaller hero logo, quote card → latest-outcome card

Three hero problems: the forced `<br />` strands "UK." alone on its own line; the full-size varsity logo appears twice in the first viewport (nav + hero) and competes with the display type; the anonymous quote ("Incubator participant") reads as filler on a site whose brand is honesty. Replace the quote with the latest *real* outcome.

**Files:**
- Modify: `app/page.tsx` (the `<h1>` near line 84; the `quote-card` block near lines 140–147; imports at top)
- Modify: `app/globals.css` (`.hero-logo` block near lines 392–397; append one new CSS block at end of file)

- [ ] **Step 1: Fix the headline**

In `app/page.tsx`, replace:

```tsx
            <h1 className="h-display">
              Build real AI in <br />
              <em>every corner of UK</em>.
            </h1>
```

with:

```tsx
            <h1 className="h-display">
              Build real AI in <em>every corner of UK</em>.
            </h1>
```

- [ ] **Step 2: Shrink the hero logo**

In `app/globals.css`, change the `.hero-logo` rule from:

```css
.hero-logo {
  display: block;
  width: clamp(240px, 30vw, 400px);
  height: auto;
  margin-bottom: calc(30px * var(--d));
}
```

to:

```css
.hero-logo {
  display: block;
  width: clamp(180px, 20vw, 280px);
  height: auto;
  margin-bottom: calc(24px * var(--d));
}
```

- [ ] **Step 3: Replace the quote card with the latest outcome**

In `app/page.tsx`, add imports at the top (merging with the existing import block):

```tsx
import { fmtIsoDate } from "@/lib/session";
```

Inside `HomePage()`, before the `return`, add:

```tsx
  const latestOutcome = [...content.outcomes].sort((a, b) =>
    a.date < b.date ? 1 : -1
  )[0];
```

Replace the quote-card block:

```tsx
            <div className="quote-card">
              <p>
                “I came with a half-formed idea and left with a team, a next
                step, and a reason to keep building.”
              </p>
              <span>Incubator participant</span>
            </div>
```

with:

```tsx
            {latestOutcome && (
              <a className="quote-card outcome-card" href="/outcomes">
                <span className="outcome-kind mono">
                  Latest outcome · {fmtIsoDate(latestOutcome.date)}
                </span>
                <p>
                  {latestOutcome.title}
                  {latestOutcome.value ? ` — ${latestOutcome.value}` : ""}
                </p>
                <span>All outcomes →</span>
              </a>
            )}
```

- [ ] **Step 4: Add the outcome-card CSS**

Append at the end of `app/globals.css`:

```css
/* ── Hero latest-outcome card ───────────────────────────── */
.outcome-card {
  display: block;
  transition: border-color 0.18s var(--ease);
}
.outcome-card:hover { border-color: var(--accent); }
.outcome-card .outcome-kind {
  display: block;
  margin-bottom: 8px;
  color: var(--accent);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
```

(The base `.quote-card` styles — border, radius, padding, and the mono uppercase footer `span` — already exist in `app/globals.css` around lines 553–573 and are reused as-is.)

- [ ] **Step 5: Verify**

Run: `npm run dev` (leave running for later tasks), then:
```bash
curl -s http://localhost:3000/ | grep -c "Latest outcome"
curl -s http://localhost:3000/ | grep -c "Incubator participant"
```
Expected: `1` then `0`. Also confirm no `<br` remains inside the h-display h1: `curl -s http://localhost:3000/ | grep -o 'Build real AI in'` → one match.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat: natural hero headline wrap, smaller hero logo, real latest-outcome card"
```

---

## Task 4: Live session panel in the hero

The hero's right-hand "LIVE PROJECT STUDIO" window currently shows three static steps (which duplicate the "How it works" section) plus a static "outputs" card. Replace its contents with the *actual* live data: next session + countdown + Teams link, this week's agenda, latest activity. All the derivation helpers already exist.

**Files:**
- Modify: `app/page.tsx` (the `<aside className="hero-proof">` block, lines ~105–147 pre-Task-3; imports)
- Modify: `app/globals.css` (append `.proof-live` block; delete the now-unused `.proof-flow`, `.proof-output`, `.proof-stack`, `.proof-project` rules at lines ~469–552)

- [ ] **Step 1: Update imports and derive data**

In `app/page.tsx` add to the imports (`fmtIsoDate` was added in Task 3 — if it is not present yet, add it now):

```tsx
import Countdown from "@/components/Countdown";
import SessionWhen from "@/components/SessionWhen";
import { deriveActivityLog, deriveAgenda } from "@/lib/derive";
import { fmtIsoDate } from "@/lib/session";
```

Inside `HomePage()`, next to the `latestOutcome` line from Task 3, add:

```tsx
  const agenda = deriveAgenda(content).slice(0, 4);
  const recent = deriveActivityLog(content).slice(0, 3);
```

- [ ] **Step 2: Replace the proof-window contents**

Replace the entire `<div className="proof-window">…</div>` block (from `<div className="proof-window">` through the close of `proof-output`'s parent) with:

```tsx
            <div className="proof-window">
              <div className="proof-window-head">
                <span className="proof-light" />
                <span>Next session</span>
              </div>
              <div className="proof-live">
                <div className="proof-when">
                  <strong>
                    <SessionWhen variant="when" />
                  </strong>
                  <span className="mono">
                    {content.session.venue} · <Countdown variant="compact" />
                  </span>
                </div>
                <a href={content.session.teamsUrl} className="btn primary sm">
                  Join in Teams <span className="arrow">→</span>
                </a>
                <div className="proof-agenda">
                  <span className="proof-label mono">On the agenda</span>
                  <ul>
                    {agenda.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="proof-activity">
                  <span className="proof-label mono">Latest activity</span>
                  <ul>
                    {recent.map((e) => (
                      <li key={e.id}>
                        <span className="mono">{fmtIsoDate(e.date)}</span> {e.note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
```

Also update the aside's aria-label from `"AI Incubator project studio snapshot"` to `"Next Friday session — live details"`.

Keep the `latestOutcome` card (Task 3) as the aside's second child.

- [ ] **Step 3: Swap the CSS**

In `app/globals.css`, delete the `.proof-flow`, `.proof-flow div`, `.proof-flow span`, `.proof-flow strong`, `.proof-flow small, .proof-project small`, `.proof-output`, `.proof-output span`, `.proof-output p`, `.proof-stack`, `.proof-project`, `.proof-project span`, and `.proof-project strong` rules (the contiguous block at ~lines 469–552). Keep `.proof-window`, `.proof-window::before`, `.proof-window-head`, and `.proof-light`.

Append at the end of the file:

```css
/* ── Hero live session panel ────────────────────────────── */
.proof-live {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 28px;
}
.proof-when { display: flex; flex-direction: column; gap: 6px; }
.proof-when strong {
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.proof-when .mono { font-size: 12px; color: var(--ink-3); }
.proof-live .btn { align-self: flex-start; }
.proof-label {
  display: block;
  margin-bottom: 8px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-3);
}
.proof-agenda ul,
.proof-activity ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.proof-agenda li {
  position: relative;
  padding-left: 16px;
  font-size: 14px;
  color: var(--ink-2);
}
.proof-agenda li::before {
  content: '—';
  position: absolute;
  left: 0;
  color: var(--accent);
}
.proof-activity li { font-size: 13px; line-height: 1.45; color: var(--ink-2); }
.proof-activity li .mono {
  margin-right: 8px;
  font-size: 11px;
  color: var(--ink-3);
}
```

- [ ] **Step 4: Verify**

With the dev server running:
```bash
curl -s http://localhost:3000/ | grep -c "On the agenda"
curl -s http://localhost:3000/ | grep -c "Latest activity"
curl -s http://localhost:3000/ | grep -c "proof-flow"
```
Expected: `1`, `1`, `0`. In a browser, confirm the countdown ticks (it renders `—` for one frame pre-hydration — that is by design) and the Teams button links to the real meeting URL.

Run: `npx tsc --noEmit` — expected clean.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat: replace static hero proof window with live session panel"
```

---

## Task 5: Stats strip under the hero

**Files:**
- Create: `components/StatsStrip.tsx`
- Modify: `app/page.tsx` (insert after `</header>`)
- Modify: `app/globals.css` (append block)

- [ ] **Step 1: Create the component**

`components/StatsStrip.tsx`:

```tsx
import { content } from "@/content/site";
import { buildHeroStats } from "@/lib/stats";

export default function StatsStrip() {
  const stats = buildHeroStats(content);
  return (
    <section className="stats-strip container" aria-label="Group at a glance">
      {stats.map((s) => (
        <div className="stat" key={s.label}>
          <span className="stat-value">{s.value}</span>
          <span className="stat-label mono">{s.label}</span>
        </div>
      ))}
    </section>
  );
}
```

- [ ] **Step 2: Mount it**

In `app/page.tsx`, add `import StatsStrip from "@/components/StatsStrip";` and insert `<StatsStrip />` on its own line immediately after the closing `</header>` tag and before the `campus-strip` section.

- [ ] **Step 3: Add the CSS**

Append to `app/globals.css`:

```css
/* ── Stats strip (homepage) ─────────────────────────────── */
.stats-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding-top: 8px;
  padding-bottom: 44px;
}
.stats-strip .stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 18px;
  border-left: 1px solid var(--line-2);
}
.stats-strip .stat-value {
  font-size: clamp(26px, 3vw, 38px);
  font-weight: 500;
  letter-spacing: -0.025em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.stats-strip .stat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-3);
}
@media (max-width: 900px) {
  .stats-strip { grid-template-columns: repeat(2, 1fr); row-gap: 28px; }
}
```

- [ ] **Step 4: Verify**

```bash
curl -s http://localhost:3000/ | grep -c "in funded work"
curl -s http://localhost:3000/ | grep -o '\$475K' | head -1
```
Expected: `1` and `$475K` (from the one CHFS grant in content).

- [ ] **Step 5: Commit**

```bash
git add components/StatsStrip.tsx app/page.tsx app/globals.css
git commit -m "feat: derived stats strip under the homepage hero"
```

---

## Task 6: Partners strip on the homepage

`components/PartnersStrip.tsx` already exists and renders `content.partners` (CHFS, KCR, Markey, UKCOM) — but it is mounted nowhere and its CSS classes were never written.

**Files:**
- Modify: `app/page.tsx` (insert after the featured-builds `</section>`)
- Modify: `app/globals.css` (append block)

- [ ] **Step 1: Mount it**

In `app/page.tsx`, add `import PartnersStrip from "@/components/PartnersStrip";` and insert `<PartnersStrip />` immediately after the closing `</section>` of the `id="projects"` featured-builds section (before the "How it works" section).

- [ ] **Step 2: Add the CSS**

Append to `app/globals.css`:

```css
/* ── Partners strip ─────────────────────────────────────── */
.partners-strip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px 48px;
  padding-top: 30px;
  padding-bottom: 30px;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.partners-strip .section-label { margin: 0; }
.partners-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 48px;
}
.partner-item { display: flex; flex-direction: column; gap: 3px; }
.partner-name {
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.01em;
}
.partner-role {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-3);
}
```

- [ ] **Step 3: Verify**

```bash
curl -s http://localhost:3000/ | grep -c "Kentucky Cancer Registry"
```
Expected: `1`.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat: mount partners strip on homepage with styling"
```

---

## Task 7: "Where we're stuck" teaser on the homepage

Surface the open-problems page — the most distinctive page on the site — with the two real active blockers. **Framing rule (repo convention): blockers describe what's needed, never who is holding things up.** The content schema already enforces this (`waitingOn` names processes/artifacts, not people) — do not editorialize beyond the data.

**Files:**
- Modify: `app/page.tsx` (new section between the join-routes section and `<CTABanner />`; imports)
- Modify: `app/globals.css` (append block)

- [ ] **Step 1: Add the section**

In `app/page.tsx`, extend the derive import to include `deriveActiveBlockers`:

```tsx
import { deriveActivityLog, deriveAgenda, deriveActiveBlockers } from "@/lib/derive";
```

Inside `HomePage()` add:

```tsx
  const blockers = deriveActiveBlockers(content).slice(0, 2);
  const projectName = (id: string) =>
    content.projects.find((p) => p.id === id)?.name ?? id;
```

Insert between the closing `</section>` of the `id="team"` join-routes section and `<CTABanner />`:

```tsx
      {blockers.length > 0 && (
        <section className="section container" id="stuck">
          <div className="section-head">
            <div>
              <div className="section-label">
                <span className="idx">04</span> <span>Where we&apos;re stuck</span>
              </div>
              <h2 className="h1" style={{ maxWidth: "20ch" }}>
                Public on purpose. Come unstick us.
              </h2>
            </div>
            <a href="/open-problems" className="btn ghost">
              All open problems <span className="arrow">→</span>
            </a>
          </div>
          <div className="stuck-list">
            {blockers.map((b) => (
              <div className="stuck-item" key={b.id}>
                <span className="mono stuck-project">{projectName(b.project)}</span>
                <p>{b.body}</p>
                {b.waitingOn && (
                  <span className="mono stuck-waiting">
                    Waiting on · {b.waitingOn}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
```

- [ ] **Step 2: Add the CSS**

Append to `app/globals.css` (the dashed border deliberately echoes the kickoff-card "honesty contract" visual):

```css
/* ── Stuck (homepage open-problems teaser) ──────────────── */
.stuck-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: calc(42px * var(--d));
}
.stuck-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px;
  border: 1px dashed var(--line-2);
  border-radius: 14px;
}
.stuck-item p { margin: 0; font-size: 16px; line-height: 1.45; }
.stuck-project {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent);
}
.stuck-waiting { font-size: 11px; color: var(--ink-3); }
@media (max-width: 900px) {
  .stuck-list { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Verify**

```bash
curl -s http://localhost:3000/ | grep -c "Come unstick us"
curl -s http://localhost:3000/ | grep -c "DSA stuck in KCR legal review"
```
Expected: `1`, `1`.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat: homepage teaser for open problems with active blockers"
```

---

## Task 8: Navigation and footer IA — unbury /outcomes, /built, /open-problems

**Files:**
- Modify: `components/Nav.tsx`
- Modify: `components/Footer.tsx` (Explore column, lines ~38–46)

- [ ] **Step 1: Update the nav links**

In `components/Nav.tsx`, replace the `nav-links` div contents:

```tsx
        <div className="nav-links">
          <Link href="/" className={cls("overview")}>Overview</Link>
          <Link href="/projects" className={cls("projects")}>Projects</Link>
          <Link href="/outcomes" className={cls("outcomes")}>Outcomes</Link>
          <Link href="/built" className={cls("built")}>Built</Link>
          <Link href="/ideas" className={cls("ideas")}>Ideas</Link>
          <Link href="/join" className={`btn primary sm ${active === "join" ? "active" : ""}`}>
            Join Friday <span className="arrow">→</span>
          </Link>
        </div>
```

(The `NavKey` union already contains `"outcomes"` and `"built"`; `app/outcomes/page.tsx` and `app/built/page.tsx` already pass `active="outcomes"` / `active="built"`. "Ways in" leaves the nav — it remains reachable via the homepage section and the footer.)

- [ ] **Step 2: Update the footer Explore column**

In `components/Footer.tsx`, replace the Explore `<ul>`:

```tsx
            <ul>
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/outcomes">Outcomes</Link></li>
              <li><Link href="/built">Built &amp; shipped</Link></li>
              <li><Link href="/open-problems">Open problems</Link></li>
              <li><Link href="/ideas">Ideas map</Link></li>
              <li><Link href="/changelog">Changelog</Link></li>
              <li><Link href="/join">Get involved</Link></li>
            </ul>
```

- [ ] **Step 3: Verify**

```bash
curl -s http://localhost:3000/ | grep -c 'href="/outcomes"'
```
Expected: at least `3` (nav + footer + hero outcome card). Click through Outcomes and Built in a browser — the active nav state should underline correctly on both pages.

- [ ] **Step 4: Commit**

```bash
git add components/Nav.tsx components/Footer.tsx
git commit -m "feat: surface outcomes, built, and open-problems in nav and footer"
```

---

## Task 9: Compress vertical rhythm

Full viewports of empty black currently separate sections (112px section padding stacked on a 100vh hero and 42–48px internal margins). Tighten globally.

**Files:**
- Modify: `app/globals.css` — four specific rules

- [ ] **Step 1: Make the edits**

1. In `:root` (line ~38): `--section-py: calc(112px * var(--d));` → `--section-py: calc(76px * var(--d));`
2. `.hero` (line ~369): replace `min-height: calc(100vh - 120px);` with `min-height: min(82vh, 880px);`
3. `.projects-hero` (line ~1138): `padding-top: 80px; padding-bottom: 60px;` → `padding-top: 56px; padding-bottom: 36px;`
4. `.join-hero` (line ~1200): `padding-top: calc(100px * var(--d)); padding-bottom: calc(60px * var(--d));` → `padding-top: calc(64px * var(--d)); padding-bottom: calc(36px * var(--d));`
5. `.ideas-hero` (line ~2256): `padding-top: 80px; padding-bottom: 40px;` → `padding-top: 56px; padding-bottom: 32px;`

- [ ] **Step 2: Verify visually**

Load `/`, `/projects`, `/join`, `/outcomes` in a browser at ~1300px width. Scroll each page top to bottom. Acceptance: no scroll position shows a viewport that is entirely empty background; each hero hands off to content within roughly one viewport.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: tighten vertical rhythm across heroes and sections"
```

---

## Task 10: Social share cards, icons, and metadata

There is currently no `og:image`/Twitter card (links pasted into Teams render as bare text) and the favicon is a 660KB PNG loaded via a manual `<link>`.

**Files:**
- Create: `app/opengraph-image.tsx`
- Create: `app/icon.tsx`
- Create: `app/apple-icon.tsx`
- Modify: `app/layout.tsx` (metadata + remove manual favicon link)

- [ ] **Step 1: Create `app/opengraph-image.tsx`**

```tsx
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "AI Incubator @ University of Kentucky — real AI builds, Fridays at noon";

export default async function OpengraphImage() {
  const logo = await readFile(
    join(process.cwd(), "public", "logo-mark-dark.png")
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          padding: 72,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={420}
          height={190}
          style={{ objectFit: "contain" }}
          alt=""
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              color: "#fafafa",
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            Build real AI in every corner of UK.
          </div>
          <div style={{ fontSize: 28, color: "#5b8cff" }}>
            Fridays at noon · Open to the entire campus · aiincubator.uky.edu
          </div>
        </div>
      </div>
    ),
    size
  );
}
```

- [ ] **Step 2: Create `app/icon.tsx`**

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0033A0",
          color: "#ffffff",
          borderRadius: 12,
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        AI
      </div>
    ),
    size
  );
}
```

- [ ] **Step 3: Create `app/apple-icon.tsx`**

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0033A0",
          color: "#ffffff",
          borderRadius: 36,
          fontSize: 84,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        AI
      </div>
    ),
    size
  );
}
```

- [ ] **Step 4: Update `app/layout.tsx`**

Replace the `metadata` export with:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://aiincubator.uky.edu"),
  title: "AI Incubator @ University of Kentucky",
  description:
    "A weekly AI project studio at the University of Kentucky where students, faculty, staff, researchers, and builders turn ideas into prototypes, studies, grants, and publications.",
  twitter: { card: "summary_large_image" },
};
```

Delete the manual favicon line from `<head>`:

```tsx
        <link rel="icon" type="image/png" href="/logo-mark.png" />
```

(The file-convention `app/icon.tsx` replaces it.)

- [ ] **Step 5: Verify**

Restart the dev server, then:
```bash
curl -s http://localhost:3000/ | grep -o 'property="og:image" content="[^"]*"'
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/opengraph-image
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/icon
curl -s http://localhost:3000/ | grep -o 'name="twitter:card" content="[^"]*"'
```
Expected: an `og:image` URL containing `/opengraph-image`; `200`; `200`; `summary_large_image`.

Run: `npm run build` — expected clean (og image is generated at build).

- [ ] **Step 6: Commit**

```bash
git add app/opengraph-image.tsx app/icon.tsx app/apple-icon.tsx app/layout.tsx
git commit -m "feat: og share card, generated favicons, twitter card metadata"
```

---

## Task 11: /ideas fallback when Supabase is not configured

Today `/ideas` renders a hero and then the single grey line "Ideas page is not configured yet (missing Supabase env vars)." — a nav-level dead end. Give the page a real floor built from existing content: kickoff open-calls and queued decisions, plus a pitch CTA. No fabricated ideas.

**Files:**
- Create: `components/IdeasFallback.tsx`
- Modify: `app/ideas/page.tsx`
- Modify: `app/globals.css` (append block)

- [ ] **Step 1: Create the fallback component**

`components/IdeasFallback.tsx`:

```tsx
import { content } from "@/content/site";
import { deriveDecisionsForSession, deriveOpenCalls } from "@/lib/derive";

/** Static floor for /ideas when the Supabase-backed idea map is not configured. */
export default function IdeasFallback() {
  const calls = deriveOpenCalls(content);
  const queued = deriveDecisionsForSession(content);
  return (
    <section
      className="container"
      style={{ paddingBottom: "calc(64px * var(--d))" }}
    >
      <div className="ideas-fallback">
        {calls.map((p) => (
          <a className="card hover idea-seed" href="/projects" key={p.id}>
            <span className="chip kick">Just kicked off</span>
            <strong>{p.name}</strong>
            <p>{p.open}</p>
          </a>
        ))}
        {queued.map((d) => (
          <div className="card idea-seed" key={d.id}>
            <span className="chip">Decision for Friday</span>
            <strong>{d.question}</strong>
          </div>
        ))}
        <a className="card hover idea-seed idea-seed-cta" href="/join#pitch">
          <span className="chip live">Open</span>
          <strong>Add yours</strong>
          <p>
            Pitch a seed of an idea — sixty seconds at a Friday meeting, or a
            structured one-pager any time.
          </p>
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Switch on configuration in the page**

In `app/ideas/page.tsx`, add the import:

```tsx
import IdeasFallback from "@/components/IdeasFallback";
```

Inside `IdeasPage()`, before the `return`:

```tsx
  const ideasConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
```

Replace the two surface divs:

```tsx
      <div className="ideas-surface-desktop">
        <IdeasMap />
      </div>
      <div className="ideas-surface-mobile">
        <IdeasGrid />
      </div>
```

with:

```tsx
      {ideasConfigured ? (
        <>
          <div className="ideas-surface-desktop">
            <IdeasMap />
          </div>
          <div className="ideas-surface-mobile">
            <IdeasGrid />
          </div>
        </>
      ) : (
        <IdeasFallback />
      )}
```

- [ ] **Step 3: Add the CSS**

Append to `app/globals.css`:

```css
/* ── Ideas fallback (no Supabase configured) ────────────── */
.ideas-fallback {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.idea-seed {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 22px;
}
.idea-seed strong {
  font-size: 19px;
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: 1.25;
}
.idea-seed p { margin: 0; font-size: 14px; color: var(--ink-2); }
.idea-seed .chip { align-self: flex-start; }
.idea-seed-cta { border-style: dashed; }
@media (max-width: 900px) {
  .ideas-fallback { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Verify**

With NO Supabase vars in `.env.local` (temporarily comment them out if present, restart dev server):
```bash
curl -s http://localhost:3000/ideas | grep -c "Add yours"
curl -s http://localhost:3000/ideas | grep -c "not configured"
```
Expected: `1`, `0`. Restore `.env.local` if you changed it, restart, and confirm the map renders again when vars are present.

- [ ] **Step 5: Commit**

```bash
git add components/IdeasFallback.tsx app/ideas/page.tsx app/globals.css
git commit -m "feat: static ideas fallback from open calls and queued decisions"
```

---

## Task 12: Scroll-reveal motion + featured-card hover

Subtle fade-up on the homepage grids, honoring `prefers-reduced-motion`, plus a hover state for featured-build cards (the /projects cards have one; the homepage cards don't).

**Files:**
- Create: `components/ScrollReveal.tsx`
- Modify: `app/page.tsx` (wrap four grids)
- Modify: `app/layout.tsx` (noscript safeguard)
- Modify: `app/globals.css` (append blocks)

- [ ] **Step 1: Create the component**

`components/ScrollReveal.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
}

/** Fades content up on first entry into the viewport. Respects prefers-reduced-motion. */
export default function ScrollReveal({ children }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("sr-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("sr-visible");
            io.disconnect();
          }
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="sr">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Wrap the homepage grids**

In `app/page.tsx`, add `import ScrollReveal from "@/components/ScrollReveal";` and wrap each of these four elements (the element itself, not its parent section):

1. `<div className="featured-builds">…</div>`
2. `<div className="steps">…</div>`
3. `<div className="join-routes">…</div>`
4. `<div className="stuck-list">…</div>`

each becoming:

```tsx
<ScrollReveal>
  <div className="featured-builds">…unchanged…</div>
</ScrollReveal>
```

- [ ] **Step 3: Noscript safeguard**

In `app/layout.tsx`, inside `<head>` after the theme script, add:

```tsx
        <noscript>
          <style>{`.sr { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
```

- [ ] **Step 4: Add the CSS**

Append to `app/globals.css`:

```css
/* ── Scroll reveal ──────────────────────────────────────── */
.sr {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.55s var(--ease), transform 0.55s var(--ease);
}
.sr-visible { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .sr { opacity: 1; transform: none; transition: none; }
}

/* ── Featured build hover ───────────────────────────────── */
.featured-build { transition: background 0.18s var(--ease); }
.featured-build:hover { background: var(--surface-2); }
.featured-build-open:hover {
  background:
    linear-gradient(180deg, color-mix(in oklab, var(--accent) 14%, transparent), transparent 46%),
    var(--ink);
}
```

- [ ] **Step 5: Verify**

In a browser: reload `/`, scroll down — grids fade up once and stay. With DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce" → reload: content appears instantly with no animation. Hover a featured card: background shifts to the elevated surface tone; the dark "Your campus problem" card deepens its blue wash.

- [ ] **Step 6: Commit**

```bash
git add components/ScrollReveal.tsx app/page.tsx app/layout.tsx app/globals.css
git commit -m "feat: scroll-reveal motion and featured-card hover states"
```

---

## Task 13: Theme toggle in the nav

The light theme is fully tokenized and the persistence layer (`localStorage["aiincubator.settings.v2"]` read by the init script in `app/layout.tsx`) already ships — there's just no control. Add a sun/moon button. Inline SVG only (this repo uses no icon library).

**Files:**
- Create: `components/ThemeToggle.tsx`
- Modify: `components/Nav.tsx`
- Modify: `app/globals.css` (append block)

- [ ] **Step 1: Create the component**

`components/ThemeToggle.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "aiincubator.settings.v2";

function readSettings(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light") setTheme("light");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...readSettings(), theme: next })
      );
    } catch {
      /* storage unavailable — theme still applies for this page view */
    }
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {theme === "light" ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Mount in the nav**

In `components/Nav.tsx`, add `import ThemeToggle from "./ThemeToggle";` and insert `<ThemeToggle />` inside the `nav-links` div, immediately before the Join Friday `<Link>`.

- [ ] **Step 3: Add the CSS**

Append to `app/globals.css`:

```css
/* ── Theme toggle ───────────────────────────────────────── */
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink-2);
  transition: all 0.15s var(--ease);
}
.theme-toggle:hover { border-color: var(--line-2); color: var(--ink); }
```

- [ ] **Step 4: Verify**

In a browser: click the toggle — page flips to the light theme (off-white `#fafaf7` background, UK blue `#0033A0` accents) and the nav logo swaps to the clean variant (the two-logo CSS swap at `app/globals.css` ~lines 399–407 handles this automatically). Reload — the choice persists. Toggle back to dark — persists. Check both themes on `/`, `/projects`, `/join` for any unreadable text.

- [ ] **Step 5: Commit**

```bash
git add components/ThemeToggle.tsx components/Nav.tsx app/globals.css
git commit -m "feat: sun/moon theme toggle wired to existing settings persistence"
```

---

## Task 14: Final verification sweep

**Files:** none (verification only)

- [ ] **Step 1: Full local CI**

Run:
```bash
npm test
npx tsc --noEmit
npm run build
```
Expected: all green.

- [ ] **Step 2: Manual QA checklist (browser, dev server)**

- `/` at ~1300px: hero shows live countdown ticking, real agenda, three activity rows; stats strip shows `$475K`; partners strip lists CHFS/KCR/Markey/UKCOM; sections numbered 01–04; no full-viewport dead zones while scrolling.
- `/` at 390px width: hero stacks cleanly; stats strip is 2×2; stuck list is single column.
- `/projects`: staleness chips read `quiet Nd` (amber) or `Nd` (muted) — red `stale` only if something truly exceeds 45d.
- `/outcomes`, `/built` reachable from the nav; active states underline.
- `/ideas` without Supabase vars: fallback grid with kickoff calls + decisions + "Add yours" card.
- Theme toggle works and persists on every page; both themes readable.
- View-source: `og:image`, `twitter:card`, and generated `/icon` present.

- [ ] **Step 3: Nothing to commit** — but if QA surfaced fixes, commit them as `fix:` commits before finishing.

---

## Human inputs required (NOT for the coding agent — do not fabricate any of these)

Hand this list back to the group lead:

1. **Refresh `content/site.ts`** — `log[]` entries, `session.agenda`, `meetings[]`, per-project `updated` dates, and `lastUpdated` are frozen at 2026-05-25. The staleness re-tune helps, but only real June/July updates make the site current. An LLM ingesting the Friday transcript may draft this patch, but a human approves it.
2. **Vercel env vars** — set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in production if the live idea map should render there (the new fallback covers the missing case gracefully either way).
3. **Optional: a real, named hero quote** — the fabricated anonymous quote was removed. If a member offers an attributable line ("M2, UKCOM" is enough), it can return as a second card under the outcome card.
4. **Confirm the production domain** — Task 10 hardcodes `https://aiincubator.uky.edu` as `metadataBase`. If the deploy URL differs, update it in `app/layout.tsx`.
