import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Panel } from "@/components/primitives/Panel";
import { SubNav } from "@/components/nav/SubNav";
import { CREW_SUB } from "@/components/nav/navItems";
import { CREWS, ROLE_LABEL, type CrewRole } from "@/data/roster";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { getAllCrewMembers } from "@/lib/crew";
import { EditPageButton } from "@/components/admin/EditPageButton";
import { computeTargets, PACK_WEIGHT_CONSTANTS } from "@/data/packWeights";

const GF = PACK_WEIGHT_CONSTANTS.gearAndFoodLbs;

const WEIGHT_COLORS = {
  ok:       { bg: "#d4edda", text: "#155724" },
  warn:     { bg: "#fff3cd", text: "#856404" },
  over:     { bg: "#f8d7da", text: "#721c24" },
  critical: { bg: "#dc3545", text: "#ffffff" },
} as const;

type WeightInfo = { bodyWeightLbs: number | null; actualBaseWeightLbs: number | null };

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
  const weightByName = new Map<string, WeightInfo>();
  try {
    const members = await getAllCrewMembers();
    claimedNames = new Set(members.filter((m) => m.userId).map((m) => m.name));
    for (const m of members) {
      weightByName.set(m.name, {
        bodyWeightLbs: m.bodyWeightLbs,
        actualBaseWeightLbs: m.actualBaseWeightLbs,
      });
    }
  } catch {
    // Public visitors who can't read the table see no indicators — fine
  }
  const claimedCount = claimedNames.size;

  return (
    <Page
      eyebrow="My Crew"
      title="Crew Roster"
      meta={`Two sister crews · 22 members · ${claimedCount} signed in`}
      action={<EditPageButton href="/admin/roster" label="Manage claims" />}
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
                  <div>
                    <div className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.08em] mb-1.5">
                      Scouts ({(cl ? 1 : 0) + scouts.length})
                    </div>
                    <ul className="space-y-1">
                      {cl && (
                        <RosterRow
                          key={cl.name}
                          name={cl.name}
                          role={cl.role}
                          claimed={claimedNames.has(cl.name)}
                          weight={weightByName.get(cl.name)}
                        />
                      )}
                      {scouts.map((m) => (
                        <RosterRow
                          key={m.name}
                          name={m.name}
                          role={m.role}
                          claimed={claimedNames.has(m.name)}
                          weight={weightByName.get(m.name)}
                        />
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.08em] mb-1.5">
                      Advisors ({(la ? 1 : 0) + advisors.length})
                    </div>
                    <ul className="space-y-1">
                      {la && (
                        <RosterRow
                          key={la.name}
                          name={la.name}
                          role={la.role}
                          claimed={claimedNames.has(la.name)}
                          weight={weightByName.get(la.name)}
                        />
                      )}
                      {advisors.map((m) => (
                        <RosterRow
                          key={m.name}
                          name={m.name}
                          role={m.role}
                          claimed={claimedNames.has(m.name)}
                          weight={weightByName.get(m.name)}
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

function PackWeightBadge({ weight }: { weight: WeightInfo | undefined }) {
  const bw = weight?.bodyWeightLbs;
  const base = weight?.actualBaseWeightLbs;

  if (base == null || bw == null) {
    return (
      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-ink-faint">
        TBD
      </span>
    );
  }

  const estMax = base + GF;
  const targets = computeTargets(bw);
  let zone: keyof typeof WEIGHT_COLORS = "critical";
  if (targets) {
    if (estMax <= targets.target20) zone = "ok";
    else if (estMax <= targets.max25) zone = "warn";
    else if (estMax <= targets.hardMax30) zone = "over";
  }
  const { bg, text } = WEIGHT_COLORS[zone];
  return (
    <span
      className="font-mono text-[10px] px-1.5 py-0.5 rounded"
      style={{ backgroundColor: bg, color: text }}
    >
      {estMax.toFixed(1)}
    </span>
  );
}

function RosterRow({
  name,
  role,
  claimed,
  weight,
}: {
  name: string;
  role: CrewRole;
  claimed: boolean;
  weight?: WeightInfo;
}) {
  return (
    <li className="flex items-center justify-between gap-2 text-[12px]">
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
      <span className="flex items-center gap-1.5 shrink-0">
        <PackWeightBadge weight={weight} />
        <StatusBadge tone={ROLE_TONE[role]}>{ROLE_LABEL[role]}</StatusBadge>
      </span>
    </li>
  );
}
