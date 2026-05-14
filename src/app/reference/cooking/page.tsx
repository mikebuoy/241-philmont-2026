import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { Panel } from "@/components/primitives/Panel";
import { SubNav } from "@/components/nav/SubNav";
import { REFERENCE_SUB } from "@/components/nav/navItems";
import {
  COOK_EQUIPMENT,
  COOK_METHOD_STEPS,
  COOK_TEAM_NOTE,
} from "@/data/cooking";

export const metadata: Metadata = { title: "Cooking" };

export default function CookingPage() {
  return (
    <Page
      eyebrow="Reference"
      title="Cooking"
      meta="Hybrid HE pot + issued pot · sterilize · sump"
    >
      <SubNav items={REFERENCE_SUB} />

      <Box variant="info">
        <strong>Hybrid cook system.</strong> Fire Maple stove + Bulin HE pot
        for fast boil. Philmont-issued 8-qt pot for rehydration and serving.
        20–40% faster boil at altitude, meaningful fuel savings.
      </Box>

      <Section num="01" title="Equipment">
        <div
          className="bg-surface border border-border rounded-md overflow-hidden overflow-x-auto"
          style={{ borderWidth: "0.5px" }}
        >
          <table className="w-full text-[12px] min-w-[600px]">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2">
                  Item
                </th>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2">
                  Type
                </th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2">
                  Weight
                </th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2">
                  Qty
                </th>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {COOK_EQUIPMENT.map((e) => (
                <tr
                  key={e.item}
                  className="border-b border-border last:border-0 align-top"
                >
                  <td className="px-3 py-2.5 font-medium">{e.item}</td>
                  <td className="px-3 py-2.5 text-ink-muted">{e.type}</td>
                  <td className="px-3 py-2.5 font-mono text-right text-ink-muted">
                    {e.weight}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-right">{e.qty}</td>
                  <td className="px-3 py-2.5 text-[11px] text-ink-muted">
                    {e.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section num="02" title="The cook method · 7 steps">
        <ol className="space-y-2">
          {COOK_METHOD_STEPS.map((s) => (
            <li
              key={s.n}
              className="bg-surface border border-border rounded-md p-4 flex items-start gap-3"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="font-mono text-[12px] font-semibold bg-ink text-bg w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                {s.n}
              </div>
              <div>
                <h3 className="text-[13px] font-semibold mb-0.5">{s.title}</h3>
                <p className="text-[12px] text-ink-muted leading-relaxed">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section num="03" title="Cook team structure">
        <Panel>
          <p className="text-[12px] text-ink-muted leading-relaxed">
            {COOK_TEAM_NOTE}
          </p>
        </Panel>
      </Section>

      <Section num="04" title="Sterilization is non-negotiable">
        <Box variant="warn">
          <strong>Every meal · every bowl · every utensil.</strong> Submerge in
          boiling water. Holding a few seconds in a true rolling boil is the
          difference between a healthy crew and a crew with norovirus on Trail
          Day 5. Philmont staff have seen what happens when crews skip this.
        </Box>
      </Section>
    </Page>
  );
}
