"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function claimRosterSlot(crewMemberId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not signed in");
  }

  // RLS allows the update because user_id IS NULL on the target row;
  // WITH CHECK enforces that the new user_id is auth.uid().
  const { error } = await supabase
    .from("crew_members")
    .update({
      user_id: user.id,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", crewMemberId)
    .is("user_id", null);

  if (error) {
    throw new Error(`Claim failed: ${error.message}`);
  }

  revalidatePath("/crew/roster");
  revalidatePath("/claim");
  redirect("/?claimed=1");
}
