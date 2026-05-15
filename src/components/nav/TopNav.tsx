"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "./navItems";
import { NavAuthButton } from "./NavAuthButton";

export default function TopNav() {
  const pathname = usePathname();
  return (
    <header className="hidden sm:block bg-surface border-b border-border">
      <div className="max-w-[900px] mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-condensed text-[15px] font-semibold tracking-[0.02em] uppercase">
            Tooth of Time
          </span>
          <span className="font-mono text-[10px] text-ink-muted hidden sm:inline">
            9,003 FT
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                    active
                      ? "bg-ink text-bg"
                      : "text-ink-muted hover:text-ink hover:bg-surface-2"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="w-px h-4 bg-border shrink-0" aria-hidden="true" />
          <NavAuthButton variant="top" />
        </div>
      </div>
    </header>
  );
}
