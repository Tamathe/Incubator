# Supabase setup — Ideas page

The `/ideas` page reads and writes a single `ideas` table in Supabase. This is a one-time manual setup.

## First-time setup

1. Create a new Supabase project (free tier is fine).
2. Open the SQL editor and run [`ideas-setup.sql`](./ideas-setup.sql) end-to-end.
3. In Project Settings → API, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Add both to `.env.local` (local dev) and to Vercel project env vars (production).
5. In Database → Replication, enable realtime for the `ideas` table.

## Moderating submissions

Open Supabase dashboard → Table Editor → `ideas` → filter `status = pending`.
Flip `status` to `approved` (publishes) or `rejected` (hides). Submitters are not
notified either way. The "Reach out" button on approved ideas opens a mailto to
`tama.the@uky.edu` so the group lead is the relay; the submitter's email is never
exposed to the browser.

## Verifying RLS (one-time check)

In a SQL editor session, switch to the `anon` role and try the following — each should fail or return restricted results:

```sql
set role anon;

-- Should NOT return submitter_email (column not in view)
select * from ideas_public limit 1;

-- Should fail (anon cannot insert as approved)
insert into ideas (status, title, theme, commitment, problem, submitter_name, submitter_email)
  values ('approved', 'sneaky', 'other', 'curious', 'x', 'x', 'x@uky.edu');

-- Should fail (honeypot non-empty)
insert into ideas (status, title, theme, commitment, problem, submitter_name, submitter_email, honeypot)
  values ('pending', 'spam', 'other', 'curious', 'x', 'x', 'x@uky.edu', 'http://spam');

reset role;
```
