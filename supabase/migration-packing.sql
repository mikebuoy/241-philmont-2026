-- ============================================================
-- Tooth of Time · Phase 2 · Personal packing list
-- Run once in Supabase SQL Editor after migration-crew.sql.
-- ============================================================

-- 1. packing_items table -----------------------------------------------------
create table if not exists public.packing_items (
  id              uuid primary key default gen_random_uuid(),
  crew_member_id  uuid not null references public.crew_members(id) on delete cascade,

  category        text not null,
  name            text not null,
  qty             int  not null default 1 check (qty >= 0),
  /** Canonical weight unit is oz. UI may display in lbs or g. */
  weight_oz       numeric not null default 0 check (weight_oz >= 0),

  /** Core items come from coreItems.ts; users can't delete them, only flag not_packing. */
  is_core         boolean not null default false,
  /** Worn: excluded from base weight. */
  is_worn         boolean not null default false,
  /** Consumable: in base weight, separately tracked. */
  is_consumable   boolean not null default false,
  /** Smellable: visual reminder for bear-bag duty; doesn't affect math. */
  is_smellable    boolean not null default false,
  /** Packed: pack-out checkbox state. */
  is_packed       boolean not null default false,
  /** Not packing: hidden by default, excluded from all weight totals. */
  is_not_packing  boolean not null default false,

  notes           text,
  sort_order      int  not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists packing_items_crew_member_idx
  on public.packing_items(crew_member_id);
create index if not exists packing_items_category_idx
  on public.packing_items(crew_member_id, category, sort_order);

-- 2. RLS ---------------------------------------------------------------------
alter table public.packing_items enable row level security;

drop policy if exists "packing_items public read"   on public.packing_items;
drop policy if exists "packing_items owner write"   on public.packing_items;
drop policy if exists "packing_items admin all"     on public.packing_items;

-- Any authenticated user can read any crew member's list (for the dashboard).
create policy "packing_items public read"
  on public.packing_items
  for select
  to authenticated
  using (true);

-- A user can insert / update / delete only on rows whose crew_member_id maps
-- to their own claimed roster slot.
create policy "packing_items owner write"
  on public.packing_items
  for all
  to authenticated
  using (
    crew_member_id in (
      select id from public.crew_members where user_id = auth.uid()
    )
  )
  with check (
    crew_member_id in (
      select id from public.crew_members where user_id = auth.uid()
    )
  );

-- Admins can do anything (rebuilds, fixes, etc.)
create policy "packing_items admin all"
  on public.packing_items
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3. updated_at trigger ------------------------------------------------------
drop trigger if exists packing_items_touch on public.packing_items;
create trigger packing_items_touch
  before update on public.packing_items
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Done. After running this, the /pack/gear page will auto-seed
-- a fresh user's list on first visit (no manual seed needed).
-- ============================================================
