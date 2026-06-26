-- =====================================================================
-- Phase 3 — commission tracking columns on leads.
-- Commission = origination_fee * (commission_pct / 100), where the
-- affiliate's share is up to 30%. origination_fee + commission_pct are
-- ADMIN-ONLY (never returned to the affiliate); the affiliate sees only
-- the final `commission` dollar amount.
-- Paste into the Supabase SQL Editor and Run. Safe to re-run.
-- =====================================================================

alter table public.leads
  add column if not exists origination_fee numeric,
  add column if not exists commission_pct  numeric default 30;

-- (commission column already exists from the Phase 1 schema.)
