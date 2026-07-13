# PM Inbox — Site sub-project 2

**Date:** 2026-05-26
**Status:** Approved, ready for implementation plan
**Author:** Tama Thé (via brainstorm w/ Claude)
**Depends on:** [2026-05-25-pm-surface-design.md](./2026-05-25-pm-surface-design.md) (sub-project 1)

## Goal

Let team members log actions, blockers, decisions, and closure updates between Fridays without opening a PR. Keep the site statically built. Keep curator control over what hits the live page.

The driving principle (carried over from sub-project 1): **internal coordination utility creates the public aliveness signal.** If team members can actually log a blocker the moment it shows up — not "wait until Friday" — the site stays fresh on its own.

## Scope

This is **sub-project 2 of three**:

1. **Site PM surfaces** — schema + rendering of actions/blockers/decisions ← *shipped*
2. **Inbox writeback** — public form on the site, Cloudflare Worker, GitHub Issues as canonical store, build-time merge into the site ← *this spec*
3. **Friday transcript agent** — LLM pipeline that emits a PR after each meeting ← *future*

Sub-project 2 produces a working inbox that augments — never replaces — `content/site.ts`. Direct PRs to `content/site.ts` continue to work. The two sources merge at build time.

## Non-goals

- No auth on the public submission form (moderation queue handles abuse)
- No per-submitter account system
- No real-time updates to the live site — rebuild on approval, ~60s freshness
- No mobile-specific design — the form is simple enough that responsive defaults cover it
- No bulk import or migration of historical items
- No webhook back to Slack/email when items land — just the curator's /admin queue
- No public read of pending items — pending lives only inside /admin

## Architecture

```
┌─────────────────┐                         ┌──────────────────┐
│ /inbox  (form)  │ ── POST submission ──▶  │  Cloudflare      │
└─────────────────┘                         │  Worker          │
                                            │  (single source) │
┌─────────────────┐                         │                  │
│ /admin (queue)  │ ◀── GET pending list ── │                  │
│ token-gated     │ ── POST approve/edit ─▶ │                  │
└─────────────────┘                         └──────┬───────────┘
                                                   │
                                            creates/labels
                                                   ▼
                                            ┌──────────────────┐
                                            │ GitHub Issues    │
                                            │ (canonical store │
                                            │  for inbox items)│
                                            └──────┬───────────┘
                                                   │
                                     deploy hook on approve
                                                   ▼
                                            ┌──────────────────┐
                                            │ Vercel rebuild   │
                                            │ scripts/build-   │
                                            │   inbox.mjs      │
                                            │ → content/       │
                                            │   inbox.json     │
                                            └──────┬───────────┘
                                                   │
                                            consumed alongside
                                            content/site.ts by
                                            lib/derive.ts
                                                   ▼
                                            live site
```

**Principles:**
- One Worker, three routes. Submission is public + rate-limited. Queue/approve are token-gated.
- GitHub Issues is the canonical store for inbox items. `content/site.ts` continues to hold the curator-authored seed. Both surface on the live site via build-time merge.
- `scripts/build-inbox.mjs` runs alongside `scripts/build-changelog.mjs` at dev/build time.
- No runtime fetch on the public site — everything stays statically built.

## Components

### 1. `/inbox` page (new, public)

`app/inbox/page.tsx`. Server-rendered shell + a small client island for the form.

- Type selector (radio): **Action** | **Blocker** | **Decision** | **Update**.
- Field set switches with type:
  - **Action:** project (dropdown), owner (free text), body (textarea), due (optional date).
  - **Blocker:** project (dropdown), body, blocked by (optional free text).
  - **Decision:** project (optional dropdown), question (textarea), for session (date defaulting to next Friday).
  - **Update:** target item (optional dropdown of currently-approved items), body (textarea).
- Optional name + email fields at the bottom (free text, no verification — purely for the curator's context).
- Cloudflare Turnstile widget for spam gate. No other client validation beyond "fields required."
- Submit → POST to Worker `/submit` → success toast + form reset.
- Project dropdown is populated at build time from `content/site.ts` projects (the curator-authored source — inbox-only projects don't exist). Written into a small `content/projects-snapshot.json` so the client island doesn't have to import the whole site content.

### 2. Cloudflare Worker (`worker/index.ts`)

Single module. Three routes:

| Method + path     | Auth          | Purpose                                                        |
|-------------------|---------------|----------------------------------------------------------------|
| `POST /submit`    | Turnstile     | Create a `pending` GH Issue from a submission payload.         |
| `GET /queue`      | `ADMIN_TOKEN` | Return all `pm-inbox + pending` open issues, parsed.           |
| `POST /approve`   | `ADMIN_TOKEN` | Apply approve/reject/edit, swap labels, trigger deploy hook.   |

Secrets (Cloudflare Worker bindings, never in code):
- `ADMIN_TOKEN` — bearer token for /queue + /approve.
- `GH_TOKEN` — fine-grained PAT scoped to the site repo, Issues: write.
- `GH_REPO` — `owner/repo` string.
- `DEPLOY_HOOK_URL` — Vercel deploy hook for the production branch.
- `TURNSTILE_SECRET` — Cloudflare Turnstile server-side secret.

Rate limiting: Worker uses Cloudflare's built-in `request.headers.get('CF-Connecting-IP')` + Durable Object (or `Cache API` as a simple TTL store) to cap submissions at 10/IP/hour. Turnstile is the primary spam gate; rate-limit is the secondary backstop.

### 3. `/admin` page (new, token-gated)

`app/admin/page.tsx` with `'use client'`. The page itself is publicly served (it's static), but the data fetch requires `ADMIN_TOKEN` passed via URL: `/admin?key=<token>`.

- On mount, reads `key` from `useSearchParams`, fetches `Worker /queue?token=<key>`. 401 → show "Bad token" empty state.
- Renders pending items grouped by type. Each row:
  - Editable form pre-filled with submitted values.
  - Type-aware fields (same as /inbox).
  - For Update-type: a "which item does this affect?" dropdown (populated from a runtime fetch of the current merged content, served by the Worker `/snapshot` route — or inlined at build time, see Open Questions).
  - Buttons: **Approve** (with edits) · **Reject** · **Skip** (closes the issue without label change, for "I'll deal with this later").
- After approve/reject, removes the row, shows a "Triggering rebuild…" toast that resolves to "Live in ~60s" or "Approval saved, deploy hook failed — rebuild manually" depending on Worker response.

The page never touches `ADMIN_TOKEN` directly — it just passes whatever's in the URL through to the Worker. Token rotation is a Worker env var change.

### 4. `scripts/build-inbox.mjs` (new)

Runs before `next dev` and `next build`, after `build-changelog.mjs`:

```json
{
  "scripts": {
    "dev":   "node scripts/build-changelog.mjs && node scripts/build-inbox.mjs && next dev",
    "build": "node scripts/build-changelog.mjs && node scripts/build-inbox.mjs && next build"
  }
}
```

Behavior:
1. Read `GH_TOKEN` + `GH_REPO` from env. If missing, write empty `content/inbox.json` and exit 0 (local dev without GH access is fine).
2. Fetch all issues (open + closed) with labels `pm-inbox` + `approved`. Paginated; cap at 500.
3. For each, parse the fenced JSON block from the body. On parse error, log to stderr and skip.
4. Build `InboxData` (see Data model). Walk update-type issues, resolve targetIds, push into `updates[]`.
5. Write `content/inbox.json`.

### 5. `lib/derive.ts` extension

Add one pure function:

```ts
export function mergeInbox(content: SiteContent, inbox: InboxData): SiteContent
```

- Concatenates `inbox.actions`, `inbox.blockers`, `inbox.decisions` into the corresponding arrays on `content`.
- Dedup by `id`: if an inbox item has the same id as a content/site.ts item, content/site.ts wins. Log a build-time warning.
- Walks `inbox.updates` and applies them in chronological order (`appliedAt` ascending). For each update, finds the target item and overwrites the named field. Unknown targets are silently skipped (already filtered out at build time, but defensive).
- Returns a fresh `SiteContent`. Existing derive functions (`deriveActivityLog`, `deriveAgenda`, `stalenessLabel`) consume the merged result.

Call sites (`LogList`, `RightNowBar`, `ProjectCard`) become:
```ts
const merged = mergeInbox(content, inbox);
// then use existing helpers against `merged`
```

### 6. `/inbox` discoverability nudge

Add a small "Log an action, blocker, or decision →" link to the Right Now bar (`rn-activity` column, below the "Full activity log" link). One-line content addition. No new layout.

## Data model

### Submission payload (form → Worker)

```ts
type SubmissionKind = "action" | "blocker" | "decision" | "update";

interface SubmissionBase {
  kind: SubmissionKind;
  submitter?: { name?: string; email?: string };
  turnstileToken: string;
}

type Submission =
  | (SubmissionBase & { kind: "action";   project: string;  owner: string; body: string; due?: string })
  | (SubmissionBase & { kind: "blocker";  project: string;  body: string;  blockedBy?: string })
  | (SubmissionBase & { kind: "decision"; project?: string; question: string; forSession: string })
  | (SubmissionBase & { kind: "update";   targetId?: string; body: string });
```

### GitHub Issue shape

One issue per submission. Worker creates with:

- **Title:** `[pending] [<kind>] [<project|—>] <first 60 chars of body or question>`
- **Labels:** `pm-inbox`, one of `pending` | `approved` | `rejected`, one of `type:action` | `type:blocker` | `type:decision` | `type:update`.
- **Body:** a fenced ```json``` block + a human-readable summary below. Worker generates an `id` (kebab slug from title + 4-char random suffix) when creating the issue.

**JSON block contents — pending state:** the raw `Submission` payload as received from the form, plus the generated `id` and `submittedAt`.

**JSON block contents — approved state:**
- For `type:action | type:blocker | type:decision`: the (possibly curator-edited) `ActionItem` / `Blocker` / `Decision` record. `id` is preserved from the pending state. This is exactly the shape `build-inbox.mjs` pushes into the corresponding array.
- For `type:update`: an `AppliedUpdate` record (`targetId`, `field`, `value`, `appliedAt`). The original submission's free-text `body` is preserved in the human-readable summary below for audit; the JSON block contains only the resolved structured update.

Curator edits during approval rewrite the JSON block to the approved shape. The summary is regenerated on save. The pending → approved transition is the *one* moment where the JSON block format changes — `build-inbox.mjs` only ever reads approved issues, so it has one parse path per type.

Sample body:
~~~markdown
```json
{
  "id": "ahead-dsa-followup-a3kf",
  "kind": "action",
  "project": "ahead",
  "owner": "TT",
  "body": "Follow up with Bin on signed DSA",
  "due": "2026-05-30",
  "submitter": { "name": "Sam" },
  "submittedAt": "2026-05-26T14:12:08Z"
}
```

**Action** for **ahead** · owner **TT** · due **2026-05-30**

Follow up with Bin on signed DSA

— submitted by Sam
~~~

### `content/inbox.json` (generated, gitignored)

```ts
interface InboxData {
  generatedAt: string;
  actions: ActionItem[];     // from approved issues with type:action
  blockers: Blocker[];       // from approved issues with type:blocker
  decisions: Decision[];     // from approved issues with type:decision
  updates: AppliedUpdate[];  // applied closure / status changes
}

interface AppliedUpdate {
  targetId: string;          // ActionItem.id | Blocker.id | Decision.id
  field: "status" | "resolved" | "outcome" | "decidedAt" | "closedAt";
  value: string;
  appliedAt: string;         // ISO, when curator approved the update
}
```

`ActionItem`, `Blocker`, `Decision` are reused from `content/site.ts`.

## Data flow

1. Team member opens `/inbox`, picks a type, fills fields, solves Turnstile, submits.
2. Browser POSTs `Submission` JSON to Worker `/submit`.
3. Worker verifies Turnstile token, checks rate limit by IP, generates an `id`, creates GH Issue with `pending` + type labels. Returns `{ ok: true, issue: <number> }`.
4. Curator opens `/admin?key=<ADMIN_TOKEN>`. Page fetches `Worker /queue?token=<key>`. Worker returns parsed pending issues.
5. Curator edits if needed, clicks Approve. Page POSTs `/approve?token=<key>` with `{ issueNumber, action: "approve", payload }`.
6. Worker:
   - For Approve: rewrites the GH Issue body with the (possibly edited) payload, swaps `pending` → `approved` labels.
   - For Reject: swaps `pending` → `rejected` labels, closes the issue.
   - For Update-type Approve: the curator picks the target item and the field to change in /admin; Worker rewrites the JSON block as an `AppliedUpdate` record (`{ targetId, field, value, appliedAt }`) and adds the `approved` label. `build-inbox.mjs` parses these into `inbox.updates[]`.
   - Then calls `fetch(DEPLOY_HOOK_URL, { method: "POST" })`. Returns `{ ok: true, deployHookFailed?: boolean }`.
7. Vercel rebuild kicks off. `scripts/build-inbox.mjs` fetches `pm-inbox + approved` issues, writes `content/inbox.json`.
8. `next build` runs. `lib/derive.ts.mergeInbox()` merges content/site.ts with inbox.json. Existing derive helpers do the rest. New item appears on the live site within ~60s.

## Error handling

### Worker

| Failure                              | Response                                    | Client surface                              |
|--------------------------------------|---------------------------------------------|---------------------------------------------|
| Invalid Turnstile                    | 400 `{ error: "verification failed" }`      | Toast: "Verification failed, retry"         |
| Rate limit exceeded                  | 429 with `Retry-After`                      | Toast: "Too many submissions, try in a bit" |
| GH API timeout / 5xx on submit       | 502                                         | Toast: "Inbox unreachable, try again"       |
| Bad/missing `ADMIN_TOKEN`            | 401 (no detail)                             | /admin: "Bad token" empty state             |
| GH API timeout / 5xx on /queue       | 502                                         | /admin: "Queue unavailable" banner          |
| GH update OK, deploy hook fails      | 200 `{ ok: true, deployHookFailed: true }`  | /admin: "Saved, but rebuild didn't trigger" |
| Unknown issue number on /approve     | 404                                         | /admin: row error, retry                    |

Issue creation is atomic from the curator's view: either the issue exists with `pending` labels, or it doesn't.

### Build-time fetch (`scripts/build-inbox.mjs`)

- Network failure or GH rate-limit → write empty `inbox.json` with `generatedAt`, log warning, exit 0. Build never fails on inbox availability.
- Malformed JSON in a single issue body → skip that issue, log to stderr, continue.
- Unknown `targetId` in an update issue → log to stderr, drop the update silently.

### Site rendering

- `content/inbox.json` missing or empty → `mergeInbox` treats inbox as empty, site is identical to sub-project 1.
- Duplicate IDs between content/site.ts and inbox → content/site.ts wins. Build logs a warning.

## Testing

Same philosophy as sub-project 1 — no new test framework, validation matches existing build pipeline.

1. `npx tsc --noEmit` — payload types, merge logic, /inbox + /admin TSX type-check.
2. `npm run build` with `GH_TOKEN` unset — site builds clean with empty inbox.
3. **Worker local dev:** `wrangler dev` runs the Worker on a localhost port. `/inbox` POSTs to that port (configurable via `NEXT_PUBLIC_WORKER_URL`). `/admin` reads from it. Hit it manually with sample submissions of each type.
4. **Vitest snapshot (or `node --test`) on `mergeInbox`:** one file covering:
   - Empty inbox passthrough (output equals input).
   - Duplicate id collision (content/site.ts wins, warning logged).
   - Update applied to an existing action (status flips, closedAt set).
   - Update with missing target (silently dropped).
   - Update ordering (later `appliedAt` wins on conflicting fields).
5. **Manual end-to-end before launch:**
   - Submit one of each type via /inbox → GH Issue created with right labels.
   - Approve each via /admin → deploy hook fires, site updates within ~60s.
   - Reject a submission → it does not appear after rebuild.
   - Submit a closure update → approve → target action flips to "done" on the live site.

## Implementation order

1. Add `mergeInbox` to `lib/derive.ts` + InboxData types (file co-located with existing types). Update call sites in `LogList`, `RightNowBar`, `ProjectCard`. Test with a hand-written `content/inbox.json`.
2. Build `scripts/build-inbox.mjs` that reads the hand-written `content/inbox.json` first, then GH if env is set. Wire into `dev` + `build`.
3. Add `app/inbox/page.tsx` + client form island. Hardcode Worker URL to `localhost:8787` for dev.
4. Add `app/admin/page.tsx` + client island.
5. Build the Cloudflare Worker (`worker/index.ts` + `wrangler.toml`). Test locally via `wrangler dev`.
6. Deploy the Worker. Set production env vars + Vercel deploy hook + Turnstile site key.
7. End-to-end test in production with throw-away items.
8. Add the Right Now bar /inbox link.
9. Visual sweep at light + dark.

## Resolved design choices

- **Update-target dropdown source:** /admin imports `content/site.ts` + reads `content/inbox.json` at build time. No extra Worker route. The dropdown is stale until the next build (~60s after approvals), which matches the rest of the freshness story. Promote to a runtime `GET /snapshot` Worker route only if curator complains.
- **Spam gate:** Cloudflare Turnstile from v1. The moderation queue isn't free for the curator to wade through, so the cost of letting bot traffic through is real.

## Deferred to future sub-projects

- **Friday transcript agent → sub-project 3.** Will read merged content + inbox state, propose closures and new items as a PR to `content/site.ts`. This is when inbox items "graduate" to the canonical store.
- **Email/Slack notification on new pending submission.** Could add later; for now /admin polling is enough at this team size.
- **Public read of the queue.** Out of scope — pending items are curator-only.

## Acceptance criteria

- [ ] `lib/derive.ts` exports `mergeInbox` + `InboxData` / `AppliedUpdate` types.
- [ ] `scripts/build-inbox.mjs` runs in `dev` + `build` script chain; produces `content/inbox.json`; tolerates missing GH env.
- [ ] `content/inbox.json` is gitignored.
- [ ] `/inbox` page exists, has the four submission types, Turnstile gate, posts to Worker.
- [ ] `/admin` page exists, gated by `?key=`, renders pending queue with Approve / Reject / Edit / Skip.
- [ ] Worker has `/submit`, `/queue`, `/approve` routes with the documented auth and behavior.
- [ ] Worker triggers Vercel deploy hook on approve; handles deploy-hook failure non-fatally.
- [ ] Activity log + agenda + project cards render inbox items alongside content/site.ts items (merge passes the snapshot test).
- [ ] Update-type submissions, on approval, flip the referenced item's state on the live site.
- [ ] `npx tsc --noEmit` clean. `npm run build` clean with GH env both set and unset.
- [ ] Manual end-to-end pass: all four submission types submit, get approved, render correctly.
