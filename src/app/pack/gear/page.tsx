import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Page } from "@/components/primitives/Page";
import { Box } from "@/components/primitives/Box";
import { SubNav } from "@/components/nav/SubNav";
import { PACK_SUB } from "@/components/nav/navItems";
import { createClient } from "@/lib/supabase/server";
import { getMyCrewMember } from "@/lib/crew";
import { getPackingItems, seedCoreItemsForCrewMember } from "@/lib/packing";
import { getGearCategories, getCoreGearDescriptions } from "@/lib/gear";
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

  // Fetch items + categories + descriptions in parallel
  const [rawItems, categories, descriptions] = await Promise.all([
    getPackingItems(me.id),
    getGearCategories(),
    getCoreGearDescriptions(),
  ]);

  // Merge descriptions from core_gear_items (live lookup, not stored in packing_items)
  const items = rawItems.map((item) => ({
    ...item,
    description: descriptions[item.name] || undefined,
  }));

  const categoryOrder = categories.map((c) => c.name);

  return (
    <Page
      eyebrow="My Pack"
      title="Gear List"
      meta={`${me.name} · ${items.filter((i) => !i.isNotPacking).length} items packing`}
    >
      <SubNav items={PACK_SUB} />

      <Box variant="info">
        <strong>Your personal packing list.</strong> Items pre-seeded from the
        troop gear list. Edit weights as you weigh your gear. Mark items
        you&apos;re not bringing as not-packing. Add personal items below each
        category. Saves automatically.
      </Box>

      <PackingListEditor
        items={items}
        bodyWeightLbs={me.bodyWeightLbs}
        categoryOrder={categoryOrder}
      />
    </Page>
  );
}
