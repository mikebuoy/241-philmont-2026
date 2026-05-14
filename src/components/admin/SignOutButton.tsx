"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/signin");
    router.refresh();
  }
  return (
    <button
      onClick={signOut}
      className="text-[11px] font-mono text-ink-muted hover:text-ink underline-offset-2 hover:underline"
    >
      Sign out
    </button>
  );
}
