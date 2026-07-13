# Session calendar — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the Friday meeting schedule on the homepage. Show the next 8 Fridays with topic chips (pitch / demo / presentation / roundtable / open / canceled), and let visitors download `.ics` files to add sessions to their personal calendars.

**Architecture:** Static-only. New `MeetingSession` records live in `content/site.ts`. Pure helpers in a new `lib/calendar.ts` compute upcoming Fridays and serialize RFC 5545 `.ics` strings. A server component renders the section; two tiny client islands handle button clicks for `.ics` downloads. No API routes, no new dependencies.

**Tech Stack:** Next.js 15.1 (static export, `output: 'export'`), React 19 server components + small client islands, plain CSS in `app/globals.css`, RFC 5545 hand-rolled in TypeScript.

**Note on verification:** This repo has no test runner (no vitest/jest in `package.json`). Verification per task uses `npx tsc --noEmit` for types and `npm run build` for the full pipeline. `.ics` correctness is verified end-to-end by importing the downloaded file into Google Calendar in the final task.

**Spec:** [`docs/superpowers/specs/2026-05-26-session-calendar-design.md`](../specs/2026-05-26-session-calendar-design.md)

---

## Task 1: Add `SessionKind`, `MeetingSession`, and seed data to `content/site.ts`

**Files:**
- Modify: `content/site.ts`

- [ ] **Step 1: Add the new type exports near the other type exports**

In `content/site.ts`, after the existing `Decision` interface (around line 111), add:

```ts
export type SessionKind =
  | "pitch"
  | "demo"
  | "presentation"
  | "roundtable"
  | "open"
  | "canceled";

export interface MeetingSession {
  /** ISO Friday date, e.g. "2026-05-29". */
  date: string;
  kind: SessionKind;
  /** Short headline. */
  title: string;
  /** 1–2 sentence summary. */
  blurb?: string;
  /** Freeform presenters line, e.g. "Bernard · Bailey". */
  presenters?: string;
  /** Optional link to projects[] by id. */
  projectId?: string;
}
```

- [ ] **Step 2: Add `meetings` to the `SiteContent` interface**

Edit the `SiteContent` interface (around line 113). Add `meetings: MeetingSession[];` as the last field:

```ts
export interface SiteContent {
  lastUpdated: string;
  cohort: string;
  session: Session;
  projects: Project[];
  log: LogEntry[];
  leads: Lead[];
  actions: ActionItem[];
  blockers: Blocker[];
  decisions: Decision[];
  meetings: MeetingSession[];
}
```

- [ ] **Step 3: Add the `meetings` initializer with seed data**

At the bottom of the `content` object literal (after `decisions: [...]`, before the closing `};`), add:

```ts
  meetings: [
    {
      date: "2026-05-29",
      kind: "pitch",
      title: "DROME — initial scope",
      blurb: "Bernard & Bailey on EMS workflow and the FAA path.",
      presenters: "Bernard · Bailey",
      projectId: "drome",
    },
    {
      date: "2026-05-29",
      kind: "presentation",
      title: "KY-AHEAD data linkage update",
      blurb: "Where the KCR DSA stands.",
      presenters: "Thé · Huang",
      projectId: "ahead",
    },
    {
      date: "2026-06-05",
      kind: "roundtable",
      title: "Cohort check-in",
      blurb: "Three minutes per active project.",
    },
    {
      date: "2026-06-12",
      kind: "demo",
      title: "NCIPP Phase 2 walkthrough",
      blurb: "Live tour of the 15-screen prototype.",
      presenters: "Thé",
      projectId: "ncipp",
    },
    {
      date: "2026-06-26",
      kind: "canceled",
      title: "No meeting — holiday",
      blurb: "Group is off this week.",
    },
  ],
```

(Note: 2026-06-19 is intentionally omitted so the homepage renders one OPEN row to verify that path.)

- [ ] **Step 4: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add content/site.ts
git commit -m "feat: add MeetingSession data model and seed entries"
```

---

## Task 2: Date helpers in new `lib/calendar.ts`

**Files:**
- Create: `lib/calendar.ts`

- [ ] **Step 1: Create `lib/calendar.ts` with the date helpers**

Create the file with this exact content:

```ts
import { content, type MeetingSession } from "@/content/site";
import { nextSession } from "@/lib/session";

/**
 * Returns the next `n` Friday Date objects starting from the next upcoming
 * session occurrence. Each Date is the Friday at session start time (noon ET
 * in local interpretation; see lib/session.ts).
 */
export function upcomingFridays(n: number, now: Date = new Date()): Date[] {
  const first = nextSession(now);
  const fridays: Date[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(first);
    d.setDate(d.getDate() + i * 7);
    fridays.push(d);
  }
  return fridays;
}

/**
 * Convert a Friday `Date` to an ISO date string (YYYY-MM-DD) in local time.
 * Used for matching against MeetingSession.date.
 */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * All `MeetingSession` entries for the given ISO date, in insertion order.
 * Returns an empty array if the date has no entries.
 */
export function meetingsForDate(isoDate: string): MeetingSession[] {
  return content.meetings.filter((m) => m.date === isoDate);
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/calendar.ts
git commit -m "feat: add upcomingFridays + meetingsForDate helpers"
```

---

## Task 3: RFC 5545 `.ics` serializer + domain helpers + downloader in `lib/calendar.ts`

**Files:**
- Modify: `lib/calendar.ts`

- [ ] **Step 1: Append the ICS event type and low-level builders**

Append to `lib/calendar.ts`:

```ts
// ─── ICS serialization (RFC 5545) ─────────────────────────────────────────

export interface IcsEvent {
  /** Stable identifier, e.g. "2026-05-29-pitch-0@aiincubator.uky.edu". */
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description?: string;
  location?: string;
}

/** Escape a text field per RFC 5545 §3.3.11. */
function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/**
 * Fold a content line to 75 octets per RFC 5545 §3.1. Subsequent lines start
 * with a single space. Lines are joined with CRLF.
 */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let i = 0;
  while (i < line.length) {
    const size = i === 0 ? 75 : 74;
    chunks.push(line.slice(i, i + size));
    i += size;
  }
  return chunks.join("\r\n ");
}

/** Format a Date as a TZID-local string: 20260529T120000 */
function fmtLocal(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}${mo}${da}T${h}${mi}${s}`;
}

/** Format a Date as a UTC stamp: 20260526T143015Z */
function fmtUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

const VTIMEZONE_NY = [
  "BEGIN:VTIMEZONE",
  "TZID:America/New_York",
  "BEGIN:STANDARD",
  "DTSTART:19701101T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "TZOFFSETFROM:-0400",
  "TZOFFSETTO:-0500",
  "TZNAME:EST",
  "END:STANDARD",
  "BEGIN:DAYLIGHT",
  "DTSTART:19700308T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
  "TZOFFSETFROM:-0500",
  "TZOFFSETTO:-0400",
  "TZNAME:EDT",
  "END:DAYLIGHT",
  "END:VTIMEZONE",
].join("\r\n");

function serializeVevent(e: IcsEvent, stamp: Date): string {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${fmtUtc(stamp)}`,
    `DTSTART;TZID=America/New_York:${fmtLocal(e.start)}`,
    `DTEND;TZID=America/New_York:${fmtLocal(e.end)}`,
    `SUMMARY:${escapeIcsText(e.summary)}`,
  ];
  if (e.description) lines.push(`DESCRIPTION:${escapeIcsText(e.description)}`);
  if (e.location) lines.push(`LOCATION:${escapeIcsText(e.location)}`);
  lines.push("END:VEVENT");
  return lines.map(foldLine).join("\r\n");
}

function wrapVcalendar(body: string): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AI Incubator UK//Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    VTIMEZONE_NY,
    body,
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Returns a full VCALENDAR string containing one VEVENT. */
export function buildIcsEvent(e: IcsEvent): string {
  return wrapVcalendar(serializeVevent(e, new Date()));
}

/** Returns a full VCALENDAR string containing N VEVENTs. */
export function buildIcsCalendar(events: IcsEvent[]): string {
  const stamp = new Date();
  const body = events.map((e) => serializeVevent(e, stamp)).join("\r\n");
  return wrapVcalendar(body);
}
```

- [ ] **Step 2: Append domain mapping helpers**

Append to `lib/calendar.ts`:

```ts
// ─── Domain mapping ───────────────────────────────────────────────────────

/** Parse "2026-05-29" + a Friday Date (for tz) into start/end at noon–1pm. */
function fridayNoonRange(isoDate: string): { start: Date; end: Date } {
  const [y, m, d] = isoDate.split("-").map(Number);
  const start = new Date(y, m - 1, d, 12, 0, 0, 0);
  const end = new Date(y, m - 1, d, 13, 0, 0, 0);
  return { start, end };
}

const KIND_LABEL: Record<MeetingSession["kind"], string> = {
  pitch: "Pitch",
  demo: "Demo",
  presentation: "Presentation",
  roundtable: "Roundtable",
  open: "Open",
  canceled: "Canceled",
};

/** Map a published MeetingSession → IcsEvent. */
export function meetingToIcsEvent(m: MeetingSession, indexOnDate: number): IcsEvent {
  const { start, end } = fridayNoonRange(m.date);
  const descParts: string[] = [];
  if (m.blurb) descParts.push(m.blurb);
  if (m.presenters) descParts.push(`Presenters: ${m.presenters}`);
  descParts.push(`Teams: ${content.session.teamsUrl}`);
  return {
    uid: `${m.date}-${m.kind}-${indexOnDate}@aiincubator.uky.edu`,
    start,
    end,
    summary: `[${KIND_LABEL[m.kind]}] ${m.title}`,
    description: descParts.join("\n"),
    location: content.session.venue,
  };
}

/** Synthesize an IcsEvent for a Friday with no MeetingSession entries. */
export function openFridayToIcsEvent(friday: Date): IcsEvent {
  const iso = toIsoDate(friday);
  const { start, end } = fridayNoonRange(iso);
  return {
    uid: `${iso}-open@aiincubator.uky.edu`,
    start,
    end,
    summary: "AI Incubator — Friday meeting",
    description: `Open Friday — topic TBD.\nTeams: ${content.session.teamsUrl}`,
    location: content.session.venue,
  };
}
```

- [ ] **Step 3: Append the client-side download helper**

Append to `lib/calendar.ts`:

```ts
// ─── Browser download ─────────────────────────────────────────────────────

/** Trigger a browser download of `.ics` content. Client-only. */
export function downloadIcs(filename: string, contents: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([contents], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 4: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add lib/calendar.ts
git commit -m "feat: add .ics serializer and domain mapping helpers"
```

---

## Task 4: Add topic chip styles to `app/globals.css`

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Append the kind chip styles**

The existing `.chip` base style is defined around line 313. Append the per-kind variants and section-specific layout at the end of `globals.css`:

```css
/* ── Session kind chips ─────────────────────────────────── */

.chip.kind {
  text-transform: uppercase;
  font-family: var(--mono);
  letter-spacing: 0.04em;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;
}
.chip.kind-pitch {
  background: var(--accent);
  color: var(--accent-ink);
  border-color: var(--accent);
}
.chip.kind-demo {
  background: var(--signal);
  color: var(--bg);
  border-color: var(--signal);
}
.chip.kind-presentation {
  background: var(--ink);
  color: var(--bg);
  border-color: var(--ink);
}
.chip.kind-roundtable {
  background: var(--surface-2);
  color: var(--ink);
  border-color: var(--line-2);
}
.chip.kind-open {
  background: var(--surface-2);
  color: var(--ink-3);
  border-color: var(--line);
}
.chip.kind-canceled {
  background: transparent;
  color: var(--ink-4);
  border-color: var(--line);
  text-decoration: line-through;
}

/* ── Upcoming sessions section ─────────────────────────── */

.upcoming {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.upcoming-day {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 24px;
  padding: 20px 0;
  border-top: 1px solid var(--line);
}
.upcoming-day:last-child {
  border-bottom: 1px solid var(--line);
}
.upcoming-day.is-canceled .upcoming-rows {
  opacity: 0.6;
}
.upcoming-date {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--ink-2);
  padding-top: 2px;
}
.upcoming-date .weekday {
  display: block;
  color: var(--ink-4);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.upcoming-rows {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.upcoming-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.upcoming-row .row-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.upcoming-row .row-title {
  font-weight: 600;
  font-size: 17px;
  color: var(--ink);
}
.upcoming-row .row-blurb {
  font-size: 14px;
  color: var(--ink-2);
  max-width: 60ch;
}
.upcoming-row .row-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: var(--ink-3);
  margin-top: 2px;
}
.upcoming-row .row-presenters {
  font-family: var(--mono);
}
.upcoming-row .row-open-cta {
  color: var(--accent);
  font-weight: 500;
}
.upcoming-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
```

- [ ] **Step 2: Verify the build still works**

Run: `npm run build`
Expected: clean build, `out/` produced.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add session kind chip styles and upcoming layout"
```

---

## Task 5: Build `UpcomingSessions` server component

**Files:**
- Create: `components/UpcomingSessions.tsx`

- [ ] **Step 1: Create the component**

Create `components/UpcomingSessions.tsx`:

```tsx
import { content, type MeetingSession } from "@/content/site";
import { upcomingFridays, toIsoDate, meetingsForDate } from "@/lib/calendar";
import AddToCalendarButton from "@/components/AddToCalendarButton";
import SubscribeAllButton from "@/components/SubscribeAllButton";

const HORIZON = 8;
const KIND_LABEL: Record<MeetingSession["kind"], string> = {
  pitch: "Pitch",
  demo: "Demo",
  presentation: "Presentation",
  roundtable: "Roundtable",
  open: "Open",
  canceled: "Canceled",
};

function fmtDate(d: Date) {
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const md = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return { weekday, md };
}

export default function UpcomingSessions() {
  const fridays = upcomingFridays(HORIZON);

  return (
    <section className="section container" id="upcoming">
      <div className="section-label">
        <span className="idx">02</span> <span>Upcoming Fridays</span>
      </div>
      <div className="section-head">
        <h2 className="h1" style={{ maxWidth: "20ch" }}>
          What&apos;s on the calendar.
        </h2>
        <span className="small">
          Fridays · 12:00 pm · {content.session.venue}
        </span>
      </div>

      <div className="upcoming">
        {fridays.map((friday) => {
          const iso = toIsoDate(friday);
          const meetings = meetingsForDate(iso);
          const isCanceledDay =
            meetings.length > 0 && meetings.every((m) => m.kind === "canceled");
          const { weekday, md } = fmtDate(friday);

          return (
            <div
              key={iso}
              className={`upcoming-day${isCanceledDay ? " is-canceled" : ""}`}
            >
              <div className="upcoming-date">
                <span className="weekday">{weekday}</span>
                <span>{md}</span>
              </div>

              <div className="upcoming-rows">
                {meetings.length === 0 ? (
                  <div className="upcoming-row">
                    <div className="row-head">
                      <span className="chip kind kind-open">Open</span>
                      <span className="row-title">Topic open</span>
                    </div>
                    <div className="row-meta">
                      <a className="row-open-cta" href="/pitch">
                        Pitch a topic →
                      </a>
                    </div>
                  </div>
                ) : (
                  meetings.map((m, i) => (
                    <div className="upcoming-row" key={`${iso}-${i}`}>
                      <div className="row-head">
                        <span className={`chip kind kind-${m.kind}`}>
                          {KIND_LABEL[m.kind]}
                        </span>
                        <span className="row-title">{m.title}</span>
                      </div>
                      {m.blurb && <div className="row-blurb">{m.blurb}</div>}
                      <div className="row-meta">
                        <span className="row-presenters">
                          {m.presenters ?? ""}
                        </span>
                        {m.kind !== "canceled" && (
                          <AddToCalendarButton meeting={m} indexOnDate={i} />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="upcoming-actions">
        <SubscribeAllButton />
      </div>
    </section>
  );
}
```

(`AddToCalendarButton` and `SubscribeAllButton` are created in Task 6; this file will not type-check until then.)

- [ ] **Step 2: Commit (compile check deferred to next task)**

```bash
git add components/UpcomingSessions.tsx
git commit -m "feat: add UpcomingSessions homepage section"
```

---

## Task 6: Build `AddToCalendarButton` and `SubscribeAllButton` client islands

**Files:**
- Create: `components/AddToCalendarButton.tsx`
- Create: `components/SubscribeAllButton.tsx`

- [ ] **Step 1: Create `AddToCalendarButton`**

Create `components/AddToCalendarButton.tsx`:

```tsx
"use client";

import type { MeetingSession } from "@/content/site";
import {
  buildIcsEvent,
  downloadIcs,
  meetingToIcsEvent,
} from "@/lib/calendar";

interface Props {
  meeting: MeetingSession;
  indexOnDate: number;
}

export default function AddToCalendarButton({ meeting, indexOnDate }: Props) {
  function handleClick() {
    const event = meetingToIcsEvent(meeting, indexOnDate);
    const ics = buildIcsEvent(event);
    downloadIcs(
      `aiincubator-${meeting.date}-${meeting.kind}.ics`,
      ics
    );
  }

  return (
    <button type="button" className="btn ghost sm" onClick={handleClick}>
      Add to calendar <span className="arrow">→</span>
    </button>
  );
}
```

- [ ] **Step 2: Create `SubscribeAllButton`**

Create `components/SubscribeAllButton.tsx`:

```tsx
"use client";

import {
  buildIcsCalendar,
  downloadIcs,
  meetingToIcsEvent,
  meetingsForDate,
  openFridayToIcsEvent,
  toIsoDate,
  upcomingFridays,
  type IcsEvent,
} from "@/lib/calendar";

const BUNDLE_HORIZON = 12;

export default function SubscribeAllButton() {
  function handleClick() {
    const events: IcsEvent[] = [];
    for (const friday of upcomingFridays(BUNDLE_HORIZON)) {
      const iso = toIsoDate(friday);
      const meetings = meetingsForDate(iso);
      if (meetings.length === 0) {
        events.push(openFridayToIcsEvent(friday));
      } else {
        meetings.forEach((m, i) => {
          if (m.kind !== "canceled") events.push(meetingToIcsEvent(m, i));
        });
      }
    }
    const ics = buildIcsCalendar(events);
    downloadIcs("aiincubator-fridays.ics", ics);
  }

  return (
    <button type="button" className="btn" onClick={handleClick}>
      Subscribe to all (.ics) <span className="arrow">→</span>
    </button>
  );
}
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/AddToCalendarButton.tsx components/SubscribeAllButton.tsx
git commit -m "feat: add .ics download client islands"
```

---

## Task 7: Wire `<UpcomingSessions />` into the homepage and renumber sections

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Import the new section**

Edit `app/page.tsx`. After the existing imports (around line 13), add:

```ts
import UpcomingSessions from "@/components/UpcomingSessions";
```

- [ ] **Step 2: Insert the section between Active Projects and How it works**

In `app/page.tsx`, after the closing `</section>` of the Active projects block (currently ending around line 104, right after the kickoff grid div), insert:

```tsx
      {/* ───── Upcoming Fridays ───── */}
      <UpcomingSessions />
```

- [ ] **Step 3: Renumber the section labels below**

In `app/page.tsx`, find and update the three remaining section indices:

- `<span className="idx">02</span> <span>How it works</span>` → change `02` to `03`
- `<span className="idx">03</span> <span>People</span>` → change `03` to `04`
- `<span className="idx">04</span> <span>Activity log</span>` → change `04` to `05`

- [ ] **Step 4: Run the dev server and visually verify**

Run: `npm run dev`
Open: `http://localhost:3000`

Verify:
- New "Upcoming Fridays" section appears with index `02`, between Active Projects and How it works.
- 2026-05-29 row shows two stacked items (DROME pitch + KY-AHEAD presentation), each with its own chip + Add-to-calendar button.
- 2026-06-05 shows a single Roundtable row.
- 2026-06-12 shows the NCIPP Demo row.
- 2026-06-19 (no entry) shows an `OPEN` row with a "Pitch a topic →" link to `/pitch`.
- 2026-06-26 shows a Canceled row, muted, no Add-to-calendar button.
- The "How it works" / "People" / "Activity log" section indices are now 03 / 04 / 05.

Stop the dev server (Ctrl+C).

- [ ] **Step 5: Verify the full build still works**

Run: `npm run build`
Expected: clean build, `out/` produced.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx
git commit -m "feat: insert Upcoming Fridays section on homepage"
```

---

## Task 8: Update schema docs (site.ts comment + README snippet)

**Files:**
- Modify: `content/site.ts`
- Modify: `README.md`

The schema is documented in two places. Update both.

- [ ] **Step 1: Update the schema comment at the top of `content/site.ts`**

Find the block comment at the top of the file (around lines 9–17). It lists each top-level field — `session`, `projects[]`, `log[]`, `leads[]`, `actions[]`, `blockers[]`, `decisions[]`.

Add one line after `decisions[]`:

```
 *   meetings[]  Per-Friday topics. kind: pitch | demo | presentation | roundtable | canceled. Fridays with no entry render as Open.
```

The full updated `Schema:` block should read:

```
 * Schema:
 *   session     The Friday meeting block. Used by the Right Now bar.
 *   projects[]  Cards rendered across the site. status: active | building | kickoff | paused
 *   log[]       Activity feed (newest first). Surfaces in the Right Now bar.
 *   leads[]     Faculty / project leads listed in the People section.
 *   actions[]   Open / closed action items per project.
 *   blockers[]  Active / resolved blockers per project.
 *   decisions[] Queued / decided decisions per session.
 *   meetings[]  Per-Friday topics. kind: pitch | demo | presentation | roundtable | canceled. Fridays with no entry render as Open.
```

- [ ] **Step 2: Update the schema snippet in `README.md`**

The snippet is in the "Editing content" section (around lines 29–38). Add a `meetings:` line at the end. The updated snippet should read:

```ts
{
  lastUpdated: "2026-05-25",
  cohort: "Cohort 03 · Spring 2026",
  session: { dayOfWeek: 5, hour: 12, minute: 0, venue: "Microsoft Teams", teamsUrl: "…", agenda: [...] },
  projects: [ { id, name, status, stage, area, leads, summary, anchors, updated } … ],
  log:      [ { date, project, note } … ],   // newest first
  leads:    [ { initials, name, role, areas } … ],
  meetings: [ { date, kind, title, blurb, presenters, projectId } … ],
}
```

(If the existing snippet has drifted from the literal text shown here, only add the `meetings:` line; do not rewrite the rest.)

- [ ] **Step 3: Commit**

```bash
git add content/site.ts README.md
git commit -m "docs: note meetings[] field in schema"
```

---

## Task 9: End-to-end manual verification

**Files:** none.

- [ ] **Step 1: Clean build**

Run: `npm run build`
Expected: clean exit, `out/` populated.

- [ ] **Step 2: Run the static preview**

Run: `npx serve@latest out`
Open: the URL printed (usually `http://localhost:3000`).

- [ ] **Step 3: Verify visual rendering**

On the homepage:
- Section `02 · Upcoming Fridays` is present.
- All five seeded items render correctly (DROME pitch, KY-AHEAD presentation, Cohort roundtable, NCIPP demo, canceled Friday).
- The OPEN row for 2026-06-19 links to `/pitch`.
- Canceled row is muted and has no calendar button.
- Section indices below count up 03, 04, 05.

- [ ] **Step 4: Verify per-event `.ics` download**

Click "Add to calendar" on the DROME pitch row.
A file `aiincubator-2026-05-29-pitch.ics` should download.

Open the file in a text editor and confirm:
- Starts with `BEGIN:VCALENDAR` and ends with `END:VCALENDAR`.
- Contains one `BEGIN:VEVENT` block.
- `SUMMARY:[Pitch] DROME — initial scope`
- `DTSTART;TZID=America/New_York:20260529T120000`
- `DTEND;TZID=America/New_York:20260529T130000`
- Description includes the blurb and `Teams: https://teams.microsoft.com/...`
- A `BEGIN:VTIMEZONE` block is present.

Import the file into Google Calendar (`https://calendar.google.com` → Settings → Import). Verify the event lands on Fri May 29, 2026 at 12:00–13:00 ET with the right title and description. Delete it after verifying.

- [ ] **Step 5: Verify "Subscribe to all" download**

Click "Subscribe to all (.ics)" at the bottom of the section.
A file `aiincubator-fridays.ics` should download.

Open in a text editor and confirm:
- One `BEGIN:VEVENT` per non-canceled session, plus one for each Open Friday.
- The canceled 2026-06-26 entry is not present.
- Distinct `UID` values on every event.

Import into Google Calendar. Verify ~12 events appear across the next 12 Fridays. Delete them after verifying.

- [ ] **Step 6: Confirm no regressions on existing pages**

Click through `/`, `/projects`, `/join`, and (if shipped) `/changelog`. Confirm no layout breaks, no console errors.

- [ ] **Step 7: Final commit (if any cleanup edits were needed)**

If you found and fixed any issues above, commit them:

```bash
git add -A
git commit -m "fix: address calendar verification issues"
```

Otherwise, skip — no final commit needed.

---

## Acceptance recap

- Homepage has `02 · Upcoming Fridays` showing the next 8 Fridays.
- Fridays with `meetings[]` entries show topic chip + title + blurb + presenters.
- Fridays without entries render as `OPEN`, linking to `/pitch`.
- Multiple entries on the same Friday stack under one date header.
- Canceled Fridays render muted, no calendar button.
- "Add to calendar" downloads a single-event `.ics` that imports cleanly into Google Calendar at 12:00–13:00 ET.
- "Subscribe to all (.ics)" downloads a multi-event `.ics` for the next 12 Fridays.
- `npm run build` produces a clean static `out/`.
- No new dependencies in `package.json`.
