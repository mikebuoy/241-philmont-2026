import Link from "next/link";
import { getCoreGearItems } from "@/lib/gear";
import { GearEditor } from "./GearEditor";

export const dynamic = "force-dynamic";

export default async function AdminGearPage() {
  const items = await getCoreGearItems();

  return (
    <div className="max-w-[900px] mx-auto px-6 pt-8 pb-16">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-muted hover:text-ink mb-4"
      >
        ‹ Admin
      </Link>

      <header className="border-b-2 border-ink pb-4 mb-2">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
          Core Gear List
        </h1>
        <p className="text-[12px] text-ink-muted mt-1">
          {items.length} items across {new Set(items.map((i) => i.category)).size} categories.
          Changes affect future seeds only — existing crew member lists are not updated.
        </p>
      </header>

      <div className="bg-warn-bg border border-warn-border rounded-md px-4 py-3 mb-6 text-[12px] text-warn-text">
        <strong>Shelter items:</strong> The two Thunder Ridge and Personal 1P tent rows use
        hardcoded role-aware defaults on seed (scouts get Thunder Ridge at 43 oz;
        advisors get Personal 1P). Renaming those items will break the role defaults.
      </div>

      <GearEditor initialItems={items} />
    </div>
  );
}
