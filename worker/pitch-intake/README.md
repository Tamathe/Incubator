# pitch-intake — Cloudflare Worker

Streams a Claude Haiku conversation that walks a visitor through a five-area
pitch intake, then polishes the result with Sonnet and emails the structured
pitch to `tama.the@uky.edu` via Resend.

Deployed separately from the static site. The site calls this Worker via
`NEXT_PUBLIC_PITCH_WORKER_URL`.

## One-time setup

```bash
npm install
npm install -g wrangler          # if you don't have it
wrangler login

# Set secrets (stored on Cloudflare, never in the repo):
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put RESEND_API_KEY
```

## Resend setup

1. Create a Resend account at [resend.com](https://resend.com).
2. Verify a sending domain (`aiincubator.uky.edu` ideally — add the DNS records
   they give you). For local testing you can use `onboarding@resend.dev` as
   the From address.
3. Update `PITCH_FROM_EMAIL` in `wrangler.toml` if you change the From address.
4. The free tier covers 100 emails/day, 3,000/month — plenty for intake volume.

## Deploy

```bash
wrangler deploy
```

The Worker publishes to `https://pitch-intake.<your-cf-subdomain>.workers.dev`.
Copy that URL into the site's environment as `NEXT_PUBLIC_PITCH_WORKER_URL`.

## Local dev

```bash
wrangler dev          # local at http://localhost:8787
```

Set the site's `.env.local` to `NEXT_PUBLIC_PITCH_WORKER_URL=http://localhost:8787`
while developing.

## Lock down CORS for production

`wrangler.toml` currently sets `ALLOWED_ORIGIN = "*"` for ease of dev. Change
to `ALLOWED_ORIGIN = "https://aiincubator.uky.edu"` (or your final domain)
before going public.

## Endpoints

- `GET /` — sanity check.
- `POST /chat` — body `{ messages: [{role, content}, ...] }`, streams
  Server-Sent Events with shapes:
  - `{ type: "text", delta: "..." }` — incremental assistant text
  - `{ type: "submitting" }` — Claude called `submit_pitch`
  - `{ type: "submitted" }` — email sent successfully
  - `{ type: "done" }` — turn ended without tool call
  - `{ type: "error", message: "..." }` — anything went wrong

## Rate limit

10 requests/minute/IP, in-memory per Worker instance. Good enough for a
research group's intake; revisit if abuse becomes an issue.

## Cost expectations

Per completed pitch (~10 turns Haiku + 1 Sonnet polish):
- Haiku 4.5: ~$0.001
- Sonnet 4.6: ~$0.01
- Resend: free tier
- Worker: free tier

Roughly **1¢ per submitted pitch**.
