"use server";

import { revalidatePath } from "next/cache";
import {
  createAdminClient,
  isCurrentUserAdmin,
} from "@/lib/supabase/admin";

export async function unbindCrewMember(crewMemberId: string) {
  if (!(await isCurrentUserAdmin())) {
    throw new Error("Forbidden");
  }
  const admin = createAdminClient();
  const { error } = await admin
    .from("crew_members")
    .update({ user_id: null, claimed_at: null })
    .eq("id", crewMemberId);
  if (error) throw new Error(`Unbind failed: ${error.message}`);

  revalidatePath("/admin/roster");
  revalidatePath("/crew/roster");
}
