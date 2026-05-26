# Handoff — AI Incubator @ University of Kentucky

The internal website / operating surface for the AI Incubator group at the University of Kentucky College of Medicine. Acts as the group's working dashboard — what projects are moving, what's on the next Friday meeting's agenda, who's in the group — not a recruiting brochure.

## About the design files

The files in this bundle (`site/index.html`, `site/projects.html`, `site/join.html`, `site/styles.css`, `site/site.js`) are **design references created in HTML**. They are prototypes showing the intended look, behavior, and content architecture — **not production code to ship as-is**.

The task is to **recreate these designs in a real codebase**, using a framework appropriate to the project. There is no existing codebase to inherit from, so you have freedom to choose the stack. Recommended:

- **Static-site framework** (Astro, Next.js with static export, Eleventy, or similar). The content updates are inherently low-frequency (weekly), and there is no per-user data — a statically-built site committed to a Git repo is the right architecture.
- **Markdown / JSON content files** as the canonical edit surface. See the "Content architecture" section below — this is the most important part of the brief.
- **Deployment**: Render, Vercel, Netlify, or GitHub Pages. The site at `aiincubator.uky.edu` should be deployable from a single `git push`.

The HTML prototype already implements the content-as-data architecture using a single inline `<script id="content" type="application/json">` block; this is a deliberate model that should carry into the real implementation.

## Fidelity

**High-fidelity.** Colors, typography, spacing, hover states, and animations are all final design decisions. Recreate pixel-perfectly. Specific design tokens are documented below in the "Design tokens" section and codified in `site/styles.css`.

## Design philosophy (critical context for the dev)

This is **not a marketing site**. It is the group's **operating surface**, designed to:

1. **Look credible to UK administrators and faculty**, exciting to students. Anchored in UK identity (blue, restrained type, College-of-Medicine adjacent) but with current-feeling motion and density.
2. **Lead with output, not description.** Active projects, upcoming session, recent activity log — not stat counters or aspirational copy.
3. **Distinguish "rich" projects from "just kicked off" projects honestly.** A new project with two co-leads and no IRB is *not* dressed up to look like a mature pilot. Its card explicitly says "Looking for collaborators" as its headline action. This is a design system commitment, not a fallback.
4. **Be agent-editable.** A meeting transcript should be runnable through an LLM agent that updates the site content. To support this, **all mutable content lives in a single JSON block**. Layout, styles, and behavior never need to change to add a project, log an update, or change the agenda.
5. **Plain operational voice.** No "Bring X. Leave with Y." No "Real X. Working Y." No anaphora, no slogan headings, no self-aware narration like "This page is our working surface." Read like a director writing a notice for their group.

## Content architecture (most important section)

In the HTML prototype, all dynamic content lives in `<script id="content" type="application/json">` inside `<head>` of `site/index.html`. **In the production implementation, this should become one or more content files that an agent or team lead can edit** — JSON, YAML, or Markdown frontmatter, depending on the framework.

The schema:

```jsonc
{
  "lastUpdated": "2026-05-25",         // ISO date — shown in footer, drives "Updated …" stamps
  "cohort": "Cohort 03 · Spring 2026", // string — shown in hero pill

  "session": {                          // The weekly meeting block
    "dayOfWeek": 5,                    // 0=Sun … 5=Fri
    "hour": 12,                        // 24-hour, local time
    "minute": 0,
    "venue": "Microsoft Teams",
    "teamsUrl": "https://teams.microsoft.com/...",  // ← currently placeholder
    "agenda": ["string", "string", ...]              // Bulleted into Right Now bar
  },

  "projects": [                         // Cards on homepage
    {
      "id": "stable-slug",             // immutable
      "name": "Display name",
      "tagline": "optional subtitle",
      "status": "active|building|kickoff|paused",  // controls visual treatment
      "stage": "Pilot",                // free text shown in status chip
      "area": "Med-Ed",                // free text shown as mono label
      "leads": "Bernard · Colson · Thé",  // free text
      "summary": "1–2 plain sentences. No rhetoric.",
      "anchors": ["string", ...],      // bullet items inside the card and hover-reveal
      "open": "Looking for ... .",      // ONLY for status: kickoff — replaces anchors
      "updated": "2026-05-15"          // ISO date
    }
  ],

  "log": [                              // Activity feed, NEWEST FIRST
    { "date": "2026-05-22", "project": "Markey", "note": "Kickoff — Pam Hull committed" }
  ],

  "leads": [                            // Faculty/collaborator block
    { "initials": "TT", "name": "Tama Thé, MD", "role": "Founder · EM", "areas": ["Med-Ed", "Pop Health"] }
  ]
}
```

### Visual contract per project status

| `status`   | Card shell           | Card body                                  | Headline action            |
|------------|----------------------|--------------------------------------------|----------------------------|
| `active`   | solid border         | mono data block of `anchors[]` + hover reveal panel | (none — info-dense)        |
| `building` | solid border         | same as `active`                           | (none — info-dense)        |
| `kickoff`  | **dashed** border    | `open` text shown prominently              | "Discuss at the next meeting →" |
| `paused`   | solid border, muted  | same as `active` with muted chip           | (none)                     |

The dashed border + prominent "Looking for collaborators" copy is the **honesty contract** — new projects must visually read as new, not as dressed-up mature work.

## Pages

### `/` (index.html)
The primary surface. Sections in order:

1. **Sticky nav** — logo, "AI Incubator / University of Kentucky" wordmark, link list (Overview / Projects / Team / Activity), primary CTA "Join Friday →" (top-right).
2. **Hero** — H1, lead paragraph, two CTAs ("Join Friday's meeting" primary; "See current projects" ghost). Hero meta strip: cohort pill + live countdown to next Friday noon. Animated dotgrid SVG background layer.
3. **Right Now bar** — three columns separated by vertical hairlines: *Next session* (date/time, venue, countdown, "Join in Teams →"), *On the agenda* (bulleted list, accent dash markers), *Recent activity* (3 latest log entries + link to full log).
4. **Active projects grid** — 3-column grid of rich project cards (status: active|building|paused). Each card: status chip + area, monospace `anchors[]` data block, project name + tagline + leads, on-hover dark reveal panel with full summary + meta.
5. **"Recently started" subgrid** — 3-column grid of kickoff cards (dashed border).
6. **How it works** — 3-step layout: Attend a meeting / Pitch an idea / Work on the project. Plain operational copy. Accent rule prefix on each step.
7. **People** — 2×4 grid of faculty/lead cards. Avatar (initials), name, role, area chips.
8. **Activity log** — full list rendered from `log[]`. Three columns: date / project name / note. Hover state expands horizontal padding.
9. **CTA banner** — dark inverted block. Eyebrow "Friday at noon", h2 "Join the next meeting.", session details, "Join this Friday" + "Add to calendar" buttons.
10. **Footer** — 4-column: brand summary / Explore / Connect / Listserv signup. Mono footer-bottom with last-updated stamp.

### `/projects.html`
Filterable full-project list. **Currently still uses the old project roster in static HTML — needs to be refactored to read from the same JSON content block as the homepage.** Reuse the same card components.

### `/join.html`
Onboarding paths + RSVP form + FAQ + contact strip.

- **Three paths** (3-column grid): PATH 01 Attend a meeting · PATH 02 Pitch a project (inverted dark card, accent) · PATH 03 Stay in the loop (with inline email subscribe).
- **RSVP form** (2-column: explainer + form card). Inputs: name, UK email, role (datalist), motivation chips, freeform textarea, listserv opt-in. Submit confirms inline (no backend in prototype).
- **FAQ** (2-column grid: question / answer pairs, hairline rules between).
- **Contact strip** (3-column card row): meeting info / email addresses / external channels.

## Theme system

Light + dark themes via `data-theme` on `<html>`. Default: **dark**. Accent palette swatches: UK blue (`#0033A0` light / `#5b8cff` dark), Forest green (`#00754f` light / `#4ecf9c` dark), Mono (no accent). Density: compact / default / roomy (scales `--d` multiplier from 0.75 / 1.0 / 1.25).

User preferences persist in `localStorage` under key `aiincubator.settings.v2`. Tweaks panel surfaces only when host posts `__activate_edit_mode` (this is a prototype affordance for design review; **do not port to production** — replace with a normal user-facing theme toggle if desired, but the on-page tweaks panel is internal-only).

## Design tokens

### Colors

**Light theme**
```
--bg          #fafaf7   (off-white)
--bg-elev     #ffffff
--surface     #ffffff
--surface-2   #f3f1ea
--ink         #0a0a0a
--ink-2       #3a3a3a
--ink-3       #6a6a6a
--ink-4       #a8a59a
--line        #e8e5db
--line-2      #d6d2c3
--accent      #0033A0  (UK blue)
--accent-soft rgba(0,51,160,0.08)
--signal      #00b07a  (the pulsing live-dot green)
```

**Dark theme**
```
--bg          #0a0a0a
--bg-elev     #111111
--surface     #141414
--surface-2   #1c1c1c
--ink         #fafafa
--ink-2       #d4d4d4
--ink-3       #888888
--ink-4       #555555
--line        #232323
--line-2      #2f2f2f
--accent      #5b8cff  (UK blue, dark-mode adjusted)
--accent-soft rgba(91,140,255,0.12)
```

### Typography

- **Sans**: Geist (300, 400, 500, 600, 700). Loaded from Google Fonts.
- **Mono**: Geist Mono (400, 500, 600). Loaded from Google Fonts.
- **Feature settings**: `font-feature-settings: 'ss01', 'cv11';` on body for stylistic alternates.
- Type ramp (see `styles.css` for exact values):
  - `.h-display`: clamp(40px, 6vw, 76px) / 500 / -0.035em / 1.02
  - `.h1`: clamp(32px, 4.4vw, 52px) / 500 / -0.028em / 1.05
  - `.h2`: clamp(24px, 2.6vw, 32px) / 500 / -0.022em / 1.1
  - `.h3`: 20px / 500 / -0.015em / 1.2
  - `.lead`: 19px / 400 / -0.005em / 1.5
  - body: 16px / 400 / 1.5
  - `.small`: 13px
  - `.eyebrow` / mono labels: 11–12px / mono / 0.06–0.08em letter-spacing / uppercase

### Spacing & layout

- `--container-max`: 1240px
- `--container-px`: 40px (22px under 900px)
- `--section-py`: `calc(112px * var(--d))`
- `--gap`: `calc(24px * var(--d))`
- Card padding: 22–24px
- Border radius: chips 100px (pill) · cards 14px · buttons 100px (pill) · CTA banner 20px

### Motion

- Easing: `cubic-bezier(0.22, 0.61, 0.36, 1)` exposed as `--ease`
- Standard transition duration: 0.18–0.22s
- Live dot: 2s pulse loop (`@keyframes pulse`)
- Dot grid: continuous slow sine ripple + mouse-parallax bump (radius 120px, easing into idle)
- Hover lifts: 2px translateY + shadow on cards

### Components

Documented inline in `styles.css` with section comments. Key components: `.nav` · `.btn` (+ `.primary`, `.lg`, `.sm`, `.ghost`) · `.chip` (+ `.live`, `.kick`, `.paused`) · `.card` (+ `.hover`) · `.proj-card` (+ `.kickoff`) · `.steps .step` · `.people .person` · `.log-row` · `.rightnow .rn-col` · `.cta-banner` · `.field` (input wrapper) · `.faq-item` · `.dotgrid` (animated SVG bg).

## Interactions & behavior

- **Countdown ticker** — recomputes the next Friday at noon every 1s; renders into all `[data-countdown="short"]` elements. The session day/hour come from the JSON (`session.dayOfWeek` / `hour` / `minute`).
- **Dot grid background** — JS-rendered SVG of circles with a sine-wave radius animation; hover near the grid bumps nearby dots' radii. Used as a hero/CTA-banner background layer.
- **Project card hover reveal** — dark panel slides up/in over the card body showing the full summary + anchors + last updated stamp. CSS-only transition.
- **Kickoff card hover** — dashed border becomes solid + accent-colored.
- **Tweaks panel** — internal-only, controlled by host postMessage protocol. Drop in production.
- **Forms** — RSVP and Subscribe forms confirm inline (text/style swap on submit). No backend in the prototype; wire to whatever email infra you adopt (Buttondown, Beehiiv, MailerLite, a simple Cloudflare Worker, etc.).

## Assets

- `assets/logo.png` — the AI Incubator logo (varsity lettering + green @ glyph). The `@` is treated as a meaningful identity element ("you, here, now"); preserve its prominence in any future logo work.
- **No imagery beyond the logo.** This is intentional. Avoid stock photos, AI-generated illustrations, robot iconography, or generic "futurism" graphics. The dot-grid animated bg is the only ornament.

## Loose ends / what's not done

These are known gaps the dev should pick up:

1. **`projects.html` still has the old hardcoded project roster** (PrecisionView, Discharge Translator, AI-FAST, etc.). Refactor to render from the same JSON content as the homepage.
2. **`session.teamsUrl` is a placeholder** (`"#teams-link"`). Drop in the real Microsoft Teams join URL.
3. **"This Week" agenda block inside `join.html` is hardcoded.** It should read from `session.agenda` in the JSON.
4. **No backend.** Subscribe + RSVP forms are no-op. Wire to your chosen infra.
5. **No CMS / agent integration yet.** The intended workflow is: someone (or an LLM agent) ingests the Friday meeting transcript, generates a diff against the content JSON, opens a PR. Build out the agent path in a small worker or GitHub Action.
6. **Speaker/lead photos** — currently using initials in avatar circles. If real headshots are added later, the `.avatar` component should swap to an `<img>` with the same dimensions.
7. **No SEO / OG tags / favicon** beyond a basic title and description. Add when going to production.

## Files in this bundle

```
site/
  index.html       — main page; contains the inline JSON content block
  projects.html    — full projects list (still on old roster — see "loose ends")
  join.html        — join paths + RSVP + FAQ + contact
  styles.css       — all styling, both themes
  site.js          — countdown, dot-grid renderer, JSON loader/renderer, tweaks panel
assets/
  logo.png         — AI Incubator logo
```

## Content (current, real)

The JSON block in `site/index.html` carries the **current real content** as of May 2026. Use it as the canonical source when porting:

- **Active projects**: Socratic Tutor (UKCOM Foundations AI tutor), KY-AHEAD ($475K state-funded cancer-screening outreach), NCIPP (K-2 teacher PD platform)
- **Just kicked off**: DROME (whole-blood drone delivery, Bernard + Bailey), Virtual Clinic (AI patient sims, Hall + Ayers), Markey HPV/Pap patient ed (Hull + Canedo)
- **Leads**: Tama Thé, Andrew Bernard, Pamela Hull, Alan Hall, Sean Bailey, Bin Huang
- **Meeting**: Fridays at noon in Microsoft Teams
