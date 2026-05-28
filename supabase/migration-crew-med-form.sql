-- Track whether each crew member has submitted the required medical form.
-- Philmont requires BSA medical form parts A, B, and C for everyone.

ALTER TABLE crew_members
  ADD COLUMN IF NOT EXISTS med_form_received boolean NOT NULL DEFAULT false;
