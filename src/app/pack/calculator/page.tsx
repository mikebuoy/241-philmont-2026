import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { SubNav } from "@/components/nav/SubNav";
import { PACK_SUB } from "@/components/nav/navItems";
import { PackWeightCalculator } from "@/components/PackWeightCalculator";
import { PACK_WEIGHT_TABLE, PACK_WEIGHT_CONSTANTS } from "@/data/packWeights";

export const metadata: Metadata = { title: "Pack Weight Calculator" };

const SHADE_CELL: Record<string, string> = {
  ok: "bg-cell-ok text-cell-ok-text",
  warn: "bg-cell-warn text-cell-warn-text",
  danger: "bg-cell-danger text-cell-danger-text",
};

export default function CalculatorPage() {
  return (
    <Page
      eyebrow="My Pack"
      title="Pack Weight Calculator"
      meta="Crew target 20% · Hard ceiling 25%"
    >
      <SubNav items={PACK_SUB} />

      <PackWeightCalculator />

      <Box variant="info">
        <strong>Why 20% and not Philmont's 25–30%?</strong> The crew target is
        20% so we get an experience, not a survival march. 25% is the hard
        ceiling — above that, you must cut weight before departure.
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

      <Section num="01" title="Reference table · 110–220 lbs">
        <div
          className="bg-surface border border-border rounded-md overflow-hidden overflow-x-auto"
          style={{ borderWidth: "0.5px" }}
        >
          <table className="w-full text-[11px] min-w-[560px]">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">
                  Body wt
                </th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">
                  Target Max
                </th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">
                  Abs Max
                </th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">
                  Target Base
                </th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">
                  Max Base
                </th>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {PACK_WEIGHT_TABLE.map((r) => (
                <tr
                  key={r.bodyWeight}
                  className={`border-b border-border last:border-0 ${SHADE_CELL[r.shade]}`}
                >
                  <td className="px-2 py-1.5 font-mono font-semibold">
                    {r.bodyWeight}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-right">
                    {r.target20.toFixed(1)}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-right">
                    {r.max25.toFixed(1)}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-right">
                    ≤{r.targetBase.toFixed(1)}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-right">
                    {r.maxBase.toFixed(1)}
                  </td>
                  <td className="px-2 py-1.5 text-[10px] leading-tight">
                    {r.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-ink-faint mt-2">
          Shading: green = good margin · yellow = tight · red = very tight or
          impossible. Target Base / Max Base exclude{" "}
          {PACK_WEIGHT_CONSTANTS.gearAndFoodLbs - PACK_WEIGHT_CONSTANTS.shelterLbs} lbs of Day-1 Gear &amp; Food
          (food, water, crew gear). Shelter is tracked in your packing list.
        </p>
      </Section>
    </Page>
  );
}
