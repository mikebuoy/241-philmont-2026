import { redirect } from "next/navigation";
import { Page } from "@/components/primitives/Page";
import { Box } from "@/components/primitives/Box";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { getAllCrewMembers, getMyCrewMember } from "@/lib/crew";
import { ROLE_LABEL, type CrewRole } from "@/data/roster";
import { claimRosterSlot } from "./actions";

export const dynamic = "force-dynamic";

const ROLE_TONE: Record<CrewRole, "issued" | "crew" | "warn" | "neutral"> = {
  crew_leader: "issued",
  lead_advisor: "warn",
  advisor: "neutral",
  scout: "crew",
};

export default async function ClaimPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Must be signed in
  if (!user) {
    redirect("/admin/signin?next=/claim");
  }

  // If already claimed, send them home
  const mine = await getMyCrewMember();
  if (mine) {
    redirect("/");
  }

  const all = await getAllCrewMembers();
  const unclaimed = all.filter((m) => m.userId === null);
  const claimed = all.filter((m) => m.userId !== null);

  return (
    <Page
      eyebrow="Welcome"
      title="Who are you?"
      meta={`Signed in as ${user.email}`}
    >
      <Box variant="info">
        <strong>One-time setup.</strong> Pick your name from the roster to
        link this Google/email account to your crew slot. After this, you can
        sign in anytime to manage your packing list and see the crew dashboard.
      </Box>

      {unclaimed.length === 0 ? (
        <Box variant="warn">
          <strong>All 22 slots are already claimed.</strong> If you should be
          on this trek, please contact Mike B. or Rick T. to unbind a wrong
          claim.
        </Box>
      ) : (
        <section className="space-y-2">
          {[1, 2].map((crewId) => {
            const crewUnclaimed = unclaimed.filter((m) => m.crewId === crewId);
            if (crewUnclaimed.length === 0) return null;
            return (
              <div key={crewId} className="space-y-1.5">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted pt-2">
                  Crew {crewId}
                </p>
                {crewUnclaimed.map((m) => (
                  <form
                    key={m.id}
                    action={async () => {
                      "use server";
                      await claimRosterSlot(m.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="w-full bg-surface border border-border rounded-md px-3.5 py-3 hover:border-ink-muted active:scale-[0.99] transition-all flex items-center justify-between gap-3 text-left"
                      style={{ borderWidth: "0.5px" }}
                    >
                      <span className="text-[13px] font-semibold">
                        {m.name}
                      </span>
                      <StatusBadge tone={ROLE_TONE[m.role]}>
                        {ROLE_LABEL[m.role]}
                      </StatusBadge>
                    </button>
                  </form>
                ))}
              </div>
            );
          })}
        </section>
      )}

      {claimed.length > 0 && (
        <section className="pt-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-faint mb-1.5">
            Already claimed ({claimed.length})
          </p>
          <p className="text-[11px] text-ink-faint leading-relaxed">
            {claimed.map((m) => m.name).join(" · ")}
          </p>
        </section>
      )}
    </Page>
  );
}
