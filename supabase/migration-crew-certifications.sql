-- Track crew member WFA and CPR certification status.
-- null means unset; public roster flags are shown only when a status is selected.

ALTER TABLE crew_members
  ADD COLUMN IF NOT EXISTS wfa_certification_status text,
  ADD COLUMN IF NOT EXISTS cpr_certification_status text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'crew_members_wfa_certification_status_check'
  ) THEN
    ALTER TABLE crew_members
      ADD CONSTRAINT crew_members_wfa_certification_status_check
      CHECK (wfa_certification_status IS NULL OR wfa_certification_status IN ('certified', 'not_certified', 'tbd'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'crew_members_cpr_certification_status_check'
  ) THEN
    ALTER TABLE crew_members
      ADD CONSTRAINT crew_members_cpr_certification_status_check
      CHECK (cpr_certification_status IS NULL OR cpr_certification_status IN ('certified', 'not_certified', 'tbd'));
  END IF;
END $$;
