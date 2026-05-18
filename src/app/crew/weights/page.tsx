import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { SubNav } from "@/components/nav/SubNav";
import { CREW_SUB } from "@/components/nav/navItems";
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

const STATUS_COLORS: Record<WeightStatus, { bg: string; text: string }> = {
  ok:       { bg: "#d4edda", text: "#155724" },
  warn:     { bg: "#fff3cd", text: "#856404" },
  over:     { bg: "#f8d7da", text: "#721c24" },
  critical: { bg: "#dc3545", text: "#ffffff" },
};

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
    const totals = memberItems.length > 0 ? computeTotals(memberItems) : null;
    const calcBase = totals ? totals.baseOz / 16 : null;
    const calcMax = calcBase != null ? calcBase + GF : null;

    const statusWeight = calcMax ?? targetMax;
    const status: WeightStatus | null =
      statusWeight != null && bw ? getStatus(statusWeight, bw) : null;

    return { m, bw, targets, actualBase, targetMax, calcBase, calcMax, status };
  });

  const entered = rows.filter((r) => r.bw != null).length;
  const onTarget = rows.filter((r) => r.status === "ok").length;

  const dash = <span className="text-ink-faint">—</span>;

  return (
    <Page
      eyebrow="My Crew"
      title="Pack Weight Readiness"
      meta={`${entered} of ${members.length} body weights entered · ${onTarget} on target`}
    >
      <SubNav items={CREW_SUB} />

      <Section num="01" title="Weight summary">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
          {([
            ["#d4edda", "#155724", "On target (≤20%)"],
            ["#fff3cd", "#856404", "Above goal (20–25%)"],
            ["#f8d7da", "#721c24", "Over 25% standard"],
            ["#dc3545", "#ffffff", "Over 30% hard max"],
          ] as const).map(([bg, text, label]) => (
            <span key={label} className="flex items-center gap-1.5 text-[11px]">
              <span className="inline-block w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: bg }} />
              <span style={{ color: text === "#ffffff" ? "#721c24" : text }}>{label}</span>
            </span>
          ))}
        </div>
        <p className="text-[11px] text-ink-muted mb-2">All weights in lbs.</p>

        {/* ── DESKTOP TABLE (md+) ── */}
        <div
          className="hidden md:block bg-surface border border-border rounded-md overflow-hidden"
          style={{ borderWidth: "0.5px" }}
        >
          <table className="w-full text-[11px]">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                {[
                  ["Name",             "text-left"],
                  ["Body\nWT",         "text-right"],
                  ["Actual\nBase",     "text-right"],
                  ["Target\nBase–Max", "text-right"],
                  ["Calc\nBase",       "text-right"],
                  ["Target\nMax",      "text-right"],
                  ["Calc\nMax",        "text-right"],
                ].map(([label, align]) => (
                  <th
                    key={label}
                    className={`${align} font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2.5 py-1.5 leading-tight whitespace-pre-line`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ m, bw, targets, actualBase, targetMax, calcBase, calcMax, status }, i) => (
                <tr key={m.id} className={`border-b border-border last:border-0 ${i % 2 === 1 ? "bg-surface-2" : "bg-surface"}`}>
                  <td
                    className="px-2.5 py-2 font-medium"
                    style={status ? { backgroundColor: STATUS_COLORS[status].bg, color: STATUS_COLORS[status].text } : undefined}
                  >
                    {m.name}
                  </td>
                  <td className="px-2.5 py-2 font-mono text-right">{bw != null ? bw : dash}</td>
                  <td className="px-2.5 py-2 font-mono text-right">
                    {actualBase != null ? fmt(actualBase) : dash}
                  </td>
                  <td className="px-2.5 py-2 font-mono text-right">
                    {targets
                      ? `${fmt(targets.targetBase)} – ${fmt(targets.maxBase)}`
                      : dash}
                  </td>
                  <td className="px-2.5 py-2 font-mono text-right">
                    {calcBase != null ? fmt(calcBase) : dash}
                  </td>
                  <td className="px-2.5 py-2 font-mono text-right">
                    {targetMax != null ? fmt(targetMax) : dash}
                  </td>
                  <td className="px-2.5 py-2 font-mono text-right">
                    {calcMax != null ? fmt(calcMax) : dash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── MOBILE CARDS (< md) ── */}
        <div className="md:hidden space-y-2">
          {rows.map(({ m, bw, targets, actualBase, targetMax, calcBase, calcMax, status }, i) => (
            <div
              key={m.id}
              className={`border border-border rounded-lg p-3 ${i % 2 === 1 ? "bg-surface-2" : "bg-surface"}`}
              style={{ borderWidth: "0.5px" }}
            >
              <div
                className="font-medium text-[13px] px-2 py-1 rounded mb-2 -mx-1"
                style={status ? { backgroundColor: STATUS_COLORS[status].bg, color: STATUS_COLORS[status].text } : undefined}
              >
                {m.name}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Body WT</span>
                  <span>{bw != null ? bw : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Actual Base</span>
                  <span>{actualBase != null ? fmt(actualBase) : "—"}</span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-ink-muted">Target Base–Max</span>
                  <span>
                    {targets ? `${fmt(targets.targetBase)} – ${fmt(targets.maxBase)}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Calc Base</span>
                  <span>{calcBase != null ? fmt(calcBase) : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Calc Max</span>
                  <span>{calcMax != null ? fmt(calcMax) : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Target Max</span>
                  <span>{targetMax != null ? fmt(targetMax) : "—"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section num="02" title="Column guide">
        <div
          className="bg-surface border border-border rounded-md overflow-hidden"
          style={{ borderWidth: "0.5px" }}
        >
          <table className="w-full text-[11px]">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2.5 py-2">Column</th>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2.5 py-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {([
                ["Body WT",        "Entered on Estimator or My Gear page"],
                ["Actual Base",    "Base weight entered on the Estimator page"],
                ["Target Base–Max","Acceptable base weight range: 20% goal to 25% crew max (both minus 14.7 lb gear & food)"],
                ["Calc Base",      "Live sum of My Gear packing list (excludes worn & not-packing)"],
                ["Target Max",     "Actual Base + 14.7 lb gear & food estimate"],
                ["Calc Max",       "Calc Base + 14.7 lb gear & food estimate"],
                ["Name color",     "Green = on target · Amber = above 20% goal · Pink = over 25% · Red = over 30% hard max"],
              ] as const).map(([col, desc]) => (
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
