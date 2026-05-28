import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Page } from "@/components/primitives/Page";
import { SubNav } from "@/components/nav/SubNav";
import { CREW_SUB } from "@/components/nav/navItems";
import { createClient } from "@/lib/supabase/server";
import { getMyCrewMember } from "@/lib/crew";
import {
  getCrewGearItems,
  seedCrewGearForCrew,
} from "@/lib/crew-gear";
import { isCurrentUserAdmin } from "@/lib/supabase/admin";
import { CrewGearChecklist } from "./CrewGearChecklist";
import { PrintButton } from "@/components/primitives/PrintButton";

export const metadata: Metadata = {
  title: "Crew Gear",
  openGraph: { images: [{ url: "/crew/gear/opengraph-image" }] },
  twitter: { card: "summary_large_image" },
};
export const dynamic = "force-dynamic";

export default async function CrewGearPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/signin?next=/crew/gear");

  const me = await getMyCrewMember();

  // Seed both crews idempotently on every load
  await Promise.all([seedCrewGearForCrew(1), seedCrewGearForCrew(2)]);

  const [crew1Items, crew2Items, isAdmin] = await Promise.all([
    getCrewGearItems(1),
    getCrewGearItems(2),
    isCurrentUserAdmin(),
  ]);

  // Crew leaders can only check items for their own crew
  const isCrewLeader = me?.role === "crew_leader";
  const canCheckCrew1 = isAdmin || (isCrewLeader && me?.crewId === 1);
  const canCheckCrew2 = isAdmin || (isCrewLeader && me?.crewId === 2);

  const checkedCount = crew1Items.filter((i) => i.isChecked).length + crew2Items.filter((i) => i.isChecked).length;
  const totalCount = crew1Items.length + crew2Items.length;

  const adminAction = isAdmin ? (
    <span className="print:hidden">
      <Link
        href="/admin/crew-gear"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink text-bg rounded-md text-[11px] font-medium font-mono uppercase tracking-[0.05em] hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Edit Master List
      </Link>
    </span>
  ) : undefined;

  return (
    <Page
      eyebrow="My Crew"
      title="Crew Gear"
      meta={`${checkedCount} of ${totalCount} items checked`}
      action={adminAction}
      titleRight={<PrintButton />}
    >
      <CrewGearChecklist
        crew1Items={crew1Items}
        crew2Items={crew2Items}
        isAdmin={isAdmin}
        canCheckCrew1={canCheckCrew1}
        canCheckCrew2={canCheckCrew2}
        myCrewId={me?.crewId}
        aboveHeader={
          <div className="print:hidden">
            <SubNav items={CREW_SUB} />
            <div className="relative w-full aspect-video rounded-md overflow-hidden border border-border mt-3" style={{ borderWidth: "0.5px" }}>
              <iframe
                src="https://www.youtube.com/embed/ZORN2Co9A5k"
                title="Philmont Gear Overview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        }
      />
    </Page>
  );
}
