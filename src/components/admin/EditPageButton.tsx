"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  /** Admin URL to navigate to when clicked, e.g. /admin/itinerary/jun-17 */
  href: string;
  /** Optional label override. Defaults to "Edit this page". */
  label?: string;
};

/**
 * Renders an "Edit this page" link at the top of an editable public page.
 * Hidden for anonymous visitors, shown to anyone signed in. The /admin
 * routes have a server-side admin gate that handles non-admin authed
 * users — they'll be bounced to /admin/signin?error=forbidden.
 */
export function EditPageButton({ href, label = "Edit" }: Props) {
  const [authed, setAuthed] = useState<boolean | null>(null);

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

  if (!authed) return null;

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink text-bg rounded-md text-[11px] font-medium font-mono uppercase tracking-[0.05em] hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      {label}
    </Link>
  );
}
