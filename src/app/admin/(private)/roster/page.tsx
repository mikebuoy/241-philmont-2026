import Link from "next/link";
import { Page } from "@/components/primitives/Page";
import { Section } from "@/components/primitives/Section";
import { Box } from "@/components/primitives/Box";
import { getAllCrewMembersAdmin } from "@/lib/crew";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  deleteCrewMember,
  resetCrewMemberGearList,
  setCrewMemberDisabled,
  unbindCrewMember,
  updateCrewMemberCertification,
  updateCrewMemberMedForm,
  updateCrewMemberRole,
} from "./actions";
import { UnbindButton } from "./UnbindButton";
import { ResetGearButton } from "./ResetGearButton";
import { CertificationSelect } from "./CertificationSelect";
import { MedFormCheckbox } from "./MedFormCheckbox";
import { RoleSelect } from "./RoleSelect";
import { StatusSelect } from "./StatusSelect";
import { DeleteButton } from "./DeleteButton";

export const dynamic = "force-dynamic";

function ClaimedCheck({ claimed }: { claimed: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
        claimed
          ? "border-ok-border bg-ok-bg text-ok-text"
          : "border-border bg-surface-2 text-ink-faint"
      }`}
      title={claimed ? "Claimed" : "Unclaimed"}
      aria-label={claimed ? "Claimed" : "Unclaimed"}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

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
                className="rounded-md border border-border bg-surface"
                style={{ borderWidth: "0.5px" }}
              >
                <table className="w-full table-fixed text-[12px]">
                  <colgroup>
                    <col className="w-[26%]" />
                    <col className="w-[16%]" />
                    <col className="w-[8%]" />
                    <col className="w-[9%]" />
                    <col className="w-[9%]" />
                    <col className="w-[9%]" />
                    <col className="w-[8%]" />
                    <col className="w-[15%]" />
                  </colgroup>
                  <thead className="border-b border-border bg-surface-2">
                    <tr>
                      {["Name", "Role", "Active", "WFA", "CPR", "MED", "Claimed", "Actions"].map((label) => (
                        <th
                          key={label}
                          className={`px-2 py-2 font-mono text-[9px] font-medium uppercase tracking-[0.05em] text-ink-muted ${
                            label === "Actions" ? "text-right" : "text-left"
                          }`}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {crew.members.map((m) => {
                      const email = m.userId ? userIdToEmail.get(m.userId) : null;
                      return (
                        <tr
                          key={m.id}
                          className={`border-b border-border last:border-0 align-middle ${
                            m.isDisabled ? "opacity-55" : ""
                          }`}
                        >
                          <td className="min-w-0 px-2 py-2">
                            <div className="truncate font-semibold text-ink">
                              {m.name}
                            </div>
                            {email && (
                              <div className="mt-0.5 truncate font-mono text-[10px] text-ink-faint">
                                {email}
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-2">
                            <RoleSelect
                              value={m.role}
                              action={async (role) => {
                                "use server";
                                await updateCrewMemberRole(m.id, role);
                              }}
                            />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <StatusSelect
                              disabled={m.isDisabled}
                              action={async (disabled) => {
                                "use server";
                                await setCrewMemberDisabled(m.id, disabled);
                              }}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <CertificationSelect
                              label="WFA"
                              showLabel={false}
                              value={m.wfaCertificationStatus}
                              action={async (status) => {
                                "use server";
                                await updateCrewMemberCertification(m.id, "wfa", status);
                              }}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <CertificationSelect
                              label="CPR"
                              showLabel={false}
                              value={m.cprCertificationStatus}
                              action={async (status) => {
                                "use server";
                                await updateCrewMemberCertification(m.id, "cpr", status);
                              }}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <MedFormCheckbox
                              showLabel={false}
                              value={m.medFormReceived}
                              action={async (received) => {
                                "use server";
                                await updateCrewMemberMedForm(m.id, received);
                              }}
                            />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <ClaimedCheck claimed={!!m.userId} />
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex items-center justify-end gap-1.5">
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
