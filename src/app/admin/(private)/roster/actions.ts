"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, isCurrentUserAdmin } from "@/lib/supabase/admin";
import { seedCoreItemsForCrewMember } from "@/lib/packing";
import type { CrewMember } from "@/lib/crew";

export async function unbindCrewMember(crewMemberId: string) {
  if (!(await isCurrentUserAdmin())) throw new Error("Forbidden");
  const admin = createAdminClient();
  const { error } = await admin
    .from("crew_members")
    .update({ user_id: null, claimed_at: null })
    .eq("id", crewMemberId);
  if (error) throw new Error(`Unbind failed: ${error.message}`);
  revalidatePath("/admin/roster");
  revalidatePath("/crew/roster");
}

export async function resetCrewMemberGearList(crewMemberId: string) {
  if (!(await isCurrentUserAdmin())) throw new Error("Forbidden");
  const admin = createAdminClient();

  // Fetch member row — need role for role-aware shelter seed defaults
  const { data: row, error: fetchErr } = await admin
    .from("crew_members")
    .select("id, name, last_initial, role, crew_id, user_id, body_weight_lbs, claimed_at")
    .eq("id", crewMemberId)
    .single();
  if (fetchErr || !row) throw new Error("Crew member not found");

  // Delete all existing packing items
  const { error: deleteErr } = await admin
    .from("packing_items")
    .delete()
    .eq("crew_member_id", crewMemberId);
  if (deleteErr) throw new Error(`Reset failed: ${deleteErr.message}`);

  // Re-seed from core_gear_items (seedCoreItemsForCrewMember sees 0 items → proceeds)
  const member: CrewMember = {
    id: row.id,
    name: row.name,
    lastInitial: row.last_initial,
    role: row.role,
    crewId: row.crew_id,
    userId: row.user_id,
    bodyWeightLbs: row.body_weight_lbs,
    actualBaseWeightLbs: null,
    claimedAt: row.claimed_at,
  };
  await seedCoreItemsForCrewMember(member);

  revalidatePath("/pack/gear");
}
