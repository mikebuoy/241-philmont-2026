-- Add actual_base_weight_lbs to track what crew members enter in the estimator.
-- Body weight already exists; this captures the user-entered pack weight so we
-- can display readiness across the crew without recalculating from packing_items.
ALTER TABLE crew_members
  ADD COLUMN IF NOT EXISTS actual_base_weight_lbs numeric;
