-- Shelter tent option for actual base weight mode.
-- Default false means the user's actual pack weight does not include tent,
-- so the Philmont-issued tent weight is added to add-on weight.
ALTER TABLE crew_members
  ADD COLUMN IF NOT EXISTS actual_pack_weight_includes_tent boolean NOT NULL DEFAULT false;
