import "server-only";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type CrewCoreGearItem = {
  id: string;
  name: string;
  supplier: "Philmont Issued" | "Troop Supplied";
  qty: number;
  weightOz: number;
  description: string;
  defaultIsNotTaking: boolean;
  sortOrder: number;
};

export type CrewGearItem = {
  id: string;
  crewId: number;
  coreItemId: string | null;
  name: string;
  supplier: "Philmont Issued" | "Troop Supplied";
  qty: number;
  weightOz: number;
  isCore: boolean;
  isChecked: boolean;
  isNotTaking: boolean;
  notes: string | null;
  description: string | null;
  sortOrder: number;
};

type CoreRow = {
  id: string;
  name: string;
  supplier: string;
  qty: number;
  weight_oz: number;
  description: string;
  default_is_not_taking: boolean;
  sort_order: number;
};

type ItemRow = {
  id: string;
  crew_id: number;
  core_item_id: string | null;
  name: string;
  supplier: string;
  qty: number;
  weight_oz: number;
  is_core: boolean;
  is_checked: boolean;
  is_not_taking: boolean;
  notes: string | null;
  sort_order: number;
  crew_core_gear: { description: string } | null;
};

function coreRowToItem(r: CoreRow): CrewCoreGearItem {
  return {
    id: r.id,
    name: r.name,
    supplier: r.supplier as CrewCoreGearItem["supplier"],
    qty: r.qty,
    weightOz: Number(r.weight_oz),
    description: r.description,
    defaultIsNotTaking: r.default_is_not_taking ?? false,
    sortOrder: r.sort_order,
  };
}

function rowToItem(r: ItemRow): CrewGearItem {
  return {
    id: r.id,
    crewId: r.crew_id,
    coreItemId: r.core_item_id,
    name: r.name,
    supplier: r.supplier as CrewGearItem["supplier"],
    qty: r.qty,
    weightOz: Number(r.weight_oz),
    isCore: r.is_core,
    isChecked: r.is_checked,
    isNotTaking: r.is_not_taking,
    notes: r.notes,
    description: r.crew_core_gear?.description ?? null,
    sortOrder: r.sort_order,
  };
}

export async function getCoreCrewGear(): Promise<CrewCoreGearItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("crew_core_gear")
    .select("*")
    .order("supplier", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Failed to load core crew gear: ${error.message}`);
  return (data as CoreRow[]).map(coreRowToItem);
}

export async function getCrewGearItems(crewId: number): Promise<CrewGearItem[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("crew_gear_items")
    .select("*, crew_core_gear(description)")
    .eq("crew_id", crewId)
    .order("supplier", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`Failed to load crew gear items: ${error.message}`);
  return (data as ItemRow[]).map(rowToItem);
}

/**
 * Idempotent seeding: inserts a crew_gear_items row for every crew_core_gear
 * entry not yet present for this crew_id (matched by core_item_id). Safe to
 * call on every page load.
 */
export async function seedCrewGearForCrew(crewId: number): Promise<void> {
  const admin = createAdminClient();

  const [coreRes, existingRes] = await Promise.all([
    admin
      .from("crew_core_gear")
      .select("*")
      .order("sort_order", { ascending: true }),
    admin
      .from("crew_gear_items")
      .select("core_item_id")
      .eq("crew_id", crewId)
      .not("core_item_id", "is", null),
  ]);

  if (coreRes.error) throw new Error(`Seed fetch core failed: ${coreRes.error.message}`);
  if (existingRes.error) throw new Error(`Seed fetch existing failed: ${existingRes.error.message}`);

  const existingCoreIds = new Set(
    (existingRes.data as { core_item_id: string }[]).map((r) => r.core_item_id)
  );

  const missing = (coreRes.data as CoreRow[]).filter(
    (r) => !existingCoreIds.has(r.id)
  );
  if (missing.length === 0) return;

  const rows = missing.map((r) => ({
    crew_id: crewId,
    core_item_id: r.id,
    name: r.name,
    supplier: r.supplier,
    qty: r.qty,
    weight_oz: Number(r.weight_oz),
    is_core: true,
    is_not_taking: r.default_is_not_taking ?? false,
    sort_order: r.sort_order,
  }));

  const { error } = await admin.from("crew_gear_items").insert(rows);
  if (error) throw new Error(`Seed insert failed: ${error.message}`);
}
