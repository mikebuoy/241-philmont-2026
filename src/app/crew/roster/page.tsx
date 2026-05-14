import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Panel } from "@/components/primitives/Panel";
import { SubNav } from "@/components/nav/SubNav";
import { CREW_SUB } from "@/components/nav/navItems";
import { CREWS, ROLE_LABEL, type CrewRole } from "@/data/roster";
import { StatusBadge } from "@/components/primitives/StatusBadge";

export const metadata: Metadata = { title: "Crew Roster" };

const ROLE_TONE: Record<CrewRole, "issued" | "crew" | "warn" | "neutral"> = {
  crew_leader: "issued",
  lead_advisor: "warn",
  advisor: "neutral",
  scout: "crew",
};

export default function RosterPage() {
  return (
    <Page
      eyebrow="My Crew"
      title="Crew Roster"
      meta="Two sister crews · 22 members · same itinerary"
    >
      <SubNav items={CREW_SUB} />

      <Section num="01" title="Sister crews">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CREWS.map((crew) => {
            const cl = crew.members.find((m) => m.role === "crew_leader");
            const la = crew.members.find((m) => m.role === "lead_advisor");
            const scouts = crew.members.filter((m) => m.role === "scout");
            const advisors = crew.members.filter((m) => m.role === "advisor");
            return (
              <Panel key={crew.id} title={`${crew.name} · ${crew.members.length} members`}>
                <div className="space-y-3">
                  {cl && (
                    <div>
                      <div className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.08em] mb-1.5">
                        Crew Leader (youth-led)
                      </div>
                      <RosterRow name={cl.name} role={cl.role} />
                    </div>
                  )}

                  <div>
                    <div className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.08em] mb-1.5">
                      Scouts ({scouts.length})
                    </div>
                    <ul className="space-y-1">
                      {scouts.map((m) => (
                        <RosterRow key={m.name} name={m.name} role={m.role} />
                      ))}
                    </ul>
                  </div>

                  {la && (
                    <div>
                      <div className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.08em] mb-1.5">
                        Lead Advisor
                      </div>
                      <RosterRow name={la.name} role={la.role} />
                    </div>
                  )}

                  <div>
                    <div className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.08em] mb-1.5">
                      Advisors ({advisors.length})
                    </div>
                    <ul className="space-y-1">
                      {advisors.map((m) => (
                        <RosterRow key={m.name} name={m.name} role={m.role} />
                      ))}
                    </ul>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      </Section>

      <Section num="02" title="On Scout-led structure">
        <Panel>
          <p className="text-[12px] text-ink-muted leading-relaxed">
            <strong className="text-ink">Crew Leader</strong> is a youth scout.
            They lead the crew. <strong className="text-ink">Lead Advisor</strong>{" "}
            is the adult responsible for the crew. Advisors advise — they do
            not lead. Day-to-day guidance flows through the Crew Leader.
          </p>
        </Panel>
      </Section>
    </Page>
  );
}

function RosterRow({ name, role }: { name: string; role: CrewRole }) {
  return (
    <li className="flex items-center justify-between gap-3 text-[12px]">
      <span className="font-medium">{name}</span>
      <StatusBadge tone={ROLE_TONE[role]}>{ROLE_LABEL[role]}</StatusBadge>
    </li>
  );
}
