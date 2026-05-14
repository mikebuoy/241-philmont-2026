import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback. Supabase redirects here after the user signs in with
 * Google. Exchanges the code for a session, then sends them on to the
 * `next` query param (typically /admin).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed — bounce back to sign-in with an error flag
  return NextResponse.redirect(`${origin}/admin/signin?error=auth`);
}
