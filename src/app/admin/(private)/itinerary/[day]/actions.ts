"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createAdminClient,
  isCurrentUserAdmin,
} from "@/lib/supabase/admin";
import { isoToSlug } from "@/data/itinerary";
import type { CampType } from "@/data/itinerary";

const FLAG_KEYS = [
  "dryCamp",
  "burroPickup",
  "burroDropoff",
  "summit",
  "conservation",
  "longestDay",
  "hardestDescent",
] as const;

const CAMP_TYPES: CampType[] = [
  "travel",
  "acclimation",
  "base",
  "trail",
  "staffed",
  "dry",
  "layover",
];

function requiredText(formData: FormData, key: string): string {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) throw new Error(`${key} is required`);
  return value;
}

function optionalText(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function optionalNumber(formData: FormData, key: string): number | null {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${key} must be a number`);
  return parsed;
}

function optionalInteger(formData: FormData, key: string): number | null {
  const value = optionalNumber(formData, key);
  return value == null ? null : Math.trunc(value);
}

function lines(formData: FormData, key: string): string[] {
  return String(formData.get(key) ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

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

  const type = requiredText(formData, "type") as CampType;
  if (!CAMP_TYPES.includes(type)) throw new Error("Invalid camp type");

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
    label: requiredText(formData, "label"),
    camp: requiredText(formData, "camp"),
    type,
    miles: optionalNumber(formData, "miles"),
    gain: optionalInteger(formData, "gain"),
    loss: optionalInteger(formData, "loss"),
    elevation: optionalInteger(formData, "elevation"),
    food_pickup: optionalText(formData, "food_pickup"),
    flags,
    programs: lines(formData, "programs"),
    wake: optionalText(formData, "wake"),
    on_trail: optionalText(formData, "on_trail"),
    what_to_expect: optionalText(formData, "what_to_expect"),
    schedule_note: optionalText(formData, "schedule_note"),
    planned_activities: lines(formData, "planned_activities"),
    opportunistic_activities: lines(formData, "opportunistic_activities"),
    crew_notes: lines(formData, "crew_notes"),
    crew_leader_watch: lines(formData, "crew_leader_watch"),
    crew_leader_focus: optionalText(formData, "crew_leader_focus"),
    meal_breakfast_note: optionalText(formData, "meal_breakfast_note"),
    meal_lunch_note: optionalText(formData, "meal_lunch_note"),
    meal_dinner_note: optionalText(formData, "meal_dinner_note"),
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

  const slug = isoToSlug(iso);

  // Revalidate admin pages so the list reflects updates immediately
  revalidatePath("/admin/itinerary");
  revalidatePath(`/admin/itinerary/${slug}`);

  // Revalidate the public pages so they regenerate with fresh data
  // on the next request (which will be the redirect below).
  revalidatePath("/trip/itinerary");
  revalidatePath(`/trip/itinerary/${slug}`);

  redirect(`/trip/itinerary/${slug}?saved=1`);
}
