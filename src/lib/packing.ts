import "server-only";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CrewMember } from "@/lib/crew";
import type { PackingItem } from "./packing-types";

export type { PackingItem, Totals } from "./packing-types";
export { computeTotals } from "./packing-types";

type Row = {
  id: string;
  crew_member_id: string;
  category: string;
  name: string;
  qty: number;
  weight_oz: number;
  is_core: boolean;
  is_required: boolean | null;
  is_worn: boolean;
  is_consumable: boolean;
  is_smellable: boolean;
  is_packed: boolean;
  is_not_packing: boolean;
  notes: string | null;
  sort_order: number;
};

function rowToItem(r: Row): PackingItem {
  return {
    id: r.id,
    crewMemberId: r.crew_member_id,
    category: r.category,
    name: r.name,
    qty: r.qty,
    weightOz: Number(r.weight_oz),
    isCore: r.is_core,
    isRequired: r.is_required,
    isWorn: r.is_worn,
    isConsumable: r.is_consumable,
    isSmellable: r.is_smellable,
    isPacked: r.is_packed,
    isNotPacking: r.is_not_packing,
    notes: r.notes,
    sortOrder: r.sort_order,
  };
}

/** Fetch all items for a given crew member, ordered for stable rendering. */
export async function getPackingItems(crewMemberId: string): Promise<PackingItem[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("packing_items")
    .select("*")
    .eq("crew_member_id", crewMemberId)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`Failed to load packing items: ${error.message}`);
  return (data as Row[]).map(rowToItem);
}

/**
 * Seed core items for a crew member who has none yet. Idempotent — checks for
 * existing items first and bails if any exist. Reads from core_gear_items DB
 * table (editable via /admin/gear) instead of the static array.
 *
 * Role-aware shelter defaults: scouts get Thunder Ridge at 43 oz pre-packed;
 * advisors get Personal 1P pre-packed at 0 oz. These are keyed on item name —
 * renaming those rows in the gear editor will break the role defaults.
 */
export async function seedCoreItemsForCrewMember(
  member: CrewMember,
): Promise<void> {
  const supabase = await createServerClient();
  const { count, error: countErr } = await supabase
    .from("packing_items")
    .select("id", { count: "exact", head: true })
    .eq("crew_member_id", member.id);
  if (countErr) throw new Error(`Seed check failed: ${countErr.message}`);
  if ((count ?? 0) > 0) return; // already seeded

  const isScout = member.role === "scout" || member.role === "crew_leader";

  // Read current gear list from DB so admin edits take effect for future seeds.
  const admin = createAdminClient();
  const { data: gearItems, error: gearErr } = await admin
    .from("core_gear_items")
    .select("*")
    .order("sort_order", { ascending: true });
  if (gearErr) throw new Error(`Failed to load core gear: ${gearErr.message}`);

  const rows = (gearItems as Array<{
    category: string; name: string; required: string;
    qty: string; weight_oz: number; sort_order: number;
  }>).map((g, idx) => {
    let weightOz = Number(g.weight_oz) || 0;
    let isNotPacking = false;

    if (g.category === "Shelter") {
      if (g.name === "Philmont Thunder Ridge tent (your half)") {
        weightOz = isScout ? 43 : 0;
        isNotPacking = !isScout;
      } else if (g.name === "Personal 1P tent (enter weight)") {
        weightOz = 0;
        isNotPacking = isScout;
      }
    }

    return {
      crew_member_id: member.id,
      category: g.category,
      name: g.name,
      qty: numberOrOne(g.qty),
      weight_oz: weightOz,
      is_core: true,
      is_required: g.required === "Required",
      is_not_packing: isNotPacking,
      sort_order: g.sort_order ?? idx,
    };
  });

  const { error } = await admin.from("packing_items").insert(rows);
  if (error) throw new Error(`Seed failed: ${error.message}`);
}

function numberOrOne(qty: string): number {
  const n = parseInt(qty, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
