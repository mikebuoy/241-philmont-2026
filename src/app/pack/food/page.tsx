import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Panel } from "@/components/primitives/Panel";
import { Box } from "@/components/primitives/Box";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { SubNav } from "@/components/nav/SubNav";
import { PACK_SUB } from "@/components/nav/navItems";
import { RESUPPLY_SCHEDULE, DRY_CAMP, WATER_SYSTEM } from "@/data/food";

export const metadata: Metadata = { title: "Food & Water" };

export default function FoodPage() {
  return (
    <Page
      eyebrow="My Pack"
      title="Food & Water"
      meta="Resupply · Dry camp · Water system"
    >
      <SubNav items={PACK_SUB} />

      <Section num="01" title="Resupply schedule">
        <p className="text-[12px] text-ink-muted">
          Three food pickups across the trek. Buddy-pair bags — 2 people share
          one food bag. 6 buddy pairs total per crew.
        </p>
        <div className="space-y-2">
          {RESUPPLY_SCHEDULE.map((r) => (
            <div
              key={r.stop}
              className="bg-surface border border-border rounded-md overflow-hidden"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="px-4 py-2.5 bg-surface-2 border-b border-border flex items-baseline justify-between gap-3">
                <div>
                  <span className="font-semibold text-[13px]">{r.stop}</span>{" "}
                  <span className="font-mono text-[11px] text-ink-muted">
                    · {r.uiDayLabel}
                  </span>
                </div>
                <StatusBadge tone="issued">{r.foodDays}</StatusBadge>
              </div>
              <div className="px-4 py-3 grid grid-cols-2 gap-3 text-[12px]">
                <div>
                  <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em]">
                    Buddy pair
                  </div>
                  <div className="font-mono text-[16px] font-semibold mt-0.5">
                    {r.buddyPairTotalLbs} lbs
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em]">
                    Per person
                  </div>
                  <div className="font-mono text-[16px] font-semibold mt-0.5">
                    {r.perPersonLbs} lbs
                  </div>
                </div>
                {r.also.length > 0 && (
                  <div className="col-span-2 pt-2 border-t border-border">
                    <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-1">
                      Also picked up
                    </div>
                    <ul className="text-[11px] text-ink-muted space-y-0.5">
                      {r.also.map((a) => (
                        <li key={a} className="flex items-start gap-1.5">
                          <span className="text-ink-faint">▸</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section num="02" title={`Dry camp · ${DRY_CAMP.camp}`}>
        <Box variant="danger">
          <strong>{DRY_CAMP.uiDayLabel} · {DRY_CAMP.date}.</strong>{" "}
          {DRY_CAMP.waterSource}.
        </Box>
        <Panel title="Protocol">
          <ol className="space-y-2">
            {DRY_CAMP.protocol.map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-[12px]">
                <span className="font-mono text-[10px] text-ink-muted bg-surface-2 border border-border-strong rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </Section>

      <Section num="03" title="Water system">
        <p className="text-[12px] text-ink-muted">
          {WATER_SYSTEM.totalFilterPaths} independent filter paths across the crew.
          Redundancy by design.
        </p>
        <Panel title="Filters">
          <ul className="divide-y divide-border">
            {WATER_SYSTEM.filters.map((f) => (
              <li
                key={f.item}
                className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0 text-[12px]"
              >
                <div className="min-w-0">
                  <div className="font-medium">{f.item}</div>
                  <div className="text-[11px] text-ink-muted">{f.notes}</div>
                </div>
                <div className="font-mono text-[11px] text-ink-muted shrink-0">
                  {f.qty} × {f.weightOz} oz
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Panel title="Daily targets">
            <ul className="space-y-1.5 text-[12px]">
              <Row label="Daily total" value={WATER_SYSTEM.dailyTargetL} />
              <Row label="Standard carry" value={WATER_SYSTEM.standardCarryL} />
              <Row label="Extended carry" value={WATER_SYSTEM.extendedCarryL} />
            </ul>
          </Panel>
          <Panel title="How to drink it">
            <ul className="space-y-1.5 text-[12px]">
              <li>
                <strong className="text-ink">Sip.</strong>{" "}
                <span className="text-ink-muted">
                  {WATER_SYSTEM.hydrationCue}
                </span>
              </li>
              <li>
                <strong className="text-ink">Electrolytes.</strong>{" "}
                <span className="text-ink-muted">
                  {WATER_SYSTEM.electrolyteGuidance}
                </span>
              </li>
              <li>
                <strong className="text-ink">Backup.</strong>{" "}
                <span className="text-ink-muted">
                  {WATER_SYSTEM.supplemental}
                </span>
              </li>
            </ul>
          </Panel>
        </div>
      </Section>
    </Page>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-baseline justify-between gap-3 text-[12px]">
      <span className="text-ink-muted">{label}</span>
      <span className="font-mono text-ink">{value}</span>
    </li>
  );
}
