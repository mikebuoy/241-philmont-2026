import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/supabase/admin";
import { SignOutButton } from "@/components/admin/SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/signin");
  }

  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    // Signed in but not in admins table — sign out & block
    await supabase.auth.signOut();
    redirect("/admin/signin?error=forbidden");
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-border">
        <div className="max-w-[900px] mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/admin" className="flex items-baseline gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
              Trek 12-23 · Admin
            </span>
            <span className="text-[13px] font-semibold tracking-tight">
              Philmont 2026
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-[11px] font-mono text-ink-muted hover:text-ink"
            >
              ‹ View site
            </Link>
            <span className="text-[11px] font-mono text-ink-muted hidden sm:inline">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
