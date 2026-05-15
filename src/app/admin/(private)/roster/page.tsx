import Link from "next/link";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { getAllCrewMembers } from "@/lib/crew";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROLE_LABEL, type CrewRole } from "@/data/roster";
import { unbindCrewMember, resetCrewMemberGearList } from "./actions";
import { UnbindButton } from "./UnbindButton";
import { ResetGearButton } from "./ResetGearButton";

export const dynamic = "force-dynamic";

const ROLE_TONE: Record<CrewRole, "issued" | "crew" | "warn" | "neutral"> = {
  crew_leader: "issued",
  lead_advisor: "warn",
  advisor: "neutral",
  scout: "crew",
};

export default async function AdminRosterPage() {
  const members = await getAllCrewMembers();

  // Pull emails for claimed members via the admin client
  const admin = createAdminClient();
  const userIdToEmail = new Map<string, string>();
  const claimedIds = members
    .map((m) => m.userId)
    .filter((id): id is string => !!id);
  if (claimedIds.length > 0) {
    const { data } = await admin.auth.admin.listUsers({
      perPage: 1000,
    });
    for (const u of data?.users ?? []) {
      if (u.email && claimedIds.includes(u.id)) {
        userIdToEmail.set(u.id, u.email);
      }
    }
  }

  const claimedCount = members.filter((m) => m.userId).length;
  const sorted = [...members].sort((a, b) => {
    if (a.crewId !== b.crewId) return a.crewId - b.crewId;
    return a.name.localeCompare(b.name);
  });

  return (
    <Page
      eyebrow="Admin"
      title="Roster claims"
      meta={`${claimedCount} of ${members.length} signed in`}
    >
      <Link
        href="/crew/roster"
        className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-muted hover:text-ink"
      >
        ‹ View public roster
      </Link>

      <Box variant="info">
        <strong>Unbind</strong> a crew member if they claimed the wrong slot.
        The slot becomes unclaimed again — they can re-claim with a fresh
        sign-in, or someone else can claim it. The user&apos;s sign-in still
        works; they just lose their roster identity until they re-claim.
      </Box>

      <Section num="01" title="All 22 members">
        <div
          className="bg-surface border border-border rounded-md overflow-hidden"
          style={{ borderWidth: "0.5px" }}
        >
          <table className="w-full text-[12px]">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2">
                  Crew
                </th>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2">
                  Name
                </th>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2">
                  Role
                </th>
                <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2">
                  Status
                </th>
                <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((m) => {
                const email = m.userId ? userIdToEmail.get(m.userId) : null;
                return (
                  <tr
                    key={m.id}
                    className="border-b border-border last:border-0 align-middle"
                  >
                    <td className="px-3 py-2.5 font-mono text-[11px] text-ink-muted">
                      Crew {m.crewId}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-semibold">{m.name}</div>
                      {email && (
                        <div className="font-mono text-[10px] text-ink-faint mt-0.5">
                          {email}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge tone={ROLE_TONE[m.role]}>
                        {ROLE_LABEL[m.role]}
                      </StatusBadge>
                    </td>
                    <td className="px-3 py-2.5">
                      {m.userId ? (
                        <StatusBadge tone="ok">CLAIMED</StatusBadge>
                      ) : (
                        <StatusBadge tone="neutral">unclaimed</StatusBadge>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {m.userId && (
                        <div className="inline-flex items-center gap-2">
                          <ResetGearButton
                            name={m.name}
                            action={async () => {
                              "use server";
                              await resetCrewMemberGearList(m.id);
                            }}
                          />
                          <UnbindButton
                            name={m.name}
                            action={async () => {
                              "use server";
                              await unbindCrewMember(m.id);
                            }}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  );
}
