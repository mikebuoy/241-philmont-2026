import { createClient as createServerClient } from "@/lib/supabase/server";
import type { CrewRole } from "@/data/roster";

export type CertificationStatus = "certified" | "not_certified" | "tbd";

export type CrewMember = {
  id: string;
  name: string;
  lastInitial: string;
  role: CrewRole;
  crewId: 1 | 2;
  userId: string | null;
  bodyWeightLbs: number | null;
  actualBaseWeightLbs: number | null;
  useActualBaseWeight: boolean;
  usesPhilmontTent: boolean;
  wfaCertificationStatus: CertificationStatus | null;
  cprCertificationStatus: CertificationStatus | null;
  claimedAt: string | null;
};

type Row = {
  id: string;
  name: string;
  last_initial: string;
  role: CrewRole;
  crew_id: 1 | 2;
  user_id: string | null;
  body_weight_lbs: number | null;
  actual_base_weight_lbs: number | null;
  use_actual_base_weight: boolean;
  uses_philmont_tent: boolean | null;
  wfa_certification_status: CertificationStatus | null;
  cpr_certification_status: CertificationStatus | null;
  claimed_at: string | null;
};

function rowToMember(r: Row): CrewMember {
  return {
    id: r.id,
    name: r.name,
    lastInitial: r.last_initial,
    role: r.role,
    crewId: r.crew_id,
    userId: r.user_id,
    bodyWeightLbs: r.body_weight_lbs,
    actualBaseWeightLbs: r.actual_base_weight_lbs,
    useActualBaseWeight: r.use_actual_base_weight ?? false,
    usesPhilmontTent: r.uses_philmont_tent ?? true,
    wfaCertificationStatus: r.wfa_certification_status,
    cprCertificationStatus: r.cpr_certification_status,
    claimedAt: r.claimed_at,
  };
}

/**
 * Fetch all crew members from Supabase, sorted by crew then by role.
 * Reads via the authenticated server client — RLS allows any signed-in
 * user to read all rows. For anonymous build-time reads (e.g. /crew/roster
 * which is a public SSG page), uses the anon key with the same read-all RLS.
 */
export async function getAllCrewMembers(): Promise<CrewMember[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("crew_members")
    .select("*")
    .order("crew_id", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`Failed to load crew: ${error.message}`);
  return (data as Row[]).map(rowToMember);
}

/**
 * Returns the crew_member row owned by the currently-authenticated user,
 * or null if not signed in or not yet claimed.
 */
export async function getMyCrewMember(): Promise<CrewMember | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("crew_members")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load my crew member: ${error.message}`);
  if (!data) return null;
  return rowToMember(data as Row);
}
