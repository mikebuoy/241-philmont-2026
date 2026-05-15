"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, isCurrentUserAdmin } from "@/lib/supabase/admin";
import { CORE_CATEGORIES } from "@/data/coreItems";

async function requireAdmin() {
  if (!(await isCurrentUserAdmin())) throw new Error("Forbidden");
}

type GearField = "name" | "category" | "required" | "qty" | "weight_oz" | "description";

export async function updateGearItem(
  id: string,
  field: GearField,
  value: string | number,
) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("core_gear_items")
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Update failed: ${error.message}`);
  revalidatePath("/admin/gear");
}

export async function addGearItem(category: string, name: string) {
  await requireAdmin();
  if (!name.trim()) return;
  const cat = CORE_CATEGORIES.includes(category) ? category : CORE_CATEGORIES[0];

  // Place new item at end of its category group
  const admin = createAdminClient();
  const { data: last } = await admin
    .from("core_gear_items")
    .select("sort_order")
    .eq("category", cat)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = last ? (last.sort_order as number) + 1 : 0;

  const { error } = await admin.from("core_gear_items").insert({
    category: cat,
    name: name.trim(),
    required: "Optional",
    qty: "1",
    weight_oz: 0,
    sort_order,
  });
  if (error) throw new Error(`Add failed: ${error.message}`);
  revalidatePath("/admin/gear");
}

export async function deleteGearItem(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("core_gear_items").delete().eq("id", id);
  if (error) throw new Error(`Delete failed: ${error.message}`);
  revalidatePath("/admin/gear");
}
