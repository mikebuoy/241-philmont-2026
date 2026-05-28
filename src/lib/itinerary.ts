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

export type TrailMeal = {
  code: string;
  items: string[];
};

type Row = {
  iso: string;
  philmont_day: number | null;
  trail_day: number | null;
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
  flags: ItineraryDay["flags"] | null;
  programs: string[] | null;
  gpx_path: string | null;
  gpx_partial: boolean | null;
  gpx_note: string | null;

  // Light table
  twilight: string | null;
  sunrise: string | null;
  sunset: string | null;
  dark: string | null;

  // Schedule
  wake: string | null;
  on_trail: string | null;
  schedule_note: string | null;

  // Rich narrative
  what_to_expect: string | null;
  planned_activities: string[] | null;
  opportunistic_activities: string[] | null;
  crew_notes: string[] | null;
  crew_leader_watch: string[] | null;
  crew_leader_focus: string | null;

  // Meal FK codes
  meal_breakfast: string | null;
  meal_lunch: string | null;
  meal_dinner: string | null;

  // Meal override notes
  meal_breakfast_note: string | null;
  meal_lunch_note: string | null;
  meal_dinner_note: string | null;

};

function rowToDay(r: Row, meals: Map<string, TrailMeal>): ItineraryDayFull {
  return {
    iso: r.iso,
    philmontDay: r.philmont_day,
    trailDay: r.trail_day,
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

    flags: r.flags ?? {},
    programs: r.programs ?? [],

    twilight: r.twilight,
    sunrise: r.sunrise,
    sunset: r.sunset,
    dark: r.dark,
    wake: r.wake,
    onTrail: r.on_trail,
    scheduleNote: r.schedule_note,

    whatToExpect: r.what_to_expect ?? "",
    plannedActivities: r.planned_activities ?? [],
    opportunisticActivities: r.opportunistic_activities ?? [],
    crewNotes: r.crew_notes ?? [],
    crewLeaderWatch: r.crew_leader_watch ?? [],
    crewLeaderFocus: r.crew_leader_focus ?? "",

    mealBreakfast: r.meal_breakfast,
    mealLunch: r.meal_lunch,
    mealDinner: r.meal_dinner,
    mealBreakfastNote: r.meal_breakfast_note,
    mealLunchNote: r.meal_lunch_note,
    mealDinnerNote: r.meal_dinner_note,

    gpx: r.gpx_path
      ? {
          path: r.gpx_path,
          partial: r.gpx_partial ?? false,
          note: r.gpx_note ?? "",
        }
      : null,

    breakfastMeal: r.meal_breakfast ? (meals.get(r.meal_breakfast) ?? null) : null,
    lunchMeal: r.meal_lunch ? (meals.get(r.meal_lunch) ?? null) : null,
    dinnerMeal: r.meal_dinner ? (meals.get(r.meal_dinner) ?? null) : null,
  };
}

export type GpxMeta = { path: string; partial: boolean; note: string };

export type ItineraryDayFull = ItineraryDay & {
  gpx: GpxMeta | null;
  /** Resolved breakfast meal (items list), null when FK is null or no match. */
  breakfastMeal: TrailMeal | null;
  lunchMeal: TrailMeal | null;
  dinnerMeal: TrailMeal | null;
};

async function fetchMealsMap(supabase: ReturnType<typeof buildClient>): Promise<Map<string, TrailMeal>> {
  const map = new Map<string, TrailMeal>();
  const { data, error } = await supabase
    .from("trail_meals")
    .select("code, items");
  if (error) return map; // table not yet created — degrade gracefully
  for (const row of (data ?? []) as { code: string; items: string[] }[]) {
    map.set(row.code, { code: row.code, items: row.items });
  }
  return map;
}

/**
 * Fetch all itinerary days from Supabase, sorted by iso date.
 * Trail meals are fetched separately and merged by FK code.
 * Called from page components at build time (SSG).
 */
export async function getItinerary(): Promise<ItineraryDayFull[]> {
  const supabase = buildClient();
  const [mealsMap, { data, error }] = await Promise.all([
    fetchMealsMap(supabase),
    supabase.from("itinerary_days").select("*").order("iso", { ascending: true }),
  ]);
  if (error) throw new Error(`Failed to load itinerary: ${error.message}`);
  return (data as Row[]).map((r) => rowToDay(r, mealsMap));
}

/** Fetch one day by iso date (YYYY-MM-DD). */
export async function getDayByIso(iso: string): Promise<ItineraryDayFull | null> {
  const supabase = buildClient();
  const [mealsMap, { data, error }] = await Promise.all([
    fetchMealsMap(supabase),
    supabase.from("itinerary_days").select("*").eq("iso", iso).maybeSingle(),
  ]);
  if (error) throw new Error(`Failed to load day ${iso}: ${error.message}`);
  if (!data) return null;
  return rowToDay(data as Row, mealsMap);
}
