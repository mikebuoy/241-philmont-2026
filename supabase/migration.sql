-- ============================================================
-- Trek 12-23 · Philmont 2026 · Admin backend migration
-- Run once in Supabase SQL Editor.
-- ============================================================

-- 1. Admins table -------------------------------------------------------------
create table if not exists public.admins (
  email text primary key,
  name text,
  added_at timestamptz default now()
);

-- Seed the two admins.
insert into public.admins (email, name) values
  ('mikebuoy@gmail.com',      'Mike Buoy'),
  ('rickdtownsend@gmail.com', 'Rick Townsend')
on conflict (email) do nothing;

-- 2. Itinerary days table -----------------------------------------------------
create table if not exists public.itinerary_days (
  iso          date primary key,
  philmont_day int,
  label        text not null,
  date_long    text not null,
  date_short   text not null,
  weekday      text not null,
  camp         text not null,
  type         text not null check (type in ('travel','acclimation','base','trail','staffed','dry','layover')),
  miles        numeric,
  gain         int,
  loss         int,
  cum_miles    numeric,
  cum_gain     int,
  cum_loss     int,
  elevation    int,
  food_pickup  text,
  notes        text default '',
  flags        jsonb default '{}'::jsonb,
  programs     text[] default array[]::text[],
  gpx_path     text,                          -- e.g. "2026-06-18.gpx" in gpx bucket
  gpx_partial  boolean default false,
  gpx_note     text,
  updated_at   timestamptz default now(),
  updated_by   text
);

-- 3. is_admin() helper --------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins a
    join auth.users u on u.email = a.email
    where u.id = auth.uid()
  );
$$;

-- 4. Row-Level Security -------------------------------------------------------
alter table public.admins enable row level security;
alter table public.itinerary_days enable row level security;

-- Drop existing policies (safe if first run)
drop policy if exists "Public can read itinerary"      on public.itinerary_days;
drop policy if exists "Admins can write itinerary"     on public.itinerary_days;
drop policy if exists "Admins can read admin list"     on public.admins;

-- itinerary_days: world-readable, admin-writable
create policy "Public can read itinerary"
  on public.itinerary_days
  for select
  to anon, authenticated
  using (true);

create policy "Admins can write itinerary"
  on public.itinerary_days
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- admins: visible only to admins themselves
create policy "Admins can read admin list"
  on public.admins
  for select
  to authenticated
  using (public.is_admin());

-- 5. Storage bucket for GPX ---------------------------------------------------
-- Create the bucket (public so build-time fetches don't need auth).
insert into storage.buckets (id, name, public)
values ('gpx', 'gpx', true)
on conflict (id) do nothing;

-- Drop existing policies (safe if first run)
drop policy if exists "Public can read gpx"           on storage.objects;
drop policy if exists "Admins can upload gpx"         on storage.objects;
drop policy if exists "Admins can update gpx"         on storage.objects;
drop policy if exists "Admins can delete gpx"         on storage.objects;

create policy "Public can read gpx"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'gpx');

create policy "Admins can upload gpx"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'gpx' and public.is_admin());

create policy "Admins can update gpx"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'gpx' and public.is_admin())
  with check (bucket_id = 'gpx' and public.is_admin());

create policy "Admins can delete gpx"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'gpx' and public.is_admin());

-- ============================================================
-- Migration 2: Trail meals + enriched itinerary days
-- Run in Supabase SQL Editor after the initial migration above.
-- ============================================================

-- 6. Trail meals table --------------------------------------------------------
-- Normalized Philmont-issued numbered meal bags. One row per meal code.
-- Multiple itinerary days can reference the same code (e.g. B7 on Jun 17 + Jun 27).
create table if not exists public.trail_meals (
  code        text primary key,   -- 'B7', 'L3', 'D10', etc.
  type        text not null check (type in ('breakfast', 'lunch', 'dinner')),
  items       text[] not null default array[]::text[],
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.trail_meals enable row level security;

drop policy if exists "trail_meals public read" on public.trail_meals;
create policy "trail_meals public read"
  on public.trail_meals
  for select
  to anon, authenticated
  using (true);

drop policy if exists "trail_meals admin write" on public.trail_meals;
create policy "trail_meals admin write"
  on public.trail_meals
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 7. Enrich itinerary_days ----------------------------------------------------
alter table public.itinerary_days
  add column if not exists trail_day                int,

  -- Light table (null for travel days)
  add column if not exists twilight                 text,
  add column if not exists sunrise                  text,
  add column if not exists sunset                   text,
  add column if not exists dark                     text,

  -- Daily schedule (null for non-trail days)
  add column if not exists wake                     text,
  add column if not exists on_trail                 text,
  add column if not exists schedule_note            text,

  -- Rich narrative content
  add column if not exists what_to_expect           text,
  add column if not exists planned_activities       text[] default array[]::text[],
  add column if not exists opportunistic_activities text[] default array[]::text[],
  add column if not exists crew_notes               text[] default array[]::text[],
  add column if not exists crew_leader_watch        text[] default array[]::text[],
  add column if not exists crew_leader_focus        text,

  -- Meal FK references (null when no numbered trail meal issued for that slot)
  add column if not exists meal_breakfast           text references public.trail_meals(code),
  add column if not exists meal_lunch               text references public.trail_meals(code),
  add column if not exists meal_dinner              text references public.trail_meals(code),

  -- Meal override notes (used when slot has no numbered meal bag)
  add column if not exists meal_breakfast_note      text,
  add column if not exists meal_lunch_note          text,
  add column if not exists meal_dinner_note         text;

-- ============================================================
-- Done. Run scripts/seed.ts to populate trail_meals and the
-- new itinerary_days columns.
-- ============================================================
