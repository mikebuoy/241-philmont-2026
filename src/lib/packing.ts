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
  advisor_note: string | null;
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
    advisorNote: r.advisor_note,
    sortOrder: r.sort_order,
  };
}

/** Fetch all packing items for all crew members in one query. */
export async function getAllPackingItems(): Promise<PackingItem[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("packing_items")
    .select("*");
  if (error) throw new Error(`Failed to load all packing items: ${error.message}`);
  return (data as Row[]).map(rowToItem);
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
 * Sync core items for a crew member. Idempotent — inserts only items that
 * don't already exist in the member's packing list (matched by name). This
 * means new items added to core_gear_items automatically appear for all
 * members on their next page load, without overwriting existing entries.
 *
 * Role-aware shelter defaults: scouts get Thunder Ridge at 43 oz pre-packed;
 * advisors get Personal 1P pre-packed at 0 oz. These are keyed on item name —
 * renaming those rows in the gear editor will break the role defaults.
 */
export async function seedCoreItemsForCrewMember(
  member: CrewMember,
): Promise<void> {
  const supabase = await createServerClient();
  const admin = createAdminClient();

  // Fetch existing core items for this member and all core_gear_items in parallel
  const [existingRes, gearRes] = await Promise.all([
    supabase
      .from("packing_items")
      .select("id, name, is_required")
      .eq("crew_member_id", member.id)
      .eq("is_core", true),
    admin
      .from("core_gear_items")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);
  if (existingRes.error) throw new Error(`Seed check failed: ${existingRes.error.message}`);
  if (gearRes.error) throw new Error(`Failed to load core gear: ${gearRes.error.message}`);

  type ExistingRow = { id: string; name: string; is_required: boolean | null };
  const existingItems = existingRes.data as ExistingRow[];
  const existingByName = new Map(existingItems.map((r) => [r.name, r]));

  const gearItems = gearRes.data as Array<{
    category: string; name: string; required: string;
    qty: string; weight_oz: number; sort_order: number;
    default_is_worn: boolean; default_is_consumable: boolean; default_is_not_packing: boolean;
  }>;

  // Sync is_required for existing core items that have drifted from core_gear_items
  const stale = gearItems
    .map((g) => {
      const existing = existingByName.get(g.name);
      if (!existing) return null;
      const expected = g.required === "Required" ? true : g.required === "Optional" ? false : null;
      if (existing.is_required === expected) return null;
      return { id: existing.id, is_required: expected };
    })
    .filter(Boolean) as { id: string; is_required: boolean | null }[];

  for (const { id, is_required } of stale) {
    await supabase.from("packing_items").update({ is_required }).eq("id", id);
  }

  // Only insert items not already present by name
  const missing = gearItems.filter((g) => !existingByName.has(g.name));
  if (missing.length === 0) return;

  const isScout = member.role === "scout" || member.role === "crew_leader";

  // Read current gear list from DB so admin edits take effect for future seeds.
  // (admin client already fetched above)
  const rows = missing.map((g, idx) => {
    let weightOz = Number(g.weight_oz) || 0;
    let isNotPacking = g.default_is_not_packing ?? false;

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
      is_required: g.required === "Required" ? true : g.required === "Optional" ? false : null,
      is_worn: g.default_is_worn ?? false,
      is_consumable: g.default_is_consumable ?? false,
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
