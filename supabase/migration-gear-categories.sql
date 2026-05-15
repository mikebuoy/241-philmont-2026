-- ============================================================
-- Gear Categories table — admin-managed category list with sort order.
-- Run after migration-gear-editor.sql.
-- ============================================================

create table if not exists public.gear_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gear_categories enable row level security;

create policy "Authenticated can read gear categories" on public.gear_categories
  for select using (auth.role() = 'authenticated');

-- Seed from current canonical category order
insert into public.gear_categories (name, sort_order) values
  ('10 Essentials',         0),
  ('Clothing',              1),
  ('First Aid - Personal',  2),
  ('Food',                  3),
  ('Footwear',              4),
  ('Mess Kit',              5),
  ('Money',                 6),
  ('Pack',                  7),
  ('Personal Gear',         8),
  ('Personal Toiletries',   9),
  ('Rain Gear',             10),
  ('Shelter',               11),
  ('Sleep System',          12),
  ('Water',                 13),
  ('Travel / Basecamp Only', 14)
on conflict (name) do nothing;
