import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type CoreGearItem = {
  id: string;
  category: string;
  name: string;
  description: string;
  required: "Required" | "Optional" | "Note";
  qty: string;
  weightOz: number;
  sortOrder: number;
};

type Row = {
  id: string;
  category: string;
  name: string;
  description: string;
  required: string;
  qty: string;
  weight_oz: number;
  sort_order: number;
};

function rowToItem(r: Row): CoreGearItem {
  return {
    id: r.id,
    category: r.category,
    name: r.name,
    description: r.description,
    required: r.required as CoreGearItem["required"],
    qty: r.qty,
    weightOz: Number(r.weight_oz),
    sortOrder: r.sort_order,
  };
}

export async function getCoreGearItems(): Promise<CoreGearItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("core_gear_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`Failed to load core gear: ${error.message}`);
  return (data as Row[]).map(rowToItem);
}
