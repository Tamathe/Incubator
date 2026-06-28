# AI Incubator Website Refresh Spec

Date: June 28, 2026

## Objective

Make the AI Incubator website feel like a high-energy, credible, desirable AI-in-medicine project studio at the University of Kentucky. The refreshed site should persuade students, residents, faculty, and collaborators that this is where real AI work is happening: prototypes, IRBs, grants, presentations, mentorship, and community.

The site should keep the existing Flask/Jinja structure, reuse the strongest real photos already in `static/images/`, and avoid a generic "AI startup template" feel.

## Primary Audiences

- Medical students and trainees who want a low-friction way into AI projects.
- Faculty and researchers looking for collaborators, technical support, or student energy.
- Institutional stakeholders who need to see momentum, credibility, and responsible research behavior.
- Potential speakers, media contributors, funders, and cross-college partners.

## Positioning

Current message:
"Where Artificial Intelligence Meets Medicine."

Recommended message:
"Build real AI in medicine at UK."

Supporting line:
"A weekly project studio for students, clinicians, researchers, and builders turning AI ideas into prototypes, IRBs, presentations, grants, and publications."

Tone:
Confident, practical, alive. Less abstract futurism, more visible momentum.

## Core Design Direction

Use real proof as the visual center:

- Real group/event photos in the first viewport.
- Project screenshots, poster thumbnails, diagrams, demo stills, or research artifacts instead of emoji panels.
- Strong status badges for IRB approved, patent filed, grant submitted, active data collection, MVP in development, manuscript in progress.
- More editorial rhythm: fewer repeated cards, more "featured stories" and "recent wins."

Keep:

- UK blue as an anchor.
- Clean navigation.
- Space Grotesk and Inter typography.
- The existing Flask routes and template names.

Revise:

- Reduce generic dark grid usage.
- Reduce emoji-based icons.
- Replace placeholder content before launch.
- Make calls to action practical and trustworthy.

## Homepage Spec

File: `templates/index.html`

### Hero

Replace the abstract dark-grid-only hero with a split or layered proof-forward hero:

- Left: headline, supporting copy, two calls to action.
- Right or background: real photo collage or one strong group/event image.
- Add 3 to 4 proof chips below the copy:
  - `15+ active projects`
  - `4 approved IRBs`
  - `$1.1M grant submitted`
  - `Weekly project studio`

Recommended headline:
"Build real AI in medicine at UK"

Recommended subhead:
"Join a weekly project studio where students and faculty turn clinical ideas into working prototypes, IRB-backed studies, presentations, grants, and publications."

Primary CTA:
"Join the mailing list"

Secondary CTA:
"Explore active projects"

### What Members Get

Replace or tighten the current "What We Do" six-card section into a more concrete "What Members Get" section:

- Join active projects
- Pitch your own idea
- Learn by building
- Get IRB and research mentorship
- Present, publish, and grow your portfolio
- Connect across Medicine, Engineering, Public Health, and CAAI

Each card should include a concrete outcome, not only a generic capability.

### Featured Projects

Feature 3 to 4 projects with richer visual treatment:

- Socratic Tutor
- Breast Tissue Volume Estimation / PrecisionView
- AI-Powered Clinical Evaluation Summaries
- AI-Assisted Ultrasound FAST Exam or Health Disparities in Kentucky

Each card should include:

- Project title
- One-sentence value proposition
- Status badges
- Best next action: "Join this project" or "See project details"
- Real artifact image if available

Avoid large emoji-only `project-image` blocks.

### Recent Wins

Replace "Upcoming Events" if events are not current. Since the current date is June 28, 2026, January, February, and March 2026 events are now past and should not appear under "Upcoming."

Recommended section title:
"Recent Wins"

Potential items:

- AAMC digital demonstrations completed
- 4 approved IRBs
- Provisional patent filed for PrecisionView
- $33,000 award received
- UKCOM Foundations Tutor usage milestone
- $1.1M precision education grant submitted

Only include claims that the group is comfortable standing behind publicly.

### Community

Move the real photo gallery higher or integrate it into the hero. The photos are one of the strongest credibility assets. Add brief captions that explain why the viewer should care:

- Weekly project meetings
- Poster presentations
- Community events
- Cross-disciplinary collaboration

### Final CTA

Make the final CTA practical:

"Bring an idea. Join a team. Learn by building."

CTA:
"Email us to join"

## Projects Page Spec

File: `templates/projects.html`

### Purpose

Help visitors quickly answer:

- What projects exist?
- Which ones can I join?
- What stage are they in?
- What skills are needed?
- Who should I contact?

### Structure

Recommended order:

1. Featured projects
2. Active projects accepting contributors
3. New pitches
4. Completed / shipped work
5. Projects on hold

Avoid leading with a long undifferentiated grid.

### Project Card Requirements

Each project card should include:

- Title
- One-line plain-language summary
- Domain tags
- Stage badge
- Needs badge, such as `clinical`, `coding`, `writing`, `data`, `design`, `IRB`, `media`
- Team lead or contact
- Next action link

Example:

```text
Socratic Tutor
Personalized medical learning with RAG, question generation, and long-term retention.
Status: MVP in development
Needs: evaluation design, content review, frontend polish
Action: Join this project
```

### Visuals

Replace emoji tiles with:

- Screenshot of app/prototype
- Diagram
- Poster thumbnail
- Photo of team presenting
- Simple abstract fallback only if no real artifact exists

## Media Page Spec

File: `templates/media.html`

### Purpose

Make the group look active and externally visible.

### Required Cleanup

Remove all placeholder entries:

- `*** Additional videos to be added ***`
- `*** Additional podcast episodes to be added ***`
- `*** Coming soon ... ***`

If a platform does not yet exist, do not show it as a card. A visible "coming soon" section makes the site feel unfinished.

### Recommended Structure

1. Featured video or presentation
2. Podcast / audio if available
3. Photo gallery
4. Recent talks and demonstrations
5. Join the media team

If there is only one video and one podcast, make them feel intentional:

- Add a strong description.
- Add a link if public.
- Use a thumbnail or photo instead of a generic emoji tile.

## Publications Page Spec

File: `templates/publications.html`

### Purpose

Show academic credibility without overwhelming visitors.

### Required Cleanup

Remove all placeholder rows:

- additional lectures
- additional grants
- additional manuscripts
- placeholder years like `****`

### Current-Date Rule

Since today is June 28, 2026, events dated February 2026 should not be under "Upcoming Presentations." Move them to "Recent Presentations" unless they are still future-facing for another reason.

### Recommended Structure

1. Featured achievements
2. Recent presentations
3. Approved IRB protocols
4. Grants and funding
5. Intellectual property
6. Manuscripts in progress

Add compact summary cards at the top:

- `4 IRB protocols`
- `$33K awarded`
- `$1.1M submitted`
- `Provisional patent filed`

## About Page Spec

File: `templates/about.html`

### Purpose

Make the group feel human, credible, and easy to understand.

### Required Cleanup

Remove or replace:

- `*** Role/Title ***`
- `*** Department ***`
- `*** Additional Faculty ***`
- `*** Earlier History ***`

If exact roles or departments are not known, use a neutral description or omit the field. Do not ship visible placeholders.

### Recommended Structure

1. Strong group photo
2. Mission in plain language
3. "How the Incubator works"
4. Core contributors
5. Faculty advisors and partners
6. Timeline / milestones

Team cards should use:

- Name
- Role or contribution
- 1 to 2 project links or badges
- Optional photo or initials

## Contact / Get Involved Spec

File: `templates/contact.html`

### Critical Issue

The current form uses `action="#"`, so it does not submit anywhere. Do not present a non-working form as the primary join path.

### Recommended Options

Option A:
Replace the form with a strong mailto-based CTA:

- `mailto:Tama.The@uky.edu?subject=AI%20Incubator%20Mailing%20List`

Option B:
Use a real form provider or endpoint:

- Vercel serverless function
- Formspree
- Airtable form
- Microsoft Forms
- Qualtrics

### Required Content

Add real meeting details:

- Day
- Time
- Location
- Virtual option if applicable
- How to join the mailing list

Remove:

- `*** Day and Time ***`
- `*** Location/Room ***`
- stale "No meeting Jan 30" note

### Suggested CTA Copy

"Want in? Send a short note with your interests, and we will add you to the list."

Primary CTA:
"Email us to join"

Secondary CTA:
"Explore projects first"

## Global Layout and Style Spec

File: `static/css/style.css`

### Visual System

Preserve the UK blue, but broaden the palette so the site does not feel like a one-note blue gradient template.

Recommended accents:

- UK blue for institutional trust
- Cyan for AI/technical energy
- White and warm gray for clarity
- Small green accent for progress/status
- Small gold accent for awards/wins

### Components

Add or revise:

- `.proof-chip`
- `.status-badge`
- `.project-stage`
- `.artifact-card`
- `.hero-collage`
- `.recent-wins`
- `.join-panel`

Reduce reliance on:

- `.feature-icon` emoji blocks
- `.project-image` emoji panels
- repeated card grids for every section

### Motion

Use subtle motion only:

- hover lifts
- image zoom on gallery
- optional slow hero collage movement

Avoid anything that makes the academic/research context feel gimmicky.

## Global Content Cleanup

Files:

- `templates/base.html`
- `templates/index.html`
- `templates/projects.html`
- `templates/media.html`
- `templates/publications.html`
- `templates/about.html`
- `templates/contact.html`

Tasks:

- Remove all visible `*** ... ***` placeholders.
- Remove or replace `href="#"` links.
- Add real LinkedIn and GitHub links, or omit those footer links.
- Add a favicon and social preview image.
- Make all event sections current as of June 28, 2026.
- Ensure "upcoming" only contains future events.
- Convert past events to "Recent Events" or "Recent Wins."
- Check all names and special characters render correctly in browser.

## Technical Spec

### Routes

Keep current routes:

- `/`
- `/projects`
- `/media`
- `/publications`
- `/about`
- `/contact`

Optional:

- Add `/join` as an alias for `/contact` if recruitment is the primary goal.

### Assets

Use existing image directory:

- `static/images/`

Add if available:

- project screenshots
- poster thumbnails
- logo/favicon
- social preview image, ideally `static/images/social-preview.jpg`

### Contact Form

Do not leave `action="#"`.

If implementing with email-only CTA:

- Remove form fields.
- Use mailto link.
- Provide a simple "include your name, affiliation, and interests" prompt.

If implementing a backend endpoint:

- Add Flask route or Vercel-compatible API endpoint.
- Validate required fields.
- Protect against spam.
- Show success and error states.
- Do not silently fail.

## Implementation Phases

### Phase 1: Credibility Cleanup

- Remove placeholders.
- Fix stale event sections.
- Replace non-working footer links.
- Replace or remove non-working contact form.
- Add favicon.
- Verify all pages load.

### Phase 2: Homepage Refresh

- Rebuild hero around real community/project proof.
- Move or integrate photo gallery higher.
- Add proof chips.
- Replace "Upcoming Events" with "Recent Wins."
- Tighten CTA language.

### Phase 3: Project and Research Story

- Redesign project cards with status and needs badges.
- Add project artifacts where available.
- Reorder projects by visitor usefulness.
- Add top-level research credibility summary to publications.

### Phase 4: Polish and QA

- Desktop QA.
- Mobile QA at approximately 390px width.
- Check that nav menu works on mobile.
- Check that no text overlaps or clips.
- Check that every CTA goes somewhere real.
- Run a link audit.

## Acceptance Criteria

The refresh is done when:

- No visible placeholder text remains.
- No primary CTA or footer link points to `#`.
- Event language is current as of June 28, 2026.
- Homepage first viewport includes real proof, not only abstract AI styling.
- Project cards communicate stage, status, and how to join.
- Contact path works or clearly opens an email.
- Site feels credible to faculty and exciting to students.
- Desktop and mobile views are visually checked.
- All Flask routes return 200 locally.

## Suggested Homepage Copy

Hero headline:

"Build real AI in medicine at UK"

Hero subhead:

"The AI Incubator is a weekly project studio where students, clinicians, researchers, and builders turn ideas into prototypes, IRB-backed studies, presentations, grants, and publications."

Primary CTA:

"Join the mailing list"

Secondary CTA:

"Explore active projects"

Recent wins intro:

"The Incubator is not just a discussion group. Members are building tools, filing IRBs, presenting nationally, and moving projects toward publication and deployment."

Final CTA:

"Bring an idea. Join a team. Learn by building."

