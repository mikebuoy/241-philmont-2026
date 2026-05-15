import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type GearCategory = {
  id: string;
  name: string;
  sortOrder: number;
};

export type CoreGearItem = {
  id: string;
  category: string;
  name: string;
  description: string;
  required: "Required" | "Optional" | "Note";
  qty: string;
  weightOz: number;
  sortOrder: number;
  defaultIsWorn: boolean;
  defaultIsConsumable: boolean;
  defaultIsNotPacking: boolean;
};

type CategoryRow = {
  id: string;
  name: string;
  sort_order: number;
};

type ItemRow = {
  id: string;
  category: string;
  name: string;
  description: string;
  required: string;
  qty: string;
  weight_oz: number;
  sort_order: number;
  default_is_worn: boolean;
  default_is_consumable: boolean;
  default_is_not_packing: boolean;
};

function rowToCategory(r: CategoryRow): GearCategory {
  return { id: r.id, name: r.name, sortOrder: r.sort_order };
}

function rowToItem(r: ItemRow): CoreGearItem {
  return {
    id: r.id,
    category: r.category,
    name: r.name,
    description: r.description ?? "",
    required: r.required as CoreGearItem["required"],
    qty: r.qty,
    weightOz: Number(r.weight_oz),
    sortOrder: r.sort_order,
    defaultIsWorn: r.default_is_worn ?? false,
    defaultIsConsumable: r.default_is_consumable ?? false,
    defaultIsNotPacking: r.default_is_not_packing ?? false,
  };
}

export async function getGearCategories(): Promise<GearCategory[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("gear_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Failed to load gear categories: ${error.message}`);
  return (data as CategoryRow[]).map(rowToCategory);
}

export async function getCoreGearItems(): Promise<CoreGearItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("core_gear_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`Failed to load core gear: ${error.message}`);
  return (data as ItemRow[]).map(rowToItem);
}

/** Returns a name → description map for all core gear items that have a description. */
export async function getCoreGearDescriptions(): Promise<Record<string, string>> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("core_gear_items")
    .select("name, description")
    .neq("description", "");
  if (error) throw new Error(`Failed to load descriptions: ${error.message}`);
  const map: Record<string, string> = {};
  for (const r of (data ?? []) as { name: string; description: string }[]) {
    if (r.description) map[r.name] = r.description;
  }
  return map;
}
