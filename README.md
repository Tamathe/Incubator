# AI Incubator @ University of Kentucky — site

Production codebase for [aiincubator.uky.edu](https://aiincubator.uky.edu).

The internal/external operating surface for the AI Incubator group at the
University of Kentucky College of Medicine. Shows active projects, the next
Friday meeting, recent activity, and how to get involved.

## Stack

- **Next.js 15** App Router with React 19, TypeScript strict mode
- **Static export** (`output: 'export'`) — the build produces `out/`, plain
  HTML/CSS/JS deployable anywhere (Vercel, Netlify, GitHub Pages, S3, Render)
- **No backend.** Forms confirm inline. See "Loose ends" for wiring options.
- **No CMS.** Content is a single TypeScript file: [`content/site.ts`](content/site.ts).

The original HTML/CSS/JS design prototype lives in [`reference/`](reference/)
and is the source of truth for visual fidelity. The CSS in `app/globals.css` is
copied from there verbatim — do not refactor it unless redesigning.

## Editing content

**Everything mutable about the site lives in [`content/site.ts`](content/site.ts).**

That one file controls projects, the weekly session/agenda, the activity log,
and the leads grid. No layout, style, or component file needs to change to add
a project, log an update, or change the agenda.

```ts
{
  lastUpdated: "2026-05-25",
  cohort: "Cohort 03 · Spring 2026",
  session: { dayOfWeek: 5, hour: 12, minute: 0, venue: "Microsoft Teams", teamsUrl: "…", agenda: [...] },
  projects: [ { id, name, status, stage, area, leads, summary, anchors, updated } … ],
  log:      [ { date, project, note } … ],   // newest first
  leads:    [ { initials, name, role, areas } … ],
}
```

### Project status → visual contract

| `status`   | Card                   | Headline action                  |
|------------|------------------------|----------------------------------|
| `active`   | solid border, dense    | (none — info-dense reveal)       |
| `building` | solid border, dense    | (none — info-dense reveal)       |
| `kickoff`  | **dashed** border      | "Discuss at the next meeting →"  |
| `paused`   | solid border, muted    | (none)                           |

The dashed border + prominent "Looking for collaborators" copy is the
**honesty contract** — new projects must visually read as new, not as
dressed-up mature work.

### Agent-editable

The intended workflow is: someone (or an LLM agent) ingests the Friday meeting
transcript, generates a patch against `content/site.ts`, opens a PR. The
schema is intentionally narrow to make this safe.

## Running locally

Requires Node 20+.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export → out/
npm run preview      # serve the built output locally
```

Type check: `npx tsc --noEmit`

## Deploying

The build produces a fully static `out/` directory.

### Vercel (recommended)
1. Push this folder to a GitHub repo.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Next.js**. No other config needed — `next.config.mjs`
   already enables static export.
4. Point `aiincubator.uky.edu` at the Vercel project's domain.

### Netlify / Render / GitHub Pages / any static host
1. `npm run build`
2. Upload the contents of `out/` to your host.
3. SPA fallback is not needed — every route is a real `.html` file.

## Project structure

```
AI INcubator/
├── app/
│   ├── layout.tsx          # root layout + theme init script
│   ├── globals.css         # all styling (copied from reference/site/styles.css)
│   ├── page.tsx            # /  (homepage)
│   ├── projects/page.tsx   # /projects (filterable)
│   └── join/page.tsx       # /join
├── components/
│   ├── Nav.tsx             # sticky nav
│   ├── Footer.tsx          # 4-col footer + listserv form
│   ├── DotGrid.tsx         # animated SVG bg (client)
│   ├── Countdown.tsx       # live next-Friday countdown (client)
│   ├── SessionWhen.tsx     # "Fri May 29 · 12:00pm" label (client)
│   ├── RightNowBar.tsx     # session / agenda / activity strip
│   ├── ProjectCard.tsx     # rich card with hover reveal
│   ├── KickoffCard.tsx     # dashed-border kickoff variant
│   ├── PersonCard.tsx
│   ├── LogList.tsx
│   ├── CTABanner.tsx
│   ├── ProjectsFilteredList.tsx  # client-side status/area filtering
│   ├── RsvpForm.tsx        # join page form (client)
│   └── SubscribeForm.tsx   # listserv form (client)
├── content/
│   └── site.ts             # ⬅ canonical edit surface
├── lib/
│   └── session.ts          # nextSession() + date formatters
├── public/
│   └── logo.png
├── reference/              # original design prototype (do not edit)
├── next.config.mjs
└── package.json
```

## Design tokens

Documented inline in `app/globals.css` and in [`reference/README.md`](reference/README.md).
Headline summary: UK blue (`#0033A0` light / `#5b8cff` dark), Geist + Geist Mono,
default dark theme via `<html data-theme="dark">`.

## Loose ends to pick up

These are real gaps. None blocks deploy.

1. **`session.teamsUrl` is a placeholder** (`#teams-link`). Replace in
   `content/site.ts` with the real Microsoft Teams join URL.
2. **Subscribe + RSVP forms are no-op.** Wire to your chosen infra:
   - Listserv: Buttondown, Beehiiv, MailerLite, or a Cloudflare Worker forwarding
     to UK ITS distribution lists. The submit handler is in
     `components/SubscribeForm.tsx` and `components/RsvpForm.tsx`.
   - RSVP: at minimum forward to `incubator@uky.edu` via Formspark/Formspree/
     Cloudflare Worker; ideally write to a small store (Notion, Airtable,
     Supabase) so the team can see who's coming Friday.
3. **No CMS / agent integration yet.** Build a GitHub Action that:
   a) accepts the Friday transcript (file upload or webhook),
   b) calls Claude/GPT to generate a diff against `content/site.ts`,
   c) opens a PR for human review.
4. **Speaker/lead photos** — currently initials in avatar circles. If real
   headshots are added, swap the `.avatar` element in
   `components/PersonCard.tsx` to an `<img>` of the same dimensions.
5. **No OG image / favicon set beyond the logo.** Add `app/icon.png`,
   `app/apple-icon.png`, and `app/opengraph-image.png` (or `.tsx` generators)
   when going public.
6. **Theme toggle.** The prototype's internal-only "Tweaks panel" was
   intentionally not ported. The theme init script in `app/layout.tsx` still
   reads `localStorage['aiincubator.settings.v2']` so an in-nav theme toggle
   (sun/moon) can be added later without rebuilding the persistence layer.

## See also

- [`reference/README.md`](reference/README.md) — the original design brief,
  philosophy, and token documentation. Required reading before any visual
  changes.
