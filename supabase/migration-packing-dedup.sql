-- Deduplicate existing core packing items (keep earliest created_at per member+name)
DELETE FROM packing_items
WHERE is_core = true
  AND id NOT IN (
    SELECT DISTINCT ON (crew_member_id, name) id
    FROM packing_items
    WHERE is_core = true
    ORDER BY crew_member_id, name, created_at ASC
  );

-- Prevent future duplicates via ON CONFLICT guard in upsert calls.
-- Must be a non-partial index so PostgREST can resolve the conflict target;
-- is_core is included as a column so custom items with the same name are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS packing_items_member_name_is_core_uniq
  ON packing_items (crew_member_id, name, is_core);
