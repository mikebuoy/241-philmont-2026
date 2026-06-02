import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { SubNav } from "@/components/nav/SubNav";
import { CREW_SUB } from "@/components/nav/navItems";
import { createClient } from "@/lib/supabase/server";
import { getAllCrewMembers } from "@/lib/crew";
import { getAllPackingItems, computeTotals } from "@/lib/packing";
import { computeTargets, PACK_WEIGHT_CONSTANTS } from "@/data/packWeights";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { PrintButton } from "@/components/primitives/PrintButton";
import { SignInSheetClient } from "@/components/SignInSheetClient";

export const metadata: Metadata = {
  title: "Crew Pack Weights",
  openGraph: { images: [{ url: "/crew/weights/opengraph-image.png" }] },
  twitter: { card: "summary_large_image" },
};
export const dynamic = "force-dynamic";

const BASE_ADD_ON_LBS =
  PACK_WEIGHT_CONSTANTS.foodPerPersonLbs +
  PACK_WEIGHT_CONSTANTS.waterTwoLitersLbs +
  PACK_WEIGHT_CONSTANTS.crewGearAvgLbs;
const PHILMONT_TENT_LBS = PACK_WEIGHT_CONSTANTS.philmontTentOz / 16;

function fmt(n: number, d = 1) {
  return n.toFixed(d);
}

type WeightStatus = "ok" | "warn" | "over" | "critical";

const STATUS_COLORS = {
  ok:       { bg: "#d4edda", text: "#155724", border: "#b8ddb8" },
  warn:     { bg: "#fff3cd", text: "#856404", border: "#f0d090" },
  over:     { bg: "#f8d7da", text: "#721c24", border: "#f0b8b8" },
  critical: { bg: "#dc3545", text: "#ffffff", border: "#b02a37" },
} as const;

function formatLbsOz(decimalLbs: number): string {
  const abs = Math.abs(decimalLbs);
  let whole = Math.floor(abs);
  let oz = Math.round((abs - whole) * 16);
  if (oz === 16) {
    whole += 1;
    oz = 0;
  }
  const lbsLabel = whole === 1 ? "lb" : "lbs";
  return `${whole} ${lbsLabel} ${oz} oz`;
}

function getReadiness({
  bodyWeight,
  baseWeight,
  usesPhilmontTent,
}: {
  bodyWeight: number | null;
  baseWeight: number | null;
  usesPhilmontTent: boolean;
}) {
  const targets = bodyWeight ? computeTargets(bodyWeight) : null;
  if (!targets || bodyWeight == null || baseWeight == null || baseWeight <= 0) return null;

  const shelterTrailLoadLbs = usesPhilmontTent ? PHILMONT_TENT_LBS : 0;
  const trailLoadLbs = BASE_ADD_ON_LBS + shelterTrailLoadLbs;
  const totalDay1 = baseWeight + trailLoadLbs;
  const pctOfBody = (totalDay1 / bodyWeight) * 100;

  let status: WeightStatus;
  if (totalDay1 <= targets.target20) status = "ok";
  else if (totalDay1 <= targets.max25) status = "warn";
  else if (totalDay1 <= targets.hardMax30) status = "over";
  else status = "critical";

  const deltaTarget = totalDay1 - targets.target20;
  const deltaLines: string[] = [];
  if (totalDay1 > targets.hardMax30) {
    deltaLines.push(`Cut ${formatLbsOz(totalDay1 - targets.hardMax30)} to hit 30% hard max`);
    deltaLines.push(`Cut ${formatLbsOz(deltaTarget)} to hit 20% target`);
  } else if (totalDay1 > targets.max25) {
    deltaLines.push(`Cut ${formatLbsOz(totalDay1 - targets.max25)} to hit 25% crew standard`);
    deltaLines.push(`${formatLbsOz(targets.hardMax30 - totalDay1)} under 30% hard max`);
  } else if (deltaTarget > 0) {
    deltaLines.push(`Cut ${formatLbsOz(deltaTarget)} to hit 20% target`);
    deltaLines.push(`${formatLbsOz(targets.max25 - totalDay1)} under 25% crew standard`);
  } else if (deltaTarget < -0.05) {
    deltaLines.push(`${formatLbsOz(-deltaTarget)} under 20% target`);
  } else {
    deltaLines.push("At 20% target");
  }

  return { targets, status, baseWeight, trailLoadLbs, totalDay1, pctOfBody, deltaLines };
}

function PackProgress({
  readiness,
  sourceLabel,
}: {
  readiness: ReturnType<typeof getReadiness>;
  sourceLabel: string;
}) {
  if (!readiness) {
    return (
      <div className="rounded-md border border-border bg-surface-2 px-3 py-2 text-[11px] text-ink-muted" style={{ borderWidth: "0.5px" }}>
        Need body weight and Base Pack Weight.
      </div>
    );
  }

  const okPct = (20 / 30) * 100;
  const warnEdgePct = (25 / 30) * 100;
  const markerPct = Math.min(100, Math.max(0, (readiness.totalDay1 / readiness.targets.hardMax30) * 100));
  const basePct = Math.min(100, Math.max(0, (readiness.baseWeight / readiness.targets.hardMax30) * 100));
  const isCritical = readiness.status === "critical";

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-mono text-[10px] text-ink-muted">
          {sourceLabel} Base {fmt(readiness.baseWeight)} + Trail Load {fmt(readiness.trailLoadLbs)}
        </div>
        <div className="font-mono text-[11px] font-semibold text-ink whitespace-nowrap">
          {fmt(readiness.totalDay1)} lbs · {fmt(readiness.pctOfBody, 1)}%
        </div>
      </div>
      <div className="relative h-3 font-mono text-[9px] font-semibold text-ink-muted leading-none">
        <span className="absolute" style={{ left: `${okPct}%`, transform: "translateX(-50%)" }}>20%</span>
        <span className="absolute" style={{ left: `${warnEdgePct}%`, transform: "translateX(-50%)" }}>25%</span>
        <span className="absolute right-0">30%</span>
      </div>
      <div className="relative pt-2.5">
        <div className="absolute top-0 z-20" style={{ left: `${markerPct}%`, transform: "translateX(-50%)" }}>
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: `8px solid ${isCritical ? STATUS_COLORS.critical.bg : "var(--color-ink)"}`,
              filter: isCritical ? "none" : "drop-shadow(0 0 1px white)",
            }}
          />
        </div>
        <div className="relative flex h-[24px] rounded-md overflow-hidden border border-border" style={{ borderWidth: "0.5px" }}>
          <div style={{ width: `${okPct}%`, backgroundColor: STATUS_COLORS.ok.bg }} />
          <div style={{ width: `${warnEdgePct - okPct}%`, backgroundColor: STATUS_COLORS.warn.bg }} />
          <div style={{ width: `${100 - warnEdgePct}%`, backgroundColor: STATUS_COLORS.over.bg }} />
          <div
            className="absolute left-0 top-0 bottom-0"
            style={{
              width: `${basePct}%`,
              backgroundColor: "rgba(30, 106, 145, 0.35)",
              borderRight: "2px solid #1e6a91",
            }}
          />
          {markerPct > basePct && (
            <div
              className="absolute top-0 bottom-0"
              style={{
                left: `${basePct}%`,
                width: `${markerPct - basePct}%`,
                backgroundColor: "rgba(30, 106, 145, 0.1)",
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(30, 106, 145, 0.5) 0, rgba(30, 106, 145, 0.5) 2px, transparent 2px, transparent 7px)",
              }}
            />
          )}
          <div
            className="absolute top-0 bottom-0 z-10 pointer-events-none"
            style={{
              left: `${markerPct}%`,
              width: "2px",
              transform: "translateX(-50%)",
              backgroundColor: isCritical ? STATUS_COLORS.critical.bg : "var(--color-ink)",
            }}
          />
          <div className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[11px] font-bold whitespace-nowrap pointer-events-none" style={{ color: "#0d3d5a" }}>
            Base: {fmt(readiness.baseWeight)}
          </div>
        </div>
      </div>
      <div className="space-y-0.5">
        {readiness.deltaLines.map((line) => (
          <div key={line} className="font-mono text-[11px] font-semibold text-ink">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

type RowData = {
  m: Awaited<ReturnType<typeof getAllCrewMembers>>[number];
  bw: number | null;
  status: NonNullable<ReturnType<typeof getReadiness>>["status"] | null;
  readiness: ReturnType<typeof getReadiness>;
  sourceLabel: string;
};

function WeightSummarySection({
  crews,
  rowsByCrew,
}: {
  crews: readonly (1 | 2)[];
  rowsByCrew: (crewId: 1 | 2) => RowData[];
}) {
  const dash = <span className="text-ink-faint">—</span>;
  return (
    <Section num="01" title="Weight summary" id="summary">
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

      {/* ── DESKTOP TABLES (md+) ── */}
      <div className="hidden md:block space-y-4">
        {crews.map((crewId) => (
          <div key={crewId}>
            <p className="font-mono text-[14px] uppercase tracking-[0.08em] text-ink-muted font-semibold mb-1.5">
              Crew {crewId}
            </p>
            <div
              className="bg-surface border border-border rounded-md overflow-hidden"
              style={{ borderWidth: "0.5px" }}
            >
              <table className="w-full text-[11px]">
                <thead className="bg-surface-2 border-b border-border">
                  <tr>
                    {[
                      ["Name",          "text-left"],
                      ["Body\nWeight",  "text-left"],
                      ["Pack Progress", "text-left"],
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
                  {rowsByCrew(crewId).map(({ m, bw, status, readiness, sourceLabel }, i) => (
                    <tr key={m.id} className={`border-b border-border last:border-0 ${i % 2 === 1 ? "bg-surface" : "bg-surface"}`}>
                      <td className="px-2.5 py-3 align-top w-[170px]">
                        {status
                          ? <StatusBadge tone={status}>{m.name}</StatusBadge>
                          : <span className="font-medium text-[11px]">{m.name}</span>}
                      </td>
                      <td className="px-2.5 py-3 font-mono text-right align-top w-[90px]">{bw != null ? bw : dash}</td>
                      <td className="px-2.5 py-3">
                        <PackProgress readiness={readiness} sourceLabel={sourceLabel} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* ── MOBILE CARDS (< md) ── */}
      <div className="md:hidden space-y-4">
        {crews.map((crewId) => (
          <div key={crewId}>
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted font-semibold mb-2">
              Crew {crewId}
            </p>
            <div className="space-y-2">
              {rowsByCrew(crewId).map(({ m, bw, status, readiness, sourceLabel }, i) => (
                <div
                  key={m.id}
                  className={`border border-border rounded-lg p-3 ${i % 2 === 1 ? "bg-surface" : "bg-surface"}`}
                  style={{ borderWidth: "0.5px" }}
                >
                  <div className="mb-2">
                    {status
                      ? <StatusBadge tone={status}>{m.name}</StatusBadge>
                      : <span className="font-medium text-[13px]">{m.name}</span>}  <span>{bw != null ? bw : "—"} lbs</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px]">
                    <div/>
                    <div className="col-span-2 pt-2">
                      <PackProgress readiness={readiness} sourceLabel={sourceLabel} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default async function CrewWeightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ── PUBLIC BRANCH ──────────────────────────────────────────────
  if (!user) {
    let members: Awaited<ReturnType<typeof getAllCrewMembers>> = [];
    try { members = await getAllCrewMembers(); } catch { /* RLS may block for public visitors */ }

    const rows: RowData[] = members.map((m) => ({
      m,
      bw: null,
      status: null,
      readiness: null,
      sourceLabel: "Calculated",
    }));
    const crews = [1, 2] as const;
    const rowsByCrew = (crewId: 1 | 2) => rows.filter((r) => r.m.crewId === crewId);

    return (
      <Page eyebrow="My Crew" title="Pack Weight Readiness" titleRight={<PrintButton />}>
        <SubNav items={CREW_SUB} />
        <SignInSheetClient
          nextUrl="/crew/weights"
          heading="Sign in to see your crew's pack weights."
          body="Body weights, pack progress, and weight targets are personal data. Sign in to see the full picture."
        />
        <WeightSummarySection crews={crews} rowsByCrew={rowsByCrew} />
      </Page>
    );
  }

  // ── AUTHENTICATED BRANCH ────────────────────────────────────────
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

  const rows: RowData[] = members.map((m) => {
    const bw = m.bodyWeightLbs;
    const actualBase = m.actualBaseWeightLbs;
    const memberItems = itemsByMember.get(m.id) ?? [];
    const totals = memberItems.length > 0 ? computeTotals(memberItems) : null;
    const calcBase = totals ? totals.baseOz / 16 : null;
    const useActual = m.useActualBaseWeight && actualBase != null;
    const activeBase = useActual ? actualBase : calcBase;
    const sourceLabel = useActual ? "Actual" : "Calculated";
    const readiness = getReadiness({
      bodyWeight: bw,
      baseWeight: activeBase,
      usesPhilmontTent: m.usesPhilmontTent,
    });
    const status = readiness?.status ?? null;

    return { m, bw, status, readiness, sourceLabel };
  });

  const entered = rows.filter((r) => r.bw != null).length;
  const onTarget = rows.filter((r) => r.status === "ok").length;

  const crews = [1, 2] as const;
  const rowsByCrew = (crewId: 1 | 2) => rows.filter((r) => r.m.crewId === crewId);

  return (
    <Page
      eyebrow="My Crew"
      title="Pack Weight Readiness"
      meta={`${entered} of ${members.length} body weights entered · ${onTarget} on target`}
      titleRight={<PrintButton />}
    >
      <SubNav items={CREW_SUB} />
      <WeightSummarySection crews={crews} rowsByCrew={rowsByCrew} />

      <Section num="02" title="Column guide" id="columns">
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
                ["Body Weight",   "Entered on Estimator or My Packing List page"],
                ["Pack Progress", "Uses Base Pack Weight from the scale when that mode is enabled; otherwise uses live My Packing List calculated Base Pack Weight"],
                ["Trail Load",    "Food, water, crew gear, and Philmont tent when the crew member is using one"],
                ["Delta line",    "Shows the same cut or margin guidance used by the pack calculator"],
                ["Name color",    "Green text = on target · Yellow = above 20% goal · Red = over 25% · Warning = over 30% hard max"],
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
