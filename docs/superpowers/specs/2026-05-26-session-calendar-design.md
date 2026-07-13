# Session calendar — design spec

**Date:** 2026-05-26
**Status:** Draft, awaiting build approval
**Goal:** Publish the Friday meeting schedule so visitors know what's coming up. List the next ~2 months of Fridays with their topic (pitch / demo / presentation / roundtable / open), and let people add any session to their personal calendar via `.ics` download.

---

## Why

The site already tells visitors *that* the group meets Fridays at noon, but not *what* the meeting is about. Visitors who would otherwise show up for a topic they care about — a project demo, a roundtable, someone's new pitch — have no way to know unless they're on the listserv.

Cadence the group is targeting:
- About once a month: a new pitch (intake handled by [`2026-05-26-pitch-intake-design.md`](./2026-05-26-pitch-intake-design.md))
- About once a month: a roundtable check-in
- The remaining Fridays: project demos, presentations, or open

Publishing the calendar makes Friday topics legible and gives a clear answer to "is this week worth showing up for?"

## Relationship to pitch intake

This spec is the **display** half of the pitch loop. The pitch-intake design owns the submission side: visitors talk through their idea at `/pitch`, a structured one-pager lands in the lead's inbox. When the lead decides to schedule that pitch, they add an entry to `meetings[]` in `content/site.ts` — at which point this spec takes over and the pitch shows up on the homepage calendar.

This spec does not build any form, chat, backend, or email path. Submission is solved separately.

## Data model

Two additions to `content/site.ts`:

```ts
export type SessionKind =
  | "pitch"
  | "demo"
  | "presentation"
  | "roundtable"
  | "open"
  | "canceled";

export interface MeetingSession {
  /** ISO Friday date, e.g. "2026-05-29" */
  date: string;
  kind: SessionKind;
  /** Short headline. e.g. "DROME — initial scope" */
  title: string;
  /** 1–2 sentence summary shown under the title. */
  blurb?: string;
  /** Freeform presenters line. e.g. "Bernard · Bailey" */
  presenters?: string;
  /** Optional link to projects[] by id. */
  projectId?: string;
}

// Added to SiteContent:
meetings: MeetingSession[];
```

Notes on the model:

- The existing recurring `session` object (cadence: dayOfWeek 5, hour 12) stays untouched. It continues to power the Right Now bar, Countdown, and listserv copy. `meetings[]` is the per-Friday topic layer.
- A Friday with **no** entry in `meetings[]` renders as `kind: "open"` implicitly. The data does not need to enumerate every Friday — only the ones with a topic or that are canceled.
- Multiple entries per date are allowed (a pitch + a demo stacked under the same Friday). They render as separate rows under one date header.
- `kind: "canceled"` rows render muted and suppress the "Add to calendar" button. Use for holidays.

Seed data: 4–6 entries covering the next 2 months, derived from the existing `agenda` and `log`. For example:

```ts
meetings: [
  { date: "2026-05-29", kind: "pitch",      title: "DROME — initial scope",
    blurb: "Bernard & Bailey on EMS workflow and the FAA path.",
    presenters: "Bernard · Bailey", projectId: "drome" },
  { date: "2026-05-29", kind: "presentation", title: "KY-AHEAD data linkage update",
    blurb: "Where the KCR DSA stands.", presenters: "Thé · Huang", projectId: "ahead" },
  { date: "2026-06-05", kind: "roundtable", title: "Cohort check-in",
    blurb: "Three minutes per active project." },
  { date: "2026-06-12", kind: "demo",        title: "NCIPP Phase 2 walkthrough",
    blurb: "Live tour of the 15-screen prototype.", presenters: "Thé", projectId: "ncipp" },
  // 2026-06-19 left out → renders as Open
]
```

## Homepage section — "Upcoming Fridays"

A new numbered section inserted into `app/page.tsx` between Active Projects (`01`) and How it works (`02`). Other sections renumber from `03` upward.

### Layout

```
02 · Upcoming Fridays
Friday · 12:00 pm · Microsoft Teams · pitch a topic →

────────────────────────────────────────────────────────
May 29   [PITCH]         DROME — initial scope
         Bernard & Bailey on EMS workflow and the FAA path.
         Bernard · Bailey                  Add to calendar →

         [PRESENTATION]  KY-AHEAD data linkage update
         Where the KCR DSA stands.
         Thé · Huang                       Add to calendar →
────────────────────────────────────────────────────────
Jun 05   [ROUNDTABLE]    Cohort check-in
         Three minutes per active project.
                                           Add to calendar →
────────────────────────────────────────────────────────
Jun 12   [DEMO]          NCIPP Phase 2 walkthrough
         Live tour of the 15-screen prototype.
         Thé                               Add to calendar →
────────────────────────────────────────────────────────
Jun 19   [OPEN]          Pitch a topic → /pitch
────────────────────────────────────────────────────────
…
[ Subscribe to all (.ics) → ]
```

### Behavior

- Default horizon: next 8 Fridays from "now."
- For each Friday in order:
  - Get all `MeetingSession` entries for that date from `content.meetings`.
  - If 1+ entries: render the date header once, then stack each entry as a row.
  - If 0 entries: render an `OPEN` row whose CTA links to `/pitch`.
- "Add to calendar" button is per-row (per `MeetingSession`). Hidden for `kind: "canceled"` and `kind: "open"`.
- "Subscribe to all (.ics)" at the bottom downloads one `.ics` file containing the next 12 Fridays as events. (A subscribable URL feed needs a server — not done here.)
- The current Friday (if before noon) shows at the top with a small "this week" chip.

### Topic chip styling

Each `kind` has a colored chip using existing CSS variables. Approximate intent (refined when implementing against `globals.css`):

| Kind          | Chip background        | Chip text  |
|---------------|------------------------|------------|
| pitch         | `--accent`             | `--bg`     |
| demo          | `var(--signal)`        | `--bg`     |
| presentation  | `--ink`                | `--bg`     |
| roundtable    | `--surface-2` + border | `--ink`    |
| open          | `--surface-2`          | `--ink-3`  |
| canceled      | transparent + border   | `--ink-4`  |

## `.ics` export

Generated entirely client-side as RFC 5545 strings, downloaded as a blob. No server needed — works with `output: 'export'`.

Two flavors:

1. **Per-event:** "Add to calendar" button on each row. Filename: `aiincubator-{date}-{kind}.ics`. Contains one `VEVENT` (Friday 12:00–13:00 local time, title = `[KIND] title`, description = blurb + presenters + Teams URL, location = `content.session.venue`).
2. **All Fridays:** "Subscribe to all (.ics)" button at the bottom of the section. Filename: `aiincubator-fridays.ics`. Contains one `VEVENT` per Friday in the next 12 weeks. Open Fridays use `SUMMARY: AI Incubator — Friday meeting`; Fridays with entries use the entry's title.

Notes:
- Time zone: emit `DTSTART;TZID=America/New_York:` with a `VTIMEZONE` block. UK is in Eastern time.
- `UID` is stable: `{date}-{kindOrIndex}@aiincubator.uky.edu`.
- Canceled Fridays are omitted from the all-Fridays bundle (not emitted as `STATUS:CANCELLED` — keeps the file simple).

## New surfaces

### `lib/calendar.ts`

Pure functions, no React. Reuses `nextSession` from `lib/session.ts`.

```ts
export function upcomingFridays(n: number, now?: Date): Date[]
export function meetingsForDate(isoDate: string): MeetingSession[]
export function buildIcsEvent(m: MeetingSession): string
export function buildIcsCalendar(meetings: MeetingSession[], fallbackTitle: string): string
export function downloadIcs(filename: string, contents: string): void
```

### `components/UpcomingSessions.tsx`

Server component. Renders the section. Computes the Friday list with `upcomingFridays(8)`, groups `content.meetings` by date, renders rows. "Add to calendar" buttons are rendered as a small client island (`SessionRowActions.tsx`) because they need `onClick`.

### `components/SessionRowActions.tsx`

Tiny client component. Single "Add to calendar" button per row. Calls `buildIcsEvent` + `downloadIcs`.

### `components/SubscribeAllButton.tsx`

Tiny client component. Single "Subscribe to all (.ics)" button. Calls `buildIcsCalendar` with the next 12 Fridays + their meetings.

## Updates to existing surfaces

- `app/page.tsx` — insert `<UpcomingSessions />` between Active Projects (`01`) and How it works. Renumber the sections that follow (How it works becomes `03`, People `04`, Activity log `05`). When the pitch-intake design ships, its `PitchSection` becomes `06` instead of the `05` that spec assumed.
- `content/site.ts` — add `SessionKind` and `MeetingSession` types; add the `meetings: MeetingSession[]` field to `SiteContent` and its initializer; seed with 4–6 entries.
- `app/globals.css` — add `.kind-pitch`, `.kind-demo`, `.kind-presentation`, `.kind-roundtable`, `.kind-open`, `.kind-canceled` chip styles.
- `README.md` — note the new `meetings[]` field in the schema docs.

## File plan

| File | Change |
|---|---|
| `content/site.ts` | Add types + `meetings[]` + seed data. |
| `lib/calendar.ts` | New — upcoming Fridays, ics builders, blob download. |
| `components/UpcomingSessions.tsx` | New — homepage section, server component. |
| `components/SessionRowActions.tsx` | New — per-row "Add to calendar" client island. |
| `components/SubscribeAllButton.tsx` | New — bottom-of-section "Subscribe to all" client island. |
| `app/page.tsx` | Insert section, renumber. |
| `app/globals.css` | Chip styles for the six kinds. |
| `README.md` | Schema doc update. |

## Edge cases

- **Past noon today, today is Friday:** `upcomingFridays` starts from next Friday. The "this week" chip in the header reflects whichever Friday is at the top.
- **Multiple sessions same day:** date header once, stacked rows below.
- **Canceled Friday (holiday):** entry with `kind: "canceled"`, blurb like "No meeting — Memorial Day." Row muted, no "Add to calendar" button, excluded from `.ics` bundle.
- **Entry referencing non-existent `projectId`:** ignored at render (project link suppressed); no error.
- **Empty `meetings[]`:** section still renders, all 8 Fridays show as `OPEN`. Section is never empty.
- **`MeetingSession.date` not actually a Friday:** treat as authoring error; still render the row at its native date, surfaced under that day's header (function `upcomingFridays` still only enumerates Fridays, so a non-Friday entry would just not appear in the list). Acceptable — authoring is maintainer-only via `site.ts`.

## Not in scope

- Form, chat, or backend for pitch submission — see [`2026-05-26-pitch-intake-design.md`](./2026-05-26-pitch-intake-design.md).
- Admin / moderation UI. Publishing = editing `site.ts` and committing.
- Subscribable iCal feed URL. Static `.ics` download only.
- Past-sessions archive view. The existing Activity log on the homepage already covers historical context.
- RSVP-per-session. Visitors come to whichever Friday they want; the RSVP form on `/join` stays a one-time intake, not a per-session toggle.
- Email reminders. Out of scope.

## Acceptance

- Homepage has an `02 · Upcoming Fridays` section showing the next 8 Fridays.
- Fridays with entries in `meetings[]` show topic chip + title + blurb + presenters.
- Fridays without entries show an `OPEN` row linking to `/pitch`.
- Multiple entries on the same Friday stack under one date header.
- Canceled Fridays render muted and suppress the calendar button.
- "Add to calendar" on a row downloads a single-event `.ics` that imports cleanly into Google Calendar and Apple Calendar (12:00–13:00 ET).
- "Subscribe to all (.ics)" at the bottom downloads a 12-event `.ics` covering the next 12 Fridays.
- `npm run build` still produces a clean static `out/`.
- No new dependencies added — pure TypeScript for `.ics` string assembly.

## Open questions

None — all forks decided.
