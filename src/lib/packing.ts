import "server-only";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CORE_ITEMS } from "@/data/coreItems";
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
 * Seed the 83 core items for a crew member who has none yet. Idempotent —
 * checks for existing items first and bails if any exist. Role-aware shelter
 * defaults: scouts get the Thunder Ridge half pre-packed; advisors get the
 * personal 1P pre-packed at 0 oz.
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

  const rows = CORE_ITEMS.map((coreItem, idx) => {
    let weightOz = 0;
    let isNotPacking = false;

    if (coreItem.category === "Shelter") {
      if (coreItem.item === "Philmont Thunder Ridge tent (your half)") {
        weightOz = isScout ? 43 : 0;
        isNotPacking = !isScout;
      } else if (coreItem.item === "Personal 1P tent (enter weight)") {
        weightOz = 0;
        isNotPacking = isScout;
      }
    }

    return {
      crew_member_id: member.id,
      category: coreItem.category,
      name: coreItem.item,
      qty: numberOrOne(coreItem.qty),
      weight_oz: weightOz,
      is_core: true,
      is_required: coreItem.required === "Required",
      is_not_packing: isNotPacking,
      sort_order: idx,
    };
  });

  // Use admin client to bypass RLS for the initial bulk seed — the caller has
  // already verified the crew_member belongs to the current user.
  const admin = createAdminClient();
  const { error } = await admin.from("packing_items").insert(rows);
  if (error) throw new Error(`Seed failed: ${error.message}`);
}

function numberOrOne(qty: string): number {
  const n = parseInt(qty, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
