-- =====================================================================
-- Southern Ground Capital — Affiliate Portal schema (Phase 1)
-- Paste this whole file into the Supabase SQL Editor and click "Run".
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE throughout.
-- =====================================================================

-- ---------- AFFILIATES -------------------------------------------------
-- One row per partner. ref_code is the slug used in ?ref=CODE links.
-- auth_user_id is linked the first time they log in (matched by email).
create table if not exists public.affiliates (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  name             text        not null,
  email            text        not null,
  phone            text,
  role             text,
  ref_code         text        not null,
  affiliate_link   text,
  auth_user_id     uuid references auth.users (id) on delete set null,
  status           text        not null default 'active',
  commission_note  text,                       -- editable; finalize in Phase 3
  airtable_id      text                        -- link back to Airtable record
);

-- Case-insensitive uniqueness on email + ref_code
create unique index if not exists affiliates_email_key
  on public.affiliates (lower(email));
create unique index if not exists affiliates_ref_code_key
  on public.affiliates (lower(ref_code));

-- ---------- CLICKS -----------------------------------------------------
-- High-volume event table. bigint id, indexed by affiliate + time.
create table if not exists public.clicks (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  affiliate_id  uuid references public.affiliates (id) on delete set null,
  ref_code      text,
  session_id    text,          -- dedupe key: one click per session/day
  ip_hash       text,          -- sha-256(ip + salt); raw IP never stored
  user_agent    text,
  landing_page  text,
  referrer      text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text
);

create index if not exists clicks_affiliate_time_idx
  on public.clicks (affiliate_id, created_at desc);

-- Prevent double-counting the same session hitting the same affiliate
create unique index if not exists clicks_dedupe_idx
  on public.clicks (affiliate_id, session_id)
  where session_id is not null;

-- ---------- LEADS ------------------------------------------------------
-- A submitted loan application, attributed to an affiliate when possible.
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  affiliate_id  uuid references public.affiliates (id) on delete set null,
  ref_code      text,
  first_name    text,
  last_name     text,
  email         text,
  phone         text,
  loan_program  text,
  property_address text,
  loan_amount   numeric,
  status        text not null default 'new',   -- new | contacted | closed | dead
  commission    numeric,
  airtable_id   text,
  notes         text
);

create index if not exists leads_affiliate_time_idx
  on public.leads (affiliate_id, created_at desc);

-- =====================================================================
-- ROW-LEVEL SECURITY
-- Netlify functions use the service-role key, which BYPASSES RLS, so
-- writes keep working. These policies govern what a logged-in affiliate
-- can read directly from the browser in Phase 2 (their own data only).
-- =====================================================================
alter table public.affiliates enable row level security;
alter table public.clicks     enable row level security;
alter table public.leads      enable row level security;

-- An affiliate can read only their own profile row.
drop policy if exists "affiliate reads own profile" on public.affiliates;
create policy "affiliate reads own profile"
  on public.affiliates for select
  using (auth_user_id = auth.uid());

-- An affiliate can read only clicks tied to their affiliate id.
drop policy if exists "affiliate reads own clicks" on public.clicks;
create policy "affiliate reads own clicks"
  on public.clicks for select
  using (affiliate_id in (
    select id from public.affiliates where auth_user_id = auth.uid()
  ));

-- An affiliate can read only leads tied to their affiliate id.
drop policy if exists "affiliate reads own leads" on public.leads;
create policy "affiliate reads own leads"
  on public.leads for select
  using (affiliate_id in (
    select id from public.affiliates where auth_user_id = auth.uid()
  ));

-- =====================================================================
-- DONE. Next: copy your Project URL + service-role key into Netlify
-- environment variables (see walkthrough). Then we wire track-click.
-- =====================================================================
