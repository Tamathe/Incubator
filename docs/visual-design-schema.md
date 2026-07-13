# AI Incubator Visual Design Schema

**System name:** Studio Black  
**Version:** 1.0  
**Status:** Working standard  
**Last reviewed:** 2026-07-12

## Definition

Studio Black is a documentary research-modernist visual system: institutional
in structure, cinematic in atmosphere, exacting about evidence, and open in
voice.

It combines the confidence of an exhibition, the immediacy of a working studio,
and the precision of a research lab. Its purpose is not to make AI look
mysterious. Its purpose is to make ambitious, multidisciplinary work feel real,
legible, and possible to join.

## Audience and action

The homepage serves two audiences in this order:

1. University leadership should quickly see a credible, active, campus-wide
   community doing consequential work.
2. Students, faculty, and staff should feel that AI is approachable and that
   their discipline belongs in the room.

The primary action is **Attend this Friday**. Projects establish credibility,
but the community is the product.

## Visual thesis

The system is built from seven recurring moves:

1. **Studio black:** near-black fields make footage, objects, maps, and white
   typography feel deliberate rather than decorative.
2. **Cobalt signal:** blue identifies action, navigation, progress, and key
   coordinates. It is used sparingly enough to remain meaningful.
3. **Documentary motion:** real people gathering, demonstrating, testing, and
   talking provide the movement.
4. **Scientific still lifes:** project imagery treats instruments, specimens,
   maps, and prototypes as objects worth close attention.
5. **Exact-data graphics:** when geography, scale, or process matters, the
   visual should be grounded in real geometry or verified source material.
6. **Exhibition typography:** large, calm statements are paired with compact
   monospaced labels, indices, and metadata.
7. **Visible structure:** hairlines, square indices, fixed aspect ratios, and
   strong bands organize the page without decorative cards.

## Design principles

### Community before product

The Incubator is a weekly room for learning together, not a consultancy funnel
or a catalog of completed products. Projects show what the community can make
possible; they should not overwhelm the invitation to participate.

### Evidence before futurism

Prefer real rooms, real hands, real equipment, recognizable Kentucky geography,
and plainly described prototypes. Avoid generic AI imagery such as glowing
brains, humanoid robots, holographic interfaces, streams of code, or abstract
neural-network webs.

### Ambition without overclaiming

The site may feel bold while the language remains careful. Use terms such as
AI-assisted, human-reviewed, prototype, pilot, evaluation, workflow support,
screening support, and research-use when they are accurate.

### One strong move per section

A section may use scale, motion, a vivid blue field, a large image, or an
unusual composition. It should rarely use all of them at once. Confidence comes
from restraint and hierarchy.

### Institutional, not corporate

The site should feel credible to University of Kentucky leadership without
looking like a software sales page. Avoid glossy feature-card grids, inflated
metrics, stock-photo optimism, and repetitive conversion copy.

### Open, not simplified

Approachability comes from plain language and visible ways to participate, not
from making the work look unserious. Show complexity, then give people a clear
way into it.

### Honest work in progress

Label generated or composite imagery as concept visualization. Distinguish a
prototype, evaluation, or pre-clinical test from a deployed service. Never use
visual polish to imply a level of maturity that the project has not reached.

## Color schema

The homepage uses a scoped Studio Black palette. The older global site theme
still serves operational and portfolio pages; do not apply the homepage palette
indiscriminately.

| Token | Value | Use |
| --- | --- | --- |
| `studio-black-0` | `#030303` | Film stages, deepest media field |
| `studio-black-1` | `#050505` | Hero field |
| `studio-black-2` | `#070707` | Main page and reel field |
| `studio-black-3` | `#090909` | Research-build band |
| `studio-black-4` | `#101010` | Final invitation and elevated field |
| `studio-line` | `#252525` | Section boundaries |
| `studio-line-strong` | `#2b2b2b` | Image frames and rails |
| `studio-white` | `#ffffff` | Primary type and high-priority controls |
| `studio-white-88` | `rgba(255,255,255,0.88)` | Questions and strong supporting text |
| `studio-white-75` | `rgba(255,255,255,0.75)` | Captions and secondary copy |
| `studio-white-58` | `rgba(255,255,255,0.58)` | Long-form tertiary copy |
| `studio-cobalt` | `#1769e0` | Primary action |
| `studio-cobalt-hover` | `#2f7df0` | Primary action hover |
| `studio-cobalt-signal` | `#82b3ff` | Indices, progress, and coordinates |
| `studio-friday-blue` | `#0b4db7` | The Friday meeting band |
| `studio-friday-light` | `#b6d3ff` | Labels on the Friday band |
| `studio-focus` | `#8edb3f` | Keyboard focus only |

Rules:

- Near-black, white, and gray should occupy most of the page.
- Cobalt is a signal, not an ambient wash. Do not add blue glows, blue gradient
  backgrounds, or decorative blue shapes.
- The Friday band may use blue as a full field because it contains the site's
  primary recurring action.
- The green in the `@` mark belongs to the logo. Do not turn it into a general
  interface accent.
- Keep the official UK blue `#0033a0` available for institutional contexts and
  inherited pages. Do not mix several blue systems within one section.

## Typography schema

Use **Geist Sans** for narrative and display type. Use **Geist Mono** for
indices, metadata, time, coordinates, small labels, and system information.

### Display hierarchy

| Role | Desktop reference | Mobile reference | Character |
| --- | --- | --- | --- |
| Hero statement | `76px / 1.0 / 600` | `42px / 1.03 / 600` | Direct, declarative |
| Section thesis | `62px / 1.04 / 600` | `40px / 1.08 / 600` | Editorial, balanced |
| Reel heading | `54px / 1.02 / 600` | `40px / 1.05 / 600` | Cinematic chapter title |
| Final invitation | `70px / 1.0 / 650` | `48px / 1.0 / 650` | Clear closing action |
| Project title | `27px / 1.08 / 640` | `27px / 1.08 / 640` | Compact and specific |
| Project question | `20px / 1.4 / 520` | `20px / 1.4 / 520` | Human-scale stakes |
| Body copy | `15-21px / 1.5-1.62` | `17-19px / 1.48-1.58` | Plain and readable |
| Mono label | `10-13px / 1.3-1.4 / 600` | `9-11px` | Coordinate, not decoration |

Rules:

- Use zero letter spacing. Do not tighten display type to manufacture drama.
- Keep headline line lengths around 12-20 characters where the layout permits.
- Use sentence case for headlines and controls.
- Use uppercase only for compact monospaced labels and indices.
- Use `text-wrap: balance` for major statements.
- The mono face should tell the viewer where they are, what they are seeing, or
  how the material is classified. It should not carry long prose.

## Layout and composition

### Page frame

- Maximum content width: `1440px`.
- Desktop side padding: `48px`.
- Tablet side padding: `28px`.
- Mobile side padding: `22px`.
- Major desktop bands generally begin with `126px` vertical space.
- Major mobile bands generally begin with `88px` vertical space.

### Composition rules

- Use full-width bands with constrained inner content.
- Do not place page sections inside floating cards.
- Use hairlines and changes in field color to mark transitions.
- Favor editorial asymmetry: an index column beside a larger thesis, staggered
  project plates, or a sticky time block beside Friday details.
- Preserve stable media geometry. Research plates use `4:5`; the desktop reel
  uses `16:9`; the mobile reel uses `4:3`.
- Let the page breathe. Large type requires open space, not additional badges
  and explanatory labels.
- Keep all functional controls within predictable, stable dimensions.

### Current homepage rhythm

1. Black invitation: what the Incubator is and how to attend.
2. Premise: why multidisciplinary AI learning matters.
3. Discipline rail: who belongs in the room.
4. Cinematic reel: what participation looks like.
5. Flagship builds: what learning together can become.
6. Friday blue: the recurring ritual and ways to take part.
7. Black invitation: the lowest-friction next step.

This sequence is part of the identity. It moves from belief, to people, to
work, to participation.

## Imagery schema

### Documentary footage

Use footage that reveals a real room and real activity:

- people listening, speaking, testing, pointing, or working together;
- cross-disciplinary groups rather than a single expert performing authority;
- imperfect but legible moments that feel observed rather than staged;
- a mix of wide room context, medium collaboration, and close detail;
- silent playback on the site unless a later editorial piece is intentionally
  produced with captions and sound controls.

Do not use footage merely as a moving background behind dense text. Video should
have a specific narrative role and a readable focal point.

### Research project visuals

Project imagery should feel like high-end editorial science photography:

- deep black or neutral field;
- sculptural white light;
- restrained cobalt rim light or interface signal;
- one inspectable subject or clear system;
- real physical texture in instruments, maps, carriers, cameras, or materials;
- space for a small index or factual label without obscuring the subject.

Use concept visuals to make an active research question legible, not to depict
an imagined successful outcome. Every generated or composited image must be
visibly labeled **Concept visualization**.

### Exact-data graphics

When a graphic makes a factual claim:

- use authoritative geography, measurements, counts, or source material;
- preserve the recognizable silhouette and proportions of the subject;
- separate verified data from illustrative marks;
- use many small, imperfectly distributed marks when the story is accumulated
  search or field work, rather than a decorative symmetrical pattern;
- repeat essential image-embedded text in accessible page text or alt text.

### Logo

- Use the complete AI Incubator mark, including the blue letterforms and green
  `@` symbol.
- Use the transparent or clean black-background asset without watermarks.
- Preserve the mark's aspect ratio and clear space.
- Do not recolor, crop through the letterforms, add glow, or reuse its varsity
  outline style for interface text.
- The logo may establish identity; it should not compete with every section
  heading.

## Motion schema

Motion should reveal activity, continuity, or a change of chapter. It should not
exist only to make the page feel busy.

### Canonical motion behaviors

| Behavior | Current reference | Purpose |
| --- | --- | --- |
| Discipline rail | `42s linear infinite` | Show campus breadth without hierarchy |
| Reel chapter change | `360-820ms` focus transition | Shift attention between activities |
| Reel dip to black | `660ms` | Make a chapter change feel like an edit |
| Research image hover | `700ms`, scale `1.025` | Reward inspection without becoming a zoom effect |
| Button hover | `180ms`, translate `-2px` | Confirm interactivity |

Rules:

- Keep video in one dominant stage. Do not turn the page into several competing
  autoplay surfaces.
- Only the active reel video should play.
- Provide a visible pause control for persistent motion.
- Respect `prefers-reduced-motion`: stop the rail, remove cinematic cuts, remove
  sticky scroll dependency, and keep the content fully available.
- Avoid parallax, floating particles, cursor trails, ambient orbs, and perpetual
  decorative animation.
- Motion on mobile should preserve comprehension and tap targets before spectacle.

## Component grammar

### Section index

A short mono label such as `The premise`, `Inside the room`, or `Three flagship
builds`. It orients the viewer and should not repeat the heading.

### Cinematic stage

An unframed or hairline-framed media plane with a stable aspect ratio, one active
chapter, restrained bottom shading, a small index, and concise caption copy.

### Research plate

A `4:5` visual followed by metadata, a project name, a human question, and a
plain-language summary. Use a square number marker and hairline separator. Do
not place the plate inside another card.

### Friday band

The one full-cobalt environment. Lead with the recurring time, explain the
different modes of participation, and provide one unmistakable meeting action.

### Buttons and links

- Primary command: solid cobalt or white-on-Friday button.
- Secondary command: transparent outlined button.
- Tertiary navigation: text link with a bottom rule.
- Corners remain nearly square at `2px`.
- Use familiar icons for icon-only controls and plain text for consequential
  commands.

### Indices and metadata

Numbers, areas, stages, progress, and classification use Geist Mono. Keep them
small and useful. They should make the work feel documented, not militarized or
over-engineered.

## Content voice

The visual system depends on a matching voice:

- ambitious, calm, and concrete;
- community-centered rather than output-obsessed;
- written for an intelligent reader outside the project's specialty;
- specific about the problem and honest about the stage;
- welcoming without telling people they need permission or prior expertise.

Prefer a human question before project mechanics:

> How do we help more people get the cancer screening they are due for?

Avoid internal shorthand such as `Phase 1 data and protocol`, `workstream
charters`, or unexplained model names. Avoid claims that AI replaces expert
judgment, guarantees outcomes, or acts autonomously in clinical care.

## Accessibility requirements

- Maintain WCAG AA contrast for text and controls.
- Use the lime focus color for a clearly visible keyboard focus state.
- Give every video a pause mechanism and honor reduced-motion preferences.
- Provide descriptive alt text for meaningful images; use empty alt text only
  for genuinely decorative images.
- Duplicate essential text that appears inside an image in accessible page copy
  or alt text.
- Keep tap targets at least `44px` in each dimension.
- Do not communicate status by color alone.
- Check that headings, labels, buttons, and metadata fit at `375px`, `768px`,
  `1440px`, and a wide desktop viewport.
- Caption any future spoken video and provide an accessible transcript.

## Do and do not

| Do | Do not |
| --- | --- |
| Show the actual room and the people doing the work | Use generic stock teams or anonymous AI imagery |
| Use black, white, and one cobalt signal | Fill every section with a different saturated color |
| Let one visual carry a research question | Turn projects into oversized promotional banners |
| Use exact Kentucky geometry when geography matters | Draw an approximate Kentucky-like shape |
| Label concept imagery honestly | Let generated imagery imply a finished clinical system |
| Use large type for true thesis statements | Use hero-scale type inside compact cards and panels |
| Use hairlines, spacing, and bands for structure | Nest cards inside cards |
| Use motion to change chapters or reveal activity | Add motion as ambient decoration |
| End with a clear Friday invitation | Repeat the same Friday pitch in every section |

## Image-generation brief

Use this as a starting prompt for future flagship project visuals:

> Create a vertical 4:5 editorial research image for the University of Kentucky
> AI Incubator. Use a deep black field, sculptural neutral-white key light, and
> a restrained cobalt-blue signal. Center one physically believable,
> inspectable subject that communicates [PROJECT QUESTION]. The image should feel
> like contemporary science photography in a museum or serious design journal,
> not a software advertisement. Preserve accurate [GEOGRAPHY / INSTRUMENT /
> MATERIAL] details. No humanoid robots, glowing brains, code overlays, neon
> grids, holograms, bokeh, gradient orbs, or invented claims. Leave quiet space
> for a small index and concept-visualization label. No logos or watermarks.

Every generation brief should replace the bracketed material with verified,
public-safe details from the project source.

## Governance and implementation

### Canonical sources

- Project and meeting content: `content/site.ts`
- Homepage story selection and sequence: `app/page.tsx`
- Studio Black implementation: the `.studio-*` rules in `app/globals.css`
- Motion behavior: `components/StudioReel.tsx`
- Visual standard: this document

### Current versus next

The schema describes the visual language already present on the homepage. It
does not require the rest of the site to be redesigned immediately.

When the system is next refactored, extract the Studio Black colors, spacing,
and motion values into scoped CSS custom properties such as `--studio-black-2`
and `--studio-cobalt`. Until then, the existing values in `app/globals.css`
remain the implementation source of truth.

### Review checklist

Before publishing a new expressive page or section, confirm:

- Does it make the community more legible, or only add spectacle?
- Is the strongest visual grounded in real activity, an inspectable object, or
  verified data?
- Is cobalt functioning as a signal?
- Is there one clear visual move rather than several competing effects?
- Is the project's maturity represented honestly?
- Can a person outside the specialty understand the stakes?
- Does the page still work with motion reduced and video paused?
- Is the primary action obvious on desktop and mobile?
- Has every public-facing fact, partner reference, and project claim been
  reviewed for safety and accuracy?

