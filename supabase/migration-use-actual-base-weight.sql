ALTER TABLE crew_members
  ADD COLUMN IF NOT EXISTS use_actual_base_weight boolean DEFAULT false;
