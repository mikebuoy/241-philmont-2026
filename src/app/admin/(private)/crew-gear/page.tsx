import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/primitives/Page";
import { getCoreCrewGear } from "@/lib/crew-gear";
import { CrewGearEditor } from "./CrewGearEditor";

export const metadata: Metadata = { title: "Admin · Crew Gear" };
export const dynamic = "force-dynamic";

export default async function AdminCrewGearPage() {
  const items = await getCoreCrewGear();

  const backAction = (
    <Link
      href="/crew/gear"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 text-ink-muted rounded-md text-[11px] font-medium font-mono uppercase tracking-[0.05em] hover:text-ink hover:bg-surface-3 active:scale-95 transition-all whitespace-nowrap border border-border"
      style={{ borderWidth: "0.5px" }}
    >
      ← Crew Gear
    </Link>
  );

  return (
    <Page
      eyebrow="Admin"
      title="Crew Gear Master List"
      meta={`${items.length} items`}
      action={backAction}
    >
      <CrewGearEditor items={items} />
    </Page>
  );
}
