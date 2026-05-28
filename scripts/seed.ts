/**
 * Seed Supabase with the current itinerary data + GPX file.
 *
 * Run from project root:
 *   npx tsx scripts/seed.ts
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { config } from "dotenv";
import { ITINERARY, TRAIL_MEALS, GPX_COVERAGE } from "../src/data/itinerary";

// Load .env.local
config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function seedTrailMeals() {
  console.log(`\nSeeding ${TRAIL_MEALS.length} trail meals...`);
  const { error } = await supabase
    .from("trail_meals")
    .upsert(TRAIL_MEALS, { onConflict: "code" });
  if (error) {
    console.error("  ✗ Upsert failed:", error.message);
    process.exit(1);
  }
  console.log(`  ✓ ${TRAIL_MEALS.length} meals upserted.`);
}

async function seedItinerary() {
  console.log(`\nSeeding ${ITINERARY.length} itinerary days...`);
  const rows = ITINERARY.map((d) => {
    const gpx = GPX_COVERAGE[d.iso];
    // Only include gpx columns when we have a known GPX entry. Omitting them
    // from the upsert payload leaves any admin-uploaded values untouched.
    const gpxFields = gpx
      ? {
          gpx_path: `${d.iso}.gpx`,
          gpx_partial: gpx.partial,
          gpx_note: gpx.note ?? null,
        }
      : {};
    return {
      iso: d.iso,
      philmont_day: d.philmontDay,
      trail_day: d.trailDay ?? null,
      label: d.label,
      date_long: d.date,
      date_short: d.dateShort,
      weekday: d.weekday,
      camp: d.camp,
      type: d.type,
      miles: d.miles,
      gain: d.gain,
      loss: d.loss,
      cum_miles: d.cumMiles,
      cum_gain: d.cumGain,
      cum_loss: d.cumLoss,
      elevation: d.elevation,
      food_pickup: d.foodPickup,
      flags: d.flags,
      programs: d.programs,
      ...gpxFields,

      // Light table
      twilight: d.twilight ?? null,
      sunrise: d.sunrise ?? null,
      sunset: d.sunset ?? null,
      dark: d.dark ?? null,

      // Schedule
      wake: d.wake ?? null,
      on_trail: d.onTrail ?? null,
      schedule_note: d.scheduleNote ?? null,

      // Rich narrative
      what_to_expect: d.whatToExpect || null,
      planned_activities: d.plannedActivities ?? [],
      opportunistic_activities: d.opportunisticActivities ?? [],
      crew_notes: d.crewNotes ?? [],
      crew_leader_watch: d.crewLeaderWatch ?? [],
      crew_leader_focus: d.crewLeaderFocus || null,

      // Meal FKs (trail_meals must be seeded first)
      meal_breakfast: d.mealBreakfast ?? null,
      meal_lunch: d.mealLunch ?? null,
      meal_dinner: d.mealDinner ?? null,

      // Meal override notes
      meal_breakfast_note: d.mealBreakfastNote ?? null,
      meal_lunch_note: d.mealLunchNote ?? null,
      meal_dinner_note: d.mealDinnerNote ?? null,

      updated_by: "seed",
    };
  });

  const { error } = await supabase
    .from("itinerary_days")
    .upsert(rows, { onConflict: "iso" });
  if (error) {
    console.error("  ✗ Upsert failed:", error.message);
    process.exit(1);
  }
  console.log(`  ✓ ${rows.length} days upserted.`);
}

async function seedGpxFiles() {
  const gpxDays = Object.keys(GPX_COVERAGE);
  console.log(`\nUploading ${gpxDays.length} GPX file(s)...`);
  for (const iso of gpxDays) {
    const localPath = join("public", "gpx", `${iso}.gpx`);
    if (!existsSync(localPath)) {
      console.log(`  - ${iso}.gpx not found locally, skipping.`);
      continue;
    }
    const file = readFileSync(localPath);
    const { error } = await supabase.storage
      .from("gpx")
      .upload(`${iso}.gpx`, file, {
        contentType: "application/gpx+xml",
        upsert: true,
      });
    if (error) {
      console.error(`  ✗ ${iso}.gpx:`, error.message);
    } else {
      console.log(`  ✓ ${iso}.gpx uploaded (${file.length} bytes)`);
    }
  }
}

async function main() {
  console.log("=== Seeding Supabase from local data ===");
  // trail_meals must be seeded before itinerary_days (FK dependency)
  await seedTrailMeals();
  await seedItinerary();
  await seedGpxFiles();
  console.log("\n✓ Seed complete.");
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
