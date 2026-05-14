import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { SubNav } from "@/components/nav/SubNav";
import { CREW_SUB } from "@/components/nav/navItems";
import { DUTY_ROLES } from "@/data/duty";

export const metadata: Metadata = { title: "Duty Roster" };

export default function DutyPage() {
  return (
    <Page eyebrow="My Crew" title="Duty Roster" meta="What each crew member does and when">
      <SubNav items={CREW_SUB} />

      <Box variant="info">
        <strong>Assignments locked at the May 16 shakedown.</strong>{" "}
        Interactive rotation grid — who cooks which meal, who hangs the bear
        bag which night — comes with sign-in in P2.
      </Box>

      <Section num="01" title="Duty types">
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

      <Section num="02" title="Rotation principle">
        <Box variant="ok">
          <strong>By Trail Day 3, every scout has run every role.</strong>{" "}
          Cook, clean up, fill water, navigate, hang the bear bag. The crew
          isn't dependent on one person knowing the system.
        </Box>
      </Section>
    </Page>
  );
}
