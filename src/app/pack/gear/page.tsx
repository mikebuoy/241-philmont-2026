import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Page } from "@/components/primitives/Page";
import { SubNav } from "@/components/nav/SubNav";
import { PACK_SUB } from "@/components/nav/navItems";
import { createClient } from "@/lib/supabase/server";
import { getMyCrewMember } from "@/lib/crew";
import { getPackingItems, seedCoreItemsForCrewMember } from "@/lib/packing";
import { getGearCategories, getCoreGearDescriptions, getCoreGearItems, type CoreGearItem } from "@/lib/gear";
import type { PackingItem } from "@/lib/packing-types";
import { isCurrentUserAdmin } from "@/lib/supabase/admin";
import { PackingListEditor } from "./PackingListEditor";
import { PrintButton } from "@/components/primitives/PrintButton";

function coreToPublicItem(core: CoreGearItem): PackingItem {
  return {
    id: core.id,
    crewMemberId: "",
    category: core.category,
    name: core.name,
    qty: parseInt(core.qty) || 1,
    weightOz: core.weightOz,
    isCore: true,
    isRequired:
      core.required === "Required" ? true :
      core.required === "Optional" ? false :
      null,
    isWorn: core.defaultIsWorn,
    isConsumable: core.defaultIsConsumable,
    isSmellable: false,
    isPacked: false,
    isNotPacking: core.defaultIsNotPacking,
    notes: null,
    advisorNote: null,
    sortOrder: core.sortOrder,
    description: core.description || undefined,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return {
    title: user ? "My Packing List" : "Philmont Gear List",
    openGraph: { images: [{ url: "/pack/gear/opengraph-image.png" }] },
    twitter: { card: "summary_large_image" },
  };
}
export const dynamic = "force-dynamic";

export default async function PackGearPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const [coreItems, categories] = await Promise.all([
      getCoreGearItems(),
      getGearCategories(),
    ]);
    const items = coreItems.map(coreToPublicItem);
    const categoryOrder = categories.map((c) => c.name);
    return (
      <Page
        eyebrow="Crew Gear"
        title="Philmont Gear List"
      >
        <PackingListEditor
          items={items}
          bodyWeightLbs={null}
          useActualBaseWeight={false}
          categoryOrder={categoryOrder}
          isPublic
          aboveHeader={<div key="subnav" className="print:hidden"><SubNav items={PACK_SUB} /></div>}
        />
      </Page>
    );
  }

  const me = await getMyCrewMember();
  if (!me) redirect("/claim?next=/pack/gear");

  // First visit: seed core items
  await seedCoreItemsForCrewMember(me);

  // Fetch items + categories + descriptions + admin status in parallel
  const [rawItems, categories, descriptions, isAdmin] = await Promise.all([
    getPackingItems(me.id),
    getGearCategories(),
    getCoreGearDescriptions(),
    isCurrentUserAdmin(),
  ]);

  // Merge descriptions from core_gear_items (live lookup, not stored in packing_items)
  const items = rawItems.map((item) => ({
    ...item,
    description: descriptions[item.name] || undefined,
  }));

  const categoryOrder = categories.map((c) => c.name);

  const adminAction = isAdmin ? (
    <span className="print:hidden">
      <Link
        href="/admin/gear"
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
      eyebrow="My Pack"
      title="My Packing List"
      meta={`${me.name} · ${items.filter((i) => !i.isNotPacking).length} items packing`}
      action={adminAction}
      titleRight={<PrintButton />}
    >
      <PackingListEditor
        items={items}
        bodyWeightLbs={me.bodyWeightLbs}
        actualBaseWeightLbs={me.actualBaseWeightLbs}
        useActualBaseWeight={me.useActualBaseWeight}
        usesPhilmontTent={me.usesPhilmontTent}
        categoryOrder={categoryOrder}
        isAdmin={isAdmin}
        aboveHeader={<div key="subnav" className="print:hidden"><SubNav items={PACK_SUB} /></div>}
      />
    </Page>
  );
}
