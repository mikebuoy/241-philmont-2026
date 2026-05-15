-- ============================================================
-- Tooth of Time · Phase 1 · Crew sign-in + roster claim
-- Run once in Supabase SQL Editor.
-- ============================================================

-- 1. crew_members table -------------------------------------------------------
create table if not exists public.crew_members (
  id uuid primary key default gen_random_uuid(),
  name           text not null,                          -- "Seth C."
  last_initial   text not null,
  role           text not null check (role in ('crew_leader','lead_advisor','advisor','scout')),
  crew_id        int  not null check (crew_id in (1, 2)),
  user_id        uuid references auth.users(id) on delete set null,
  body_weight_lbs numeric,                               -- visible to all crew
  claimed_at     timestamptz,
  updated_at     timestamptz default now()
);

-- Only one row per claimed user (no double-claiming)
create unique index if not exists crew_members_user_id_unique
  on public.crew_members(user_id)
  where user_id is not null;

-- Helpful index for the dashboard
create index if not exists crew_members_crew_role_idx
  on public.crew_members(crew_id, role);

-- 2. RLS ---------------------------------------------------------------------
alter table public.crew_members enable row level security;

-- Clear existing policies (safe on first run)
drop policy if exists "crew_members public read"  on public.crew_members;
drop policy if exists "crew_members self update"  on public.crew_members;
drop policy if exists "crew_members admin all"    on public.crew_members;

-- Anyone authenticated can read the full roster (needed for the crew dashboard)
create policy "crew_members public read"
  on public.crew_members
  for select
  to authenticated
  using (true);

-- An authenticated user can update an unclaimed row (the claim) or their own
-- already-claimed row (body weight, etc.). They cannot transfer or steal slots
-- because the WITH CHECK clause requires the resulting row to be assigned to
-- themselves.
create policy "crew_members self update"
  on public.crew_members
  for update
  to authenticated
  using (user_id = auth.uid() or user_id is null)
  with check (user_id = auth.uid());

-- Admins can do anything (rebind a wrong claim, fix data, etc.)
create policy "crew_members admin all"
  on public.crew_members
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3. updated_at trigger ------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists crew_members_touch on public.crew_members;
create trigger crew_members_touch
  before update on public.crew_members
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Done. After running this, execute the seed script:
--   npx tsx scripts/seed-crew.ts
-- which populates the 22 roster rows from src/data/roster.ts.
-- ============================================================
