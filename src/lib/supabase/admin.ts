import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses RLS — for server-side admin
 * operations only (seed scripts, server actions verified to be from admins).
 * NEVER use this from client code; never expose the service key.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

/** Returns true if the currently-authenticated user is in the admins table. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { createClient: createServerSupabaseClient } = await import("./server");
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return false;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admins")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();
  return !error && !!data;
}
