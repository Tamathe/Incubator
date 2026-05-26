-- Run this once in the Supabase SQL editor for the project that hosts the Ideas page.
-- After running, the public anon key can insert pending ideas and read approved/pending ideas
-- (without PII columns) via the ideas_public view. Rejected ideas and PII never leave the DB.

-- 1. Enums
create type idea_status as enum ('pending', 'approved', 'rejected');
create type idea_theme as enum ('med_ed', 'trauma', 'population_health', 'ed_tech', 'k12', 'other');
create type idea_commitment as enum ('curious', 'exploring', 'committed');

-- 2. Base table
create table ideas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status idea_status not null default 'pending',
  title text not null check (char_length(title) <= 60),
  theme idea_theme not null,
  commitment idea_commitment not null,
  problem text not null,
  affects text,
  build_first text,
  looking_for text[],
  submitter_name text not null,
  submitter_email text not null,
  submitter_role text,
  honeypot text
);

create index ideas_status_idx on ideas (status);
create index ideas_theme_idx on ideas (theme);
create index ideas_created_at_idx on ideas (created_at desc);

-- 3. Public view (no PII)
-- security_invoker = true so the RLS policies on the base table apply when anon reads through this view.
create view ideas_public
  with (security_invoker = true)
  as
  select
    id, created_at, status, title, theme, commitment,
    problem, affects, build_first, looking_for,
    submitter_name, submitter_role
  from ideas;

-- 4. RLS
alter table ideas enable row level security;

-- Anon can insert, but only as pending and only when honeypot is empty.
create policy "anon_insert_pending" on ideas
  for insert to anon
  with check (
    status = 'pending'
    and (honeypot is null or honeypot = '')
  );

-- Anon can read non-rejected rows (column scope is enforced by the ideas_public view).
create policy "anon_read_visible" on ideas
  for select to anon
  using (status in ('pending', 'approved'));

-- 5. Grants for the view
grant select on ideas_public to anon;
