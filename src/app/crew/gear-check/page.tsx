import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Page } from "@/components/primitives/Page";
import { SubNav } from "@/components/nav/SubNav";
import { CREW_SUB } from "@/components/nav/navItems";
import { createClient } from "@/lib/supabase/server";
import { getAllCrewMembers, ROLE_ORDER, type CrewMember } from "@/lib/crew";
import { getAllPackingItems, computeTotals } from "@/lib/packing";
import { getGearCategories } from "@/lib/gear";
import { isCurrentUserAdmin } from "@/lib/supabase/admin";
import { computeTargets, PACK_WEIGHT_CONSTANTS } from "@/data/packWeights";
import type { CrewRole } from "@/data/roster";
import { GearCheckGrid, type CellData, type CrewGrid, type GridRow } from "./GearCheckGrid";
import { PrintButton } from "@/components/primitives/PrintButton";

export const metadata: Metadata = { title: "Gear Check" };
export const dynamic = "force-dynamic";

const BASE_TRAIL_LOAD_LBS =
  PACK_WEIGHT_CONSTANTS.foodPerPersonLbs +
  PACK_WEIGHT_CONSTANTS.waterTwoLitersLbs +
  PACK_WEIGHT_CONSTANTS.crewGearAvgLbs;
const PHILMONT_TENT_OZ = PACK_WEIGHT_CONSTANTS.philmontTentOz;


export default async function GearCheckPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/signin?next=/crew/gear-check");

  const [members, allItems, categories, isAdmin] = await Promise.all([
    getAllCrewMembers(),
    getAllPackingItems(),
    getGearCategories(),
    isCurrentUserAdmin(),
  ]);

  // Build per-member item lookup — two maps:
  // coreItemMap: for grid display (core items only)
  // allItemsMap: for weight calculation (all items)
  const memberCoreMap = new Map<string, Map<string, (typeof allItems)[0]>>();
  const memberAllMap = new Map<string, (typeof allItems)[0][]>();
  for (const item of allItems) {
    if (!memberAllMap.has(item.crewMemberId)) memberAllMap.set(item.crewMemberId, []);
    memberAllMap.get(item.crewMemberId)!.push(item);
    if (!item.isCore) continue;
    if (!memberCoreMap.has(item.crewMemberId)) memberCoreMap.set(item.crewMemberId, new Map());
    memberCoreMap.get(item.crewMemberId)!.set(`${item.category}||${item.name}`, item);
  }

  function getMemberWeight(member: CrewMember): {
    estMaxLbs: number | null;
    weightStatus: "ok" | "warn" | "over" | "critical" | null;
  } {
    const bw = member.bodyWeightLbs;
    const targets = bw ? computeTargets(bw) : null;
    const memberItems = memberAllMap.get(member.id) ?? [];
    const baseOz = computeTotals(memberItems).baseOz;
    const baseLbs = member.useActualBaseWeight
      ? (member.actualBaseWeightLbs ?? 0)
      : baseOz / 16;
    const shelterLbs =
      member.useActualBaseWeight && member.usesPhilmontTent ? PHILMONT_TENT_OZ / 16 : 0;
    const estMax = baseLbs + BASE_TRAIL_LOAD_LBS + shelterLbs;
    if (!targets || !bw || baseLbs <= 0) return { estMaxLbs: null, weightStatus: null };
    let weightStatus: "ok" | "warn" | "over" | "critical";
    if (estMax <= targets.target20) weightStatus = "ok";
    else if (estMax <= targets.max25) weightStatus = "warn";
    else if (estMax <= targets.hardMax30) weightStatus = "over";
    else weightStatus = "critical";
    return { estMaxLbs: estMax, weightStatus };
  }

  // Collect distinct rows — exclude Note items (isRequired === null)
  const categoryOrderMap = new Map(categories.map((c, i) => [c.name, i]));
  const rowMap = new Map<string, GridRow & { catOrder: number; itemOrder: number }>();
  for (const item of allItems) {
    if (!item.isCore) continue;
    if (item.isRequired === null) continue; // skip Note-type rows
    const key = `${item.category}||${item.name}`;
    if (!rowMap.has(key)) {
      rowMap.set(key, {
        category: item.category,
        itemName: item.name,
        isRequired: item.isRequired,
        catOrder: categoryOrderMap.get(item.category) ?? 999,
        itemOrder: item.sortOrder,
      });
    }
  }
  const rows: GridRow[] = Array.from(rowMap.values())
    .sort((a, b) => a.catOrder - b.catOrder || a.itemOrder - b.itemOrder)
    .map(({ category, itemName, isRequired }) => ({ category, itemName, isRequired }));

  // Build one CrewGrid per crew, members sorted by role then name
  const grids: CrewGrid[] = ([1, 2] as const).map((crewId) => {
    const crewMembers = members
      .filter((m) => m.crewId === crewId)
      .sort(
        (a, b) =>
          ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.name.localeCompare(b.name),
      )
      .map((m) => {
        const { estMaxLbs, weightStatus } = getMemberWeight(m);
        return { id: m.id, name: m.name, role: m.role, estMaxLbs, weightStatus };
      });

    const cells: Record<string, Record<string, CellData | null>> = {};
    for (const row of rows) {
      const rk = `${row.category}||${row.itemName}`;
      cells[rk] = {};
      for (const member of crewMembers) {
        const item = memberCoreMap.get(member.id)?.get(rk);
        cells[rk][member.id] = item
          ? {
              itemId: item.id,
              isPacked: item.isPacked,
              isNotPacking: item.isNotPacking,
              advisorNote: item.advisorNote,
            }
          : null;
      }
    }

    return { crewId, members: crewMembers, rows, cells };
  });

  const totalFlagged = grids.reduce((sum, g) => {
    for (const rowCells of Object.values(g.cells)) {
      for (const cell of Object.values(rowCells)) {
        if (cell?.advisorNote) sum++;
      }
    }
    return sum;
  }, 0);

  return (
    <Page
      eyebrow="My Crew"
      title="Gear Check"
      meta={`${members.length} members · ${totalFlagged} item${totalFlagged !== 1 ? "s" : ""} flagged`}
      titleRight={<PrintButton />}
    >
      <div className="print:hidden">
        <SubNav items={CREW_SUB} />
      </div>
      <GearCheckGrid grids={grids} isAdmin={isAdmin} />
    </Page>
  );
}
