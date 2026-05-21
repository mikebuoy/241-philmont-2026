import Link from "next/link";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { getAllCrewMembersAdmin } from "@/lib/crew";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  deleteCrewMember,
  resetCrewMemberGearList,
  setCrewMemberDisabled,
  unbindCrewMember,
  updateCrewMemberCertification,
  updateCrewMemberRole,
} from "./actions";
import { UnbindButton } from "./UnbindButton";
import { ResetGearButton } from "./ResetGearButton";
import { CertificationSelect } from "./CertificationSelect";
import { RoleSelect } from "./RoleSelect";
import { StatusSelect } from "./StatusSelect";
import { DeleteButton } from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminRosterPage() {
  const allMembers = await getAllCrewMembersAdmin();

  // Pull emails for claimed members via the admin client
  const admin = createAdminClient();
  const userIdToEmail = new Map<string, string>();
  const claimedIds = allMembers.map((m) => m.userId).filter((id): id is string => !!id);
  if (claimedIds.length > 0) {
    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
    for (const u of data?.users ?? []) {
      if (u.email && claimedIds.includes(u.id)) {
        userIdToEmail.set(u.id, u.email);
      }
    }
  }

  const enabledCount = allMembers.filter((m) => !m.isDisabled).length;
  const claimedCount = allMembers.filter((m) => m.userId && !m.isDisabled).length;

  const crew1 = allMembers.filter((m) => m.crewId === 1);
  const crew2 = allMembers.filter((m) => m.crewId === 2);
  const groupedCrews = [
    { id: 1, name: "Crew 1", members: crew1 },
    { id: 2, name: "Crew 2", members: crew2 },
  ];

  return (
    <Page
      eyebrow="Admin"
      title="Roster management"
      meta={`${claimedCount} of ${enabledCount} signed in · ${allMembers.length} total`}
    >
      <Link
        href="/crew/roster"
        className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-muted hover:text-ink"
      >
        ‹ View public roster
      </Link>

      <Box variant="info">
        <strong>Role</strong> and <strong>Status</strong> changes save immediately.
        <strong> Disabled</strong> members are hidden from all non-admin screens — their data is
        preserved. <strong>Delete</strong> permanently removes the member from the database.
        <strong> Unbind</strong> a crew member if they claimed the wrong slot.
      </Box>

      <Section num="01" title="Crew members">
        <div className="space-y-6">
          {groupedCrews.map((crew) => (
            <div key={crew.id} className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-mono text-[13px] font-semibold uppercase tracking-[0.08em] text-ink">
                  {crew.name}
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-ink-faint">
                  {crew.members.filter((m) => !m.isDisabled).length} active
                  {crew.members.some((m) => m.isDisabled) && (
                    <> · {crew.members.filter((m) => m.isDisabled).length} disabled</>
                  )}
                </span>
              </div>
              <div
                className="bg-surface border border-border rounded-md overflow-x-auto"
                style={{ borderWidth: "0.5px" }}
              >
                <table className="w-full text-[12px]">
                  <thead className="bg-surface-2 border-b border-border">
                    <tr>
                      <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2 whitespace-nowrap">
                        Name
                      </th>
                      <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2 whitespace-nowrap">
                        Role
                      </th>
                      <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2 whitespace-nowrap">
                        Status
                      </th>
                      <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2 whitespace-nowrap">
                        Certifications
                      </th>
                      <th className="text-left font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2 whitespace-nowrap">
                        Claimed
                      </th>
                      <th className="text-right font-mono font-medium text-[10px] uppercase tracking-[0.05em] text-ink-muted px-3 py-2 whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {crew.members.map((m) => {
                      const email = m.userId ? userIdToEmail.get(m.userId) : null;
                      return (
                        <tr
                          key={m.id}
                          className={`border-b border-border last:border-0 align-middle ${
                            m.isDisabled ? "opacity-50" : ""
                          }`}
                        >
                          <td className="px-3 py-2.5">
                            <div className="font-semibold flex items-center gap-1.5">
                              {m.name}
                              {m.isDisabled && (
                                <StatusBadge tone="neutral">Disabled</StatusBadge>
                              )}
                            </div>
                            {email && (
                              <div className="font-mono text-[10px] text-ink-faint mt-0.5">
                                {email}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <RoleSelect
                              value={m.role}
                              action={async (role) => {
                                "use server";
                                await updateCrewMemberRole(m.id, role);
                              }}
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <StatusSelect
                              disabled={m.isDisabled}
                              action={async (disabled) => {
                                "use server";
                                await setCrewMemberDisabled(m.id, disabled);
                              }}
                            />
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="inline-flex items-start gap-2">
                              <CertificationSelect
                                label="WFA"
                                value={m.wfaCertificationStatus}
                                action={async (status) => {
                                  "use server";
                                  await updateCrewMemberCertification(m.id, "wfa", status);
                                }}
                              />
                              <CertificationSelect
                                label="CPR"
                                value={m.cprCertificationStatus}
                                action={async (status) => {
                                  "use server";
                                  await updateCrewMemberCertification(m.id, "cpr", status);
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            {m.userId ? (
                              <StatusBadge tone="ok">CLAIMED</StatusBadge>
                            ) : (
                              <StatusBadge tone="neutral">unclaimed</StatusBadge>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <div className="inline-flex items-center gap-2">
                              <ResetGearButton
                                name={m.name}
                                action={async () => {
                                  "use server";
                                  await resetCrewMemberGearList(m.id);
                                }}
                              />
                              {m.userId && (
                                <UnbindButton
                                  name={m.name}
                                  action={async () => {
                                    "use server";
                                    await unbindCrewMember(m.id);
                                  }}
                                />
                              )}
                              <DeleteButton
                                name={m.name}
                                action={async () => {
                                  "use server";
                                  await deleteCrewMember(m.id);
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  );
}
