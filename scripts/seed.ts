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
import { ITINERARY, GPX_COVERAGE } from "../src/data/itinerary";

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

async function seedItinerary() {
  console.log(`\nSeeding ${ITINERARY.length} itinerary days...`);
  const rows = ITINERARY.map((d) => {
    const gpx = GPX_COVERAGE[d.iso];
    return {
      iso: d.iso,
      philmont_day: d.philmontDay,
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
      notes: d.notes,
      flags: d.flags,
      programs: d.programs,
      gpx_path: gpx ? `${d.iso}.gpx` : null,
      gpx_partial: gpx?.partial ?? false,
      gpx_note: gpx?.note ?? null,
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
  await seedItinerary();
  await seedGpxFiles();
  console.log("\n✓ Seed complete.");
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
