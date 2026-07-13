# Pitch intake — design spec

**Date:** 2026-05-26
**Status:** Draft, awaiting build approval
**Goal:** Let visitors pitch a project idea through a real Claude-powered conversation. Output is a structured one-pager the group lead can triage.

---

## Why

The site currently has no real pitch flow. `/join` PATH 02 ("Pitch a project") links to the generic RSVP form, which conflates "I want to attend Friday" with "I have an idea." the group lead wants triage-grade structured pitches, not free-form emails.

Thematically, an AI incubator's pitch intake should use AI. The intake itself is a demonstration of the group's premise.

## Goal of the intake (decided)

**Triage mode.** Visitor finishes the chat → structured pitch one-pager lands in the group lead's inbox → the group lead decides whether to invite them to Friday. Optimized for the group lead's time, not the pitcher's. Pitcher gets a clear "we read every one, we'll be in touch within a few days" signal at the end.

## Architecture

```
Browser (static)  ──POST /chat (SSE)──▶  Cloudflare Worker  ──▶  Claude Haiku 4.5  (streaming)
       ▲                                       │
       └── streamed assistant turns ───────────┘
                                               │
                              on `submit_pitch` tool call:
                                               │
                                               ├──▶  Claude Sonnet 4.6  (one-shot summary polish)
                                               │
                                               └──▶  Resend  ──▶  tama.the@uky.edu
```

- Site stays purely static (`output: 'export'`) and deployable to any host.
- Worker holds `ANTHROPIC_API_KEY` and `RESEND_API_KEY` as Wrangler secrets. Browser never sees them.
- IP rate limiting in the Worker (10 req/min per IP) to prevent abuse.

## The conversation

Claude Haiku 4.5 with a locked system prompt:

- Walk through five areas in order: (1) the problem, (2) who it affects, (3) what you'd build first, (4) who/what help you need, (5) about you (name, UK email, role, availability).
- One focused question per turn. At most one sharpening follow-up per area.
- Warm, precise tone. No syrup. No solutioneering — help them articulate THEIR idea, not propose one.
- When all five areas are covered, call the `submit_pitch` tool.

Tool definition (Anthropic tool use):

```ts
{
  name: "submit_pitch",
  description: "Submit the completed pitch once all five areas are covered.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string" },
      role: { type: "string" },           // e.g., "medical student", "faculty / EM", "staff RN"
      availability: { type: "string" },   // e.g., "5 hrs/week", "evenings only"
      problem: { type: "string" },
      audience: { type: "string" },
      first_build: { type: "string" },
      help_needed: { type: "string" }
    },
    required: ["name", "email", "role", "problem", "audience", "first_build", "help_needed"]
  }
}
```

When Claude calls the tool, the Worker:

1. Validates the input (email shape, non-empty fields).
2. Calls Claude Sonnet 4.6 once with the structured fields to produce a polished one-page Markdown pitch summary.
3. Emails the summary to `tama.the@uky.edu` via Resend (subject: `Pitch · {name} · {one-line problem}`).
4. Returns `{ ok: true, summary }` to the browser.

Browser shows a success screen: "Submitted. the group lead reads every pitch and will be in touch within a few days."

### Escape hatch

A "Skip ahead — just send what I have" link below the chat input short-circuits the conversation. The Worker takes whatever was captured so far, fills missing fields with `null`, runs the Sonnet polish anyway, and emails it with a `[partial]` tag in the subject. Pitcher still gets the success screen.

## New surfaces

### `app/pitch/page.tsx`

- Hero: "Pitch a project" headline, one-paragraph explainer ("Talk it through with our intake. ~10 minutes. the group lead reads every one.")
- Single-column chat at max-w-700px, centered.
- Step indicator above the thread ("Step 2 of 5 · Who it affects") driven by which fields are populated so far (browser tracks this via assistant turn metadata).
- Text input at bottom, "Skip ahead" link below it.
- Below the chat: a 3-step "what happens next" strip (submit → the group lead reads it → invited to Friday if it's a fit).
- Success state replaces the chat in-place.

### `components/PitchChat.tsx` (client)

- Manages message history (`{role, content}[]`).
- Calls `WORKER_URL/chat` with the full history; reads SSE stream; appends assistant turns.
- Detects tool-call delta from the stream → shows "submitting..." → reads `{ok: true}` final event → flips to success state.

### `components/PitchSection.tsx` (homepage)

- Numbered `05 · Pitch a project` matching the site's `01/02/03/04` rhythm.
- Two columns: left = headline + value prop + CTA; right = a *stylized chat preview* showing 3–4 rendered messages between the intake and a hypothetical pitcher. Visual proof, not just a button.
- CTA: `Start a pitch →` linking to `/pitch`.

### Worker: `worker/pitch-intake/`

- `src/index.ts` — Hono router with:
  - `POST /chat` — accepts `{messages: Message[]}`, streams Claude Haiku, emits tool-call detection events as SSE.
  - On tool call → Sonnet polish → Resend → final SSE event with `{ok: true}`.
- `wrangler.toml` — config + secret bindings.
- `package.json` — `@anthropic-ai/sdk`, `hono`, `resend`.
- `README.md` — deploy steps: `wrangler secret put ANTHROPIC_API_KEY`, `wrangler secret put RESEND_API_KEY`, `wrangler deploy`.

## Updates to existing surfaces

- `app/join/page.tsx` — PATH 02 currently links to `#rsvp`. Change to `/pitch`. The RSVP form remains for the "I want to attend Friday" intent.
- `app/page.tsx` — insert `<PitchSection />` between activity log (`04`) and `<CTABanner />`. (Listserv section, if/when we ship it, slots in after pitch as `06`.)

## Config the user needs to provide

1. A Cloudflare account and `wrangler` CLI installed.
2. An Anthropic API key.
3. A Resend account + verified sending domain (or use Resend's `onboarding@resend.dev` for testing).
4. Decide the Worker's public URL (e.g., `pitch-intake.aiincubator.workers.dev`). The site will read it from `NEXT_PUBLIC_PITCH_WORKER_URL` at build time.

## Not in scope (yet)

- Persistence beyond email (no DB, no Google Sheet, no Slack). Triage stays in the group lead's inbox for now.
- Authentication. The form is open; the rate limit + email triage handles abuse.
- Public pitch directory or "see other pitches" view.
- Listserv signup section — separately scoped, parked on a previous design pass.

## Open questions

None — all forks decided.

## Acceptance

- Homepage has a `05 · Pitch a project` section with a chat preview and CTA.
- `/pitch` loads a working chat that streams Haiku responses.
- Completing all five areas triggers a `submit_pitch` tool call → Sonnet polish → email lands at `tama.the@uky.edu` within ~30 seconds.
- "Skip ahead" works at any point in the conversation.
- Rate limit kicks in at 10 requests / minute / IP.
- `npm run build` still produces a clean static `out/`.
- `/join` PATH 02 routes to `/pitch`.
