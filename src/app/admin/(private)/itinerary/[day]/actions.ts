"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createAdminClient,
  isCurrentUserAdmin,
} from "@/lib/supabase/admin";

const FLAG_KEYS = [
  "dryCamp",
  "burroPickup",
  "burroDropoff",
  "summit",
  "conservation",
  "longestDay",
  "hardestDescent",
] as const;

export async function saveDay(iso: string, formData: FormData) {
  // Auth + admin gate
  if (!(await isCurrentUserAdmin())) {
    throw new Error("Forbidden");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Not signed in");

  // Parse flags from checkbox values
  const flags: Record<string, boolean> = {};
  for (const k of FLAG_KEYS) {
    if (formData.get(`flag_${k}`) === "on") flags[k] = true;
  }

  // Parse programs from textarea (one per line)
  const programsRaw = String(formData.get("programs") ?? "");
  const programs = programsRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const notes = String(formData.get("notes") ?? "");
  const gpxPartial = formData.get("gpx_partial") === "on";
  const gpxNote = String(formData.get("gpx_note") ?? "");
  const removeGpx = formData.get("remove_gpx") === "on";

  // GPX file upload (if provided)
  const gpxFile = formData.get("gpx_file") as File | null;
  let gpxPath: string | null | undefined; // undefined = no change

  const adminClient = createAdminClient();

  if (removeGpx) {
    // Delete from storage if exists
    await adminClient.storage.from("gpx").remove([`${iso}.gpx`]);
    gpxPath = null;
  } else if (gpxFile && gpxFile.size > 0) {
    const buf = Buffer.from(await gpxFile.arrayBuffer());
    const { error } = await adminClient.storage
      .from("gpx")
      .upload(`${iso}.gpx`, buf, {
        contentType: "application/gpx+xml",
        upsert: true,
      });
    if (error) throw new Error(`GPX upload failed: ${error.message}`);
    gpxPath = `${iso}.gpx`;
  }

  // Update row (use admin client to bypass RLS — auth already verified above)
  const patch: Record<string, unknown> = {
    notes,
    flags,
    programs,
    updated_at: new Date().toISOString(),
    updated_by: user.email,
  };
  if (gpxPath !== undefined) {
    patch.gpx_path = gpxPath;
    patch.gpx_partial = gpxPath ? gpxPartial : false;
    patch.gpx_note = gpxPath ? gpxNote : null;
  } else {
    // Update the partial/note even if file unchanged
    patch.gpx_partial = gpxPartial;
    patch.gpx_note = gpxNote || null;
  }

  const { error: updateError } = await adminClient
    .from("itinerary_days")
    .update(patch)
    .eq("iso", iso);
  if (updateError) throw new Error(`Save failed: ${updateError.message}`);

  // Trigger Vercel rebuild
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (hookUrl) {
    try {
      await fetch(hookUrl, { method: "POST" });
    } catch {
      // Don't fail the save if the hook ping fails; the change is in the DB.
    }
  }

  // Revalidate admin pages so the list reflects updates immediately
  revalidatePath("/admin/itinerary");
  revalidatePath(`/admin/itinerary/${iso}`);

  redirect(`/admin/itinerary?saved=${iso}`);
}
