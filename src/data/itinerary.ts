export type CampType =
  | "travel"
  | "acclimation"
  | "base"
  | "trail"
  | "staffed"
  | "dry"
  | "layover";

/** Convert an ISO date (YYYY-MM-DD) into a friendly slug (jun-14, jun-27, etc.). */
const MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];
export function isoToSlug(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${MONTHS[Number(m) - 1]}-${String(Number(d))}`;
}

export type ItineraryDay = {
  /** Internal Philmont 1–12 numbering. null for the two pre-trek days. */
  philmontDay: number | null;
  /** UI day label, e.g. "Trail Day 1", "HQ Day", "Acclimation Day", "Fly Day" */
  label: string;
  /** Long-form date for headers */
  date: string;
  /** Short-form date for cards */
  dateShort: string;
  /** Weekday */
  weekday: string;
  /** ISO date string for sorting and date math */
  iso: string;
  /** Camp / location */
  camp: string;
  /** Camp type — drives badge color */
  type: CampType;
  /** Trail metrics — null for pre-trek + HQ days. P1 surfaces these. */
  miles: number | null;
  gain: number | null;
  loss: number | null;
  cumMiles: number | null;
  cumGain: number | null;
  cumLoss: number | null;
  /** Approx elevation at camp, in ft */
  elevation: number | null;
  /** Food pickup location, if any */
  foodPickup: string | null;
  /** Programs and events */
  programs: string[];
  /** Free-text notes */
  notes: string;
  /** Critical flags surface visual emphasis on the day card */
  flags: {
    dryCamp?: boolean;
    burroPickup?: boolean;
    burroDropoff?: boolean;
    summit?: boolean;
    conservation?: boolean;
    longestDay?: boolean;
    hardestDescent?: boolean;
  };
};

/** Days with GPX coverage. File served from public/gpx/<iso>.gpx. */
export const GPX_COVERAGE: Record<string, { partial: boolean; note: string }> = {
  "2026-06-18": {
    partial: true,
    note: "Partial coverage — Cimarron River → Mistletoe segment. Trail continues to Santa Claus.",
  },
};

export const ITINERARY: ItineraryDay[] = [
  {
    philmontDay: null,
    label: "Fly Day",
    date: "Sunday, June 14, 2026",
    dateShort: "Jun 14",
    weekday: "Sun",
    iso: "2026-06-14",
    camp: "Travel · Home → New Mexico",
    type: "travel",
    miles: null,
    gain: null,
    loss: null,
    cumMiles: null,
    cumGain: null,
    cumLoss: null,
    elevation: null,
    foodPickup: null,
    programs: [],
    notes:
      "Hydrate on the plane — cabin air is extremely dry. Avoid alcohol. Being well-hydrated before stepping off at 6,500 ft makes a real difference on Day 1.",
    flags: {},
  },
  {
    philmontDay: null,
    label: "Acclimation Day",
    date: "Monday, June 15, 2026",
    dateShort: "Jun 15",
    weekday: "Mon",
    iso: "2026-06-15",
    camp: "Phillips Museum",
    type: "acclimation",
    miles: null,
    gain: null,
    loss: null,
    cumMiles: null,
    cumGain: null,
    cumLoss: null,
    elevation: null,
    foodPickup: null,
    programs: ["Phillips Museum visit"],
    notes: "Light activity. Hydrate. Adjust to elevation.",
    flags: {},
  },
  {
    philmontDay: 1,
    label: "HQ Day",
    date: "Tuesday, June 16, 2026",
    dateShort: "Jun 16",
    weekday: "Tue",
    iso: "2026-06-16",
    camp: "Camping HQ",
    type: "base",
    miles: 0,
    gain: 0,
    loss: 0,
    cumMiles: 0,
    cumGain: 0,
    cumLoss: 0,
    elevation: 6500,
    foodPickup: "HQ",
    programs: ["Opening Campfire"],
    notes: "Gear issue, food pickup, crew gear distribution.",
    flags: {},
  },
  {
    philmontDay: 2,
    label: "Trail Day 1",
    date: "Wednesday, June 17, 2026",
    dateShort: "Jun 17",
    weekday: "Wed",
    iso: "2026-06-17",
    camp: "Cimarron River",
    type: "trail",
    miles: 2.2,
    gain: 580,
    loss: 640,
    cumMiles: 2.2,
    cumGain: 580,
    cumLoss: 640,
    elevation: 7132,
    foodPickup: null,
    programs: [
      "Ranger Training",
      "Fire Ecology & Wildlife Conservation @ Cimarroncita (passthrough)",
    ],
    notes: "Departs Ute Park Trailhead. First trail day.",
    flags: {},
  },
  {
    philmontDay: 3,
    label: "Trail Day 2",
    date: "Thursday, June 18, 2026",
    dateShort: "Jun 18",
    weekday: "Thu",
    iso: "2026-06-18",
    camp: "Santa Claus",
    type: "dry",
    miles: 5.6,
    gain: 3060,
    loss: 1870,
    cumMiles: 7.8,
    cumGain: 3640,
    cumLoss: 2510,
    elevation: 9200,
    foodPickup: null,
    programs: [],
    notes:
      "DRY CAMP — no water source. Cook and eat dinner at last water source during lunch stop. Cold lunch bag eaten as camp dinner. No-cook breakfast next morning. Carry 1–2L water in.",
    flags: { dryCamp: true },
  },
  {
    philmontDay: 4,
    label: "Trail Day 3",
    date: "Friday, June 19, 2026",
    dateShort: "Jun 19",
    weekday: "Fri",
    iso: "2026-06-19",
    camp: "Head of Dean",
    type: "staffed",
    miles: 4.0,
    gain: 1440,
    loss: 1150,
    cumMiles: 11.8,
    cumGain: 5080,
    cumLoss: 3660,
    elevation: 9300,
    foodPickup: null,
    programs: ["Challenge Course Program"],
    notes: "First staffed camp.",
    flags: {},
  },
  {
    philmontDay: 5,
    label: "Trail Day 4",
    date: "Saturday, June 20, 2026",
    dateShort: "Jun 20",
    weekday: "Sat",
    iso: "2026-06-20",
    camp: "Black Horse Creek",
    type: "trail",
    miles: 5.2,
    gain: 2520,
    loss: 1580,
    cumMiles: 17.0,
    cumGain: 7600,
    cumLoss: 5240,
    elevation: 9500,
    foodPickup: null,
    programs: [
      "Bent, St. Vrain & Company @ Miranda (passthrough)",
      "Baldy Hike Prep",
    ],
    notes: "Baldy summit tomorrow — prep crew tonight.",
    flags: {},
  },
  {
    philmontDay: 6,
    label: "Trail Day 5",
    date: "Sunday, June 21, 2026",
    dateShort: "Jun 21",
    weekday: "Sun",
    iso: "2026-06-21",
    camp: "Black Horse Creek (layover)",
    type: "layover",
    miles: 9.1,
    gain: 5820,
    loss: 5820,
    cumMiles: 26.1,
    cumGain: 13420,
    cumLoss: 11060,
    elevation: 9500,
    foodPickup: "Baldy Town",
    programs: [
      "Baldy Mountain Summit — 12,441 ft",
      "Claude Mining & Milling Company @ French Henry (optional)",
      "Baldy Mining District @ Baldy Town (passthrough)",
    ],
    notes:
      "Highest point on trek. Mileage/elevation assumes no optional routes taken. Layover — same camp as Day 4.",
    flags: { summit: true },
  },
  {
    philmontDay: 7,
    label: "Trail Day 6",
    date: "Monday, June 22, 2026",
    dateShort: "Jun 22",
    weekday: "Mon",
    iso: "2026-06-22",
    camp: "Pueblano",
    type: "staffed",
    miles: 7.3,
    gain: 2370,
    loss: 4000,
    cumMiles: 33.4,
    cumGain: 15790,
    cumLoss: 15060,
    elevation: 8000,
    foodPickup: null,
    programs: [
      "Pick up burro @ Miranda Burro Pens",
      "Continental Tie & Lumber Company",
      "Campfire Show",
    ],
    notes: "BURRO PICKUP. Mandatory — this is a burro packing itinerary.",
    flags: { burroPickup: true },
  },
  {
    philmontDay: 8,
    label: "Trail Day 7",
    date: "Tuesday, June 23, 2026",
    dateShort: "Jun 23",
    weekday: "Tue",
    iso: "2026-06-23",
    camp: "Ponil",
    type: "staffed",
    miles: 8.2,
    gain: 3030,
    loss: 3980,
    cumMiles: 41.6,
    cumGain: 18820,
    cumLoss: 19040,
    elevation: 6700,
    foodPickup: "Ponil",
    programs: [
      "Drop off burro @ Ponil",
      "Trail Building — New Trail Construction @ Sioux 2:00pm",
      "Philturn Five Points",
      "Cantina",
      "Campfire Show",
    ],
    notes:
      "BURRO DROP-OFF. Conservation project 2:00pm. Showers may be available.",
    flags: { burroDropoff: true, conservation: true },
  },
  {
    philmontDay: 9,
    label: "Trail Day 8",
    date: "Wednesday, June 24, 2026",
    dateShort: "Jun 24",
    weekday: "Wed",
    iso: "2026-06-24",
    camp: "Dean Cow",
    type: "staffed",
    miles: 8.1,
    gain: 3460,
    loss: 3340,
    cumMiles: 49.7,
    cumGain: 22280,
    cumLoss: 22380,
    elevation: 7800,
    foodPickup: null,
    programs: ["Rock Climbing Program"],
    notes: "Showers may be available.",
    flags: {},
  },
  {
    philmontDay: 10,
    label: "Trail Day 9",
    date: "Thursday, June 25, 2026",
    dateShort: "Jun 25",
    weekday: "Thu",
    iso: "2026-06-25",
    camp: "Vaca",
    type: "trail",
    miles: 10.0,
    gain: 4050,
    loss: 3890,
    cumMiles: 59.7,
    cumGain: 26330,
    cumLoss: 26270,
    elevation: 7500,
    foodPickup: null,
    programs: ["Shotgun Program @ Harlan (passthrough)"],
    notes: "Longest mileage day except final day. Strong day.",
    flags: { longestDay: true },
  },
  {
    philmontDay: 11,
    label: "Trail Day 10",
    date: "Friday, June 26, 2026",
    dateShort: "Jun 26",
    weekday: "Fri",
    iso: "2026-06-26",
    camp: "Clarks Fork",
    type: "staffed",
    miles: 7.7,
    gain: 2630,
    loss: 2510,
    cumMiles: 67.4,
    cumGain: 28960,
    cumLoss: 28780,
    elevation: 7600,
    foodPickup: null,
    programs: ["Western Lore Program", "Chuckwagon Dinner", "Campfire Show"],
    notes: "Showers may be available.",
    flags: {},
  },
  {
    philmontDay: 12,
    label: "Trail Day 11 · Return",
    date: "Saturday, June 27, 2026",
    dateShort: "Jun 27",
    weekday: "Sat",
    iso: "2026-06-27",
    camp: "Tooth of Time → Camping HQ",
    type: "base",
    miles: 12.8,
    gain: 6040,
    loss: 6870,
    cumMiles: 80.2,
    cumGain: 35000,
    cumLoss: 35650,
    elevation: 6500,
    foodPickup: null,
    programs: ["Tooth of Time — 9,003 ft", "Hike in to Base", "Closing Campfire"],
    notes:
      "Longest and hardest day. 6,870 ft of descent. Ankle support critical.",
    flags: { hardestDescent: true },
  },
  {
    philmontDay: null,
    label: "Post-Trek · Fly Home",
    date: "Sunday, June 28, 2026",
    dateShort: "Jun 28",
    weekday: "Sun",
    iso: "2026-06-28",
    camp: "Philmont → Golden Corral → Home",
    type: "travel",
    miles: null,
    gain: null,
    loss: null,
    cumMiles: null,
    cumGain: null,
    cumLoss: null,
    elevation: null,
    foodPickup: null,
    programs: ["Golden Corral AYCE — eat everything"],
    notes:
      "Depart Philmont. Stop at Golden Corral for the traditional all-you-can-eat post-trek meal. Fly home.",
    flags: {},
  },
];
