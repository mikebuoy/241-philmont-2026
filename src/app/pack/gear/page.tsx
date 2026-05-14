import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { SubNav } from "@/components/nav/SubNav";
import { PACK_SUB } from "@/components/nav/navItems";
import { Panel } from "@/components/primitives/Panel";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { CORE_ITEMS, CORE_CATEGORIES, CATEGORY_NOTES } from "@/data/coreItems";

export const metadata: Metadata = { title: "Gear List" };

export default function GearListPage() {
  const totalRequired = CORE_ITEMS.filter((i) => i.required === "Required").length;
  const totalOptional = CORE_ITEMS.filter((i) => i.required === "Optional").length;

  return (
    <Page
      eyebrow="My Pack"
      title="Gear List"
      meta={`${CORE_ITEMS.length} core items · ${CORE_CATEGORIES.length} categories`}
    >
      <SubNav items={PACK_SUB} />

      <Box variant="info">
        <strong>Interactive packing list coming in P2.</strong> This will become
        a LighterPack-style tool: track your own list, mark items packed, see
        live weight totals against your body weight target, and share status
        with the crew. Sign-in required for P2. The list below is the source of
        truth for what to bring.
      </Box>

      <Section num="00" title="At a glance">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Total" value={CORE_ITEMS.length} />
          <Stat label="Required" value={totalRequired} />
          <Stat label="Optional" value={totalOptional} />
        </div>
      </Section>

      {CORE_CATEGORIES.map((cat, i) => {
        const items = CORE_ITEMS.filter((it) => it.category === cat);
        const note = CATEGORY_NOTES.find((n) => n.category === cat);
        return (
          <Section
            key={cat}
            num={String(i + 1).padStart(2, "0")}
            title={cat}
          >
            {note && (
              <Box variant="warn">
                <strong>Note.</strong> {note.note}
              </Box>
            )}
            <Panel>
              <ul className="divide-y divide-border">
                {items.map((it) => (
                  <li
                    key={`${it.category}-${it.item}`}
                    className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0 text-[12px]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-ink">{it.item}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-[11px] text-ink-muted">
                        {it.qty}
                      </span>
                      {it.required === "Required" ? (
                        <StatusBadge tone="crew">Required</StatusBadge>
                      ) : it.required === "Optional" ? (
                        <StatusBadge tone="neutral">Optional</StatusBadge>
                      ) : (
                        <StatusBadge tone="info">Note</StatusBadge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          </Section>
        );
      })}
    </Page>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="bg-surface border border-border rounded-md py-3"
      style={{ borderWidth: "0.5px" }}
    >
      <div className="font-mono text-[22px] font-semibold leading-none">
        {value}
      </div>
      <div className="text-[10px] text-ink-muted uppercase tracking-[0.05em] mt-1">
        {label}
      </div>
    </div>
  );
}
