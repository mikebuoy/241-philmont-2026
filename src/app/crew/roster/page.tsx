import type { Metadata } from "next";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Panel } from "@/components/primitives/Panel";
import { SubNav } from "@/components/nav/SubNav";
import { CREW_SUB } from "@/components/nav/navItems";
import { ROLE_LABEL, type CrewRole } from "@/data/roster";
import { DUTY_ROLES, PATROL_METHOD_NOTE } from "@/data/duty";
import { CREW_ROLES, CREW_DEVELOPMENT_PHASES } from "@/data/trek";
import { RANGER_RELEASE_CHECKLIST } from "@/data/incamp";
import { Box } from "@/components/primitives/Box";

const ROSTER_ROLE_LABEL: Record<CrewRole, string> = { ...ROLE_LABEL, chaplain_aide: "Chap. Aid" };
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { getAllCrewMembers, type CertificationStatus } from "@/lib/crew";
import { EditPageButton } from "@/components/admin/EditPageButton";
import { PrintButton } from "@/components/primitives/PrintButton";
import { computeTargets, PACK_WEIGHT_CONSTANTS } from "@/data/packWeights";

const BASE_ADD_ON_LBS =
  PACK_WEIGHT_CONSTANTS.foodPerPersonLbs +
  PACK_WEIGHT_CONSTANTS.waterTwoLitersLbs +
  PACK_WEIGHT_CONSTANTS.crewGearAvgLbs;
const PHILMONT_TENT_LBS = PACK_WEIGHT_CONSTANTS.philmontTentOz / 16;

const WEIGHT_COLORS = {
  ok:       { bg: "#d4edda", text: "#155724" },
  warn:     { bg: "#fff3cd", text: "#856404" },
  over:     { bg: "#f8d7da", text: "#721c24" },
  critical: { bg: "#dc3545", text: "#ffffff" },
} as const;
const ROSTER_ROW_CLASS = "flex items-center gap-1.5";

type WeightInfo = {
  bodyWeightLbs: number | null;
  actualBaseWeightLbs: number | null;
  usesPhilmontTent: boolean;
  wfaCertificationStatus: CertificationStatus | null;
  cprCertificationStatus: CertificationStatus | null;
  medFormReceived: boolean;
};

export const metadata: Metadata = {
  title: "Crew Roster",
  openGraph: { images: [{ url: "/crew/roster/opengraph-image.png" }] },
  twitter: { card: "summary_large_image" },
};
export const dynamic = "force-dynamic";

const ROLE_TONE: Record<CrewRole, "issued" | "crew" | "warn" | "neutral"> = {
  crew_leader: "issued",
  chaplain_aide: "issued",
  guia: "issued",
  scout: "crew",
  lead_advisor: "warn",
  advisor: "neutral",
};

export default async function RosterPage() {
  let members: Awaited<ReturnType<typeof getAllCrewMembers>> = [];
  try {
    members = await getAllCrewMembers();
  } catch {
    // Public visitors who can't read the table see empty roster — fine
  }

  const claimedCount = members.filter((m) => m.userId).length;

  const crew1 = members.filter((m) => m.crewId === 1);
  const crew2 = members.filter((m) => m.crewId === 2);
  const crewGroups = [
    { id: 1, name: "Crew 1", members: crew1 },
    { id: 2, name: "Crew 2", members: crew2 },
  ];

  return (
    <Page
      eyebrow="My Crew"
      title="Crew Roster"
      meta={`Two sister crews · ${members.length} members · ${claimedCount} signed in`}
      action={<EditPageButton href="/admin/roster" label="Manage Crew" />}
      titleRight={<PrintButton />}
    >
      <SubNav items={CREW_SUB} />

      <Section num="01" title="The Patrol Method">
        <Panel>
          <p className="text-[12px] text-ink-muted leading-relaxed">
            {PATROL_METHOD_NOTE}
          </p>
        </Panel>
      </Section>

      <Section num="02" title="Sister crews">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {crewGroups.map((crew) => {
            const youth = crew.members.filter((m) =>
              ["crew_leader", "chaplain_aide", "guia", "scout"].includes(m.role)
            );
            const adults = crew.members.filter((m) =>
              ["lead_advisor", "advisor"].includes(m.role)
            );
            return (
              <Panel
                key={crew.id}
                title={`${crew.name} · ${crew.members.length} members`}
              >
                <div className="space-y-3">
                  {youth.length > 0 && (
                    <div>
                      <div className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.08em] mb-1.5">
                        Scouts ({youth.length})
                      </div>
                      <RosterHeader />
                      <ul className="space-y-0.5">
                        {youth.map((m) => (
                          <RosterRow
                            key={m.id}
                            name={m.name}
                            role={m.role}
                            claimed={!!m.userId}
                            weight={{
                              bodyWeightLbs: m.bodyWeightLbs,
                              actualBaseWeightLbs: m.actualBaseWeightLbs,
                              usesPhilmontTent: m.usesPhilmontTent,
                              wfaCertificationStatus: m.wfaCertificationStatus,
                              cprCertificationStatus: m.cprCertificationStatus,
                              medFormReceived: m.medFormReceived,
                            }}
                          />
                        ))}
                      </ul>
                    </div>
                  )}

                  {adults.length > 0 && (
                    <div>
                      <div className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.08em] mb-1.5">
                        Advisors ({adults.length})
                      </div>
                      <RosterHeader />
                      <ul className="space-y-0.5">
                        {adults.map((m) => (
                          <RosterRow
                            key={m.id}
                            name={m.name}
                            role={m.role}
                            claimed={!!m.userId}
                            weight={{
                              bodyWeightLbs: m.bodyWeightLbs,
                              actualBaseWeightLbs: m.actualBaseWeightLbs,
                              usesPhilmontTent: m.usesPhilmontTent,
                              wfaCertificationStatus: m.wfaCertificationStatus,
                              cprCertificationStatus: m.cprCertificationStatus,
                              medFormReceived: m.medFormReceived,
                            }}
                          />
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      </Section>

      <Section num="04" title="Crew roles">
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

      <Section num="05" title="Duty types">
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

      <Section num="06" title="Rotation principle">
        <Box variant="ok">
          <strong>By Trail Day 3, every scout has run every role.</strong>{" "}
          Cook, clean up, fill water, navigate, hang the bear bag. The crew
          isn&apos;t dependent on one person knowing the system.
        </Box>
      </Section>

      <Section num="07" title="Ranger release standard">
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

      <Section num="08" title="Crew development">
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
    </Page>
  );
}

function PackWeightBadge({ weight }: { weight: WeightInfo | undefined }) {
  const bw = weight?.bodyWeightLbs;
  const base = weight?.actualBaseWeightLbs;
  const usesPhilmontTent = weight?.usesPhilmontTent;

  const pillClass = "font-mono text-[10px] py-0.5 rounded inline-flex items-center justify-center w-12";

  if (base == null || bw == null || usesPhilmontTent == null) {
    return <span className={`${pillClass} bg-surface-2 text-ink-faint`}>TBD</span>;
  }

  const trailLoadLbs = BASE_ADD_ON_LBS + (usesPhilmontTent ? PHILMONT_TENT_LBS : 0);
  const estMax = base + trailLoadLbs;
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
      className={pillClass}
      style={{ backgroundColor: bg, color: text }}
      title={`Est Max ${estMax.toFixed(1)} lbs`}
    >
      {estMax.toFixed(1)}
    </span>
  );
}

function CertificationFlag({
  label,
  status,
}: {
  label: "WFA" | "CPR";
  status: CertificationStatus | null | undefined;
}) {
  if (!status) return null;

  const styles = {
    certified: "bg-ok-bg text-ok-text border-ok-border",
    not_certified: "bg-danger-bg text-danger-text border-danger-border",
    tbd: "bg-pink-50 text-pink-700 border-pink-200",
  } satisfies Record<CertificationStatus, string>;
  const text = status === "not_certified" ? `NO ${label}` : label;

  return (
    <span
      className={`font-mono text-[9px] py-0.5 px-1 rounded border inline-flex w-full items-center justify-center ${styles[status]}`}
      title={`${label}: ${status === "certified" ? "certified" : status === "tbd" ? "TBD" : "not certified"}`}
    >
      {text}
    </span>
  );
}

function CertificationCell({
  label,
  status,
}: {
  label: "WFA" | "CPR";
  status: CertificationStatus | null | undefined;
}) {
  return (
    <span className="min-w-0">
      <CertificationFlag label={label} status={status} />
    </span>
  );
}

function MedFormCell({ received }: { received: boolean | undefined }) {
  const styles = received
    ? "bg-ok-bg text-ok-text border-ok-border"
    : "bg-danger-bg text-danger-text border-danger-border";

  return (
    <span
      className={`font-mono text-[9px] py-0.5 px-1 rounded border inline-flex w-full items-center justify-center ${styles}`}
      title={`Medical form: ${received ? "received" : "missing"}`}
    >
      ABC
    </span>
  );
}

function RosterHeader() {
  return (
    <div
      className={`${ROSTER_ROW_CLASS} mb-1 px-2 font-mono text-[9px] uppercase tracking-[0.05em] text-ink-faint`}
    >
      <span className="w-2 shrink-0" aria-hidden="true" />
      <span className="w-[88px] shrink-0">Role</span>
      <span className="shrink-0">Name</span>
      <span className="min-w-2 flex-1" aria-hidden="true" />
      <span className="w-9 shrink-0 text-center">WFA</span>
      <span className="w-9 shrink-0 text-center">CPR</span>
      <span className="w-9 shrink-0 text-center">MED</span>
      <span className="w-12 shrink-0 text-right">Est Wgt</span>
    </div>
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
    <li
      className={`${ROSTER_ROW_CLASS} px-1 text-[12px]`}
    >
      <span className="flex w-2 shrink-0 items-center">
        <span
          className={`w-1.5 h-1.5 shrink-0 rounded-full ${claimed ? "bg-ok-text" : "bg-transparent"}`}
          title={claimed ? "Signed in" : undefined}
          aria-label={claimed ? "Signed in" : undefined}
          aria-hidden={claimed ? undefined : true}
        />
      </span>
      <StatusBadge tone={ROLE_TONE[role] ?? "neutral"} className="w-[88px] shrink-0 justify-start px-1 text-[9px]">
        {ROSTER_ROLE_LABEL[role] ?? role}
      </StatusBadge>
      <span className="flex flex-1 items-center gap-1.5 border-b border-border/40 py-1">
        <span className="shrink-0 whitespace-nowrap font-medium text-left">{name}</span>
        <span className="min-w-2 flex-1" aria-hidden="true" />
        <span className="w-9 shrink-0">
          <CertificationCell label="WFA" status={weight?.wfaCertificationStatus} />
        </span>
        <span className="w-9 shrink-0">
          <CertificationCell label="CPR" status={weight?.cprCertificationStatus} />
        </span>
        <span className="w-9 shrink-0">
          <MedFormCell received={weight?.medFormReceived} />
        </span>
        <span className="w-12 shrink-0">
          <PackWeightBadge weight={weight} />
        </span>
      </span>
    </li>
  );
}
