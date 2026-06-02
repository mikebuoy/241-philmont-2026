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
import { createClient } from "@/lib/supabase/server";
import {
  saveMyBodyWeight,
  saveMyActualBaseWeight,
  saveUsesPhilmontTent,
} from "./actions";

export const metadata: Metadata = {
  title: "Pack Weight Calculator",
  openGraph: { images: [{ url: "/pack/calculator/opengraph-image.png" }] },
  twitter: { card: "summary_large_image" },
};


export default async function CalculatorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const me = await getMyCrewMember();
  const isPublic = !user;
  return (
    <Page
      eyebrow="My Pack"
      title="Pack Weight Calculator"
      meta="Crew goal 20% · Crew standard 25% · Hard ceiling 30%"
    >
      <SubNav items={PACK_SUB} />

      <PackWeightCalculator
        initialBodyWeight={me?.bodyWeightLbs ?? null}
        initialActualBaseWeight={me?.actualBaseWeightLbs ?? null}
        initialUsesPhilmontTent={me?.usesPhilmontTent ?? null}
        onBodyWeightChange={isPublic ? undefined : saveMyBodyWeight}
        onActualBaseWeightChange={isPublic ? undefined : saveMyActualBaseWeight}
        onUsesPhilmontTentChange={isPublic ? undefined : saveUsesPhilmontTent}
        isPublic={isPublic}
      />

      <Box variant="warn">
        <strong>Gear assignment may need to be uneven.</strong> Lighter crew
        members may need to carry less shared crew gear so their Estimated Max
        Pack Weight stays under their Absolute Max. Heavier crew members pick up the
        slack — they have margin. See{" "}
        <Link
          href="/reference/gear"
          className="underline underline-offset-2 hover:text-ink"
        >
          Reference › Gear › Assignment guide
        </Link>{" "}
        for the body-weight tiers.
      </Box>

      <Section num="01" title="Participant guidelines" id="guidelines">
        <div
          className="bg-surface border border-border rounded-md overflow-hidden"
          style={{ borderWidth: "0.5px" }}
        >
          {/* Mobile: stacked cards */}
          <div className="sm:hidden divide-y divide-border">
            {[
              { label: "Strong, fit adult or older youth", target: "25%", max: "30%" },
              { label: "Average youth or adult", target: "20–25%", max: "30%" },
              { label: "Smaller youth", target: "20–25%", max: "25% preferred" },
            ].map((row) => (
              <div key={row.label} className="px-3 py-2.5">
                <p className="text-[12px] text-ink mb-1.5">{row.label}</p>
                <div className="flex gap-5 text-[11px]">
                  <span><span className="text-ink-muted">Target: </span><span className="font-mono">{row.target}</span></span>
                  <span><span className="text-ink-muted">Max: </span><span className="font-mono">{row.max}</span></span>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <table className="hidden sm:table w-full text-[11px]">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">Participant</th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">Recommended target</th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">Do not exceed</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-2 py-1.5">Strong, fit adult or older youth</td>
                <td className="px-2 py-1.5 font-mono text-right">25% body weight</td>
                <td className="px-2 py-1.5 font-mono text-right">30% body weight</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-2 py-1.5">Average youth or adult</td>
                <td className="px-2 py-1.5 font-mono text-right">20–25% body weight</td>
                <td className="px-2 py-1.5 font-mono text-right">30% body weight</td>
              </tr>
              <tr className="border-b border-border last:border-0">
                <td className="px-2 py-1.5">Smaller youth</td>
                <td className="px-2 py-1.5 font-mono text-right">20–25% body weight</td>
                <td className="px-2 py-1.5 font-mono text-right">25% preferred</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Box variant="info">
          <strong>Why 20% and not Philmont&apos;s 25–30%? </strong> The crew goal
          is 20% so we get an experience, not a survival march. 25% is the crew
          standard — above that you&apos;re carrying too much. 30% is Philmont&apos;s
          hard ceiling — no exceptions.
        </Box>
      </Section>

      <Section num="02" title="Planning rules" id="planning">
        <div
          className="bg-surface border border-border rounded-md overflow-hidden"
          style={{ borderWidth: "0.5px" }}
        >
          <table className="w-full text-[11px]">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5 w-2/5">Planning rule</th>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.04em] text-ink-muted px-2 py-1.5">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-2 py-1.5 font-medium align-top">Crew standard</td>
                <td className="px-2 py-1.5 text-ink-muted">25% or less after Trail Load is added</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-2 py-1.5 font-medium align-top">Smaller or underweight youth</td>
                <td className="px-2 py-1.5 text-ink-muted">20–25% body weight</td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-2 py-1.5 font-medium align-top">Absolute ceiling</td>
                <td className="px-2 py-1.5 text-ink-muted">30% body weight</td>
              </tr>
              <tr className="border-b border-border last:border-0">
                <td className="px-2 py-1.5 font-medium align-top">Coaching note</td>
                <td className="px-2 py-1.5 text-ink-muted">Treat 30% as the maximum, not the goal</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section num="04" title="Body weight reference · 100–200 lbs" id="weight-ref">
        <div
          className="bg-surface border border-border rounded-md overflow-hidden"
          style={{ borderWidth: "0.5px" }}
        >
          {/* Mobile: card per weight row */}
          <div className="sm:hidden divide-y divide-border">
            {PACK_WEIGHT_TABLE.map((r) => (
              <div key={r.bodyWeight} className="px-3 py-2.5">
                <p className="font-mono font-semibold text-[13px] mb-1.5">{r.bodyWeight} lb</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wide text-ink-muted mb-0.5">20% Goal</p>
                    <p className="font-mono text-[12px]">{r.target20.toFixed(0)} lb</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wide text-ink-muted mb-0.5">30% Max</p>
                    <p className="font-mono text-[12px]">{r.hardMax30.toFixed(0)} lb</p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wide text-ink-muted mb-0.5">Target Base</p>
                    <p className="font-mono text-[12px]">≤{r.targetBase.toFixed(1)} lb</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: full table */}
          <table className="hidden sm:table w-full text-[11px] min-w-[540px]">
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
                <tr key={r.bodyWeight} className="border-b border-border last:border-0">
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
          Reference Target Base values use a fixed {PACK_WEIGHT_CONSTANTS.gearAndFoodLbs} lb Trail Load estimate. The live calculator above adjusts Trail Load based on whether you are using a Philmont tent.
        </p>
      </Section>
    </Page>
  );
}
