"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMyCrewMember } from "@/lib/crew";

export async function saveMyBodyWeight(lbs: number | null): Promise<void> {
  const me = await getMyCrewMember();
  if (!me) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("crew_members")
    .update({ body_weight_lbs: lbs })
    .eq("id", me.id);
  if (error) throw new Error(error.message);
  revalidatePath("/pack/calculator");
  revalidatePath("/pack/gear");
}
