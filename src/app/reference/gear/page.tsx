import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { Panel } from "@/components/primitives/Panel";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { SubNav } from "@/components/nav/SubNav";
import { REFERENCE_SUB } from "@/components/nav/navItems";
import {
  ISSUED_GEAR,
  CREW_SUPPLIED_GEAR,
  SHELTER_BY_ROLE,
  HEAVIEST_ITEMS,
  type GearItem,
} from "@/data/gear";
import { GEAR_ASSIGNMENT } from "@/data/packWeights";

export const metadata: Metadata = { title: "Gear" };

export default function ReferenceGearPage() {
  return (
    <Page
      eyebrow="Reference"
      title="Gear"
      meta="Issued · Crew-supplied · Shelter · Assignment"
    >
      <SubNav items={REFERENCE_SUB} />

      <Box variant="info">
        <strong>This is the shared/crew gear reference.</strong> Personal
        items live on <em>My Pack › Gear List</em>. Weights confirmed against
        the Philmont 2024 Guidebook to Adventure unless noted otherwise.
      </Box>

      <Section num="01" title="Philmont-issued crew gear">
        <GearTable items={ISSUED_GEAR} tone="issued" />
      </Section>

      <Section num="02" title="Crew-supplied shared gear">
        <GearTable items={CREW_SUPPLIED_GEAR} tone="crew" />
      </Section>

      <Section num="03" title="Shelter by role">
        <div
          className="bg-surface border border-border rounded-md overflow-hidden"
          style={{ borderWidth: "0.5px" }}
        >
          <table className="w-full text-[12px]">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <Th>Role</Th>
                <Th>Setup</Th>
                <Th align="right">Weight</Th>
                <Th>Carries</Th>
              </tr>
            </thead>
            <tbody>
              {SHELTER_BY_ROLE.map((r) => (
                <tr
                  key={r.role}
                  className="border-b border-border last:border-0 align-top"
                >
                  <td className="px-3 py-2.5 font-medium">{r.role}</td>
                  <td className="px-3 py-2.5 text-ink-muted">{r.setup}</td>
                  <td className="px-3 py-2.5 font-mono text-right">{r.weight}</td>
                  <td className="px-3 py-2.5 text-ink-muted text-[11px]">
                    {r.carries ?? r.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section num="04" title="Assignment guide by body weight">
        <p className="text-[12px] text-ink-muted">
          Crew gear is distributed unevenly by design. Heavier carriers take
          heavier items on the highest-load days. Lighter carriers pick up more
          as food weight drops.
        </p>
        <div className="space-y-2">
          {GEAR_ASSIGNMENT.map((tier) => (
            <Panel key={tier.bodyWeightLabel} title={tier.bodyWeightLabel}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                <StatusBadge tone="info">{tier.eligibility}</StatusBadge>
              </div>
              {tier.eligible.length > 0 && (
                <div className="mb-2">
                  <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-1">
                    Eligible
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tier.eligible.map((e) => (
                      <StatusBadge key={e} tone="ok">
                        {e}
                      </StatusBadge>
                    ))}
                  </div>
                </div>
              )}
              {tier.excluded.length > 0 && (
                <div className="mb-2">
                  <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-1">
                    Excluded
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tier.excluded.map((e) => (
                      <StatusBadge key={e} tone="danger">
                        {e}
                      </StatusBadge>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[11px] text-ink-muted">{tier.notes}</p>
            </Panel>
          ))}
        </div>
      </Section>

      <Section num="05" title="Heaviest single items">
        <div
          className="bg-surface border border-border rounded-md overflow-hidden"
          style={{ borderWidth: "0.5px" }}
        >
          <table className="w-full text-[12px]">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <Th>Item</Th>
                <Th align="right">Weight</Th>
                <Th>Assign to</Th>
              </tr>
            </thead>
            <tbody>
              {HEAVIEST_ITEMS.map((h) => (
                <tr
                  key={h.item}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-3 py-2.5 font-medium">{h.item}</td>
                  <td className="px-3 py-2.5 font-mono text-right">
                    {h.weight}
                  </td>
                  <td className="px-3 py-2.5 text-ink-muted">{h.assignTo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  );
}

function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "right" | "left";
}) {
  return (
    <th
      className={`font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function GearTable({
  items,
  tone,
}: {
  items: GearItem[];
  tone: "issued" | "crew";
}) {
  const total = items.reduce((sum, it) => sum + it.totalOz, 0);
  return (
    <div
      className="bg-surface border border-border rounded-md overflow-hidden"
      style={{ borderWidth: "0.5px" }}
    >
      <table className="w-full text-[12px]">
        <thead className="bg-surface-2 border-b border-border">
          <tr>
            <Th>Item</Th>
            <Th align="right">Each</Th>
            <Th align="right">Qty</Th>
            <Th align="right">Total</Th>
            <Th>Notes</Th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr
              key={it.item}
              className="border-b border-border last:border-0 align-top"
            >
              <td className="px-3 py-2.5 font-medium">{it.item}</td>
              <td className="px-3 py-2.5 font-mono text-right text-ink-muted">
                {it.weightEach}
              </td>
              <td className="px-3 py-2.5 font-mono text-right text-ink-muted">
                {it.qty}
              </td>
              <td className="px-3 py-2.5 font-mono text-right">
                {it.totalOz.toFixed(1)} oz
              </td>
              <td className="px-3 py-2.5 text-[11px] text-ink-muted">
                {it.notes}
              </td>
            </tr>
          ))}
          <tr className="bg-surface-2">
            <td className="px-3 py-2 font-semibold" colSpan={3}>
              Total ({tone === "issued" ? "issued" : "crew-supplied"})
            </td>
            <td className="px-3 py-2 font-mono text-right font-semibold">
              {(total / 16).toFixed(1)} lbs
            </td>
            <td className="px-3 py-2 text-[11px] text-ink-muted">
              ≈ {(total / 12).toFixed(1)} oz per crew member (×12)
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
