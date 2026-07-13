# PM Surface — Site sub-project 1

**Date:** 2026-05-25
**Status:** Approved, ready for implementation plan
**Author:** Group lead (via brainstorm w/ Claude)

## Goal

Make the AI Incubator landing page a working project-management surface for the group, without restructuring its layout.

The driving principle: **internal coordination utility creates the public aliveness signal.** A site the team actually uses (fresh timestamps, real blockers, live action items in the log) reads as alive to outsiders because it *is* alive — no manufactured indicators required.

## Scope

This spec covers **sub-project 1 of three**:

1. **Site PM surfaces** — schema additions + rendering changes that consume `content/site.ts` ← *this spec*
2. **Inbox writeback** — small Cloudflare Worker + GitHub Issues + build-time fetch, so team members can log actions/blockers/decisions between Fridays without opening a PR ← *future*
3. **Friday transcript agent** — LLM pipeline that emits a PR after each meeting, populating actions/blockers/decisions from the meeting transcript ← *future*

Sub-projects 2 and 3 write *into* the schema this spec defines. Sub-project 1 is sufficient on its own as long as updates continue to happen via direct PRs to `content/site.ts`.

## Non-goals

- No structural changes to the landing page sections, columns, or surface count
- No new aggregate stat strip, no "across projects" panel, no 4th column in the Right Now bar
- No per-project drill-down pages
- No graphical blocker visualization
- No real-time updates or websockets — the site remains a statically-built artifact

## Architecture

```
content/site.ts                            (canonical edit surface)
├── existing: session, projects[], log[], leads[]
└── NEW:
    ├── actions[]      ActionItem[]
    ├── blockers[]     Blocker[]
    └── decisions[]    Decision[]

lib/derive.ts                              (NEW — pure functions)
├── deriveActivityLog(content)  →  combined log
├── deriveAgenda(content)       →  manual agenda + queued decisions
└── stalenessLabel(updated, status)  →  '· 3d' | 'STALE 11d' | ''

components/
├── ProjectCard.tsx              (modified — staleness badge + hover actions)
├── RightNowBar.tsx              (modified — agenda uses derived list)
├── LogList.tsx                  (modified — uses derived log)
└── Footer.tsx                   (modified — link to GH history, curator line)

app/changelog/page.tsx           (NEW — git-log-driven page)
scripts/build-changelog.mjs      (NEW — runs at build time)
```

All rendering happens server-side at build time. Derived data is pure-functional over `content`.

## Data model

```ts
// content/site.ts

export type ActionStatus = "open" | "done" | "cancelled";

export interface ActionItem {
  id: string;                  // stable slug
  project: string;             // project id from projects[]
  owner: string;               // initials (matches Lead.initials) or freeform
  body: string;                // "Send DSA draft to KCR data POC"
  created: string;             // ISO date
  due?: string;                // ISO date
  status: ActionStatus;
  closedAt?: string;           // ISO date — required when status !== "open"
}

export interface Blocker {
  id: string;
  project: string;             // project id
  body: string;                // "Awaiting DSA review"
  blockedBy?: string;          // "KCR legal" — free text, optional
  created: string;
  resolved?: string;           // ISO date when no longer blocking
}

export type DecisionStatus = "queued" | "decided" | "cancelled";

export interface Decision {
  id: string;
  project?: string;            // optional — cross-cutting decisions have no project
  question: string;            // "Should we publish before IRB or after?"
  created: string;             // ISO date — when the decision was queued
  forSession: string;          // ISO date of the target Friday session
  status: DecisionStatus;
  outcome?: string;            // populated when status === "decided"
  decidedAt?: string;          // ISO date
}

export interface SiteContent {
  // existing fields unchanged...
  actions: ActionItem[];       // initial: []
  blockers: Blocker[];         // initial: []
  decisions: Decision[];       // initial: []
}
```

Initial migration: add the three arrays as empty in the existing `content` constant. Site continues to function identically until data is populated.

## Derived rendering

### Activity log derivation

Combines `content.log[]` (manual entries) with synthesized lifecycle entries from actions/blockers/decisions, newest first. Same `<LogList>` component, same row shape.

**Synthesis rules:**

| Source                                    | Date used  | Project       | Note text                                    |
|-------------------------------------------|------------|---------------|----------------------------------------------|
| `action` opened (created)                 | `created`  | `project`     | `Action: [owner] — [body]` + due if present  |
| `action` closed (status: done, closedAt)  | `closedAt` | `project`     | `Done: [body]`                               |
| `action` cancelled                        | `closedAt` | `project`     | `Cancelled: [body]`                          |
| `blocker` opened (created)                | `created`  | `project`     | `Blocker: [body]` + blockedBy if present     |
| `blocker` resolved                        | `resolved` | `project`     | `Unblocked: [body]`                          |
| `decision` queued                         | `created`  | `project` or `—` | `For Friday: [question]`                 |
| `decision` decided                        | `decidedAt`| `project`     | `Decided: [outcome]`                         |

Manual `log[]` entries always pass through unmodified. Derived entries do **not** persist into `log[]`; they're computed at build time so the source-of-truth is always the action/blocker/decision records.

### Right Now bar agenda merge

Replaces the current `session.agenda[]` consumption with:

```ts
const upcomingFriday = nextSession();     // existing helper
const queuedDecisions = content.decisions.filter(d =>
  d.status === "queued" &&
  sameDay(parseISO(d.forSession), upcomingFriday)
);
const agendaItems = [
  ...content.session.agenda,
  ...queuedDecisions.map(d => `Decision: ${d.question}`),
];
```

Same column, same bulleted rendering.

### Project card hover reveal — open actions

Inside the existing `.reveal` dark panel, below the summary block, add a small section when the project has open actions:

```tsx
{openActions.length > 0 && (
  <div className="reveal-actions">
    <div className="reveal-actions-label mono">Open actions</div>
    <ul>
      {openActions.map(a => (
        <li key={a.id}>— {a.body} <span className="mono">{a.owner}</span></li>
      ))}
    </ul>
  </div>
)}
```

Same hover trigger, same dark panel, same transition. Pure content addition inside the existing surface.

### Project card staleness badge

Added to the existing `.top` strip, beside the area label. Borderline-layout change (approved, ~12 px in an existing element).

```tsx
<div className="top">
  <StatusChip project={p} />
  <span className="area mono">
    {p.area} · {stalenessLabel(p.updated, p.status)}
  </span>
</div>
```

`stalenessLabel(updated, status)` rules:

| Project status   | Days since `updated` | Output      | Visual            |
|------------------|----------------------|-------------|-------------------|
| `paused`         | any                  | `paused`    | ink-3 (muted)     |
| `kickoff`        | 0–6                  | `Nd`        | ink-3             |
| `kickoff`        | 7–13                 | `STALE Nd`  | amber             |
| `kickoff`        | 14+                  | `STALE Nd`  | red               |
| `active`/`build` | 0–7                  | `Nd`        | ink-3             |
| `active`/`build` | 8–14                 | `STALE Nd`  | amber             |
| `active`/`build` | 15+                  | `STALE Nd`  | red               |

Thresholds adjustable in `lib/derive.ts`. Color values use existing CSS tokens (`--ink-3`, plus two new `--warn` and `--alert` aligned to the existing accent palette).

## Aliveness affordances

These are content-only or attribute-only additions to existing elements:

1. **Footer "last updated" link** — wrap the existing date span in an `<a>` pointing at the GitHub commits view for `content/site.ts`. No new pixels.
2. **Footer curator line** — add `Last curated by the group lead · [date]` immediately below the existing footer-bottom row. Single new content line.
3. **Footer changelog link** (optional, discoverable) — small link in the existing Explore column: `Changelog →`.

## `/changelog` page

New route, doesn't touch the landing.

**Build step** (`scripts/build-changelog.mjs`):
- Runs `git log --pretty=format:'%H|%aI|%an|%s' -- content/site.ts`
- Parses into commits
- Groups by ISO week (Mon–Sun)
- Writes `app/changelog/data.json` consumed by the page at build time

**Page** (`app/changelog/page.tsx`):
- Header: "Changelog"
- One section per week, newest first: `Week of May 18 — May 24, 2026`
- Each commit as a row: date · author · message
- Mono-style consistent with the activity log

**Failure mode:** if `git log` fails (shallow clone, missing history), the build script writes an empty `data.json` and the page renders a "no history available yet" message. Build doesn't fail.

## Error handling

- **Schema validation:** runtime type narrowing where data is consumed. No runtime validator added — invalid data shows up as a TypeScript error at build time.
- **Missing references:** action/blocker/decision with a `project` id that doesn't match any project — the derived log entry still renders, but the project is omitted from the row. No build failure.
- **Date parsing:** all dates use existing `fmtIsoDate` helper. Malformed dates render as `—`.
- **Empty collections:** when `actions`/`blockers`/`decisions` are all empty, the site behaves identically to today — no PM-specific content appears.
- **Stale project staleness label:** computed from `updated` field; if missing, treated as `0d`.

## Testing

No new test framework. Validation matches the existing build pipeline:

1. `npx tsc --noEmit` — schema additions type-check.
2. `npm run build` — static export succeeds with seeded test data in `content/site.ts`.
3. Manual visual sweep: confirm landing page resting layout is unchanged with empty arrays; confirm derived entries appear in log / agenda / hover when data is populated; confirm `/changelog` renders.
4. (Optional) snapshot test on `deriveActivityLog` output for a sample content.

## Implementation order

1. Add type definitions + empty arrays in `content/site.ts`.
2. Build `lib/derive.ts` with the three pure functions.
3. Update `LogList`, `RightNowBar`, `ProjectCard`, `Footer` to consume derived data.
4. Add staleness label rendering.
5. Build the `/changelog` page + `scripts/build-changelog.mjs`.
6. Wire `build-changelog.mjs` into the build script (run before `next build`).
7. Seed `content/site.ts` with a small set of actions/blockers/decisions reflecting current state, so the page reads alive immediately.
8. Visual sweep at light + dark, mobile + desktop.

## Open questions deferred to future sub-projects

- **How items get into the system between Fridays** — sub-project 2 (inbox writeback)
- **How meeting transcripts populate items** — sub-project 3 (transcript agent)
- **Whether `/pm` operator-only dashboard is worth building** — defer; revisit if landing density proves insufficient once schema is populated

## Acceptance criteria

- [ ] Type definitions added; site builds with empty arrays.
- [ ] `lib/derive.ts` exports `deriveActivityLog`, `deriveAgenda`, `stalenessLabel`.
- [ ] Activity log section renders manual + derived entries, newest first.
- [ ] Right Now bar agenda includes open decisions for the upcoming Friday.
- [ ] Project card hover reveal includes open actions when present.
- [ ] Project card top strip shows staleness label.
- [ ] Footer "last updated" links to GitHub commits view.
- [ ] Footer includes "Last curated by the group lead · [date]" line.
- [ ] `/changelog` page exists, week-grouped, generated from `git log`.
- [ ] Seeded test data demonstrates all surfaces working.
- [ ] All builds clean; no regressions in dark mode, light mode, mobile, or desktop.
