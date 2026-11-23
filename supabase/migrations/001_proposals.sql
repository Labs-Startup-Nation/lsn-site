-- Project proposals sent from the website form.
-- Anonymous visitors may only INSERT, and only the form's columns. Nobody but the team
-- (Supabase dashboard, service role) can read, change or remove proposals.

create table public.proposals (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text        not null check (char_length(name) between 1 and 120),
  email         text        not null check (char_length(email) between 3 and 254),
  organisation  text                 check (char_length(organisation) <= 160),
  kind          text        not null check (kind in ('app', 'site', 'tool', 'automation', 'other')),
  problem       text        not null check (char_length(problem) between 1 and 4000),
  first_version text                 check (char_length(first_version) <= 2000),
  timing        text        not null check (timing in ('none', 'month', 'quarter', 'fixed')),
  consent       boolean     not null,
  status        text        not null default 'new' check (status in ('new', 'read', 'accepted', 'declined'))
);

comment on table public.proposals is 'Project proposals from the website form. Read them from the Supabase dashboard.';

alter table public.proposals enable row level security;

-- Supabase grants every privilege on public tables to anon/authenticated by default: take them back,
-- then give anon the right to insert the form's columns only (not id, created_at or status).
revoke all on public.proposals from anon, authenticated;
grant insert (name, email, organisation, kind, problem, first_version, timing, consent)
  on public.proposals to anon;

create policy "anon can send a proposal with consent"
  on public.proposals for insert to anon
  with check (consent = true and status = 'new');
