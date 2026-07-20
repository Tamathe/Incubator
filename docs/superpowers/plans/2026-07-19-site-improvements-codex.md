# Site Improvements Implementation Plan (for Codex)

> **For agentic workers:** Execute tasks in order, one commit per task. Steps use checkbox (`- [ ]`) syntax for tracking. Line numbers are accurate as of the commit this plan was written against — if a file has shifted, match by the quoted code, not the number. If a step's "verify" command fails, stop and fix before committing; never commit a task with failing verification.

**Goal:** Make the AI Incubator site more compelling and usable by rendering the trust content that already exists in the data layer, closing the RSVP conversion loop, fixing accessibility and performance regressions, and removing dead code.

**Architecture:** This is a Next.js 15 App Router site. The live public site is exactly three pages — `/` ([app/page.tsx](../../../app/page.tsx)), `/projects`, `/join` — six other routes permanently redirect via `next.config.mjs`. Nearly all copy comes from the single content file `content/site.ts` ("Edit ONLY this file" contract). Forms POST to `app/api/*` routes backed by Prisma. There is **no email-sending infrastructure** — do not add any; instead the plan makes the UI truthful about that.

**Tech Stack:** Next.js 15.5 / React 19 / TypeScript strict / plain CSS in `app/globals.css` (no Tailwind) / vitest / Prisma.

**Constraints — read before starting:**

1. **Do not touch** `components/IdeasMap.tsx`, `IdeasGrid.tsx`, `IdeaIntakeDrawer.tsx`, `IdeaDetailPanel.tsx`, or the `d3-force` dependency. They look dead but are reserved by an approved expansion spec (`docs/superpowers/specs/2026-07-17-idea-board-toolkit-sessions-design.md`).
2. **Do not delete** `app/changelog/` — `scripts/build-changelog.mjs` (run by both `dev` and `build` npm scripts) writes `app/changelog/data.json`.
3. **Do not invent facts.** Anything needing real-world data (faculty names, grant amounts, statistics, video transcript) is listed in Appendix A for the site owner — build the rendering, leave that data empty.
4. The site defaults to **dark theme** (`data-theme="dark"` on `<html>`); a persisted setting can switch to light. CSS changes must work in both.
5. Repo conventions: TypeScript strict, no `any`, prefer `const`, no comments on unchanged code, conventional-ish commit messages (`feat:`, `fix:`, `perf:`, `refactor:`, `chore:`).

**Baseline commands** (run from repo root, bash):

```bash
npm ci
npx tsc --noEmit          # must be clean before you start
npm test                  # vitest; must pass before you start
npm run dev               # dev server on http://localhost:3000
```

---

## Task 0: Branch

- [ ] **Step 1: Create the working branch**

```bash
git checkout -b codex/site-improvements
```

- [ ] **Step 2: Confirm baseline is green**

Run: `npx tsc --noEmit && npm test`
Expected: no type errors; all existing vitest suites pass.

---

## Task 1: Hero says who, where, and when

The first screen never mentions the University of Kentucky, the College of Medicine, the health focus, or the meeting time. Fix all four in the hero, and give the `#fridays` chapter (the Nav "Fridays" target) an RSVP action — it is currently the only anchor chapter without one.

**Files:**
- Modify: `app/page.tsx:117-149`
- Modify: `app/globals.css` (append)

- [ ] **Step 1: Replace the hero deck and add a logistics line**

In `app/page.tsx`, the current hero message block is:

```tsx
            <div className="studio-hero-message">
              <h1>Learn AI by working on something real.</h1>
              <p className="studio-hero-deck">
                The AI Incubator is a group of students, faculty, and staff who
                meet once a week to solve problems with AI.
              </p>
            </div>

            <div className="studio-hero-actions">
              <Link
                className="studio-button studio-button-primary"
                href="/join"
              >
                Join us <span aria-hidden="true">-&gt;</span>
              </Link>
              <Link className="studio-text-link" href="/projects">
                See projects <span aria-hidden="true">-&gt;</span>
              </Link>
            </div>
```

Replace with:

```tsx
            <div className="studio-hero-message">
              <h1>Learn AI by working on something real.</h1>
              <p className="studio-hero-deck">
                We are a University of Kentucky College of Medicine community —
                students, faculty, and staff who meet every week to work on
                real problems in health care and beyond with AI.
              </p>
            </div>

            <div className="studio-hero-actions">
              <Link
                className="studio-button studio-button-primary"
                href="/join"
              >
                Join us <span aria-hidden="true">-&gt;</span>
              </Link>
              <Link className="studio-text-link" href="/projects">
                See projects <span aria-hidden="true">-&gt;</span>
              </Link>
            </div>

            <p className="studio-hero-when mono">
              Fridays · Noon · Microsoft Teams
            </p>
```

- [ ] **Step 2: Add an RSVP link to the `#fridays` chapter**

In `app/page.tsx`, the fridays chapter currently reads:

```tsx
        <StoryChapter
          id="fridays"
          side="right"
          variant="anchor"
          title="We meet once a week"
          body="to share strategies, pitch ambitious ideas, and test new tools."
          video="/media/story/02-student-demo.mp4"
          poster="/media/story/02-student-demo.jpg"
        >
          <CommercialPlayer />
        </StoryChapter>
```

Add a `primaryLink` prop (the `StoryChapter` component supports `primaryLink` and `children` together):

```tsx
        <StoryChapter
          id="fridays"
          side="right"
          variant="anchor"
          title="We meet once a week"
          body="to share strategies, pitch ambitious ideas, and test new tools."
          video="/media/story/02-student-demo.mp4"
          poster="/media/story/02-student-demo.jpg"
          primaryLink={{ href: "/join", label: "RSVP for Friday" }}
        >
          <CommercialPlayer />
        </StoryChapter>
```

- [ ] **Step 3: Style the logistics line**

Append to the end of `app/globals.css`:

```css
/* ── Hero logistics line ─────────────────────────────────── */
.studio-hero-when {
  margin-top: 16px;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
}
```

(The hero sits over a shaded photo in both themes, so a fixed light color is correct here — it matches the existing hero text treatment.)

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`, then with the dev server running:

```bash
curl -s http://localhost:3000/ | grep -o "College of Medicine" | head -1
curl -s http://localhost:3000/ | grep -o "Fridays · Noon · Microsoft Teams"
curl -s http://localhost:3000/ | grep -o "RSVP for Friday"
```

Expected: each grep prints its match.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat: hero states institution, domain, and meeting time; fridays chapter gets RSVP link"
```

---

## Task 2: Mount PartnersStrip and write its missing CSS

`content/site.ts:476-524` holds seven real partners (Markey Cancer Center, KY Cabinet for Health & Family Services, Kentucky Cancer Registry, Microsoft, UK Center of Excellence in Rural Health, UK College of Medicine, UK College of Nursing). `components/PartnersStrip.tsx` renders them but is mounted nowhere, and its CSS classes were never written.

**Files:**
- Modify: `app/page.tsx` (imports + one mount point)
- Modify: `app/globals.css` (append)

- [ ] **Step 1: Import and mount PartnersStrip on the homepage**

In `app/page.tsx`, add to the imports at the top:

```tsx
import PartnersStrip from "@/components/PartnersStrip";
```

Then mount it between the closing `</section>` of the `studio-builds` section and the final `<StoryChapter id="come-this-friday" ...>`:

```tsx
        </section>

        <PartnersStrip />

        <StoryChapter
          id="come-this-friday"
```

- [ ] **Step 2: Write the missing CSS**

Append to `app/globals.css`:

```css
/* ── Partners strip ──────────────────────────────────────── */
.partners-strip {
  padding: calc(var(--section-py) * 0.5) var(--container-px);
}
.partners-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 36px;
  margin-top: 20px;
}
.partner-item {
  min-width: 180px;
}
.partner-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--ink);
}
.partner-role {
  margin-top: 2px;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-3);
}
```

- [ ] **Step 3: Verify**

```bash
curl -s http://localhost:3000/ | grep -o "Markey Cancer Center"
curl -s http://localhost:3000/ | grep -o "Kentucky Cancer Registry"
```

Expected: both names print. Also confirm visually that the strip renders between "Current projects" and the final "Join us" chapter.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat: mount partners strip on homepage with styles"
```

---

## Task 3: Proof near the RSVP form, and honest homepage claims

The `/join` conversion page has zero credibility signals, while the homepage claims students are "Founding their own startups, leading national discussions" with nothing rendered to back it. Use the three finished student builds (already in `content.studentWork` with real YouTube links) as proof on `/join`, and soften the homepage claim to what the page itself demonstrates.

**Files:**
- Modify: `app/join/page.tsx:97-102`
- Modify: `app/page.tsx:160`
- Modify: `app/globals.css` (append)

- [ ] **Step 1: Add a "Made by members" list to the RSVP column**

In `app/join/page.tsx`, the RSVP left column currently ends with:

```tsx
              <div className="community-agenda">
                <div>This week · {content.cohort}</div>
                {content.session.agenda.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
```

Directly after that `</div>`, add:

```tsx
              <div className="join-proof">
                <div className="join-proof-label mono">Made by members</div>
                <ul>
                  {content.studentWork.map((work) => (
                    <li key={work.id}>
                      {work.videoUrl ? (
                        <a
                          href={work.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {work.title}
                        </a>
                      ) : (
                        <span>{work.title}</span>
                      )}{" "}
                      — {work.person}
                    </li>
                  ))}
                </ul>
              </div>
```

- [ ] **Step 2: Soften the homepage claim to match rendered evidence**

In `app/page.tsx`, the student-work anchor chapter has:

```tsx
            body="Founding their own startups, leading national discussions, and taking on real-life projects."
```

Replace with:

```tsx
            body="Shipping real tools, leading live demonstrations, and taking on real-life projects."
```

- [ ] **Step 3: Style the proof list**

Append to `app/globals.css`:

```css
/* ── Join-page proof list ────────────────────────────────── */
.join-proof {
  margin-top: 28px;
}
.join-proof-label {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-3);
}
.join-proof ul {
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
  display: grid;
  gap: 8px;
}
.join-proof li {
  font-size: 14px;
  color: var(--ink-2);
}
.join-proof a {
  color: var(--ink);
  text-decoration: underline;
  text-underline-offset: 3px;
}
```

- [ ] **Step 4: Verify**

```bash
curl -s http://localhost:3000/join | grep -o "Made by members"
curl -s http://localhost:3000/join | grep -o "Socratic Tutor"
curl -s http://localhost:3000/ | grep -o "Shipping real tools"
```

Expected: all three print.

- [ ] **Step 5: Commit**

```bash
git add app/join/page.tsx app/page.tsx app/globals.css
git commit -m "feat: student-build proof on join page; homepage claim matches rendered evidence"
```

---

## Task 4: Footer — institutional affiliation, honest link labels, freshness stamp

The footer reads like a personal project: an unexplained "Lenario22 on GitHub" profile link, a bare "GitHub" label, no link to the College of Medicine, and no evidence the site is maintained.

**Files:**
- Modify: `components/Footer.tsx`

- [ ] **Step 1: Rewrite the Connect column and bottom line**

Replace the entire contents of `components/Footer.tsx` with:

```tsx
import Link from "next/link";
import Logo from "./Logo";
import SubscribeForm from "./SubscribeForm";
import { content } from "@/content/site";
import { fmtIsoDate } from "@/lib/session";

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div>
            <Link
              className="nav-brand"
              href="/"
              style={{ marginBottom: 14 }}
              aria-label="AI Incubator at the University of Kentucky home"
            >
              <Logo alt="" className="nav-logo" src="/logo-incubator.png" />
            </Link>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/#fridays">Fridays</Link></li>
              <li><Link href="/#student-work">Student work</Link></li>
              <li><Link href="/join">Join us</Link></li>
            </ul>
          </div>
          <div>
            <h4>Connect</h4>
            <ul>
              <li><a href="mailto:incubator@uky.edu">incubator@uky.edu</a></li>
              <li>
                <a
                  href="https://med.uky.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  UK College of Medicine
                </a>
              </li>
              <li>
                <a
                  href="https://tamathe.com/incubator"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  About Tama Thé, founder -&gt;
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Tamathe/Incubator"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Site source on GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Friday updates</h4>
            <SubscribeForm />
          </div>
        </div>
        <div className="foot-bottom">
          <span>
            &copy; {new Date().getFullYear()} AI Incubator · University of
            Kentucky College of Medicine · Updated{" "}
            {fmtIsoDate(content.lastUpdated, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </footer>
  );
}
```

Notes: this deletes the `https://github.com/Lenario22` profile link (see Appendix A item 6 — the owner decides how to credit contributors) and relabels the repo link.

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
curl -s http://localhost:3000/ | grep -o "UK College of Medicine"
curl -s http://localhost:3000/ | grep -o "July 16, 2026"
curl -s http://localhost:3000/ | grep -c "Lenario22" || true
```

Expected: first two greps print matches; the last prints `0`. (Do not grep for the contiguous string "Updated July 16, 2026" — React SSR emits `<!-- -->` separators between adjacent JSX text nodes, so only the date itself is contiguous in the served HTML. The `|| true` keeps the zero-match case from reading as a failed command.)

- [ ] **Step 3: Commit**

```bash
git add components/Footer.tsx
git commit -m "feat: footer affiliation link, honest labels, last-updated stamp"
```

---

## Task 5: Recent-activity strip on /projects

Six dated log entries exist in `content.log` but render nowhere. Show the latest three on `/projects` as evidence the group is active.

**Files:**
- Modify: `app/projects/page.tsx`
- Modify: `app/globals.css` (append)

- [ ] **Step 1: Render the log excerpt**

Replace the contents of `app/projects/page.tsx` with:

```tsx
import { content } from "@/content/site";
import { fmtIsoDate } from "@/lib/session";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProjectsFilteredList from "@/components/ProjectsFilteredList";

export const metadata = {
  title: "Current projects · AI Incubator",
  description:
    "See what people in the UK AI Incubator are working on and where a student or collaborator could help.",
};

export default function ProjectsPage() {
  return (
    <>
      <Nav active="projects" />

      <main className="community-page" id="main">
        <header className="community-hero container">
          <h1>Current projects.</h1>
          <p className="lead">
            See what teams are working on and where you could help.
          </p>
        </header>

        <section
          className="container recent-activity"
          aria-labelledby="recent-activity-title"
        >
          <h2 id="recent-activity-title" className="eyebrow">
            Recent activity
          </h2>
          <ul>
            {content.log.slice(0, 3).map((entry) => (
              <li key={`${entry.date}-${entry.project}`}>
                <span className="mono">{fmtIsoDate(entry.date)}</span>
                <strong>{entry.project}</strong>
                <span>{entry.note}</span>
              </li>
            ))}
          </ul>
        </section>

        <div id="project-list">
          <ProjectsFilteredList projects={content.projects} />
        </div>
      </main>

      <Footer />
    </>
  );
}
```

(The `id="main"` on `<main>` is the skip-link target added in Task 13 — adding it now avoids touching this file twice.)

- [ ] **Step 2: Style the strip**

Append to `app/globals.css`:

```css
/* ── Recent activity strip (/projects) ───────────────────── */
.recent-activity {
  padding-bottom: 32px;
}
.recent-activity ul {
  list-style: none;
  padding: 0;
  margin: 14px 0 0;
  display: grid;
  gap: 10px;
}
.recent-activity li {
  display: grid;
  grid-template-columns: 64px minmax(120px, 240px) 1fr;
  gap: 14px;
  align-items: baseline;
  font-size: 14px;
  color: var(--ink-2);
}
.recent-activity li .mono {
  font-size: 12px;
  color: var(--ink-3);
}
@media (max-width: 720px) {
  .recent-activity li {
    grid-template-columns: 64px 1fr;
  }
  .recent-activity li span:last-child {
    grid-column: 2;
  }
}
```

- [ ] **Step 3: Verify**

```bash
curl -s http://localhost:3000/projects | grep -o "Recent activity"
curl -s http://localhost:3000/projects | grep -o "Jul 4"
```

Expected: both print (the newest log entry is dated 2026-07-04).

- [ ] **Step 4: Commit**

```bash
git add app/projects/page.tsx app/globals.css
git commit -m "feat: recent-activity strip on projects page"
```

---

## Task 6: Project cards — truthful status chips, clickable homepage cards, a next step

Three fixes: (a) the status chip on `/projects` renders the *stage* text, so an `active` project's chip literally reads "Planning a…"; (b) homepage project cards are not links; (c) the "Where you could help" expansion dead-ends with no CTA.

**Files:**
- Modify: `components/ProjectCard.tsx`
- Modify: `app/page.tsx:194-216`
- Modify: `app/globals.css` (append)

- [ ] **Step 1: Fix StatusChip and add stage line + CTA in ProjectCard**

Replace the contents of `components/ProjectCard.tsx` with:

```tsx
import Link from "next/link";
import { content } from "@/content/site";
import type { Project } from "@/content/site";

interface ProjectCardProps {
  project: Project;
}

function StatusChip({ project }: { project: Project }) {
  const labels = {
    active: { cls: "live", text: "Active" },
    building: { cls: "live", text: "In development" },
    kickoff: { cls: "kick", text: "Just kicked off" },
    paused: { cls: "paused", text: "On hold" },
  } as const;
  const status = labels[project.status];
  return <span className={`chip ${status.cls}`}>{status.text}</span>;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const openActions = content.actions.filter(
    (action) => action.project === project.id && action.status === "open",
  );
  const hasContributionDetails =
    Boolean(project.open) ||
    Boolean(project.studentFit?.length) ||
    openActions.length > 0;

  return (
    <article className="project-index-card" data-id={project.id}>
      <header className="project-index-head">
        <StatusChip project={project} />
        <span className="project-index-area mono">{project.area}</span>
      </header>

      <div className="project-index-body">
        <h2>{project.name}</h2>
        <p className="project-index-summary">{project.summary}</p>
      </div>

      <div className="project-index-meta">
        <span className="project-index-stage">{project.stage}</span>
        <span>Led by {project.leads}</span>
      </div>

      {hasContributionDetails && (
        <details className="project-index-details">
          <summary>
            Where you could help <span aria-hidden="true">+</span>
          </summary>
          <div>
            {project.open && <p>{project.open}</p>}
            {project.studentFit && project.studentFit.length > 0 && (
              <ul>
                {project.studentFit.map((fit) => <li key={fit}>{fit}</li>)}
              </ul>
            )}
            {openActions.length > 0 && (
              <ul>
                {openActions.map((action) => (
                  <li key={action.id}>{action.body} <span className="mono">{action.owner}</span></li>
                ))}
              </ul>
            )}
            <p className="project-index-cta">
              <Link href="/join">
                Interested? Come Friday <span aria-hidden="true">-&gt;</span>
              </Link>
            </p>
          </div>
        </details>
      )}
    </article>
  );
}
```

- [ ] **Step 2: Make homepage project cards link to /projects**

In `app/page.tsx`, the card loop currently renders bare `<article>` elements:

```tsx
            {featured.map(({ story, project }) => (
              <article
                className="studio-research-card"
                data-project={project.id}
                key={project.id}
              >
```

Wrap each card in a `Link` (an `<article>` inside `<a>` is valid HTML):

```tsx
            {featured.map(({ story, project }) => (
              <Link
                className="studio-research-card-link"
                href="/projects"
                key={project.id}
              >
                <article
                  className="studio-research-card"
                  data-project={project.id}
                >
```

and close it — the card's closing tags become:

```tsx
                </article>
              </Link>
            ))}
```

(Indent the article's inner JSX one level deeper; remove the `key` from `<article>` since it moved to `Link`.)

- [ ] **Step 3: Styles**

Append to `app/globals.css`:

```css
/* ── Project card links & CTA ────────────────────────────── */
.studio-research-card-link {
  display: block;
  color: inherit;
  text-decoration: none;
}
.project-index-stage {
  display: block;
  color: var(--ink-3);
}
.project-index-cta {
  margin-top: 12px;
}
.project-index-cta a {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
curl -s http://localhost:3000/projects | grep -o "In development" | head -1
curl -s http://localhost:3000/projects | grep -o "Interested? Come Friday" | head -1
curl -s http://localhost:3000/ | grep -o "studio-research-card-link" | head -1
```

Expected: all three greps print. The `/projects` filter labels ("Active", "In development") now match the chip text on cards.

- [ ] **Step 5: Commit**

```bash
git add components/ProjectCard.tsx app/page.tsx app/globals.css
git commit -m "fix: truthful status chips, clickable homepage cards, project-card CTA"
```

---

## Task 7: RSVP success card with the Teams link and a calendar invite

Today the RSVP success state flips a button label to "Confirmed" and nothing else, while the page copy promises "We will send the Teams link and a reminder" — but there is no email infrastructure. Give the success state everything the promise implies, and make the copy truthful.

**Files:**
- Modify: `components/RsvpForm.tsx`
- Modify: `app/join/page.tsx:93-95`

- [ ] **Step 1: Add imports to RsvpForm**

In `components/RsvpForm.tsx` (a `"use client"` component), extend the imports at the top:

```tsx
"use client";

import { useState } from "react";
import { content } from "@/content/site";
import { nextSession, fmtSessionWhen } from "@/lib/session";
import {
  buildIcsEvent,
  downloadIcs,
  openFridayToIcsEvent,
  toIsoDate,
} from "@/lib/calendar";
```

- [ ] **Step 2: Add the invite-download handler**

Inside the `RsvpForm` component body, after the `togglePick` function, add:

```tsx
  function handleDownloadInvite() {
    const friday = nextSession();
    const ics = buildIcsEvent(openFridayToIcsEvent(friday));
    downloadIcs(`aiincubator-${toIsoDate(friday)}.ics`, ics);
  }
```

- [ ] **Step 3: Render a confirmation card instead of the form on success**

At the top of the component's `return`-preceding logic there are already:

```tsx
  const submitted = state.kind === "done";
  const sending = state.kind === "sending";
```

Directly after those two lines, add an early return:

```tsx
  if (submitted) {
    return (
      <div className="card" style={{ padding: 32 }} role="status">
        <h3 style={{ margin: 0, fontSize: 22 }}>
          You&apos;re confirmed for Friday.
        </h3>
        <p className="body" style={{ marginTop: 10 }}>
          {fmtSessionWhen(nextSession())} · {content.session.venue}
        </p>
        <div
          style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}
        >
          <a
            className="btn primary"
            href={content.session.teamsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open the Teams meeting <span className="arrow">-&gt;</span>
          </a>
          <button
            type="button"
            className="btn ghost"
            onClick={handleDownloadInvite}
          >
            Add to calendar
          </button>
        </div>
        <p className="small" style={{ marginTop: 16 }}>
          Save the invite — the Teams link lives inside it. See you Friday.
        </p>
      </div>
    );
  }
```

Leave the rest of the form JSX unchanged (the `submitted` styling branches on the button are now dead in practice but harmless; do not refactor them in this task).

- [ ] **Step 4: Make the join-page promise truthful**

In `app/join/page.tsx`, replace:

```tsx
              <p className="body community-section-copy">
                We will send the Teams link and a reminder.
              </p>
```

with:

```tsx
              <p className="body community-section-copy">
                RSVP so we can save you a seat — the Teams link and a calendar
                invite appear right after you submit.
              </p>
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit`. Then in a browser on `http://localhost:3000/join`, fill the RSVP form with a test name/email and submit.

Expected: the form is replaced by the confirmation card showing the next Friday's date, an "Open the Teams meeting" link pointing at `teams.microsoft.com`, and "Add to calendar" downloads an `.ics` file. (If the local DB is not configured the API returns 503 — the error path renders instead; that still proves wiring. To force the success path locally, you may temporarily stub `fetch` in DevTools, but do not change the component to fake success.)

- [ ] **Step 6: Commit**

```bash
git add components/RsvpForm.tsx app/join/page.tsx
git commit -m "feat: RSVP confirmation card with Teams link and calendar invite; truthful RSVP copy"
```

---

## Task 8: /join shows a real date, an honest agenda label, pitch steps, and a perk

Four small edits to `app/join/page.tsx` plus one new tiny client component: (a) the hero never shows a concrete date; (b) "This week ·" labels a static agenda that goes stale; (c) the pitch section lost the "what happens next" explainer that lived on the deleted-in-spirit `/pitch` page; (d) the FAQ answers objections but never states a positive benefit.

**Files:**
- Create: `components/NextSessionDate.tsx`
- Modify: `app/join/page.tsx`
- Modify: `app/globals.css` (append)

- [ ] **Step 1: Create the client date component**

Create `components/NextSessionDate.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { nextSession, fmtSessionWhen } from "@/lib/session";

/** Renders the next Friday-session date client-side (avoids a stale
 * build-time date on a statically rendered page). */
export default function NextSessionDate() {
  const [when, setWhen] = useState<string | null>(null);

  useEffect(() => {
    setWhen(fmtSessionWhen(nextSession()));
  }, []);

  if (!when) return null;
  return (
    <p className="community-hero-when mono">
      Next meeting: {when} · Microsoft Teams
    </p>
  );
}
```

- [ ] **Step 2: Mount it in the join hero and relabel the agenda**

In `app/join/page.tsx`:

Add the import:

```tsx
import NextSessionDate from "@/components/NextSessionDate";
```

In the hero, after the `<p className="lead">…</p>` block, add:

```tsx
          <NextSessionDate />
```

Change the agenda label from:

```tsx
                <div>This week · {content.cohort}</div>
```

to:

```tsx
                <div>On the agenda · {content.cohort}</div>
```

- [ ] **Step 3: Add pitch process steps**

In `app/join/page.tsx`, the pitch section's left column is:

```tsx
            <div>
              <h2 className="h1">Bring a problem.</h2>
              <p className="body community-section-copy">
                Tell us what is stuck, who it affects, and what you would test
                first.
              </p>
            </div>
```

After the `<p>…</p>`, add:

```tsx
              <ol className="pitch-steps">
                <li>
                  <strong>Submit.</strong> Two or three sentences per box is
                  enough.
                </li>
                <li>
                  <strong>We read it.</strong> The organizers follow up by
                  email.
                </li>
                <li>
                  <strong>Friday.</strong> If it fits, the group works your
                  problem together.
                </li>
              </ol>
```

- [ ] **Step 4: Add a benefit FAQ entry**

In the `FAQ` array in `app/join/page.tsx`, after the "Do I need to attend every week?" entry, insert:

```tsx
  {
    q: "What do I get out of coming?",
    a: "Weekly demos, help on your own project, and hands-on practice with the professional AI coding tools UK students already have access to.",
  },
```

- [ ] **Step 5: Styles**

Append to `app/globals.css`:

```css
/* ── Join page: next-session line & pitch steps ──────────── */
.community-hero-when {
  margin-top: 14px;
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-3);
}
.pitch-steps {
  margin: 18px 0 0;
  padding-left: 20px;
  display: grid;
  gap: 10px;
  font-size: 14px;
  color: var(--ink-2);
}
.pitch-steps strong {
  color: var(--ink);
}
```

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
curl -s http://localhost:3000/join | grep -o "On the agenda"
curl -s http://localhost:3000/join | grep -o "We read it."
curl -s http://localhost:3000/join | grep -o "What do I get out of coming?"
```

Expected: all print. Load `/join` in a browser and confirm "Next meeting: Fri, Jul 24 · 12:00 pm · Microsoft Teams" (date relative to today) appears under the hero lead.

- [ ] **Step 7: Commit**

```bash
git add components/NextSessionDate.tsx app/join/page.tsx app/globals.css
git commit -m "feat: join page shows next session date, agenda label, pitch steps, benefit FAQ"
```

---

## Task 9: Distinguish rate-limit, validation, and server errors in all three forms

The API routes return 429 (5 requests / 10 min / IP — realistic on shared campus NAT), 400, 503, and 500, but SubscribeForm, RsvpForm, and PitchForm collapse everything into one generic message.

**Files:**
- Create: `lib/form-errors.ts`
- Create: `tests/form-errors.test.ts`
- Modify: `components/SubscribeForm.tsx`
- Modify: `components/RsvpForm.tsx`
- Modify: `components/PitchForm.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/form-errors.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { submitErrorMessage } from "../lib/form-errors";

describe("submitErrorMessage", () => {
  it("explains rate limiting for 429", () => {
    expect(submitErrorMessage(429)).toMatch(/try again in a few minutes/i);
  });

  it("asks the user to check fields for 400", () => {
    expect(submitErrorMessage(400)).toMatch(/check the fields/i);
  });

  it("falls back to a generic save failure for 5xx", () => {
    expect(submitErrorMessage(500)).toMatch(/could not save/i);
    expect(submitErrorMessage(503)).toMatch(/could not save/i);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../lib/form-errors'` (or equivalent).

- [ ] **Step 3: Implement the helper**

Create `lib/form-errors.ts`:

```ts
/** Map a failed form-submit response status to user-facing copy. */
export function submitErrorMessage(status: number): string {
  if (status === 429) {
    return "Too many submissions from this network right now — try again in a few minutes.";
  }
  if (status === 400) {
    return "Something in the form looks invalid. Check the fields and try again.";
  }
  return "The site could not save this just now.";
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Use it in SubscribeForm**

In `components/SubscribeForm.tsx`:

Add the import:

```tsx
import { submitErrorMessage } from "@/lib/form-errors";
```

Change the state type:

```tsx
type SubscribeState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done" }
  | { kind: "error"; mailtoHref: string; message: string; showMailto: boolean };
```

In `onSubmit`, replace the two error paths:

```tsx
      if (!res.ok && res.status !== 204) {
        setState({
          kind: "error",
          mailtoHref,
          message: submitErrorMessage(res.status),
          showMailto: res.status >= 500,
        });
        return;
      }
      setState({ kind: "done" });
      setEmail("");
    } catch {
      setState({
        kind: "error",
        mailtoHref,
        message: "The site could not reach the server.",
        showMailto: true,
      });
    }
```

Replace the error render block:

```tsx
      {state.kind === "error" && (
        <span
          className="small"
          role="alert"
          style={{ color: "var(--danger, #c0392b)", marginLeft: 8 }}
        >
          {state.message}
          {state.showMailto && (
            <>
              {" "}
              <a href={state.mailtoHref}>Email us instead</a>.
            </>
          )}
        </span>
      )}
```

(Note the added `role="alert"` — screen readers currently never hear this failure.)

- [ ] **Step 6: Use it in RsvpForm**

In `components/RsvpForm.tsx`, same pattern:

Add the import (alongside the Task 7 imports):

```tsx
import { submitErrorMessage } from "@/lib/form-errors";
```

Change the state type:

```tsx
type RsvpState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done" }
  | { kind: "error"; mailtoHref: string; message: string; showMailto: boolean };
```

In `handleSubmit`, replace the two error paths:

```tsx
      if (!res.ok && res.status !== 204) {
        setState({
          kind: "error",
          mailtoHref,
          message: submitErrorMessage(res.status),
          showMailto: res.status >= 500,
        });
        return;
      }
      setState({ kind: "done" });
    } catch {
      setState({
        kind: "error",
        mailtoHref,
        message: "The site could not reach the server.",
        showMailto: true,
      });
    }
```

Replace the error render block at the bottom of the form:

```tsx
          {state.kind === "error" && (
            <div
              className="small"
              role="alert"
              style={{ color: "var(--danger, #c0392b)", lineHeight: 1.6 }}
            >
              {state.message}
              {state.showMailto && (
                <>
                  {" "}
                  <a href={state.mailtoHref}>Open an email draft instead</a>.
                </>
              )}
            </div>
          )}
```

- [ ] **Step 7: Use it in PitchForm**

In `components/PitchForm.tsx`, apply exactly the same three changes (import, `FormState` error variant `{ kind: "error"; mailtoHref: string; message: string; showMailto: boolean }`, the two error paths in `handleSubmit`, and the same error render block as RsvpForm's).

- [ ] **Step 8: Verify**

```bash
npx tsc --noEmit && npm test
```

Expected: clean. Then exercise one path live — submit the footer subscribe form 6 times quickly with valid emails; the 6th shows "Too many submissions from this network right now — try again in a few minutes." with no mailto link.

- [ ] **Step 9: Commit**

```bash
git add lib/form-errors.ts tests/form-errors.test.ts components/SubscribeForm.tsx components/RsvpForm.tsx components/PitchForm.tsx
git commit -m "feat: status-aware form error messages with tests; announce errors to screen readers"
```

---

## Task 10: Subscribe success that says something true

On success the subscribe button flips to "Sent" (nothing is sent — there is no email), the input locks silently, and screen-reader users hear nothing.

**Files:**
- Modify: `components/SubscribeForm.tsx`

- [ ] **Step 1: Change the success label and add an announced status line**

In `components/SubscribeForm.tsx`, replace the button and add a status line after it. Current:

```tsx
      <button
        className="btn primary sm"
        type="submit"
        disabled={state.kind === "sending"}
      >
        {state.kind === "done"
          ? "Sent"
          : state.kind === "sending"
            ? "Sending..."
            : "Subscribe"}
      </button>
```

Replace with:

```tsx
      <button
        className="btn primary sm"
        type="submit"
        disabled={state.kind === "sending" || state.kind === "done"}
      >
        {state.kind === "done"
          ? "Subscribed"
          : state.kind === "sending"
            ? "Sending..."
            : "Subscribe"}
      </button>
      {state.kind === "done" && (
        <span className="small" role="status" style={{ marginLeft: 8 }}>
          You&apos;re on the list.
        </span>
      )}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`. Submit the footer form with a fresh email (or observe the 503/error path if no local DB — in that case verify the Task 9 error message appears instead; the success copy can be confirmed by temporarily returning 204 from the route in a scratch run, but do not commit such a change).

- [ ] **Step 3: Commit**

```bash
git add components/SubscribeForm.tsx
git commit -m "fix: truthful subscribe success state with status announcement"
```

---

## Task 11: Restore visible keyboard focus everywhere

The RSVP note textarea and all three pitch textareas set `outline: "none"` inline with no replacement; the only `:focus-visible` rules in the CSS are eight `studio-*` rules hardcoding `#8edb3f` (fails 3:1 contrast on the light theme); everything else falls back to inconsistent browser defaults.

**Files:**
- Modify: `components/RsvpForm.tsx` (one line)
- Modify: `components/PitchForm.tsx` (one line)
- Modify: `app/globals.css`

- [ ] **Step 1: Delete the inline outline suppressions**

In `components/RsvpForm.tsx`, in the `#rsvp-note` textarea's `style` object, delete the line:

```tsx
                outline: "none",
```

In `components/PitchForm.tsx`, in the shared `textareaStyle` object, delete the line:

```tsx
  outline: "none",
```

- [ ] **Step 2: Add a global focus-visible rule and upgrade the field ring**

Append to `app/globals.css`:

```css
/* ── Global keyboard-focus visibility ────────────────────── */
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
```

Then find the existing rule (around line 1391):

```css
.field:focus-within { border-color: var(--ink); }
```

and replace it with:

```css
.field:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
```

- [ ] **Step 3: Make the studio focus rings theme-aware**

In `app/globals.css` there are exactly eight rules containing `outline: 3px solid #8edb3f`. Replace every occurrence of:

```css
outline: 3px solid #8edb3f
```

with:

```css
outline: 3px solid var(--accent)
```

Run to confirm the sweep: `grep -c "8edb3f" app/globals.css || true` → Expected: `0`.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`. In a browser, Tab through `/join`: every input, chip button, textarea, and the submit button must show a visible ring; the textareas must no longer be ring-less.

- [ ] **Step 5: Commit**

```bash
git add components/RsvpForm.tsx components/PitchForm.tsx app/globals.css
git commit -m "fix: visible keyboard focus on all interactive elements (WCAG 2.4.7)"
```

---

## Task 12: Raise --ink-4 to readable contrast

`--ink-4` is `#555555` on dark (~2.5:1 against `#141414`) and `#a8a59a` on light (~2.5:1 against white). It styles every input placeholder, the "(optional)" hint, and the paused-chip text.

**Files:**
- Modify: `app/globals.css:17` and `app/globals.css:55`

- [ ] **Step 1: Change the two token values**

In the `:root` (light) block, replace:

```css
  --ink-4: #a8a59a;
```

with:

```css
  --ink-4: #6e6a5f;
```

In the `html[data-theme="dark"]` block, replace:

```css
  --ink-4: #555555;
```

with:

```css
  --ink-4: #8a8a8a;
```

- [ ] **Step 2: Verify the contrast arithmetic**

Run this one-liner:

```bash
node -e '
const L=h=>{const [r,g,b]=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(c=>c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4);return 0.2126*r+0.7152*g+0.0722*b};
const ratio=(a,b)=>{const [x,y]=[L(a),L(b)].sort((p,q)=>q-p);return (x+0.05)/(y+0.05)};
console.log("dark:", ratio("#8a8a8a","#141414").toFixed(2));
console.log("light:", ratio("#6e6a5f","#fafaf7").toFixed(2));
'
```

Expected: both values ≥ 4.50.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "fix: raise --ink-4 tokens to 4.5:1 contrast in both themes"
```

---

## Task 13: Skip link, aria-current, menu label, reduced motion

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx` (add `id="main"`)
- Modify: `app/join/page.tsx` (add `id="main"`)
- Modify: `components/Nav.tsx`
- Modify: `components/MobileNav.tsx`
- Modify: `app/globals.css` (append)

(`app/projects/page.tsx` already got `id="main"` in Task 5.)

- [ ] **Step 1: Add the skip link**

In `app/layout.tsx`, replace:

```tsx
      <body>{children}</body>
```

with:

```tsx
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
```

- [ ] **Step 2: Add the target id on the remaining pages**

In `app/page.tsx`: `<main className="studio-home">` → `<main className="studio-home" id="main">`.

In `app/join/page.tsx`: `<main className="community-page">` → `<main className="community-page" id="main">`.

- [ ] **Step 3: aria-current in Nav and MobileNav**

In `components/Nav.tsx`, replace the two active-able links:

```tsx
          <Link href="/projects" className={cls("projects")}>Projects</Link>
```

→

```tsx
          <Link
            href="/projects"
            className={cls("projects")}
            aria-current={active === "projects" ? "page" : undefined}
          >
            Projects
          </Link>
```

and

```tsx
          <Link
            href="/join"
            className={`btn primary sm ${active === "join" ? "active" : ""}`}
          >
```

→

```tsx
          <Link
            href="/join"
            className={`btn primary sm ${active === "join" ? "active" : ""}`}
            aria-current={active === "join" ? "page" : undefined}
          >
```

In `components/MobileNav.tsx`, the projects link gains the same attribute:

```tsx
        <Link
          href="/projects"
          className={projectsActive ? "active" : undefined}
          aria-current={projectsActive ? "page" : undefined}
          onClick={closeMenu}
        >
```

- [ ] **Step 4: Fix the summary label**

In `components/MobileNav.tsx`, replace:

```tsx
      <summary aria-label="Open site navigation">Menu</summary>
```

with:

```tsx
      <summary>Menu</summary>
```

(The visible text "Menu" is the accessible name; the old aria-label broke label-in-name and never flipped to "Close".)

- [ ] **Step 5: Skip-link styles and a global reduced-motion guard**

Append to `app/globals.css`:

```css
/* ── Skip link ───────────────────────────────────────────── */
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 300;
  background: var(--accent);
  color: var(--accent-ink);
  padding: 10px 18px;
  border-radius: 0 0 10px 0;
  font-family: var(--sans);
  font-size: 14px;
}
.skip-link:focus {
  left: 0;
}

/* ── Global reduced-motion guard ─────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
curl -s http://localhost:3000/ | grep -o "Skip to content"
curl -s http://localhost:3000/projects | grep -o 'aria-current="page"' | head -1
```

Expected: both print. In a browser, press Tab once on the homepage — "Skip to content" appears top-left; Enter jumps to main content.

- [ ] **Step 7: Commit**

```bash
git add app/layout.tsx app/page.tsx app/join/page.tsx components/Nav.tsx components/MobileNav.tsx app/globals.css
git commit -m "fix: skip link, aria-current, honest menu label, global reduced-motion guard"
```

---

## Task 14: Caption track wiring for the commercial film

The flagship with-sound film has no captions (WCAG 1.2.2 Level A). Codex cannot transcribe the video — the `.vtt` file is Appendix A item 3. Wire the `<track>` now so dropping the file in activates captions with no further code change. A missing track file is silently ignored by browsers (a 404, no error UI), which is an acceptable interim state.

**Files:**
- Modify: `components/CommercialPlayer.tsx:79-87`

- [ ] **Step 1: Add the track element**

In `components/CommercialPlayer.tsx`, replace:

```tsx
          <video
            ref={videoRef}
            controls
            playsInline
            preload="none"
            poster="/media/incubator-commercial-poster.jpg"
          >
            <source src="/media/incubator-commercial.mp4" type="video/mp4" />
          </video>
```

with:

```tsx
          <video
            ref={videoRef}
            controls
            playsInline
            preload="none"
            poster="/media/incubator-commercial-poster.jpg"
          >
            <source src="/media/incubator-commercial.mp4" type="video/mp4" />
            <track
              kind="captions"
              src="/media/incubator-commercial.vtt"
              srcLang="en"
              label="English"
              default
            />
          </video>
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`. Open the homepage, click "Watch the video with sound" — the film must still play normally (the missing `.vtt` is ignored).

- [ ] **Step 3: Commit**

```bash
git add components/CommercialPlayer.tsx
git commit -m "feat: caption track wiring for commercial film (VTT file pending from owner)"
```

---

## Task 15: Replace the render-blocking Google Fonts @import with next/font

`app/globals.css:6` pulls Geist/Geist Mono via CSS `@import` — the worst-case font chain (HTML → CSS → Google CSS → font files), render-blocking with no fallback metric matching.

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css:6` and `app/globals.css:33-34`

- [ ] **Step 1: Configure next/font in the layout**

In `app/layout.tsx`, add at the top (after the existing imports):

```tsx
import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});
```

Then add the variables to the `<html>` element:

```tsx
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
      data-theme="dark"
      data-accent="blue"
      data-density="default"
    >
```

- [ ] **Step 2: Delete the @import and repoint the font tokens**

In `app/globals.css`, delete line 6 entirely:

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap');
```

Replace the two token lines:

```css
  --sans: 'Geist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --mono: 'Geist Mono', ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, monospace;
```

with:

```css
  --sans: var(--font-geist), -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --mono: var(--font-geist-mono), ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, monospace;
```

- [ ] **Step 3: Verify**

```bash
npm run build
curl -s http://localhost:3000/ | grep -c "fonts.googleapis.com" || true
```

Expected: build succeeds; the grep prints `0`. Pages must still render in Geist (inspect any heading's computed `font-family` — it should resolve to a `__Geist_…` self-hosted family).

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "perf: self-host Geist via next/font, drop render-blocking @import"
```

---

## Task 16: Right-size the logo, real favicon, compressed posters

`public/logo-incubator.png` is 1.1 MB at 1512×654, shipped raw in the Nav on every page **and** used as the favicon. Six story-poster JPEGs (~1.15 MB total) load eagerly on the homepage.

**Files:**
- Create: `tools/optimize-assets.mjs`
- Create (generated): `public/logo-incubator-sm.png`, `public/logo-incubator-md.png`, `app/icon.png`, six `.webp` posters
- Modify: `components/Nav.tsx:31`, `components/Footer.tsx` (logo line), `app/page.tsx` (hero logo + 6 poster paths), `app/layout.tsx` (drop manual favicon link)

- [ ] **Step 1: Install sharp and write the script**

```bash
npm install --save-dev sharp
```

Create `tools/optimize-assets.mjs`:

```js
import sharp from "sharp";

const logoJobs = [
  { out: "public/logo-incubator-sm.png", width: 400 },
  { out: "public/logo-incubator-md.png", width: 800 },
];

const posters = [
  "public/media/story/02-student-demo.jpg",
  "public/media/story/01-student-presenter.jpg",
  "public/media/studio-reel/03-chaelyn.jpg",
  "public/media/studio-reel/05-hunter.jpg",
  "public/media/story/07-alex-vibecoding.jpg",
  "public/media/story/10-andrew-peng-drone-demo.jpg",
];

for (const { out, width } of logoJobs) {
  await sharp("public/logo-incubator.png")
    .resize({ width })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log("wrote", out);
}

for (const src of posters) {
  const out = src.replace(/\.jpg$/, ".webp");
  await sharp(src).resize({ width: 1280 }).webp({ quality: 72 }).toFile(out);
  console.log("wrote", out);
}

await sharp("public/logo-mark.png")
  .resize({
    width: 512,
    height: 512,
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile("app/icon.png");
console.log("wrote app/icon.png");
```

- [ ] **Step 2: Run it**

Run: `node tools/optimize-assets.mjs`
Expected: nine "wrote …" lines. Check sizes: `ls -la public/logo-incubator-sm.png` should be well under 100 KB.

- [ ] **Step 3: Point the Nav and Footer at the small logo, the hero at the medium one**

- `components/Nav.tsx`: `src="/logo-incubator.png"` → `src="/logo-incubator-sm.png"`.
- `components/Footer.tsx`: `src="/logo-incubator.png"` → `src="/logo-incubator-sm.png"`.
- `app/page.tsx` hero: `src="/logo-incubator.png"` → `src="/logo-incubator-md.png"`.

- [ ] **Step 4: Swap the six homepage poster paths to .webp**

In `app/page.tsx`, change each of these `poster` values from `.jpg` to `.webp` (six occurrences):

`/media/studio-reel/03-chaelyn.jpg`, `/media/studio-reel/05-hunter.jpg`, `/media/story/07-alex-vibecoding.jpg`, `/media/story/02-student-demo.jpg`, `/media/story/01-student-presenter.jpg`, `/media/story/10-andrew-peng-drone-demo.jpg` → same path with `.webp` extension.

Do **not** touch `content/site.ts` image paths or `/media/incubator-commercial-poster.jpg` (it is the OG image at 1920×1080).

- [ ] **Step 5: Let the file-convention favicon take over**

In `app/layout.tsx`, delete the manual link:

```tsx
        <link rel="icon" type="image/png" href="/logo-incubator.png" />
```

(`app/icon.png` is picked up automatically by Next.)

- [ ] **Step 6: Verify**

```bash
npm run build
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/icon.png
curl -s http://localhost:3000/ | grep -c 'logo-incubator.png"' || true
curl -s http://localhost:3000/ | grep -o "02-student-demo.webp" | head -1
```

Expected: `200`; `0` (no page references the 1.1 MB original — it stays on disk as the source asset); the webp path prints.

- [ ] **Step 7: Commit**

```bash
git add tools/optimize-assets.mjs public/logo-incubator-sm.png public/logo-incubator-md.png app/icon.png public/media/story/*.webp public/media/studio-reel/*.webp components/Nav.tsx components/Footer.tsx app/page.tsx app/layout.tsx package.json package-lock.json
git commit -m "perf: right-sized logos, real favicon, webp posters (~2 MB saved per page load)"
```

---

## Task 17: robots.ts and sitemap.ts

Nothing stops crawlers from indexing `/admin*`, and there is no sitemap.

**Files:**
- Create: `app/robots.ts`
- Create: `app/sitemap.ts`

- [ ] **Step 1: Create app/robots.ts**

```ts
import type { MetadataRoute } from "next";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://aiincubator-uky.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin-login", "/api"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
```

- [ ] **Step 2: Create app/sitemap.ts**

```ts
import type { MetadataRoute } from "next";
import { content } from "@/content/site";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://aiincubator-uky.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${content.lastUpdated}T12:00:00`);
  return [
    { url: `${BASE}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${BASE}/projects`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE}/join`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
```

- [ ] **Step 3: Verify**

```bash
curl -s http://localhost:3000/robots.txt
curl -s http://localhost:3000/sitemap.xml | grep -c "<url>"
```

Expected: robots output shows `Disallow: /admin` and the sitemap URL; the sitemap grep prints `3`.

- [ ] **Step 4: Commit**

```bash
git add app/robots.ts app/sitemap.ts
git commit -m "feat: robots.txt (admin disallowed) and sitemap"
```

---

## Task 18: Page-specific OG cards for /projects and /join

Both pages export only `title`/`description`, so shared links inherit the homepage's entire OG block (wrong title, wrong description).

**Files:**
- Modify: `app/projects/page.tsx` (metadata export)
- Modify: `app/join/page.tsx` (metadata export)

- [ ] **Step 1: /projects metadata**

Replace the `metadata` export in `app/projects/page.tsx` with:

```tsx
export const metadata = {
  title: "Current projects · AI Incubator",
  description:
    "See what people in the UK AI Incubator are working on and where a student or collaborator could help.",
  openGraph: {
    title: "Current projects · AI Incubator at UK",
    description:
      "Cancer screening, rural eye care, blood-by-drone, and more — see what UK AI Incubator teams are working on.",
    type: "website",
    images: [
      {
        url: "/media/incubator-commercial-poster.jpg",
        width: 1920,
        height: 1080,
        alt: "AI Incubator members at a University of Kentucky showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Current projects · AI Incubator at UK",
    description:
      "Cancer screening, rural eye care, blood-by-drone, and more — see what UK AI Incubator teams are working on.",
    images: ["/media/incubator-commercial-poster.jpg"],
  },
};
```

- [ ] **Step 2: /join metadata**

Replace the `metadata` export in `app/join/page.tsx` with:

```tsx
export const metadata = {
  title: "Come to a Friday meeting · AI Incubator",
  description:
    "Come to one UK AI Incubator meeting. You can listen, ask a question, show unfinished work, or meet people working on something that interests you.",
  openGraph: {
    title: "Come to a Friday meeting · AI Incubator at UK",
    description:
      "Fridays at noon on Microsoft Teams. No experience or preparation required — RSVP and come see what the group is building.",
    type: "website",
    images: [
      {
        url: "/media/incubator-commercial-poster.jpg",
        width: 1920,
        height: 1080,
        alt: "AI Incubator members at a University of Kentucky showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Come to a Friday meeting · AI Incubator at UK",
    description:
      "Fridays at noon on Microsoft Teams. No experience or preparation required — RSVP and come see what the group is building.",
    images: ["/media/incubator-commercial-poster.jpg"],
  },
};
```

- [ ] **Step 3: Verify**

```bash
curl -s http://localhost:3000/projects | grep -o 'property="og:title" content="[^"]*"'
curl -s http://localhost:3000/join | grep -o 'property="og:title" content="[^"]*"'
```

Expected: each page prints its own og:title, not "The AI Incubator at UK".

- [ ] **Step 4: Commit**

```bash
git add app/projects/page.tsx app/join/page.tsx
git commit -m "feat: page-specific OG/twitter cards for projects and join"
```

---

## Task 19: JSON-LD — Organization sitewide, EventSeries on /join

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/join/page.tsx`

- [ ] **Step 1: Organization schema in the layout**

In `app/layout.tsx`, after the `themeInitScript` constant, add:

```tsx
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AI Incubator at the University of Kentucky",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://aiincubator-uky.vercel.app",
  email: "incubator@uky.edu",
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "University of Kentucky College of Medicine",
    url: "https://med.uky.edu",
  },
};
```

In the `<head>`, after the theme script tag, add:

```tsx
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
```

- [ ] **Step 2: EventSeries schema on /join**

In `app/join/page.tsx`, after the `FAQ` constant, add:

```tsx
const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "EventSeries",
  name: "AI Incubator Friday meeting",
  description:
    "Weekly meeting of the AI Incubator at the University of Kentucky — demos, problem-solving, and pitches.",
  eventSchedule: {
    "@type": "Schedule",
    byDay: "https://schema.org/Friday",
    startTime: "12:00",
    endTime: "13:00",
    scheduleTimezone: "America/New_York",
    repeatFrequency: "P1W",
  },
  eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  location: { "@type": "VirtualLocation", url: content.session.teamsUrl },
  isAccessibleForFree: true,
  organizer: {
    "@type": "Organization",
    name: "AI Incubator at the University of Kentucky",
    email: "incubator@uky.edu",
  },
};
```

Inside the component, directly after `<main className="community-page" id="main">`, add:

```tsx
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
```

- [ ] **Step 3: Verify**

```bash
curl -s http://localhost:3000/ | grep -o '"@type":"Organization"'
curl -s http://localhost:3000/join | grep -o '"@type":"EventSeries"'
```

Expected: both print.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/join/page.tsx
git commit -m "feat: Organization and EventSeries JSON-LD"
```

---

## Task 20: Delete orphaned pages behind redirects; prune NavKey

Six routes permanently redirect in `next.config.mjs` yet their page files still compile every build. Delete the five with no revival plan. **Keep** `app/changelog/` (build-script dependency) and **keep all components** (some are reserved — see Constraints; the rest cost nothing and removing them is out of scope).

**Files:**
- Delete: `app/built/page.tsx`, `app/outcomes/page.tsx`, `app/open-problems/page.tsx`, `app/ideas/page.tsx`, `app/pitch/page.tsx` (and their now-empty directories)
- Modify: `components/Nav.tsx:5-13`

- [ ] **Step 1: Delete the page files**

```bash
git rm -r app/built app/outcomes app/open-problems app/ideas app/pitch
```

- [ ] **Step 2: Prune NavKey**

In `components/Nav.tsx`, replace:

```tsx
type NavKey =
  | "overview"
  | "projects"
  | "ideas"
  | "team"
  | "open-problems"
  | "outcomes"
  | "built"
  | "join";
```

with:

```tsx
type NavKey = "overview" | "projects" | "join";
```

- [ ] **Step 3: Verify nothing referenced the deleted pages**

```bash
npx tsc --noEmit
npm run build
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/built
```

Expected: type-check and build clean (`app/changelog/page.tsx` uses `active="overview"`, which survives the prune); `/built` still answers `308 http://localhost:3000/projects` from the redirect config.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete orphaned pages behind permanent redirects; prune NavKey"
```

---

## Task 21: Single-source the student stories; plain-language Agentic copy

The homepage `STUDENT_STORIES` duplicates title/body text that already exists in `content.studentWork` (two copies to keep in sync — a violation of the site.ts "edit only this file" contract), and the "Agentic Engineering" story buries the site's most concrete student perk in jargon.

**Files:**
- Modify: `content/site.ts:526-564` (studentWork entries)
- Modify: `app/page.tsx` (STUDENT_STORIES + render loop)

- [ ] **Step 1: Make site.ts the canonical text (with the improved copy)**

In `content/site.ts`, replace the three `studentWork` entries' `title`/`summary` fields so they carry the homepage-quality text plus the plain-language rewrite. The full array becomes:

```ts
  studentWork: [
    {
      id: "philanthropy-outreach-site",
      title: "Philanthropy outreach site",
      person: "Chaelyn McGuire",
      format: "Student build",
      summary:
        "Chaelyn McGuire built a site that helps her sorority organize outreach and raise money for survivors of domestic abuse.",
      image: "/media/studio-reel/03-chaelyn.jpg",
      imageAlt:
        "Students discussing a philanthropy website around a table with their laptops",
      videoUrl: "https://youtu.be/IGmB8OBMKkg",
      videoLabel: "Watch the philanthropy story",
    },
    {
      id: "socratic-tutor",
      title: "Socratic Tutor",
      person: "Hunter Colson, Matthew Bernard, and Alex Dripchak",
      format: "Prototype",
      summary:
        "Hunter Colson, Matthew Bernard, and Alex Dripchak built a tutor that asks students to explain their reasoning.",
      image: "/media/studio-reel/05-hunter.jpg",
      imageAlt: "Hunter Colson discussing the Socratic Tutor prototype",
      videoUrl: "https://youtu.be/WsiDyqqhBH0",
      videoLabel: "Watch the Socratic Tutor story",
    },
    {
      id: "vibe-coding-workshop",
      title: "AI coding tools, live with Alex Dripchak",
      person: "Alex Dripchak",
      format: "Learning session",
      summary:
        "Alex demonstrates the professional AI coding tools UK students already have access to — live, from a blank screen to a working build.",
      image: "/media/student-work/alex-vibe-coding.jpg",
      imageAlt: "AI coding demonstration with Alex Dripchak",
      videoUrl: "https://youtu.be/ni40Z1JOAXQ",
      videoLabel: "Watch the live demonstration",
    },
  ],
```

- [ ] **Step 2: Strip the duplicated text from the homepage**

In `app/page.tsx`, replace the `STUDENT_STORIES` constant with a layout-only version (no `title`, no `body`):

```tsx
const STUDENT_STORIES = [
  {
    id: "philanthropy-outreach-site",
    chapterId: "chaelyn-build",
    side: "right",
    variant: "standard",
    video: "/media/studio-reel/03-chaelyn.mp4",
    poster: "/media/studio-reel/03-chaelyn.webp",
  },
  {
    id: "socratic-tutor",
    chapterId: "hunter-tutor",
    side: "left",
    variant: "proof",
    video: "/media/studio-reel/05-hunter.mp4",
    poster: "/media/studio-reel/05-hunter.webp",
  },
  {
    id: "vibe-coding-workshop",
    chapterId: "alex-workshop",
    side: "right",
    variant: "proof",
    video: "/media/story/07-alex-vibecoding.mp4",
    poster: "/media/story/07-alex-vibecoding.webp",
  },
] as const;
```

(Poster paths are already `.webp` after Task 16 — carry them over exactly as this file has them at this point.)

Then replace the story render loop:

```tsx
          <div className="studio-student-work-stories">
            {studentStories.map((story) => (
              <StoryChapter
                id={story.chapterId}
                key={story.id}
                side={story.side}
                variant={story.variant}
                title={story.title}
                body={"body" in story ? story.body : undefined}
                video={story.video}
                poster={story.poster}
                focus={story.id === "philanthropy-outreach-site" ? "46% center" : undefined}
                primaryLink={getStudentStoryLink(story.id)}
              />
            ))}
          </div>
```

with:

```tsx
          <div className="studio-student-work-stories">
            {studentStories.map((story) => {
              const work = content.studentWork.find((w) => w.id === story.id);
              if (!work) return null;
              return (
                <StoryChapter
                  id={story.chapterId}
                  key={story.id}
                  side={story.side}
                  variant={story.variant}
                  title={work.title}
                  body={work.summary}
                  video={story.video}
                  poster={story.poster}
                  focus={story.id === "philanthropy-outreach-site" ? "46% center" : undefined}
                  primaryLink={getStudentStoryLink(story.id)}
                />
              );
            })}
          </div>
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
curl -s http://localhost:3000/ | grep -o "AI coding tools, live with Alex Dripchak"
curl -s http://localhost:3000/ | grep -c "Agentic coding tools" || true
```

Expected: the new title prints; the jargon count is `0` (the `|| true` keeps grep's zero-match exit status from reading as a failed command).

- [ ] **Step 4: Commit**

```bash
git add content/site.ts app/page.tsx
git commit -m "refactor: student stories single-sourced from site.ts; plain-language AI-tools copy"
```

---

## Task 22: `whyItMatters` field — render human stakes when provided

Every project reads as a hedged planning memo with no stakes. Add an optional per-project stakes line. **Do not write the stakes content** — real numbers must come from the owner (Appendix A item 4). Build the plumbing so adding one string to site.ts renders it.

**Files:**
- Modify: `content/site.ts` (Project interface)
- Modify: `components/ProjectCard.tsx`
- Modify: `app/globals.css` (append)

- [ ] **Step 1: Extend the Project interface**

In `content/site.ts`, inside `export interface Project`, after the `summary: string;` line, add:

```ts
  /** One line on the human stakes, with a verifiable number where possible.
   * Shown emphasized on the project card. */
  whyItMatters?: string;
```

- [ ] **Step 2: Render it in ProjectCard**

In `components/ProjectCard.tsx`, after the summary paragraph:

```tsx
        <p className="project-index-summary">{project.summary}</p>
```

add:

```tsx
        {project.whyItMatters && (
          <p className="project-index-why">{project.whyItMatters}</p>
        )}
```

- [ ] **Step 3: Style it**

Append to `app/globals.css`:

```css
/* ── Project stakes line ─────────────────────────────────── */
.project-index-why {
  margin-top: 8px;
  padding-left: 12px;
  border-left: 2px solid var(--accent);
  font-size: 14px;
  color: var(--ink-2);
}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` (clean — the field is optional, no data added). Temporarily add `whyItMatters: "test stakes line"` to the first project in site.ts, confirm it renders on `/projects` with the accent border, then **remove it** before committing.

- [ ] **Step 5: Commit**

```bash
git add content/site.ts components/ProjectCard.tsx app/globals.css
git commit -m "feat: optional whyItMatters stakes line on project cards"
```

---

## Final gate

- [ ] Run the full suite:

```bash
npx tsc --noEmit
npm test
npm run build
```

Expected: all clean. Then a manual pass in the browser (both `light` and `dark` via the persisted theme, desktop and ~375px width): `/`, `/projects`, `/join`, the RSVP submit flow, keyboard-only Tab pass on `/join`.

- [ ] Do **not** push or open a PR — leave the branch local for the owner to review.

---

## Appendix A — Content only the owner (Tama) can supply

The code above renders each of these the moment the data exists. None block the tasks.

1. **Outcomes** (`content.outcomes` in site.ts): the join-page FAQ claims "capstones, thesis work, posters, papers, pilots, and grant applications" — populate `outcomes[]` with real, dated entries (the `Outcome` type supports grant/paper/product/student/media/talk with a free-text `value` like "$475K"). Until then the claim rests on the student builds surfaced in Task 3.
2. **Named people**: at least one named faculty sponsor with title for the homepage and `/join`. The `leads[]` array currently holds anonymized group pseudo-entities; `PersonCard.tsx` exists but has no photos. Requires names + consent.
3. **Captions**: transcribe `/media/incubator-commercial.mp4` into `public/media/incubator-commercial.vtt` (WebVTT). Task 14's `<track>` activates automatically once the file exists.
4. **Stakes lines** (`whyItMatters`, Task 22): one sentence with a verifiable number per project — e.g., Kentucky's cancer-incidence ranking for KY-AHEAD — sourced/checked by the owner before publishing.
5. **Future meetings**: `content.meetings` ends 2026-07-17 (in the past). Add the next several Fridays so the changelog/history surfaces stay honest. Update `content.session.agenda` weekly per the meeting-driven workflow, since `/join` labels it "On the agenda".
6. **Contributor credit**: Task 4 removed the unexplained "Lenario22 on GitHub" footer link — decide where/how to credit contributors (e.g., a People section per item 2).

## Appendix B — Environment / ops checks (no code)

1. **`NEXT_PUBLIC_SITE_URL`** must be set in the Vercel project (production) — `metadataBase`, robots, sitemap, and JSON-LD all fall back to `https://aiincubator-uky.vercel.app` without it. If a custom domain arrives, update the fallback in `app/layout.tsx:6`, `app/robots.ts`, and `app/sitemap.ts`.
2. Confirm **incubator@uky.edu** is a real, monitored mailbox — the footer, forms' mailto fallbacks, and JSON-LD all point at it.
3. RSVPs still require a human to email attendees anything beyond what the Task 7 confirmation card shows — there is deliberately no email-sending code.
