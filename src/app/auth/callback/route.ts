import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth / magic link callback. Supabase redirects here after sign-in.
 * Exchanges the code for a session, then routes the user:
 *  - First-time signed-in user with no claimed roster slot → /claim
 *  - Otherwise → ?next param (default /)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/signin?error=auth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/admin/signin?error=auth`);
  }

  // If the user hasn't claimed a roster slot yet, send them through claim flow
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: claimed } = await supabase
      .from("crew_members")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!claimed) {
      // Preserve `next` so after claiming we can still send them back
      return NextResponse.redirect(
        `${origin}/claim?next=${encodeURIComponent(next)}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
