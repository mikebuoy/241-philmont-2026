-- Track whether a crew member is using a Philmont tent.
-- This replaces the UI meaning of actual_pack_weight_includes_tent without dropping the old column.

ALTER TABLE crew_members
  ADD COLUMN IF NOT EXISTS uses_philmont_tent boolean NOT NULL DEFAULT true;

UPDATE crew_members
SET uses_philmont_tent = true
WHERE uses_philmont_tent IS NULL;
