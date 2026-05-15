import { createClient as createServerClient } from "@/lib/supabase/server";
import type { CrewRole } from "@/data/roster";

export type CrewMember = {
  id: string;
  name: string;
  lastInitial: string;
  role: CrewRole;
  crewId: 1 | 2;
  userId: string | null;
  bodyWeightLbs: number | null;
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
