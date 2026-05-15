"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMyCrewMember } from "@/lib/crew";

async function requireMyCrewMember() {
  const me = await getMyCrewMember();
  if (!me) throw new Error("Not signed in or not claimed");
  return me;
}

export async function updateItemField(
  itemId: string,
  patch: {
    name?: string;
    qty?: number;
    weight_oz?: number;
    notes?: string | null;
  },
): Promise<void> {
  await requireMyCrewMember();
  const supabase = await createClient();
  const { error } = await supabase
    .from("packing_items")
    .update(patch)
    .eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath("/pack/gear");
}

export async function toggleItemFlag(
  itemId: string,
  flag:
    | "is_worn"
    | "is_consumable"
    | "is_smellable"
    | "is_packed"
    | "is_not_packing",
  value: boolean,
): Promise<void> {
  await requireMyCrewMember();
  const supabase = await createClient();
  const { error } = await supabase
    .from("packing_items")
    .update({ [flag]: value })
    .eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath("/pack/gear");
}

export async function addPersonalItem(category: string): Promise<string> {
  const me = await requireMyCrewMember();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("packing_items")
    .insert({
      crew_member_id: me.id,
      category,
      name: "New item",
      qty: 1,
      weight_oz: 0,
      is_core: false,
      sort_order: 9999,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/pack/gear");
  return data.id as string;
}

export async function deletePersonalItem(itemId: string): Promise<void> {
  await requireMyCrewMember();
  const supabase = await createClient();
  // RLS prevents deleting other users' items; we additionally guard against
  // deleting core items here.
  const { error } = await supabase
    .from("packing_items")
    .delete()
    .eq("id", itemId)
    .eq("is_core", false);
  if (error) throw new Error(error.message);
  revalidatePath("/pack/gear");
}

export async function saveMyBodyWeight(lbs: number | null): Promise<void> {
  const me = await requireMyCrewMember();
  const supabase = await createClient();
  const { error } = await supabase
    .from("crew_members")
    .update({ body_weight_lbs: lbs })
    .eq("id", me.id);
  if (error) throw new Error(error.message);
  revalidatePath("/pack/gear");
}
