"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SubNavItem = { href: string; label: string };

export function SubNav({ items }: { items: SubNavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0 mb-6">
      <div className="flex gap-1 min-w-max">
        {items.map((it) => {
          const active =
            pathname === it.href ||
            (it.href !== "/" && pathname.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`font-mono text-[11px] uppercase tracking-[0.05em] px-3 py-1.5 rounded-md transition-colors ${
                active
                  ? "bg-ink text-bg"
                  : "text-ink-muted hover:text-ink hover:bg-surface-2"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
