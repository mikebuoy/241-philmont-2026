-- ============================================================
-- Tooth of Time · Phase 2 v2 · is_required + Travel category
-- Run once in Supabase SQL Editor after migration-packing.sql.
-- Idempotent: safe to re-run.
-- ============================================================

-- 1. Add is_required column ---------------------------------------------------
alter table public.packing_items
  add column if not exists is_required boolean;

-- 2. Backfill: assume Required for core items, then override the optionals ----
update public.packing_items
   set is_required = true
 where is_core = true
   and is_required is null;

update public.packing_items
   set is_required = false
 where is_core = true
   and name in (
     'Camp/Sleep Socks',
     'Camp/Sleep Shirt',
     'Camp/Sleep Pants or Shorts',
     'Camp/Sleep Beanie',
     'Mid Layer Fleece',
     'Hiking Gloves (Sun Protection)',
     'Camp Shoes (Crocs, Sandals, Water Shoes)',
     'Mug (Adults recommended for Advisor Coffee)',
     'Money',
     'Pack Cover',
     'Stuff Sacks',
     'Trekking Poles (Rubber tips mandatory)',
     '1 pair Backup tips for trekking pole',
     'Sit Pad/Camp Chair',
     'Sleeping Bag Liner',
     'Pillow'
   );

-- 3. Recategorize travel-only items ------------------------------------------
update public.packing_items
   set category = 'Travel / Basecamp Only'
 where name in (
   'Field Uniform',
   'Gear Duffle for Checked Luggage'
 );

-- ============================================================
-- Done. New seeds going forward will set is_required and the
-- correct category automatically from coreItems.ts.
-- ============================================================
