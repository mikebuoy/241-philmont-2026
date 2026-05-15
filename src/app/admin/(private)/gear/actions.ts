"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, isCurrentUserAdmin } from "@/lib/supabase/admin";

async function requireAdmin() {
  if (!(await isCurrentUserAdmin())) throw new Error("Forbidden");
}

// ─── Category actions ────────────────────────────────────────────────────────

export async function addCategory(name: string): Promise<void> {
  await requireAdmin();
  const n = name.trim();
  if (!n) return;
  const admin = createAdminClient();
  const { data: last } = await admin
    .from("gear_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = last ? (last.sort_order as number) + 1 : 0;
  const { error } = await admin
    .from("gear_categories")
    .insert({ name: n, sort_order });
  if (error) throw new Error(`Add category failed: ${error.message}`);
  revalidatePath("/admin/gear");
}

export async function updateCategoryName(
  oldName: string,
  newName: string,
): Promise<void> {
  await requireAdmin();
  const n = newName.trim();
  if (!n || n === oldName) return;
  const admin = createAdminClient();
  const { error: catErr } = await admin
    .from("gear_categories")
    .update({ name: n, updated_at: new Date().toISOString() })
    .eq("name", oldName);
  if (catErr) throw new Error(`Rename failed: ${catErr.message}`);
  // Cascade to all items in that category
  const { error: itemErr } = await admin
    .from("core_gear_items")
    .update({ category: n })
    .eq("category", oldName);
  if (itemErr) throw new Error(`Category cascade failed: ${itemErr.message}`);
  revalidatePath("/admin/gear");
}

export async function deleteCategory(name: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { count } = await admin
    .from("core_gear_items")
    .select("id", { count: "exact", head: true })
    .eq("category", name);
  if ((count ?? 0) > 0) {
    throw new Error(`"${name}" still has ${count} item(s). Remove them first.`);
  }
  const { error } = await admin
    .from("gear_categories")
    .delete()
    .eq("name", name);
  if (error) throw new Error(`Delete category failed: ${error.message}`);
  revalidatePath("/admin/gear");
}

/** Persist the new category order after drag/drop. */
export async function reorderCategories(orderedNames: string[]): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  await Promise.all(
    orderedNames.map((name, idx) =>
      admin
        .from("gear_categories")
        .update({ sort_order: idx, updated_at: new Date().toISOString() })
        .eq("name", name),
    ),
  );
  revalidatePath("/admin/gear");
}

// ─── Item actions ────────────────────────────────────────────────────────────

type GearField =
  | "name"
  | "category"
  | "required"
  | "qty"
  | "weight_oz"
  | "description";

export async function updateGearItem(
  id: string,
  field: GearField,
  value: string | number,
): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("core_gear_items")
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Update failed: ${error.message}`);
  revalidatePath("/admin/gear");
}

export async function addGearItem(
  category: string,
  name: string,
): Promise<void> {
  await requireAdmin();
  if (!name.trim()) return;
  const admin = createAdminClient();
  // Verify category exists
  const { data: cat } = await admin
    .from("gear_categories")
    .select("name")
    .eq("name", category)
    .maybeSingle();
  const targetCat = cat?.name ?? category;
  const { data: last } = await admin
    .from("core_gear_items")
    .select("sort_order")
    .eq("category", targetCat)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = last ? (last.sort_order as number) + 1 : 0;
  const { error } = await admin.from("core_gear_items").insert({
    category: targetCat,
    name: name.trim(),
    required: "Optional",
    qty: "1",
    weight_oz: 0,
    description: "",
    sort_order,
  });
  if (error) throw new Error(`Add item failed: ${error.message}`);
  revalidatePath("/admin/gear");
}

export async function deleteGearItem(id: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("core_gear_items")
    .delete()
    .eq("id", id);
  if (error) throw new Error(`Delete item failed: ${error.message}`);
  revalidatePath("/admin/gear");
}

/** Persist item order within a category after drag/drop. */
export async function reorderItems(orderedIds: string[]): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  await Promise.all(
    orderedIds.map((id, idx) =>
      admin
        .from("core_gear_items")
        .update({ sort_order: idx, updated_at: new Date().toISOString() })
        .eq("id", id),
    ),
  );
  revalidatePath("/admin/gear");
}

/** Move an item to a different category (cross-category drag). */
export async function moveItemToCategory(
  id: string,
  category: string,
): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: last } = await admin
    .from("core_gear_items")
    .select("sort_order")
    .eq("category", category)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = last ? (last.sort_order as number) + 1 : 0;
  const { error } = await admin
    .from("core_gear_items")
    .update({ category, sort_order, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Move item failed: ${error.message}`);
  revalidatePath("/admin/gear");
}
