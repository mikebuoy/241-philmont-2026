"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActive } from "./navItems";

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="active:bg-surface-2 transition-colors"
            >
              <div
                className={`flex flex-col items-center justify-center gap-1 py-2 ${
                  active ? "text-ink" : "text-ink-muted"
                }`}
              >
                <NavIcon href={item.href} active={active} />
                <span className="text-[10px] font-medium tracking-tight">
                  {item.shortLabel}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function NavIcon({ href, active }: { href: string; active: boolean }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: active ? 2.2 : 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (href) {
    case "/":
      return (
        <svg {...common}>
          <path d="M3 12 12 3l9 9" />
          <path d="M5 10v11h14V10" />
        </svg>
      );
    case "/trip":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case "/pack":
      return (
        <svg {...common}>
          <path d="M5 7h14l-1.5 13a2 2 0 0 1-2 1.8H8.5a2 2 0 0 1-2-1.8L5 7Z" />
          <path d="M9 7V5a3 3 0 0 1 6 0v2" />
        </svg>
      );
    case "/crew":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "/reference":
      return (
        <svg {...common}>
          <path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V4Z" />
          <path d="M4 16a4 4 0 0 1 4-4h12" />
        </svg>
      );
    default:
      return null;
  }
}
