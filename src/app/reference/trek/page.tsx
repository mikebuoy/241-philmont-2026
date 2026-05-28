import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { Panel } from "@/components/primitives/Panel";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { SubNav } from "@/components/nav/SubNav";
import { REFERENCE_SUB } from "@/components/nav/navItems";
import {
  BIG_PICTURE,
  CREW_ROLES,
  CREW_DEVELOPMENT_PHASES,
  ARROWHEAD_REQUIREMENTS,
  MEDICAL_STANDARDS,
  TRADING_POSTS,
  TREK_LOGISTICS,
} from "@/data/trek";

export const metadata: Metadata = { title: "Trek Overview" };

export default function TrekPage() {
  return (
    <Page
      eyebrow="Reference"
      title="Trek"
      meta="Crew · Arrowhead · Logistics"
    >
      <SubNav items={REFERENCE_SUB} />

      <Section num="01" title="The big picture">
        <Box variant="info">
          <strong>{BIG_PICTURE.headline}</strong>
        </Box>
        <Panel title="Crew code">
          <ul className="space-y-1.5">
            {BIG_PICTURE.crewCode.map((line) => (
              <li key={line} className="flex items-start gap-2 text-[12px]">
                <span className="text-ok-text mt-0.5 shrink-0">▸</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>

      <Section num="02" title="Crew roles">
        <p className="text-[12px] text-ink-muted">
          Fixed roles assigned before the trek. They do not rotate.
        </p>
        <div className="space-y-2">
          {CREW_ROLES.map((r) => (
            <div
              key={r.id}
              className="bg-surface border border-border rounded-md p-4"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <h3 className="text-[13px] font-semibold">{r.name}</h3>
                <StatusBadge tone={r.type === "advisory" ? "neutral" : "info"}>
                  {r.type === "advisory" ? "Advisor" : "Youth"}
                </StatusBadge>
              </div>
              <p className="text-[12px] text-ink-muted leading-relaxed">
                {r.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section num="03" title="Crew development">
        <Box variant="info">
          <strong>Advisor lens.</strong> These phases describe what to expect
          as the crew evolves over the trek. Approximate timing varies by crew.
        </Box>
        <div className="space-y-2">
          {CREW_DEVELOPMENT_PHASES.map((phase) => (
            <div
              key={phase.name}
              className="bg-surface border border-border rounded-md p-4"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <h3 className="text-[13px] font-semibold">{phase.name}</h3>
                <span className="font-mono text-[10px] text-ink-muted">
                  {phase.window}
                </span>
              </div>
              <p className="text-[12px] text-ink-muted leading-relaxed mb-2">
                <strong className="text-ink">Signs: </strong>{phase.signs}
              </p>
              <p className="text-[12px] text-ink-muted leading-relaxed">
                <strong className="text-ink">Focus: </strong>{phase.focus}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section num="04" title="Arrowhead award">
        <Panel>
          <ul className="space-y-1.5">
            {ARROWHEAD_REQUIREMENTS.map((req) => (
              <li key={req} className="flex items-start gap-2 text-[12px]">
                <span className="text-ok-text mt-0.5 shrink-0">▸</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Box variant="warn">
          <strong>Missing conservation = no Arrowhead.</strong> Conservation is
          Day 8 at Sioux at 2:00 PM. A late start on Day 8 puts the whole day
          at risk.
        </Box>
      </Section>

      <Section num="05" title="Medical recheck">
        <div className="grid grid-cols-2 gap-2">
          <div
            className="bg-surface border border-border rounded-md p-4"
            style={{ borderWidth: "0.5px" }}
          >
            <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-1">
              BMI limit (under 21)
            </div>
            <div className="text-[22px] font-semibold font-mono">
              {MEDICAL_STANDARDS.bmiUnder21}
            </div>
          </div>
          <div
            className="bg-surface border border-border rounded-md p-4"
            style={{ borderWidth: "0.5px" }}
          >
            <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-1">
              BMI limit (adults)
            </div>
            <div className="text-[22px] font-semibold font-mono">
              {MEDICAL_STANDARDS.bmiAdult}
            </div>
          </div>
          <div
            className="bg-surface border border-border rounded-md p-4 col-span-2"
            style={{ borderWidth: "0.5px" }}
          >
            <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-1">
              Blood pressure max
            </div>
            <div className="text-[22px] font-semibold font-mono">
              {MEDICAL_STANDARDS.bpMax}
            </div>
          </div>
        </div>
        <Box variant="warn">
          <strong>{MEDICAL_STANDARDS.note}</strong>
        </Box>
        <Panel title="Requirements">
          <ul className="space-y-1.5">
            {MEDICAL_STANDARDS.medRequirements.map((req) => (
              <li key={req} className="flex items-start gap-2 text-[12px]">
                <span className="text-warn-text mt-0.5 shrink-0">▸</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>

      <Section num="06" title="The burro">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div
            className="bg-surface border border-border rounded-md p-3"
            style={{ borderWidth: "0.5px" }}
          >
            <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-0.5">
              Pickup
            </div>
            <p className="text-[12px] font-medium">{TREK_LOGISTICS.burro.pickupDay}</p>
          </div>
          <div
            className="bg-surface border border-border rounded-md p-3"
            style={{ borderWidth: "0.5px" }}
          >
            <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.05em] mb-0.5">
              Drop-off
            </div>
            <p className="text-[12px] font-medium">{TREK_LOGISTICS.burro.dropoffDay}</p>
          </div>
        </div>
        <Panel>
          <ul className="space-y-1.5">
            {TREK_LOGISTICS.burro.notes.map((note) => (
              <li key={note} className="flex items-start gap-2 text-[12px]">
                <span className="text-ink-muted mt-0.5 shrink-0">▸</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>

      <Section num="07" title="Trading posts">
        <div className="space-y-2">
          {TRADING_POSTS.map((tp) => (
            <div
              key={tp.name}
              className="bg-surface border border-border rounded-md p-4"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h3 className="text-[13px] font-semibold">{tp.name}</h3>
                <span className="font-mono text-[10px] text-ink-muted whitespace-nowrap">
                  {tp.when}
                </span>
              </div>
              <p className="text-[12px] text-ink-muted leading-relaxed">
                {tp.notes}
              </p>
              <p className="text-[11px] font-mono text-ink-muted mt-1">
                Budget: {tp.budget}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section num="08" title="Cell service & electronics">
        <Box variant="warn">
          <strong>{TREK_LOGISTICS.cellService.summary}</strong>
        </Box>
        <Panel title="Emergency contact">
          <p className="text-[13px] font-mono font-semibold">
            {TREK_LOGISTICS.cellService.emergencyNumber}
          </p>
          <p className="text-[12px] text-ink-muted mt-1 leading-relaxed">
            {TREK_LOGISTICS.cellService.emergencyNote}
          </p>
        </Panel>
        <Panel title="Electronics">
          <p className="text-[12px] text-ink-muted leading-relaxed mb-3">
            {TREK_LOGISTICS.electronics.summary}
          </p>
          <ul className="space-y-1.5">
            {TREK_LOGISTICS.electronics.rules.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-[12px]">
                <span className="text-ink-muted mt-0.5 shrink-0">▸</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Section>
    </Page>
  );
}
