-- Expand role check constraint to include chaplain_aide and guia
ALTER TABLE crew_members DROP CONSTRAINT crew_members_role_check;
ALTER TABLE crew_members ADD CONSTRAINT crew_members_role_check
  CHECK (role IN ('crew_leader','chaplain_aide','guia','scout','lead_advisor','advisor'));

-- Add disabled flag (defaults false so all existing members remain enabled)
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS is_disabled boolean NOT NULL DEFAULT false;
