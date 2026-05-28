import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { Panel } from "@/components/primitives/Panel";
import { SubNav } from "@/components/nav/SubNav";
import { REFERENCE_SUB } from "@/components/nav/navItems";
import { STOVE_SAFETY } from "@/data/incamp";
import {
  COOK_METHOD_STEPS,
  COOK_TEAM_NOTE,
  COOK_EQUIPMENT,
} from "@/data/cooking";

export const metadata: Metadata = { title: "Cooking" };

function VideoEmbed({ id, title }: { id: string; title: string }) {
  return (
    <div
      className="relative w-full aspect-video rounded-md overflow-hidden border border-border"
      style={{ borderWidth: "0.5px" }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}

export default function CookingPage() {
  return (
    <Page
      eyebrow="Reference"
      title="Cooking"
      meta="Stove · Method · Equipment"
    >
      <SubNav items={REFERENCE_SUB} />

      <Section num="01" title="Stove safety">
        <Box variant="warn">
          <strong>Closed-toe shoes required whenever stoves are on.</strong> No exceptions.
        </Box>
        <Panel>
          <ul className="space-y-1.5">
            {STOVE_SAFETY.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-[12px]">
                <span className="text-warn-text mt-0.5 shrink-0">▸</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>

      <Section num="02" title="The cook method · 7 steps">
        <Box variant="info">
          <strong>Hybrid cook system.</strong> Fire Maple stove + Bulin HE pot for fast boil. Philmont-issued 8-qt pot for rehydration and serving. 20–40% faster boil at altitude, meaningful fuel savings.
        </Box>
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
                <p className="text-[12px] text-ink-muted leading-relaxed">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <Panel title="Cook team structure">
          <p className="text-[12px] text-ink-muted leading-relaxed">{COOK_TEAM_NOTE}</p>
        </Panel>
        <Box variant="warn">
          <strong>Every meal · every bowl · every utensil.</strong> Submerge in boiling water. Holding a few seconds in a true rolling boil is the difference between a healthy crew and a crew with norovirus on Trail Day 5.
        </Box>
        <div className="space-y-3">
          <VideoEmbed id="UA_Q1ZnJDvQ" title="Philmont Backcountry Cooking Method" />
          <VideoEmbed id="eLt8XjCG7So" title="How To Wash Dishes" />
        </div>
      </Section>

      <Section num="03" title="Cook equipment">
        <div
          className="bg-surface border border-border rounded-md overflow-hidden overflow-x-auto"
          style={{ borderWidth: "0.5px" }}
        >
          <table className="w-full text-[12px] min-w-[520px]">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                {["Item", "Type", "Weight", "Qty", "Notes"].map((h, i) => (
                  <th
                    key={h}
                    className={`font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2 ${i >= 2 && i <= 3 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COOK_EQUIPMENT.map((e) => (
                <tr key={e.item} className="border-b border-border last:border-0 align-top">
                  <td className="px-3 py-2.5 font-medium">{e.item}</td>
                  <td className="px-3 py-2.5 text-ink-muted">{e.type}</td>
                  <td className="px-3 py-2.5 font-mono text-right text-ink-muted">{e.weight}</td>
                  <td className="px-3 py-2.5 font-mono text-right">{e.qty}</td>
                  <td className="px-3 py-2.5 text-[11px] text-ink-muted">{e.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  );
}
