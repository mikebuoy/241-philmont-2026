-- Add default_is_not_taking to crew_core_gear (added after initial migration was run)
ALTER TABLE crew_core_gear
  ADD COLUMN IF NOT EXISTS default_is_not_taking BOOLEAN NOT NULL DEFAULT FALSE;
