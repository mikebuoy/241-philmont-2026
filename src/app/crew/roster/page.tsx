import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Panel } from "@/components/primitives/Panel";
import { SubNav } from "@/components/nav/SubNav";
import { CREW_SUB } from "@/components/nav/navItems";
import { CREWS, ROLE_LABEL, type CrewRole } from "@/data/roster";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { getAllCrewMembers } from "@/lib/crew";

export const metadata: Metadata = { title: "Crew Roster" };
export const dynamic = "force-dynamic";

const ROLE_TONE: Record<CrewRole, "issued" | "crew" | "warn" | "neutral"> = {
  crew_leader: "issued",
  lead_advisor: "warn",
  advisor: "neutral",
  scout: "crew",
};

export default async function RosterPage() {
  // Fetch claim status from Supabase (best-effort — if it fails, render
  // the static roster without claim indicators)
  let claimedNames = new Set<string>();
  try {
    const members = await getAllCrewMembers();
    claimedNames = new Set(
      members.filter((m) => m.userId).map((m) => m.name),
    );
  } catch {
    // Public visitors who can't read the table see no indicators — fine
  }
  const claimedCount = claimedNames.size;

  return (
    <Page
      eyebrow="My Crew"
      title="Crew Roster"
      meta={`Two sister crews · 22 members · ${claimedCount} signed in`}
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
              <Panel
                key={crew.id}
                title={`${crew.name} · ${crew.members.length} members`}
              >
                <div className="space-y-3">
                  {cl && (
                    <div>
                      <div className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.08em] mb-1.5">
                        Crew Leader (youth-led)
                      </div>
                      <RosterRow
                        name={cl.name}
                        role={cl.role}
                        claimed={claimedNames.has(cl.name)}
                      />
                    </div>
                  )}

                  <div>
                    <div className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.08em] mb-1.5">
                      Scouts ({scouts.length})
                    </div>
                    <ul className="space-y-1">
                      {scouts.map((m) => (
                        <RosterRow
                          key={m.name}
                          name={m.name}
                          role={m.role}
                          claimed={claimedNames.has(m.name)}
                        />
                      ))}
                    </ul>
                  </div>

                  {la && (
                    <div>
                      <div className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.08em] mb-1.5">
                        Lead Advisor
                      </div>
                      <RosterRow
                        name={la.name}
                        role={la.role}
                        claimed={claimedNames.has(la.name)}
                      />
                    </div>
                  )}

                  <div>
                    <div className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.08em] mb-1.5">
                      Advisors ({advisors.length})
                    </div>
                    <ul className="space-y-1">
                      {advisors.map((m) => (
                        <RosterRow
                          key={m.name}
                          name={m.name}
                          role={m.role}
                          claimed={claimedNames.has(m.name)}
                        />
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
            <strong className="text-ink">Crew Leader</strong> is a youth
            scout. They lead the crew.{" "}
            <strong className="text-ink">Lead Advisor</strong> is the adult
            responsible for the crew. Advisors advise — they do not lead.
            Day-to-day guidance flows through the Crew Leader.
          </p>
        </Panel>
      </Section>
    </Page>
  );
}

function RosterRow({
  name,
  role,
  claimed,
}: {
  name: string;
  role: CrewRole;
  claimed: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-3 text-[12px]">
      <span className="flex items-center gap-1.5 min-w-0">
        {claimed && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-ok-text shrink-0"
            title="Signed in"
            aria-label="Signed in"
          />
        )}
        <span className="font-medium truncate">{name}</span>
      </span>
      <StatusBadge tone={ROLE_TONE[role]}>{ROLE_LABEL[role]}</StatusBadge>
    </li>
  );
}
