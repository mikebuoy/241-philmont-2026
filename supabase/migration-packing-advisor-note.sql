-- ============================================================
-- Tooth of Time · Advisor notes on packing items
-- Run once in Supabase SQL Editor.
-- Idempotent: safe to re-run.
-- ============================================================

alter table public.packing_items
  add column if not exists advisor_note text;

-- No RLS changes needed:
-- Existing "admin all" policy covers writes to the new column.
-- Existing authenticated-read policy covers reads.
