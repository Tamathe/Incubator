# Ideas page — design spec

**Date:** 2026-05-26
**Status:** Draft, awaiting build approval
**Goal:** A public `/ideas` page where anyone can submit a problem or pitch they're thinking about, and visitors browse the landscape of in-air ideas on a clustered concept map weighted by submitter commitment.

---

## Why

The site has `/projects` (live work) and `/join` (RSVP + the conversational pitch intake described in [`2026-05-26-pitch-intake-design.md`](2026-05-26-pitch-intake-design.md)). Nothing currently captures the **pre-project** state — the loose, low-commitment ideas people are tossing around. That landscape is invisible to visitors and to the group itself.

`/ideas` makes that landscape browsable. It also lets people who aren't ready to do a full conversational pitch (yet) drop a seed and see if anyone else is thinking about the same thing.

### Relationship to `/pitch`

These are complementary, not redundant:

| | `/pitch` (existing spec) | `/ideas` (this spec) |
|---|---|---|
| Audience | Someone ready to commit to a Friday pitch | Anyone with a thought, from "would be cool" to "I'm pitching this" |
| Surface | Claude-driven chat conversation | Form-based intake mirroring `RsvpForm` |
| Output | Private email to group lead | Public node on the map |
| Friction | ~10 min conversation | 30s for a seed, ~3 min for a full pitch |
| Moderation | None (just email) | Light: pending → approved by group lead |

A future iteration may auto-promote a completed `/pitch` into a `Committed`-level node on the `/ideas` map. Out of scope for v1.

## Goal of the page (decided)

**Browseable landscape + low-friction seeding.** Visitor lands on the map, sees themed clusters of what's in the air, can click any node to read the full pitch, and can add their own idea in a side drawer without leaving the map. Higher-commitment ideas pull more visual weight.

## Architecture

```
Browser (static)  ──supabase-js──▶  Supabase Postgres  (RLS enforced)
       ▲                                  │
       │                                  │  realtime subscription
       └──────────────────────────────────┘

Admin (group lead)  ──browser──▶  Supabase Dashboard  (built-in table UI for moderation)
```

- Site stays purely static (`output: 'export'`).
- Public anon key embedded in client. RLS restricts it to:
  - `INSERT` rows with `status` forced to `'pending'`
  - `SELECT` only non-PII columns where `status IN ('pending', 'approved')`
- Service-role key never leaves Supabase. The group lead moderates via Supabase's dashboard table view filtered to `status = 'pending'`.
- No Cloudflare Worker, no separate backend. One vendor (Supabase) added.

## Data model

Single Supabase table `ideas`:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, pk, default `gen_random_uuid()` | |
| `created_at` | timestamptz, default `now()` | |
| `status` | enum `idea_status` (`pending`, `approved`, `rejected`) | RLS forces insert as `pending` |
| `title` | text, required, ≤ 60 chars | Shown on hover and as the node's accessible label |
| `theme` | enum `idea_theme` (`med_ed`, `trauma`, `population_health`, `ed_tech`, `k12`, `other`) | Drives cluster placement |
| `commitment` | enum `idea_commitment` (`curious`, `exploring`, `committed`) | Drives node visual weight |
| `problem` | text, required | Required field |
| `affects` | text | Optional — "Who it affects" |
| `build_first` | text | Optional — "What you'd build first" |
| `looking_for` | text[] | Optional — chip multi-select |
| `submitter_name` | text, required | |
| `submitter_email` | text, required | **Private.** Never returned to public reads. |
| `submitter_role` | text | Optional |
| `honeypot` | text | Invisible field, RLS rejects rows where this is non-empty |

### RLS policies

```sql
-- Public anon insert: only status=pending, only if honeypot empty
create policy "anon_insert_pending" on ideas
  for insert to anon
  with check (status = 'pending' and (honeypot is null or honeypot = ''));

-- Public anon read: only non-PII columns, only non-rejected
create policy "anon_read_visible" on ideas
  for select to anon
  using (status in ('pending', 'approved'));

-- Service role: full access (used by Supabase dashboard for moderation)
-- (default; no explicit policy needed)
```

A view `ideas_public` exposes only the non-PII columns (`id, created_at, status, title, theme, commitment, problem, affects, build_first, looking_for, submitter_name, submitter_role`) for the anon read path. The client always reads from this view, never the base table.

**Postgres gotcha:** by default a view runs with the owner's privileges, which would bypass the underlying table's RLS. Create the view with `with (security_invoker = true)` so the `anon_read_visible` RLS policy applies when the client queries through it.

## The map

Full-bleed canvas filling ~70vh on desktop. Nodes are circles, one per visible idea, arranged in themed clusters using a D3-force simulation:

- One attractor per theme positioned in a hexagonal layout across the canvas.
- Each node is pulled toward its theme's attractor, gently repelled from sibling nodes.
- Cluster labels render as faint typographic anchors behind the nodes (e.g., "MED-ED" in low-opacity uppercase mono).
- Simulation runs for a few seconds on mount, then settles. Small drift continues for liveliness.

### Commitment encoding

| Commitment | Node diameter | Fill opacity | Halo |
|---|---|---|---|
| `curious` | 18px | 0.5 | none |
| `exploring` | 28px | 0.8 | none |
| `committed` | 40px | 1.0 | 2px `var(--accent)` ring |

### Pending vs approved

Pending nodes render with a 1px dashed stroke and reduced saturation (50%). Visible to all visitors, visually distinct.

### Interactions

- **Hover:** node lifts slightly (scale 1.1), shows the title in a small tooltip.
- **Click:** opens an inline side panel sliding in from the right (~420px wide). Panel shows: title, theme chip, commitment badge, submitter name + role, problem, affects, build_first, looking_for chips, and a "Reach out" button (mailto to `tama.the@uky.edu` with subject `Re: {title}`). Close button returns to the map; map remains interactive while panel is open.
- **Filter strip** above the canvas: toggleable chips for theme (6 options) and commitment (3 options). Same `filter-chip` styling as `/projects`. Multi-select within each dimension; AND across dimensions. Filtered-out nodes fade to 0.1 opacity rather than disappearing — keeps spatial context.
- **Add your idea pill:** sticky top-right of the canvas, accent-colored. Opens the intake drawer.

### Realtime

Client subscribes to `ideas` table inserts via Supabase realtime. New approved or pending ideas animate into the map without a refresh. Sound-free, subtle scale-in.

## The intake form

Lives in a drawer that slides in from the right (same column as the read-side panel — only one slide-in surface ever open at a time). Triggered by the "+ Add your idea" pill.

### Required fields (above the fold)

| Field | Type | Notes |
|---|---|---|
| Your name | text | mirrors `RsvpForm` styling |
| UK email | email | `@uky.edu` regex check client-side |
| Idea title | text, ≤ 60 chars | What shows on hover |
| Theme | single-pick chips | 6 options matching the enum |
| Commitment | single-pick chips | Curious · Exploring · Committed |
| The problem | textarea, 3 rows | Required |

### Optional fields (below a collapsed "Tell us more (optional)" divider)

- Who it affects — one-liner
- What you'd build first — one-liner
- Looking for collaborators — multi-pick chips: Clinician · Coder · Designer · Writer · Researcher · Faculty sponsor
- Role — datalist matching `RsvpForm`'s `ROLES` array
- "Add me to the weekly listserv" — checkbox, default checked

### Honeypot

Invisible field named `website` (common spam-bait), `tabindex={-1}`, `aria-hidden`, positioned offscreen. Rejected server-side by the RLS `with check` clause.

### Submit flow

1. Client builds the row, calls `supabase.from('ideas').insert(...)`.
2. On success: button flips to "Submitted ✓ — pending review" (green, matches `RsvpForm`'s submitted state).
3. New node animates into the map in its pending visual style.
4. Drawer auto-closes after 1.5s.
5. On failure: drawer stays open, inline error below submit button, button returns to active state. No data loss.

### Validation

- HTML5 `required` on the six required fields.
- UK email regex: `/^[^\s@]+@uky\.edu$/i`. Inline error: "Please use your @uky.edu email."
- Title `maxLength={60}`.
- All other client-side validation kept light; trust the server (RLS + Postgres constraints).

## Page shell & navigation

- **Route:** `app/ideas/page.tsx`.
- **Nav:** add "Ideas" entry to `components/Nav.tsx`. Order: Projects · **Ideas** · Changelog · Join. Page sets `<Nav active="ideas" />`.
- **Header:** matches `/projects` rhythm — DotGrid background, eyebrow `Ideas · {cohort}`, `h-display` title "Ideas in the air.", short lead ("What people in the group are thinking about. Some are seeds, some are pitches. Add yours."), and a count chip ("{N} ideas · {M} looking for collaborators"). Compact — the map is the point.
- **Layout below header:** filter strip → map canvas (with sticky "+ Add your idea" pill) → footer.

## Mobile / responsive

At `< 768px` the physics map is unusable. Page degrades to a **clustered grid view**:

- One `<section>` per theme, h3 heading.
- Within each section, ideas render as small cards in a single-column stack, sorted by commitment (committed first within each theme).
- Commitment encoding moves from size→to→a leading colored dot + label ("● Committed", "○ Curious").
- "+ Add your idea" becomes a full-width button at the top of the page.
- Intake drawer slides up from the bottom instead of the right.
- Read-side detail also slides up from the bottom (full-height sheet).

Same data, two presentations. Detected via a single Tailwind breakpoint at `md:`.

## Error handling & edge cases

| Scenario | Behavior |
|---|---|
| Supabase fetch fails on load | Centered `ErrorBanner`-style message ("Couldn't load ideas — try refresh") with retry button. No empty canvas pretending all is well. |
| Submission fails | Drawer stays open with form state preserved, inline error below submit, button reverts. No data loss. |
| Zero ideas in DB | Map shows a centered placeholder ("No ideas yet — be the first") that opens the intake drawer on click. |
| Realtime subscription drops | Silent. Next page load picks up changes. |
| Submitter clicks their own pending node | Side panel renders normally — pending nodes are first-class. |
| Same email submits multiple ideas | Allowed; no dedup. |
| Title exceeds rendered node width | Truncate with ellipsis on node; full title in side panel. |
| Theme = `other` | Renders as a quieter cluster bottom-right of the canvas. |
| Rejected ideas | Filtered out by the `anon_read_visible` RLS policy — never leave the database for anon callers. Submitter sees nothing on the page; no email is sent to them. |

## New surfaces

### `app/ideas/page.tsx`

Page shell — header, count chip, mounts `<IdeasMap />` and `<IdeasGrid />` (one wins per breakpoint).

### `components/IdeasMap.tsx` (client)

Desktop map canvas. Owns the D3-force simulation, node rendering (SVG), hover/click handlers, filter state, and the realtime subscription. Renders the filter strip, the "+ Add your idea" pill, and slots `<IdeaDetailPanel />` and `<IdeaIntakeDrawer />`.

### `components/IdeasGrid.tsx` (client)

Mobile clustered grid. Same data source as `IdeasMap`. Renders themed sections of small cards with commitment dots.

### `components/IdeaDetailPanel.tsx` (client)

Side panel (desktop) / bottom sheet (mobile). Receives an idea object, renders full content + Reach out button.

### `components/IdeaIntakeDrawer.tsx` (client)

Intake form drawer. Mirrors `RsvpForm` field patterns. Owns submit logic.

### `lib/supabase.ts`

Single `createClient(...)` call with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Exports a typed `supabase` instance.

### `lib/ideas.ts`

Pure utilities: `themeToCluster(theme) → {x, y}`, `commitmentToVisual(commitment) → {radius, opacity, halo}`, `parseIdeaRow(row) → Idea`. Type-checked via `tsc`; behavior verified at integration points.

### `components/Nav.tsx` (modified)

Add `{ href: "/ideas", label: "Ideas" }` to the nav entries array.

### Supabase project setup (one-time, manual)

Create project. Create the `ideas` table and `ideas_public` view from the SQL in this spec. Apply the RLS policies. Generate anon key. Add to `.env.local` and Vercel envs:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Testing

Consistent with the rest of the site, no automated tests. Verification per task uses `npx tsc --noEmit` for types and `npm run build` for the full pipeline. One special check:

- **RLS policies** — verified manually after Supabase setup using the SQL editor: confirm anon cannot read PII columns, confirm anon cannot insert with `status != 'pending'`, confirm honeypot is rejected.

### Manual QA checklist

- [ ] Submit with only required fields → node appears as pending, drawer closes
- [ ] Submit with all fields → side panel shows everything correctly when clicked
- [ ] Email validation rejects non-`@uky.edu` addresses inline
- [ ] Honeypot field present in DOM but invisible; filling it blocks submission
- [ ] Moderation: flip `status` from pending → approved in Supabase dashboard, verify visual style updates on next page load
- [ ] Moderation: flip pending → rejected, verify node disappears
- [ ] Filter by theme: nodes outside filter fade, not vanish
- [ ] Filter by commitment: same
- [ ] Filter by theme + commitment combined: AND semantics
- [ ] Reach out button opens mailto to `tama.the@uky.edu` with subject pre-filled
- [ ] Resize to mobile (< 768px): grid view renders, map gone, intake drawer opens from bottom
- [ ] Empty state: with zero rows, placeholder shows and opens drawer
- [ ] Error state: with Supabase URL invalid, error banner shows with retry

## Out of scope (v1)

- Auto-promotion of `/pitch` submissions into the map
- Notifications (Slack/email) on new pending submissions — group lead checks dashboard
- Captcha (add Turnstile if spam becomes a problem)
- Per-idea comments/upvotes
- Idea editing or deletion by submitter
- Idea search box
- Tag/hashtag system beyond the 6 themes
- Date-based decay (older ideas dimming)
- Anonymous submissions (UK email required)

## Open questions

None at spec time. All design decisions resolved during brainstorming.
