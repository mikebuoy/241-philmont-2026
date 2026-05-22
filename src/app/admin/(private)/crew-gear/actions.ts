"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, isCurrentUserAdmin } from "@/lib/supabase/admin";
import { seedCrewGearForCrew } from "@/lib/crew-gear";

async function requireAdmin() {
  if (!(await isCurrentUserAdmin())) throw new Error("Forbidden");
}

export async function addCoreCrewGearItem(data: {
  name: string;
  supplier: "Philmont Issued" | "Troop Supplied";
  qty: number;
  weight_oz: number;
  description: string;
}): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: last } = await admin
    .from("crew_core_gear")
    .select("sort_order")
    .eq("supplier", data.supplier)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = last ? (last as { sort_order: number }).sort_order + 1 : 0;
  const { error } = await admin.from("crew_core_gear").insert({
    ...data,
    name: data.name.trim() || "New item",
    sort_order,
  });
  if (error) throw new Error(`Add failed: ${error.message}`);
  revalidatePath("/admin/crew-gear");
  revalidatePath("/crew/gear");
}

type UpdateField = "name" | "supplier" | "qty" | "weight_oz" | "description" | "default_is_not_taking";

export async function updateCoreCrewGearItem(
  id: string,
  field: UpdateField,
  value: string | number | boolean,
): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("crew_core_gear")
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Update failed: ${error.message}`);

  // Cascade name → crew_gear_items
  if (field === "name") {
    await admin
      .from("crew_gear_items")
      .update({ name: value })
      .eq("core_item_id", id)
      .eq("is_core", true);
  }

  // Cascade default_is_not_taking → is_not_taking on all crew_gear_items for this core item
  if (field === "default_is_not_taking") {
    await admin
      .from("crew_gear_items")
      .update({ is_not_taking: value })
      .eq("core_item_id", id)
      .eq("is_core", true);
  }

  revalidatePath("/admin/crew-gear");
  revalidatePath("/crew/gear");
}

export async function deleteCoreCrewGearItem(id: string): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  // Orphan existing crew_gear_items (ON DELETE SET NULL handles the FK; mark as custom)
  await admin
    .from("crew_gear_items")
    .update({ is_core: false })
    .eq("core_item_id", id);
  const { error } = await admin.from("crew_core_gear").delete().eq("id", id);
  if (error) throw new Error(`Delete failed: ${error.message}`);
  revalidatePath("/admin/crew-gear");
  revalidatePath("/crew/gear");
}

/**
 * Persist a new sort order for items within one supplier group. Cascades
 * sort_order to all crew_gear_items rows so the per-crew checklists stay
 * in sync.
 */
export async function reorderCoreCrewGear(orderedIds: string[]): Promise<void> {
  await requireAdmin();
  const admin = createAdminClient();
  await Promise.all(
    orderedIds.map((id, idx) =>
      admin
        .from("crew_core_gear")
        .update({ sort_order: idx, updated_at: new Date().toISOString() })
        .eq("id", id)
        .then(() =>
          admin
            .from("crew_gear_items")
            .update({ sort_order: idx })
            .eq("core_item_id", id)
        ),
    ),
  );
  revalidatePath("/admin/crew-gear");
  revalidatePath("/crew/gear");
}

/** Push any new crew_core_gear items to all existing crew_gear_items rows. */
export async function syncAllCrewsAction(): Promise<{ crewsProcessed: number; itemsAdded: number }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: crewRows } = await admin
    .from("crew_gear_items")
    .select("crew_id")
    .order("crew_id", { ascending: true });

  const crewIds = [...new Set(((crewRows ?? []) as { crew_id: number }[]).map((r) => r.crew_id))];
  if (crewIds.length === 0) crewIds.push(1, 2);

  const before = await admin
    .from("crew_gear_items")
    .select("id", { count: "exact", head: true });
  const beforeCount = before.count ?? 0;

  await Promise.all(crewIds.map((id) => seedCrewGearForCrew(id)));

  const after = await admin
    .from("crew_gear_items")
    .select("id", { count: "exact", head: true });
  const itemsAdded = (after.count ?? 0) - beforeCount;

  revalidatePath("/crew/gear");
  revalidatePath("/admin/crew-gear");
  return { crewsProcessed: crewIds.length, itemsAdded };
}
