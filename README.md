# AI Incubator @ University of Kentucky — site

Production codebase for [aiincubator.uky.edu](https://aiincubator.uky.edu).

The internal/external operating surface for the AI Incubator group at the
University of Kentucky College of Medicine. Shows active projects, the next
Friday meeting, recent activity, and how to get involved.

## Stack

- **Next.js 15** App Router with React 19, TypeScript strict mode
- **Dynamic deployment** on Vercel (formerly static export)
- **Neon Postgres** via Prisma 7 + PrismaPg adapter
- **`/admin` dashboard** (password-protected) for members, subscribers, RSVPs, pitches
- **No CMS yet.** Site content still in `content/site.ts` (Stage 2 will migrate this)

The original HTML/CSS/JS design prototype lives in [`reference/`](reference/)
and remains the source of truth for the inherited component system and
operational pages. The homepage now has a scoped **Studio Black** layer in
`app/globals.css`, documented in
[`docs/visual-design-schema.md`](docs/visual-design-schema.md). Avoid broad
visual refactors when a scoped change will do.

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
npm run build        # production build (.next/)
npm run start        # serve the production build locally
```

Type check: `npx tsc --noEmit`

## Deploying

Dynamic Next.js on Vercel.

### Required env vars

| Var | Value |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string |
| `DIRECT_URL` | Neon **direct** connection string (used by migrations) |
| `JWT_SECRET` | 32+ random chars; `openssl rand -hex 32` |
| `ADMIN_PASSWORD_HASH` | bcrypt hash from `node scripts/hash-password.mjs` |

### One-time setup

1. Provision a Neon project; copy both connection strings.
2. Locally: `cp prisma/.env.example .env.local`, fill in the values.
3. Run the initial migration: `npx prisma migrate deploy` (or `npm run db:deploy`).
4. Generate the client: `npm run db:generate`.
5. Generate an admin password hash: `node scripts/hash-password.mjs`.
6. Paste all four vars into Vercel's project Environment Variables.
7. Push to `master` — Vercel deploys.

### Smoke test

After deploy, run through [`docs/admin-smoke-test.md`](docs/admin-smoke-test.md).

## Project structure

```
AI INcubator/
├── app/
│   ├── layout.tsx          # root layout + theme init script
│   ├── globals.css         # all styling (copied from reference/site/styles.css)
│   ├── page.tsx            # /  (homepage)
│   ├── projects/page.tsx   # /projects (filterable)
│   └── join/page.tsx       # /join, including one-email member signup
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
│   ├── JoinIncubator.tsx   # one-email member signup (client)
│   ├── RsvpForm.tsx        # retained meeting-RSVP component (client)
│   └── SubscribeForm.tsx   # Friday-updates form (client)
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

The inherited tokens are documented inline in `app/globals.css` and in
[`reference/README.md`](reference/README.md): UK blue (`#0033A0` light /
`#5b8cff` dark), Geist + Geist Mono, and a default dark theme via
`<html data-theme="dark">`.

The current homepage's **Studio Black** visual language, including its palette,
typography, imagery, motion, and composition rules, is documented in
[`docs/visual-design-schema.md`](docs/visual-design-schema.md).

## Loose ends to pick up

These are real gaps. None blocks deploy.

1. **`session.teamsUrl` is a placeholder** (`#teams-link`). Replace in
   `content/site.ts` with the real Microsoft Teams join URL.
2. **Member signup, subscribe, RSVP, and pitch intake are wired.** Member
   signup is intentionally one email field. It creates the active roster and
   adds the member to Friday updates. Submissions land in Neon Postgres and
   surface in the password-protected `/admin` dashboard, with CSV export and
   status controls.
3. **No CMS / agent integration yet.** Stage 2 will migrate `content/site.ts`
   into the database and build a GitHub Action that:
   a) accepts the Friday transcript (file upload or webhook),
   b) calls Claude/GPT to generate a diff,
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

- [`docs/visual-design-schema.md`](docs/visual-design-schema.md) — the current
  homepage design language and rules for new expressive surfaces.
- [`reference/README.md`](reference/README.md) — the inherited design brief,
  philosophy, and token documentation for operational pages.
