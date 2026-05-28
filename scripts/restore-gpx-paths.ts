/**
 * Restores gpx_path values in itinerary_days by listing what's actually in the
 * Supabase Storage `gpx` bucket and updating any rows where gpx_path is currently null.
 *
 * Run after a seed that accidentally wiped gpx_path:
 *   npx tsx scripts/restore-gpx-paths.ts
 *
 * NOTE: gpx_partial and gpx_note cannot be auto-restored — set those via the
 *       admin itinerary editor after running this script.
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

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

async function main() {
  console.log("Listing files in gpx bucket...");
  const { data: files, error: listError } = await supabase.storage
    .from("gpx")
    .list("", { limit: 200 });

  if (listError) {
    console.error("Failed to list bucket:", listError.message);
    process.exit(1);
  }

  if (!files || files.length === 0) {
    console.log("No files found in gpx bucket. Nothing to restore.");
    return;
  }

  console.log(`Found ${files.length} file(s) in bucket:`);
  for (const f of files) console.log(`  ${f.name}`);

  let restored = 0;
  for (const file of files) {
    const name = file.name; // e.g. "2026-06-18.gpx"
    if (!name.endsWith(".gpx")) continue;
    const iso = name.replace(/\.gpx$/, ""); // e.g. "2026-06-18"

    const { data: existing } = await supabase
      .from("itinerary_days")
      .select("iso, gpx_path")
      .eq("iso", iso)
      .maybeSingle();

    if (!existing) {
      console.log(`  - ${name}: no matching itinerary row for iso=${iso}, skipping`);
      continue;
    }

    if (existing.gpx_path) {
      console.log(`  ✓ ${name}: gpx_path already set (${existing.gpx_path}), skipping`);
      continue;
    }

    const { error: updateError } = await supabase
      .from("itinerary_days")
      .update({ gpx_path: name })
      .eq("iso", iso);

    if (updateError) {
      console.error(`  ✗ ${name}: update failed —`, updateError.message);
    } else {
      console.log(`  ✓ ${name}: gpx_path restored`);
      restored++;
    }
  }

  console.log(`\nDone. ${restored} row(s) restored.`);
  if (restored > 0) {
    console.log(
      "\nNOTE: gpx_partial and gpx_note were not restored (unknown values).\n" +
      "Re-set those per day in the admin itinerary editor if needed."
    );
  }
}

main().catch((e) => {
  console.error("Restore failed:", e);
  process.exit(1);
});
