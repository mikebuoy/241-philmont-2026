"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, isCurrentUserAdmin } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getMyCrewMember } from "@/lib/crew";

async function requireAdmin() {
  if (!(await isCurrentUserAdmin())) throw new Error("Forbidden");
}

/**
 * Allows admins to check any item, and crew leaders to check items for their
 * own crew only. Fetches the item's crew_id and validates the caller's role.
 */
async function requireCheckPermission(itemId: string): Promise<void> {
  const isAdmin = await isCurrentUserAdmin();
  if (isAdmin) return;

  const me = await getMyCrewMember();
  if (!me || me.role !== "crew_leader") throw new Error("Forbidden");

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("crew_gear_items")
    .select("crew_id")
    .eq("id", itemId)
    .single();
  if (error || !data) throw new Error("Item not found");
  if ((data as { crew_id: number }).crew_id !== me.crewId) throw new Error("Forbidden");
}

export async function toggleCrewGearChecked(
  itemId: string,
  value: boolean,
): Promise<void> {
  await requireCheckPermission(itemId);
  const admin = createAdminClient();
  const { error } = await admin
    .from("crew_gear_items")
    .update({ is_checked: value, updated_at: new Date().toISOString() })
    .eq("id", itemId);
  if (error) throw new Error(`Toggle checked failed: ${error.message}`);
  revalidatePath("/crew/gear");
}

export async function toggleCrewGearNotTaking(
  itemId: string,
  value: boolean,
): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("crew_gear_items")
    .update({ is_not_taking: value, updated_at: new Date().toISOString() })
    .eq("id", itemId);
  if (error) throw new Error(`Toggle not-taking failed: ${error.message}`);
  revalidatePath("/crew/gear");
}

export async function updateCrewGearItemNotes(
  itemId: string,
  notes: string | null,
): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("crew_gear_items")
    .update({ notes: notes ?? null, updated_at: new Date().toISOString() })
    .eq("id", itemId);
  if (error) throw new Error(`Update notes failed: ${error.message}`);
  revalidatePath("/crew/gear");
}

export async function updateCrewGearItem(
  itemId: string,
  patch: { name?: string; qty?: number; weight_oz?: number },
): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("crew_gear_items")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", itemId);
  if (error) throw new Error(`Update item failed: ${error.message}`);
  revalidatePath("/crew/gear");
}

export async function addCustomCrewGearItem(
  crewId: number,
  supplier: "Philmont Issued" | "Troop Supplied",
): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: last } = await admin
    .from("crew_gear_items")
    .select("sort_order")
    .eq("crew_id", crewId)
    .eq("supplier", supplier)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = last ? (last as { sort_order: number }).sort_order + 1 : 100;
  const { error } = await admin.from("crew_gear_items").insert({
    crew_id: crewId,
    name: "New item",
    supplier,
    qty: 1,
    weight_oz: 0,
    is_core: false,
    sort_order,
  });
  if (error) throw new Error(`Add item failed: ${error.message}`);
  revalidatePath("/crew/gear");
}

export async function deleteCustomCrewGearItem(itemId: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("crew_gear_items")
    .delete()
    .eq("id", itemId)
    .eq("is_core", false); // safety guard: only custom items
  if (error) throw new Error(`Delete item failed: ${error.message}`);
  revalidatePath("/crew/gear");
}
