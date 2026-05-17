import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { SubNav } from "@/components/nav/SubNav";
import { PACK_SUB } from "@/components/nav/navItems";
import { PackWeightCalculator } from "@/components/PackWeightCalculator";
import { PACK_WEIGHT_TABLE, PACK_WEIGHT_CONSTANTS } from "@/data/packWeights";
import { getMyCrewMember } from "@/lib/crew";
import { saveMyBodyWeight } from "./actions";

export const metadata: Metadata = { title: "Pack Weight Calculator" };

const SHADE_CELL: Record<string, string> = {
  ok: "bg-cell-ok text-cell-ok-text",
  warn: "bg-cell-warn text-cell-warn-text",
  danger: "bg-cell-danger text-cell-danger-text",
  over: "bg-cell-over text-cell-over-text",
  critical: "bg-cell-critical text-cell-critical-text",
};

export default async function CalculatorPage() {
  const me = await getMyCrewMember();
  return (
    <Page
      eyebrow="My Pack"
      title="Pack Weight Calculator"
      meta="Crew goal 20% · Crew standard 25% · Hard ceiling 30%"
    >
      <SubNav items={PACK_SUB} />

      <PackWeightCalculator
        initialBodyWeight={me?.bodyWeightLbs}
        onBodyWeightChange={saveMyBodyWeight}
      />

      <Box variant="info">
        <strong>Why 20% and not Philmont&apos;s 25–30%?</strong> The crew goal
        is 20% so we get an experience, not a survival march. 25% is the crew
        standard — above that you&apos;re carrying too much. 30% is Philmont&apos;s
        hard ceiling — no exceptions.
      </Box>

      <Box variant="warn">
        <strong>Gear assignment may need to be uneven.</strong> Lighter crew
        members may need to carry less shared crew gear so their Day-1 total
        stays under their Absolute Max. Heavier crew members pick up the
        slack — they have margin. See{" "}
        <Link
          href="/reference/gear"
          className="underline underline-offset-2 hover:text-ink"
        >
          Reference › Gear › Assignment guide
        </Link>{" "}
        for the body-weight tiers.
      </Box>

      <Section num="01" title="Body weight reference · 100–200 lbs">
        <div
          className="bg-surface border border-border rounded-md overflow-hidden overflow-x-auto"
          style={{ borderWidth: "0.5px" }}
        >
          <table className="w-full text-[11px] min-w-[540px]">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">Body wt</th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">20% Target</th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">25% Standard</th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">30% Hard Max</th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">Target Base</th>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">Note</th>
              </tr>
            </thead>
            <tbody>
              {PACK_WEIGHT_TABLE.map((r) => (
                <tr key={r.bodyWeight} className={`border-b border-border last:border-0 ${SHADE_CELL[r.shade]}`}>
                  <td className="px-2 py-1.5 font-mono font-semibold">{r.bodyWeight} lb</td>
                  <td className="px-2 py-1.5 font-mono text-right">{r.target20.toFixed(0)} lb</td>
                  <td className="px-2 py-1.5 font-mono text-right">{r.max25.toFixed(1)} lb</td>
                  <td className="px-2 py-1.5 font-mono text-right">{r.hardMax30.toFixed(0)} lb</td>
                  <td className="px-2 py-1.5 font-mono text-right">≤{r.targetBase.toFixed(1)} lb</td>
                  <td className="px-2 py-1.5 text-[10px] leading-tight">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-ink-faint mt-2">
          Target Base excludes {PACK_WEIGHT_CONSTANTS.gearAndFoodLbs} lbs of estimated Day-1 Gear &amp; Food (food, water, tent, crew gear). Use My Gear for exact weights.
        </p>
      </Section>

      <Section num="02" title="Participant guidelines">
        <div
          className="bg-surface border border-border rounded-md overflow-hidden overflow-x-auto"
          style={{ borderWidth: "0.5px" }}
        >
          <table className="w-full text-[11px] min-w-[400px]">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">Participant</th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">Recommended target</th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">Do not exceed</th>
              </tr>
            </thead>
            <tbody className="text-[11px]">
              <tr className="border-b border-border bg-cell-ok text-cell-ok-text">
                <td className="px-2 py-1.5">Strong, fit adult or older youth</td>
                <td className="px-2 py-1.5 font-mono text-right">25% body weight</td>
                <td className="px-2 py-1.5 font-mono text-right">30% body weight</td>
              </tr>
              <tr className="border-b border-border bg-cell-warn text-cell-warn-text">
                <td className="px-2 py-1.5">Average youth or adult</td>
                <td className="px-2 py-1.5 font-mono text-right">20–25% body weight</td>
                <td className="px-2 py-1.5 font-mono text-right">30% body weight</td>
              </tr>
              <tr className="border-b border-border last:border-0 bg-cell-danger text-cell-danger-text">
                <td className="px-2 py-1.5">Smaller or underweight youth</td>
                <td className="px-2 py-1.5 font-mono text-right">20–25% body weight</td>
                <td className="px-2 py-1.5 font-mono text-right">25% preferred</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section num="03" title="Planning rules">
        <div
          className="bg-surface border border-border rounded-md overflow-hidden overflow-x-auto"
          style={{ borderWidth: "0.5px" }}
        >
          <table className="w-full text-[11px] min-w-[360px]">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">Planning rule</th>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-2 py-1.5 font-medium">Crew standard</td>
                <td className="px-2 py-1.5 text-ink-muted">25% or less after food, water, and crew gear are added</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-2 py-1.5 font-medium">Smaller or underweight youth</td>
                <td className="px-2 py-1.5 text-ink-muted">20–25% body weight</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-2 py-1.5 font-medium">Absolute ceiling</td>
                <td className="px-2 py-1.5 text-ink-muted">30% body weight</td>
              </tr>
              <tr className="border-b border-border last:border-0">
                <td className="px-2 py-1.5 font-medium">Coaching note</td>
                <td className="px-2 py-1.5 text-ink-muted">Treat 30% as the maximum, not the goal</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  );
}
