"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, isCurrentUserAdmin } from "@/lib/supabase/admin";

async function requireAdmin() {
  if (!(await isCurrentUserAdmin())) throw new Error("Forbidden");
}

export async function setPackedState(
  itemId: string,
  isPacked: boolean,
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("packing_items")
      .update({ is_packed: isPacked })
      .eq("id", itemId);
    if (error) return { error: error.message };
    revalidatePath("/crew/gear-check");
    revalidatePath("/pack/gear");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function setAdvisorNote(
  itemId: string,
  note: string | null,
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("packing_items")
      .update({ advisor_note: note })
      .eq("id", itemId);
    if (error) return { error: error.message };
    revalidatePath("/crew/gear-check");
    revalidatePath("/pack/gear");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}
