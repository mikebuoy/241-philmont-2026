import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { Panel } from "@/components/primitives/Panel";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { SubNav } from "@/components/nav/SubNav";
import { CREW_SUB } from "@/components/nav/navItems";
import { DUTY_ROLES, PATROL_METHOD_NOTE } from "@/data/duty";
import { CREW_ROLES } from "@/data/trek";
import { RANGER_RELEASE_CHECKLIST } from "@/data/incamp";

export const metadata: Metadata = { title: "Duty Roster" };

export default function DutyPage() {
  return (
    <Page eyebrow="Crew" title="Duty Roster" meta="What each crew member does and when">
      <SubNav items={CREW_SUB} />

      <Box variant="info">
        <strong>Assignments locked at the May 16 shakedown.</strong>{" "}
        Interactive rotation grid — who cooks which meal, who hangs the bear
        bag which night — comes with sign-in in P2.
      </Box>

      <Section num="01" title="The Patrol Method">
        <Panel>
          <p className="text-[12px] text-ink-muted leading-relaxed">
            {PATROL_METHOD_NOTE}
          </p>
        </Panel>
      </Section>

      <Section num="02" title="Crew roles">
        <div className="space-y-2">
          {CREW_ROLES.map((role) => (
            <div
              key={role.id}
              className="bg-surface border border-border rounded-md p-4"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <h3 className="text-[13px] font-semibold">{role.name}</h3>
                <StatusBadge tone={role.type === "fixed" ? "crew" : "info"}>
                  {role.type === "fixed" ? "Youth" : "Advisor"}
                </StatusBadge>
              </div>
              <p className="text-[12px] text-ink-muted leading-relaxed">
                {role.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section num="03" title="Duty types">
        <div className="space-y-2">
          {DUTY_ROLES.map((d) => (
            <div
              key={d.id}
              className="bg-surface border border-border rounded-md p-4"
              style={{ borderWidth: "0.5px" }}
            >
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <h3 className="text-[13px] font-semibold">{d.name}</h3>
                <StatusBadge tone={d.tone}>{d.cadence}</StatusBadge>
              </div>
              <p className="text-[12px] text-ink-muted leading-relaxed">
                {d.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section num="04" title="Rotation principle">
        <Box variant="ok">
          <strong>By Trail Day 3, every scout has run every role.</strong>{" "}
          Cook, clean up, fill water, navigate, hang the bear bag. The crew
          isn&apos;t dependent on one person knowing the system.
        </Box>
      </Section>

      <Section num="05" title="Ranger release standard">
        <p className="text-[12px] text-ink-muted mb-3">
          The Philmont Ranger stays with the crew through Trail Day 3. Before
          leaving, they verify the crew can operate independently. This is the
          checklist.
        </p>
        <Panel>
          <ul className="space-y-1.5">
            {RANGER_RELEASE_CHECKLIST.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[12px]">
                <span className="text-ok-text mt-0.5 shrink-0">▸</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Box variant="warn">
          <strong>If the crew isn&apos;t ready, the Ranger doesn&apos;t leave.</strong>{" "}
          The standard isn&apos;t a formality — it&apos;s the crew demonstrating they can
          keep themselves safe without a guide.
        </Box>
      </Section>
    </Page>
  );
}
