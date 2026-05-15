/**
 * Seed Supabase crew_members table from src/data/roster.ts.
 *
 * Run from project root after running supabase/migration-crew.sql:
 *   npx tsx scripts/seed-crew.ts
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { ALL_MEMBERS } from "../src/data/roster";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log(`Seeding ${ALL_MEMBERS.length} crew members...`);

  // Idempotent: upsert by (name, crew_id) — won't duplicate on re-run
  // (no unique constraint on name yet, so we check existence first)
  const { data: existing } = await supabase
    .from("crew_members")
    .select("name, crew_id");
  const existingKeys = new Set(
    (existing ?? []).map((r) => `${r.crew_id}::${r.name}`),
  );

  const toInsert = ALL_MEMBERS.filter(
    (m) => !existingKeys.has(`${m.crewId}::${m.name}`),
  );

  if (toInsert.length === 0) {
    console.log("  All members already in DB.");
    return;
  }

  const rows = toInsert.map((m) => ({
    name: m.name,
    last_initial: m.lastInitial,
    role: m.role,
    crew_id: m.crewId,
  }));

  const { error } = await supabase.from("crew_members").insert(rows);
  if (error) {
    console.error("  ✗ Insert failed:", error.message);
    process.exit(1);
  }
  console.log(`  ✓ Inserted ${rows.length} new members.`);
  console.log(`  (${existingKeys.size} already existed, skipped.)`);
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
