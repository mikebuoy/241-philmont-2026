-- Backfill: set is_required = NULL for packing_items that map to Note-type
-- core_gear_items. Before this migration, Note items were seeded with
-- is_required = false (same as Optional), making them indistinguishable.
-- After this, Note items are: is_core = true AND is_required IS NULL.
-- Personal items (is_core = false) also have is_required NULL but are
-- distinguished by is_core.

UPDATE public.packing_items pi
SET is_required = NULL
FROM public.core_gear_items cgi
WHERE pi.name = cgi.name
  AND pi.is_core = true
  AND cgi.required = 'Note';
