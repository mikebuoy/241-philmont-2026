"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function NavAuthButton({ variant }: { variant: "top" | "bottom" }) {
  return (
    <Suspense fallback={<Placeholder variant={variant} />}>
      <Inner variant={variant} />
    </Suspense>
  );
}

function Inner({ variant }: { variant: "top" | "bottom" }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setAuthed(!!data.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setAuthed(!!session?.user);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setAuthed(false);
    router.refresh();
  }

  const qs = params.toString();
  const fullPath = qs ? `${pathname}?${qs}` : pathname;
  const signInHref = `/admin/signin?next=${encodeURIComponent(fullPath)}`;

  if (authed === null) return <Placeholder variant={variant} />;

  if (variant === "top") {
    if (authed) {
      return (
        <button
          onClick={signOut}
          disabled={signingOut}
          className="px-2.5 py-1 font-mono text-[11px] text-ink-muted hover:text-ink border border-border rounded-md hover:border-border-strong transition-colors disabled:opacity-40"
        >
          {signingOut ? "…" : "Sign Out"}
        </button>
      );
    }
    return (
      <Link
        href={signInHref}
        className="px-2.5 py-1 font-mono text-[11px] text-ink-muted hover:text-ink border border-border rounded-md hover:border-border-strong transition-colors"
      >
        Sign In
      </Link>
    );
  }

  // Bottom nav variant — icon + label
  const label = authed ? (signingOut ? "…" : "Sign Out") : "Sign In";
  const strokeWidth = 1.6;

  if (authed) {
    return (
      <button
        onClick={signOut}
        disabled={signingOut}
        className="flex flex-col items-center justify-center gap-1 py-2 w-full text-ink-muted active:bg-surface-2 transition-colors disabled:opacity-40"
      >
        <PersonIcon strokeWidth={strokeWidth} />
        <span className="text-[10px] font-medium tracking-tight">{label}</span>
      </button>
    );
  }
  return (
    <Link
      href={signInHref}
      className="flex flex-col items-center justify-center gap-1 py-2 text-ink-muted active:bg-surface-2 transition-colors"
    >
      <PersonIcon strokeWidth={strokeWidth} />
      <span className="text-[10px] font-medium tracking-tight">{label}</span>
    </Link>
  );
}

function Placeholder({ variant }: { variant: "top" | "bottom" }) {
  if (variant === "top") {
    return (
      <span className="px-2.5 py-1 font-mono text-[11px] opacity-0 border border-transparent rounded-md">
        Sign In
      </span>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-2 opacity-0">
      <PersonIcon strokeWidth={1.6} />
      <span className="text-[10px] font-medium tracking-tight">Sign In</span>
    </div>
  );
}

function PersonIcon({ strokeWidth }: { strokeWidth: number }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
