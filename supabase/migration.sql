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
-- Done. After running this, you can run the seed script
-- (scripts/seed.ts) from the project to populate itinerary_days
-- and upload the GPX file.
-- ============================================================
