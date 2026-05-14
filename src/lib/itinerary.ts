import { createClient } from "@supabase/supabase-js";
import type { ItineraryDay, CampType } from "@/data/itinerary";

/**
 * Read-only Supabase client used at build time to fetch itinerary data.
 * Uses anon key — RLS allows public reads on itinerary_days.
 */
function buildClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

type Row = {
  iso: string;
  philmont_day: number | null;
  label: string;
  date_long: string;
  date_short: string;
  weekday: string;
  camp: string;
  type: CampType;
  miles: number | null;
  gain: number | null;
  loss: number | null;
  cum_miles: number | null;
  cum_gain: number | null;
  cum_loss: number | null;
  elevation: number | null;
  food_pickup: string | null;
  notes: string | null;
  flags: ItineraryDay["flags"] | null;
  programs: string[] | null;
  gpx_path: string | null;
  gpx_partial: boolean | null;
  gpx_note: string | null;
};

function rowToDay(r: Row): ItineraryDay {
  return {
    iso: r.iso,
    philmontDay: r.philmont_day,
    label: r.label,
    date: r.date_long,
    dateShort: r.date_short,
    weekday: r.weekday,
    camp: r.camp,
    type: r.type,
    miles: r.miles,
    gain: r.gain,
    loss: r.loss,
    cumMiles: r.cum_miles,
    cumGain: r.cum_gain,
    cumLoss: r.cum_loss,
    elevation: r.elevation,
    foodPickup: r.food_pickup,
    notes: r.notes ?? "",
    flags: r.flags ?? {},
    programs: r.programs ?? [],
  };
}

export type GpxMeta = { path: string; partial: boolean; note: string };

export type ItineraryDayFull = ItineraryDay & {
  gpx: GpxMeta | null;
};

/**
 * Fetch all itinerary days from Supabase, sorted by iso date.
 * Called from page components at build time (SSG).
 */
export async function getItinerary(): Promise<ItineraryDayFull[]> {
  const supabase = buildClient();
  const { data, error } = await supabase
    .from("itinerary_days")
    .select("*")
    .order("iso", { ascending: true });
  if (error) throw new Error(`Failed to load itinerary: ${error.message}`);
  return (data as Row[]).map((r) => ({
    ...rowToDay(r),
    gpx: r.gpx_path
      ? {
          path: r.gpx_path,
          partial: r.gpx_partial ?? false,
          note: r.gpx_note ?? "",
        }
      : null,
  }));
}

/** Fetch one day by iso slug. */
export async function getDayByIso(iso: string): Promise<ItineraryDayFull | null> {
  const supabase = buildClient();
  const { data, error } = await supabase
    .from("itinerary_days")
    .select("*")
    .eq("iso", iso)
    .maybeSingle();
  if (error) throw new Error(`Failed to load day ${iso}: ${error.message}`);
  if (!data) return null;
  const r = data as Row;
  return {
    ...rowToDay(r),
    gpx: r.gpx_path
      ? {
          path: r.gpx_path,
          partial: r.gpx_partial ?? false,
          note: r.gpx_note ?? "",
        }
      : null,
  };
}
