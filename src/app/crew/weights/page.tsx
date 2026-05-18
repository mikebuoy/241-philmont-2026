import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { SubNav } from "@/components/nav/SubNav";
import { CREW_SUB } from "@/components/nav/navItems";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { getAllCrewMembers } from "@/lib/crew";
import { getAllPackingItems, computeTotals } from "@/lib/packing";
import { computeTargets, PACK_WEIGHT_CONSTANTS } from "@/data/packWeights";

export const metadata: Metadata = { title: "Crew Pack Weights" };
export const dynamic = "force-dynamic";

const GF = PACK_WEIGHT_CONSTANTS.gearAndFoodLbs;

function fmt(n: number, d = 1) {
  return n.toFixed(d);
}

type WeightStatus = "ok" | "warn" | "over" | "critical";

function getStatus(totalLbs: number, bw: number): WeightStatus {
  const targets = computeTargets(bw);
  if (!targets) return "critical";
  if (totalLbs <= targets.target20) return "ok";
  if (totalLbs <= targets.max25) return "warn";
  if (totalLbs <= targets.hardMax30) return "over";
  return "critical";
}

export default async function CrewWeightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/signin?next=/crew/weights");

  const [members, allItems] = await Promise.all([
    getAllCrewMembers(),
    getAllPackingItems(),
  ]);

  // Group packing items by crew_member_id for O(1) lookup
  const itemsByMember = new Map<string, typeof allItems>();
  for (const item of allItems) {
    const list = itemsByMember.get(item.crewMemberId) ?? [];
    list.push(item);
    itemsByMember.set(item.crewMemberId, list);
  }

  const rows = members.map((m) => {
    const bw = m.bodyWeightLbs;
    const targets = bw ? computeTargets(bw) : null;

    const actualBase = m.actualBaseWeightLbs;
    const targetMax = actualBase != null ? actualBase + GF : null;

    const memberItems = itemsByMember.get(m.id) ?? [];
    const hasItems = memberItems.length > 0;
    const totals = hasItems ? computeTotals(memberItems) : null;
    const calcBase = totals ? totals.baseOz / 16 : null;
    const calcMax = calcBase != null ? calcBase + GF : null;

    // Prefer calc max (actual items) for status; fall back to target max
    const statusWeight = calcMax ?? targetMax;
    const status: WeightStatus | null =
      statusWeight != null && bw ? getStatus(statusWeight, bw) : null;

    return { m, bw, targets, actualBase, targetMax, calcBase, calcMax, status };
  });

  const entered = rows.filter((r) => r.bw != null).length;
  const onTarget = rows.filter((r) => r.status === "ok").length;

  return (
    <Page
      eyebrow="My Crew"
      title="Pack Weight Readiness"
      meta={`${entered} of ${members.length} body weights entered · ${onTarget} on target`}
    >
      <SubNav items={CREW_SUB} />

      <Section num="01" title="Weight summary">
        <p className="text-[11px] text-ink-muted mb-2">All weights in lbs.</p>
        <div
          className="bg-surface border border-border rounded-md overflow-hidden overflow-x-auto print:overflow-visible"
          style={{ borderWidth: "0.5px" }}
        >
          <table className="w-full text-[11px] min-w-[680px]">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2.5 py-1.5 leading-tight">Name</th>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2.5 py-1.5 leading-tight">Status</th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2.5 py-1.5 leading-tight">Body<br/>WT</th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2.5 py-1.5 leading-tight">Actual<br/>Base</th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2.5 py-1.5 leading-tight">Target<br/>Base</th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2.5 py-1.5 leading-tight">Calc<br/>Base</th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2.5 py-1.5 leading-tight">Target<br/>Max</th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2.5 py-1.5 leading-tight">Calc<br/>Max</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ m, bw, targets, actualBase, targetMax, calcBase, calcMax, status }) => (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="px-2.5 py-2 font-medium">{m.name}</td>
                  <td className="px-2.5 py-2">
                    {status === "ok" && <StatusBadge tone="ok">ON TARGET</StatusBadge>}
                    {status === "warn" && <StatusBadge tone="warn">ABOVE TARGET</StatusBadge>}
                    {status === "over" && <StatusBadge tone="over">OVER 25%</StatusBadge>}
                    {status === "critical" && <StatusBadge tone="critical">OVER MAX</StatusBadge>}
                    {status === null && <span className="text-ink-faint font-mono text-[10px]">—</span>}
                  </td>
                  <td className="px-2.5 py-2 font-mono text-right">
                    {bw != null ? bw : <span className="text-ink-faint">—</span>}
                  </td>
                  <td className="px-2.5 py-2 font-mono text-right">
                    {actualBase != null ? fmt(actualBase) : <span className="text-ink-faint">—</span>}
                  </td>
                  <td className="px-2.5 py-2 font-mono text-right">
                    {targets ? `≤ ${fmt(targets.targetBase)}` : <span className="text-ink-faint">—</span>}
                  </td>
                  <td className="px-2.5 py-2 font-mono text-right">
                    {calcBase != null ? fmt(calcBase) : <span className="text-ink-faint">—</span>}
                  </td>
                  <td className="px-2.5 py-2 font-mono text-right">
                    {targetMax != null ? fmt(targetMax) : <span className="text-ink-faint">—</span>}
                  </td>
                  <td className="px-2.5 py-2 font-mono text-right">
                    {calcMax != null ? fmt(calcMax) : <span className="text-ink-faint">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section num="02" title="Column guide">
        <div
          className="bg-surface border border-border rounded-md overflow-hidden overflow-x-auto"
          style={{ borderWidth: "0.5px" }}
        >
          <table className="w-full text-[11px] min-w-[400px]">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2.5 py-2">Column</th>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2.5 py-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Body WT", "Entered on Estimator or My Gear page"],
                ["Actual Base", "Base weight entered on the Estimator page"],
                ["Target Base", "20% of body weight minus 14.7 lb gear & food constant"],
                ["Calc Base", "Live sum of My Gear packing list (excludes worn & not-packing)"],
                ["Target Max", "Actual Base + 14.7 lb gear & food estimate"],
                ["Calc Max", "Calc Base + 14.7 lb gear & food estimate"],
                ["Status", "Based on Calc Max if available, otherwise Target Max vs. body weight thresholds"],
              ].map(([col, desc]) => (
                <tr key={col} className="border-b border-border last:border-0">
                  <td className="px-2.5 py-1.5 font-mono font-medium whitespace-nowrap">{col}</td>
                  <td className="px-2.5 py-1.5 text-ink-muted">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  );
}
