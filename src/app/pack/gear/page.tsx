import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Page } from "@/components/primitives/Page";
import { Box } from "@/components/primitives/Box";
import { SubNav } from "@/components/nav/SubNav";
import { PACK_SUB } from "@/components/nav/navItems";
import { createClient } from "@/lib/supabase/server";
import { getMyCrewMember } from "@/lib/crew";
import { getPackingItems, seedCoreItemsForCrewMember } from "@/lib/packing";
import { getGearCategories, getCoreGearDescriptions } from "@/lib/gear";
import { isCurrentUserAdmin } from "@/lib/supabase/admin";
import { PackingListEditor } from "./PackingListEditor";

export const metadata: Metadata = { title: "Gear List" };
export const dynamic = "force-dynamic";

export default async function PackGearPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/signin?next=/pack/gear");

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
  ) : undefined;

  return (
    <Page
      eyebrow="My Pack"
      title="Gear List"
      meta={`${me.name} · ${items.filter((i) => !i.isNotPacking).length} items packing`}
      action={adminAction}
    >
      <PackingListEditor
        items={items}
        bodyWeightLbs={me.bodyWeightLbs}
        categoryOrder={categoryOrder}
        aboveHeader={<SubNav key="subnav" items={PACK_SUB} />}
      >
        <Box variant="info">
          <strong>Your personal packing list.</strong> Items pre-seeded from the
          troop gear list. Edit weights as you weigh your gear. Mark items
          you&apos;re not bringing as not-packing. Add personal items below each
          category. Saves automatically.
        </Box>
      </PackingListEditor>
    </Page>
  );
}
