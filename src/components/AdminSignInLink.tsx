"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Footer auth link. Renders:
 *   - "Sign in" link (with ?next preserving current page) when anonymous
 *   - "Sign out" button when signed in
 *
 * Important for shared devices — scouts in families may share a browser
 * with siblings or parents, so a one-tap sign-out is essential.
 */
export function AdminSignInLink() {
  return (
    <Suspense fallback={<FallbackLink />}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
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

  // Loading state — keep layout stable by rendering the fallback link
  if (authed === null) return <FallbackLink />;

  if (authed) {
    return (
      <button
        onClick={signOut}
        disabled={signingOut}
        className="hover:text-ink underline-offset-2 hover:underline disabled:opacity-50"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    );
  }

  const qs = params.toString();
  const fullPath = qs ? `${pathname}?${qs}` : pathname;
  const href = `/admin/signin?next=${encodeURIComponent(fullPath)}`;
  return (
    <Link
      href={href}
      className="hover:text-ink underline-offset-2 hover:underline"
    >
      Sign in
    </Link>
  );
}

function FallbackLink() {
  return (
    <Link
      href="/admin/signin"
      className="hover:text-ink underline-offset-2 hover:underline"
    >
      Sign in
    </Link>
  );
}
