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

export type Meal = {
  code: string;    // e.g. 'B7'
  items: string[];
};

export type ItineraryDay = {
  /** Internal Philmont 1–12 numbering. null for the two pre-trek days. */
  philmontDay: number | null;
  /** Sequential trail day number (1–11). null for non-trail days. */
  trailDay?: number | null;
  /** Free-form description, e.g. "Ute Park to Cimarroncita" */
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
  /** Trail metrics — null for pre-trek + HQ days. */
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

  // ---- Light table (null for travel days Jun 14 + Jun 28) ----
  twilight: string | null;   // civil twilight, e.g. "5:10 AM"
  sunrise: string | null;
  sunset: string | null;
  dark: string | null;

  // ---- Daily schedule (null for non-trail days) ----
  wake: string | null;
  onTrail: string | null;
  scheduleNote: string | null;

  // ---- Rich narrative content ----
  whatToExpect: string;
  plannedActivities: string[];
  opportunisticActivities: string[];
  crewNotes: string[];
  crewLeaderWatch: string[];
  crewLeaderFocus: string;

  // ---- Meals (FK codes seed into DB; notes for non-trail-bag slots) ----
  mealBreakfast: string | null;
  mealLunch: string | null;
  mealDinner: string | null;
  mealBreakfastNote: string | null;
  mealLunchNote: string | null;
  mealDinnerNote: string | null;
};

/** Days with GPX coverage. File served from public/gpx/<iso>.gpx. */
export const GPX_COVERAGE: Record<string, { partial: boolean; note: string }> = {
  "2026-06-18": {
    partial: true,
    note: "Partial coverage — Cimarron River → Mistletoe segment. Trail continues to Santa Claus.",
  },
};

// ---------------------------------------------------------------------------
// Trail meals — one row per Philmont-issued numbered meal bag.
// Multiple itinerary days can share the same code (e.g. B7 on Jun 17 + Jun 27).
// ---------------------------------------------------------------------------
export type TrailMealSeed = {
  code: string;
  type: "breakfast" | "lunch" | "dinner";
  items: string[];
};

export const TRAIL_MEALS: TrailMealSeed[] = [
  // --- Breakfasts ---
  {
    code: "B1",
    type: "breakfast",
    items: [
      "Buffalo Style Chicken Bites",
      "Amazin Goldens Blue Raspberry",
      "Animal Crackers",
      "Kodiak Chewy S'Mores Bar",
      "Strawberry Granola",
      "Skratch Orange Drink Mix",
    ],
  },
  {
    code: "B2",
    type: "breakfast",
    items: [
      "Original Smoked Hickory Snack Stick",
      "Banana Chips",
      "RXBAR Blueberry Protein Bar",
      "Caramel Rice Crisps",
      "Chocolate Granola",
    ],
  },
  {
    code: "B3",
    type: "breakfast",
    items: [
      "Honey Pepper Beef Stick",
      "Instant Oatmeal Maple and Brown Sugar",
      "Snickerdoodle Protein Bar",
      "Almond Sweet and Salty Bar",
      "Sour Berries Dried Cherries and Cranberries",
      "Hot Cocoa Mix",
    ],
  },
  {
    code: "B4",
    type: "breakfast",
    items: [
      "SBR Teriyaki Beef Jerky",
      "Field Stone Granola",
      "Pop Tarts Frosted Cinnamon",
      "HS Waffle GF Salted Caramel",
      "Tropical Treasure Fruit Blend",
    ],
  },
  {
    code: "B5",
    type: "breakfast",
    items: [
      "Honey Pepper Turkey Bites",
      "Whole Berry Blast Meal Bar",
      "Darlington Granola Bites",
      "Welch's Fruit Gummies",
      "Trix Chewy Cereal Bar",
      "Skratch Lemon-Lime Drink Mix",
    ],
  },
  {
    code: "B6",
    type: "breakfast",
    items: [
      "Old #9 Jerky Stick",
      "Amazin Raisin Strawberry",
      "Animal Crackers",
      "Kodiak Crunchy Chocolate Chip Granola Bar",
      "Cinnamon Granola",
    ],
  },
  {
    code: "B7",
    type: "breakfast",
    items: [
      "Sunflower Seed Butter",
      "Belvita Blueberry Breakfast Biscuits",
      "BBQ Beef Bites",
      "Bob's Peanut Butter Banana & Oats Bar",
      "Chocolate Granola",
      "Cran Raspberry Drink Mix",
    ],
  },
  {
    code: "B8",
    type: "breakfast",
    items: [
      "Bold Teriyaki Meat Stick",
      "Apple Cinnamon Bar",
      "Vanilla Waffle",
      "Peanut Butter Cup Protein Bar",
      "Tropical Treasure Fruit Blend",
    ],
  },
  {
    code: "B9",
    type: "breakfast",
    items: [
      "Pepperoni Bites",
      "Original Instant Oatmeal Plain",
      "Pop Tarts Frosted Strawberry Crunchy Poppers",
      "Kashi Chewy Granola Bar",
      "Banana Chips",
      "Sqwincher Watermelon Drink Mix",
    ],
  },
  {
    code: "B10",
    type: "breakfast",
    items: [
      "SBR Sweet N' Spicy Jerky",
      "Bob's Peanut Butter Jelly & Oats Bar",
      "Welch's Fruit Gummies",
      "Blueberry Oat Snack Bar",
      "Cocoa Puffs Cereal Bar",
    ],
  },

  // --- Lunches ---
  {
    code: "L1",
    type: "lunch",
    items: [
      "Saltines",
      "Chunk Chicken Pouch",
      "Cheddar Goldfish",
      "Crunchy Peanut Butter Bar",
      "Antioxidant Trail Mix",
    ],
  },
  {
    code: "L2",
    type: "lunch",
    items: [
      "Graham Crackers",
      "Peanut Butter & Jelly",
      "Sweet BBQ Snack Stick",
      "Salted Sunflower Seeds",
      "Lemon Lime Drink Mix",
    ],
  },
  {
    code: "L3",
    type: "lunch",
    items: [
      "Original Triscuit Crackers",
      "Original Cheese Wedges",
      "Caramel Almond & Sea Salt Bar",
      "Spam",
      "Cajun Style Trail Mix",
    ],
  },
  {
    code: "L4",
    type: "lunch",
    items: [
      "Gluten Free Crackers",
      "Chili Con Queso Cheese Cup",
      "Chocolate Chip Energy Bar",
      "Sea Salt Flavored Corn",
      "Sweet Annie Brown Jerky",
    ],
  },
  {
    code: "L5",
    type: "lunch",
    items: [
      "Chicken In A Biskit Crackers",
      "Sweet & Spicy Tuna",
      "Raspberry and Lemon Energy Bar",
      "Cheez-its",
      "Sweet & Salty Trail Mix",
    ],
  },
  {
    code: "L6",
    type: "lunch",
    items: [
      "Sea Salt Pita Chips",
      "Smoked Gouda Cheese Cup",
      "Strawberry Energy Chews",
      "Pepperoni Sticks",
      "Peanut Butter Chocolate Trail Mix",
    ],
  },
  {
    code: "L7",
    type: "lunch",
    items: [
      "Wheat Thins",
      "Chicken Salad",
      "Chocolate Cherry Cashew Energy Bar",
      "Cheddar Goldfish",
      "Honey Roasted Sunflower Seeds",
    ],
  },
  {
    code: "L8",
    type: "lunch",
    items: [
      "Ritz Crackers",
      "Velveeta Cheese Sauce",
      "Blueberry Almond Energy Bar",
      "Beef Sausage Mini Bites",
      "Hot and Spicy Corn",
    ],
  },
  {
    code: "L9",
    type: "lunch",
    items: [
      "Fire Roasted Tomato Triscuit Crackers",
      "Zesty Lemon Pasta and Beans with Tuna",
      "Pink Lemonade Energy Chews",
      "Cheez-its",
      "Energizer Trail Mix",
    ],
  },
  {
    code: "L10",
    type: "lunch",
    items: [
      "Club Crackers",
      "Pepperjack Cheese Wedges",
      "Beef Salami Slices",
      "Salted Watermelon Energy Chews",
      "Cheddar Flavored Corn",
    ],
  },

  // --- Dinners ---
  {
    code: "D1",
    type: "dinner",
    items: [
      "Beef Stroganoff with Noodles",
      "Goldfish Pretzels",
      "Chocolate Chip Cookies",
    ],
  },
  {
    code: "D2",
    type: "dinner",
    items: [
      "Fettuccine Alfredo with Chicken",
      "Cheddar Cheese Combos",
      "Oreos",
    ],
  },
  {
    code: "D3",
    type: "dinner",
    items: [
      "Loaded Chili Mac",
      "Honey Mustard and Onion Pretzel Pieces",
      "Nutter Butters",
    ],
  },
  {
    code: "D4",
    type: "dinner",
    items: [
      "Four Cheese Mashed Potatoes with Chicken and Soup Mix",
      "Marshmallow Squares",
    ],
  },
  {
    code: "D5",
    type: "dinner",
    items: [
      "Chicken Curry",
      "Cinnamon Graham Goldfish",
      "Hot Buffalo Wings Pretzel Pieces",
    ],
  },
  {
    code: "D7",
    type: "dinner",
    items: [
      "Beef Ramen Noodles with Summer Sausage",
      "Cheddar Pretzel Pieces",
      "Lorna Doone Cookies",
    ],
  },
  {
    code: "D8",
    type: "dinner",
    items: [
      "Spaghetti with Meat Sauce",
      "Pepperoni Pretzel Pieces",
      "Oreos",
    ],
  },
  {
    code: "D9",
    type: "dinner",
    items: [
      "Creamy Tomato Pasta with Chicken",
      "Jalapeño Pretzel Pieces",
      "Cinnamon Graham Goldfish",
    ],
  },
  {
    code: "D10",
    type: "dinner",
    items: [
      "Stuffing Mix with Turkey and Cranberries",
      "Turkey Spam",
      "Chocolate Chip Waffles",
    ],
  },
];

// ---------------------------------------------------------------------------
// Itinerary — source of truth for seed script.
// Pages read from Supabase (getItinerary()); this array seeds the DB.
// ---------------------------------------------------------------------------
export const ITINERARY: ItineraryDay[] = [
  // -------------------------------------------------------------------------
  // Jun 14 — Fly Day
  // -------------------------------------------------------------------------
  {
    philmontDay: null,
    trailDay: null,
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
    flags: {},

    twilight: null,
    sunrise: null,
    sunset: null,
    dark: null,
    wake: "Arrive at Scout hut 4:20 AM",
    onTrail: null,
    scheduleNote: null,

    whatToExpect: "This is a travel and arrival day. The goal is to arrive safely, keep gear together, hydrate, eat, and get sleep. The trek starts before we ever hit the trail because how we handle travel affects the next two weeks.",
    plannedActivities: [
      "Arrive at Scout hut at 4:20 AM to caravan",
      "Arrive at the airport 5:30 AM in Field Uniform",
      "Delta flight departs at 7:30 AM EST",
      "Arrive in Denver, CO at 8:35 AM MST",
      "Pick up two rental vans",
      "Drive to Philmont (~6 hrs with breakfast and lunch stop)",
      "Check in for Stay & Play",
      "Dinner at Philmont Dining Hall",
      "Get settled and start adjusting to altitude",
    ],
    opportunisticActivities: [
      "Light walk around Philmont if time and energy allow",
      "Tooth of Time Traders if open and the schedule allows",
    ],
    crewNotes: [
      "Stay together at the airport, baggage claim, rental pickup, and food stops.",
      "Do not let the first night become a late night. You need sleep before the altitude starts working on you.",
    ],
    crewLeaderWatch: [
      "Lost gear during travel",
      "Scouts scattering during airport stops and van loading",
      "Dehydration and poor sleep on travel day",
      "Crew arriving exhausted because someone stayed up all night",
    ],
    crewLeaderFocus: "Keep the crew together through airport, baggage, vans, and arrival. Assign van groups and gear expectations before departure. Start hydration and sleep discipline on arrival.",

    mealBreakfast: null,
    mealLunch: null,
    mealDinner: null,
    mealBreakfastNote: "Meal on road",
    mealLunchNote: "Meal on road",
    mealDinnerNote: "Base Camp dining hall",
  },

  // -------------------------------------------------------------------------
  // Jun 15 — Acclimation Day
  // -------------------------------------------------------------------------
  {
    philmontDay: null,
    trailDay: null,
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
    flags: {},

    twilight: null,
    sunrise: null,
    sunset: null,
    dark: null,
    wake: null,
    onTrail: null,
    scheduleNote: null,

    whatToExpect: "This is our setup day. We will learn more about Philmont, continue adjusting to altitude, and get medical recheck completed before official Day 1 so Tuesday is less crowded.",
    plannedActivities: [
      "National Scouting Museum — Scouting history, Philmont history, and context for why this place matters",
      "Villa Philmonté, the Phillips mansion — a tour of Waite Phillips' historic home and how Philmont became part of Scouting",
      "Medical recheck during Stay & Play — height and weight check, possible blood pressure check, review of medical forms, and a medication check. Bring all medications in original containers.",
    ],
    opportunisticActivities: [
      "Tooth of Time Traders if time allows",
      "Additional low-key Philmont walking or downtime — do not burn energy today",
    ],
    crewNotes: [
      "Hydrate all day. Altitude starts working on you before the trail does.",
      "If you have an inhaler, EpiPen, allergy medicine, prescription medicine, or other required medication, keep it organized and ready for medical recheck.",
      "Sleep matters tonight.",
    ],
    crewLeaderWatch: [
      "Medical form or medication surprises discovered at recheck",
      "Doing too much today and burning energy before the trek",
      "Late bedtime",
    ],
    crewLeaderFocus: "Keep the day calm. Get medical recheck done. Use the museum and Villa tour to build meaning.",

    mealBreakfast: null,
    mealLunch: null,
    mealDinner: null,
    mealBreakfastNote: "Base Camp dining hall",
    mealLunchNote: "Base Camp dining hall",
    mealDinnerNote: "Base Camp dining hall",
  },

  // -------------------------------------------------------------------------
  // Jun 16 — HQ Day (Philmont Day 1)
  // -------------------------------------------------------------------------
  {
    philmontDay: 1,
    trailDay: null,
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
    flags: {},

    twilight: "5:10 AM",
    sunrise: "5:41 AM",
    sunset: "8:19 PM",
    dark: "8:50 PM",
    wake: "Base Camp schedule",
    onTrail: null,
    scheduleNote: null,

    whatToExpect: "This is the official start. It will feel busy. We will move between check-in stops, confirm paperwork, finish gear issue, get food, complete shakedown, and attend the opening campfire.",
    plannedActivities: [
      "Registration and roster check — Advisor or Lead Advisor handles check-in. All adults 18 and older need photo ID.",
      "Medical recheck if not already completed on Monday",
      "Crew photo",
      "Logistics meeting — Lead Advisor and Crew Leader finalize route, food pickups, bus/trailhead, program, and conservation details. Crew Leader gets the final Crew Leader copy.",
      "Outfitting — crew gear and first food issue at the Mabee Services Building",
      "Shakedown with Ranger — pack review, crew gear review, and excess gear decisions",
      "Leadership meetings — separate sessions for Adult Advisors, Crew Leaders, Chaplain's Aides, and Wilderness Pledge Guías",
      "Religious services at 7:00 PM — attendance is mandatory for all crew members",
      "Opening Campfire — the Philmont Story",
    ],
    opportunisticActivities: [
      "Tooth of Time Traders if the schedule allows",
      "Short Base Camp tour if the Ranger has time",
    ],
    crewNotes: [
      "After shakedown, anything in your pack goes on trail. There is no way to send it back.",
      "The Crew Leader should listen closely in Logistics. The final Crew Leader copy controls the trail plan.",
      "The Opening Campfire means bedtime is late tonight. Plan for it.",
      "Quiet hours at Base Camp are 10:00 PM to 7:00 AM.",
    ],
    crewLeaderWatch: [
      "Extra gear creeping into packs at shakedown",
      "Missing medical form or medication issue discovered at check-in",
      "Not asking questions while the Ranger is available",
      "Late campfire running into quiet hours",
    ],
    crewLeaderFocus: "Stay organized through check-in. Listen carefully in Logistics. Own the final Crew Leader copy. Shakedown decisions are final.",

    mealBreakfast: null,
    mealLunch: null,
    mealDinner: null,
    mealBreakfastNote: "Base Camp dining hall",
    mealLunchNote: "Base Camp dining hall",
    mealDinnerNote: "Base Camp dining hall",
  },

  // -------------------------------------------------------------------------
  // Jun 17 — Trail Day 1 (Philmont Day 2)
  // -------------------------------------------------------------------------
  {
    philmontDay: 2,
    trailDay: 1,
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
    flags: {},

    twilight: "5:10 AM",
    sunrise: "5:41 AM",
    sunset: "8:19 PM",
    dark: "8:50 PM",
    wake: "4:30 AM (or as directed by Ranger)",
    onTrail: "5:30 AM (bus to trailhead)",
    scheduleNote: "Check out of tent city no later than 8:30 AM and report to the Welcome Center at your scheduled departure time.",

    whatToExpect: "This is our first day on trail. The mileage is short, but the goal is not speed. The goal is learning the Philmont way so we can run our own trek safely from Day 4 forward.",
    plannedActivities: [
      "Base Camp breakfast",
      "Bus or transport to Ute Park Trailhead",
      "Hike to Cimarron River",
      "Ranger Training at camp — campsite setup, bear procedures, cooking, cleanup, water treatment, crew jobs, navigation, and trail expectations",
    ],
    opportunisticActivities: [
      "Cimarroncita pass-through — Fire Ecology and Wildlife Conservation program if timing and staff allow",
    ],
    crewNotes: [
      "Do not treat the short mileage as a free day.",
      "Pay attention. The Ranger is training us to be independent.",
      "This is the day to ask questions and fix systems.",
      "First bear bag hang tonight — team effort as we learn.",
    ],
    crewLeaderWatch: [
      "Short mileage causing low focus and sloppy first camp systems",
      "Overpacking food or organizing smellables incorrectly",
      "Sloppy first bear bag and cleanup process",
    ],
    crewLeaderFocus: "Let the Ranger teach, but make the crew do the work. Set duty roster expectations from the first campsite. Practice calm, clean, repeatable systems.",

    mealBreakfast: null,
    mealLunch: "L7",
    mealDinner: "D7",
    mealBreakfastNote: "Base Camp dining hall",
    mealLunchNote: null,
    mealDinnerNote: null,
  },

  // -------------------------------------------------------------------------
  // Jun 18 — Trail Day 2 · Santa Claus (Philmont Day 3) — Dry Camp
  // -------------------------------------------------------------------------
  {
    philmontDay: 3,
    trailDay: 2,
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
    flags: { dryCamp: true },

    twilight: "5:11 AM",
    sunrise: "5:41 AM",
    sunset: "8:20 PM",
    dark: "8:50 PM",
    wake: "4:30 AM",
    onTrail: "5:30 AM",
    scheduleNote: null,

    whatToExpect: "This is the first real climbing day. Santa Claus is a dry camp with no services. We need to carry the right water and get camp systems right.",
    plannedActivities: [
      "Hike to Santa Claus",
      "Continue Ranger coaching on pace, navigation, breaks, water, campsite routine, cooking, cleanup, and bear bags",
      "Dry camp routine",
    ],
    opportunisticActivities: [
      "Quiet trail camp experience",
      "A good night for crew reflection and getting mentally ready for Head of Dean",
    ],
    crewNotes: [
      "Dry camp water planning is required. The Crew Leader and advisors must confirm water plan before leaving the last reliable source.",
      "Carry enough water for tonight and tomorrow morning at minimum.",
      "Expect some crew friction today. It is normal. Keep your attitude under control.",
    ],
    crewLeaderWatch: [
      "Dry camp water planning failure — confirm plan before leaving last reliable source",
      "Altitude and pack fatigue hitting harder than expected",
      "Storming behavior beginning",
    ],
    crewLeaderFocus: "Confirm water before Santa Claus. Watch pace on the first big climb. Use the second Ranger night to tighten systems.",

    mealBreakfast: "B8",
    mealLunch: "L8",
    mealDinner: "D8",
    mealBreakfastNote: null,
    mealLunchNote: null,
    mealDinnerNote: null,
  },

  // -------------------------------------------------------------------------
  // Jun 19 — Trail Day 3 · Head of Dean (Philmont Day 4)
  // -------------------------------------------------------------------------
  {
    philmontDay: 4,
    trailDay: 3,
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
    flags: {},

    twilight: "5:11 AM",
    sunrise: "5:41 AM",
    sunset: "8:20 PM",
    dark: "8:51 PM",
    wake: "4:30 AM",
    onTrail: "5:30 AM",
    scheduleNote: null,

    whatToExpect: "This is the transition from Ranger-led startup to crew-led expedition. Head of Dean gives us a challenge course program. The bigger test is whether we can now run the trek ourselves.",
    plannedActivities: [
      "Hike to Head of Dean",
      "Challenge Course Program — team problem-solving, initiative games, communication, and trust-building",
      "Run camp as a crew after Ranger release",
    ],
    opportunisticActivities: [
      "Advisor coffee if available and timing allows",
    ],
    crewNotes: [
      "Once the Ranger leaves, the Crew Leader leads. Advisors advise. Everyone owns their job and role.",
      "This is a likely Storming day — tired people, early chores, new systems, and leadership pressure. Stay steady.",
    ],
    crewLeaderWatch: [
      "Advisor accidentally replacing Crew Leader after Ranger leaves",
      "Crew treating Ranger departure as freedom from standards",
      "Camp chores taking too long for the first solo night",
    ],
    crewLeaderFocus: "Crew Leader transitions to real command after Ranger release. Use challenge course to build trust and communication. Short evening debrief.",

    mealBreakfast: "B9",
    mealLunch: "L9",
    mealDinner: "D9",
    mealBreakfastNote: null,
    mealLunchNote: null,
    mealDinnerNote: null,
  },

  // -------------------------------------------------------------------------
  // Jun 20 — Trail Day 4 · Black Horse Creek (Philmont Day 5)
  // -------------------------------------------------------------------------
  {
    philmontDay: 5,
    trailDay: 4,
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
    flags: {},

    twilight: "5:11 AM",
    sunrise: "5:42 AM",
    sunset: "8:20 PM",
    dark: "8:51 PM",
    wake: "4:30 AM",
    onTrail: "5:30 AM",
    scheduleNote: null,

    whatToExpect: "This is a move toward Baldy country. We pass Miranda and prepare for the biggest summit day of the trek. Tonight is Baldy prep night.",
    plannedActivities: [
      "Hike to Black Horse Creek",
      "Baldy Hike Prep at Black Horse Creek — check route, water, layers, rain gear, timing, and turnaround rules for Baldy summit",
    ],
    opportunisticActivities: [
      "Miranda pass-through — Bent, St. Vrain & Company Fur Trading Program",
    ],
    crewNotes: [
      "Do not spend so much time at Miranda that we damage Baldy prep.",
      "Baldy day starts tonight — water, gear, food, layers, and sleep matter.",
      "Eat a full dinner. Get to sleep early. Extra early wake up time for Baldy summit.",
    ],
    crewLeaderWatch: [
      "Spending too long at Miranda pass-through",
      "Loose or incomplete Baldy plan",
      "Under-eating before summit day",
    ],
    crewLeaderFocus: "Arrive at Black Horse Creek with time for Baldy prep. Confirm water, route, clothing, snacks, rain gear, and turnaround standard. Protect sleep.",

    mealBreakfast: "B10",
    mealLunch: "L10",
    mealDinner: "D10",
    mealBreakfastNote: null,
    mealLunchNote: null,
    mealDinnerNote: null,
  },

  // -------------------------------------------------------------------------
  // Jun 21 — Trail Day 5 · Baldy Summit + Layover (Philmont Day 6)
  // -------------------------------------------------------------------------
  {
    philmontDay: 6,
    trailDay: 5,
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
    flags: { summit: true },

    twilight: "5:11 AM",
    sunrise: "5:42 AM",
    sunset: "8:21 PM",
    dark: "8:51 PM",
    wake: "3:45–4:00 AM — earlier for Baldy",
    onTrail: "5:30 AM",
    scheduleNote: "Crew rule: off Baldy summit by 11:00 AM, no later than 12:00. Weather timing drives the decision.",

    whatToExpect: "This is Baldy day. Baldy Mountain stands at 12,441 feet. It is a layover camp, but not a rest day. We summit and return to Black Horse Creek. Weather timing is the main planning factor. There is no tree cover above timberline.",
    plannedActivities: [
      "Baldy Mountain summit — 12,441 ft",
      "Baldy Town food pickup on the route",
      "Return to Black Horse Creek",
    ],
    opportunisticActivities: [
      "French Henry — Claude Mining & Milling Company program if timing, staff, and weather allow",
      "Baldy Town — Baldy Mining District Program and shower if timing allows",
    ],
    crewNotes: [
      "Crew rule: off Baldy summit by 11:00 AM, no later than 12:00.",
      "No summit is worth a weather mistake. Crew Leader and advisors must be willing to turn around.",
      "Watch everyone for altitude symptoms above 10,000 feet — headache, nausea, confusion, unusual fatigue. Stay hydrated and fueled.",
      "We move as a crew. We summit as a crew. We stay safe as a crew.",
    ],
    crewLeaderWatch: [
      "Late start above timberline",
      "Lightning exposure above tree line",
      "Summit fever overriding judgment",
      "Food pickup timing at Baldy Town",
    ],
    crewLeaderFocus: "Move early. Keep the crew together. Keep stops short. Monitor weather. Make summit decisions based on safety, not pride. Crew rule: off Baldy summit by 11:00 AM, no later than 12:00.",

    mealBreakfast: "B1",
    mealLunch: "L1",
    mealDinner: "D1",
    mealBreakfastNote: null,
    mealLunchNote: null,
    mealDinnerNote: null,
  },

  // -------------------------------------------------------------------------
  // Jun 22 — Trail Day 6 · Pueblano (Philmont Day 7)
  // -------------------------------------------------------------------------
  {
    philmontDay: 7,
    trailDay: 6,
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
    flags: { burroPickup: true },

    twilight: "5:11 AM",
    sunrise: "5:42 AM",
    sunset: "8:21 PM",
    dark: "8:51 PM",
    wake: "4:30 AM",
    onTrail: "5:30 AM",
    scheduleNote: null,

    whatToExpect: "This is burro pickup and Pueblano day. We leave Baldy country, pick up our burro at Miranda Burro Pens, and arrive at one of Philmont's classic logging camps.",
    plannedActivities: [
      "Pick up burro at Miranda Burro Pens",
      "Hike to Pueblano",
      "Continental Tie & Lumber Company Program — logging history, crosscut saws, tie making, and camp culture",
      "Campfire Show",
    ],
    opportunisticActivities: [
      "Miranda pass-through moments if timing allows",
    ],
    crewNotes: [
      "Burro day changes pace. The crew must stay patient and work together with the burro.",
      "Burro gear, loading, and control are crew responsibilities. Ask staff at Miranda how they want us to handle this.",
    ],
    crewLeaderWatch: [
      "Burro frustration slowing the crew and morale",
      "Burro slowing overall pace more than planned",
      "Gear not secured correctly on burro",
    ],
    crewLeaderFocus: "Manage burro pickup calmly. Assign burro handlers. Arrive at Pueblano ready for program and campfire.",

    mealBreakfast: "B2",
    mealLunch: "L2",
    mealDinner: "D2",
    mealBreakfastNote: null,
    mealLunchNote: null,
    mealDinnerNote: null,
  },

  // -------------------------------------------------------------------------
  // Jun 23 — Trail Day 7 · Ponil (Philmont Day 8)
  // -------------------------------------------------------------------------
  {
    philmontDay: 8,
    trailDay: 7,
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
    flags: { burroDropoff: true, conservation: true },

    twilight: "5:12 AM",
    sunrise: "5:42 AM",
    sunset: "8:21 PM",
    dark: "8:52 PM",
    wake: "4:30 AM",
    onTrail: "5:30 AM",
    scheduleNote: "Time-critical day. Sioux conservation must start at 2:00 PM. Ponil food pickup and evening program depend on hitting this window.",

    whatToExpect: "This is the logistics-crunch day. We need to move well, drop off the burro, complete conservation at Sioux at 2:00 PM, pick up food at Ponil, and still enjoy the Ponil campfire show.",
    plannedActivities: [
      "Drop off burro at Ponil",
      "Conservation at Sioux, 2:00 PM — New Trail Construction. Real trail work with tools and direction from conservation staff.",
      "Food pickup at Ponil",
      "Philturn Five Points Camp Program — ranching and Western camp life",
      "Cantina",
      "Campfire Show",
    ],
    opportunisticActivities: [
      "Ponil trading post or advisor coffee if available and timing allows",
    ],
    crewNotes: [
      "Conservation at Sioux is at 2:00 PM. Late start equals missed conservation.",
      "Conservation work is required for the Arrowhead Award. Arrive ready to work.",
      "This is a must-hit schedule day.",
    ],
    crewLeaderWatch: [
      "Late start cascading into missed conservation at 2:00 PM",
      "Burro drop-off at Ponil causing delays",
      "Trying to do everything without watching the clock",
    ],
    crewLeaderFocus: "This is the logistics crunch day. Move with urgency from wake-up. Hit Sioux conservation at 2:00 PM. Protect Ponil food pickup and evening program.",

    mealBreakfast: "B3",
    mealLunch: "L3",
    mealDinner: "D3",
    mealBreakfastNote: null,
    mealLunchNote: null,
    mealDinnerNote: null,
  },

  // -------------------------------------------------------------------------
  // Jun 24 — Trail Day 8 · Dean Cow (Philmont Day 9)
  // -------------------------------------------------------------------------
  {
    philmontDay: 9,
    trailDay: 8,
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
    flags: {},

    twilight: "5:12 AM",
    sunrise: "5:43 AM",
    sunset: "8:21 PM",
    dark: "8:52 PM",
    wake: "4:30 AM",
    onTrail: "5:30 AM",
    scheduleNote: null,

    whatToExpect: "This is a hard hiking day followed by rock climbing. We need an early start so the crew arrives with energy and enough time for the program. Rock climbing is staff-supervised at Dean Cow, which is one of Philmont's designated climbing camps.",
    plannedActivities: [
      "Hike to Dean Cow",
      "Rock Climbing Program — staff-supervised climbing, helmets, harnesses, and safety systems",
    ],
    opportunisticActivities: [
      "Advisor coffee if available",
    ],
    crewNotes: [
      "Arriving late can cut into climbing time. Move early and efficiently.",
      "Eat and drink during the hike. Do not save everything for camp.",
    ],
    crewLeaderWatch: [
      "Arriving too late for climbing program",
      "Post-Ponil sluggishness from conservation day",
      "Blisters and foot problems showing up in force",
    ],
    crewLeaderFocus: "Early movement to protect rock climbing time. Monitor fatigue after conservation day. Keep water and food intake steady.",

    mealBreakfast: "B4",
    mealLunch: "L4",
    mealDinner: "D4",
    mealBreakfastNote: null,
    mealLunchNote: null,
    mealDinnerNote: null,
  },

  // -------------------------------------------------------------------------
  // Jun 25 — Trail Day 9 · Vaca (Philmont Day 10)
  // -------------------------------------------------------------------------
  {
    philmontDay: 10,
    trailDay: 9,
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
    flags: { longestDay: true },

    twilight: "5:12 AM",
    sunrise: "5:43 AM",
    sunset: "8:21 PM",
    dark: "8:52 PM",
    wake: "4:30 AM",
    onTrail: "5:30 AM",
    scheduleNote: null,

    whatToExpect: "This is one of the biggest mileage and elevation days after Baldy. Vaca is a trail camp, so the crew must be ready to take care of itself.",
    plannedActivities: [
      "Hike to Vaca",
      "Trail camp routine at Vaca",
    ],
    opportunisticActivities: [
      "Harlan pass-through — Shotgun Program if timing, staff, and safety allow. Expect supervised shotgun shooting with strict range rules.",
    ],
    crewNotes: [
      "Do not let the Harlan program create a late arrival problem. If the timing does not work cleanly, keep moving.",
      "This is a day to watch feet, knees, hydration, and attitude.",
      "10.0 miles with 4,050 feet of gain. Eat more than you think you need. Drink more than you think you need.",
    ],
    crewLeaderWatch: [
      "Harlan shotgun program temptation creating late arrival at Vaca",
      "Long day fatigue",
      "Trail camp chores after a hard day",
    ],
    crewLeaderFocus: "Treat this as a major hiking day. Only take Harlan shotgun opportunity if it does not compromise safe arrival. Watch feet, knees, mood, and hydration.",

    mealBreakfast: "B5",
    mealLunch: "L5",
    mealDinner: "D5",
    mealBreakfastNote: null,
    mealLunchNote: null,
    mealDinnerNote: null,
  },

  // -------------------------------------------------------------------------
  // Jun 26 — Trail Day 10 · Clarks Fork (Philmont Day 11)
  // -------------------------------------------------------------------------
  {
    philmontDay: 11,
    trailDay: 10,
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
    flags: {},

    twilight: "5:13 AM",
    sunrise: "5:43 AM",
    sunset: "8:22 PM",
    dark: "8:52 PM",
    wake: "4:30 AM",
    onTrail: "5:30 AM",
    scheduleNote: null,

    whatToExpect: "This is the final staffed backcountry camp. Clarks Fork is a reward day if we move well and arrive with time to enjoy it.",
    plannedActivities: [
      "Hike to Clarks Fork",
      "Western Lore Program — cowboy skills, ranching history, branding, roping, and Western camp culture",
      "Chuckwagon Dinner",
      "Campfire Show",
    ],
    opportunisticActivities: [
      "Showers may be available",
      "Advisor coffee if available",
    ],
    crewNotes: [
      "Tonight is also prep for Tooth day. Pack smart, sleep early, and lock in water plans.",
      "Treat sunset as bedtime. The campfire ends when it ends. Get to sleep as soon as possible after.",
    ],
    crewLeaderWatch: [
      "Getting casual because the end feels close",
      "Poor prep for the hardest final day",
      "Late night at campfire affecting Tooth day wake-up",
    ],
    crewLeaderFocus: "Arrive early enough for Western Lore and dinner. Lock in Tooth day plan before bed. Make sunset the bedtime target.",

    mealBreakfast: "B6",
    mealLunch: "L6",
    mealDinner: null,
    mealBreakfastNote: null,
    mealLunchNote: null,
    mealDinnerNote: "Chuckwagon Dinner at Clarks Fork",
  },

  // -------------------------------------------------------------------------
  // Jun 27 — Trail Day 11 · Tooth of Time (Philmont Day 12)
  // -------------------------------------------------------------------------
  {
    philmontDay: 12,
    trailDay: 11,
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
    flags: { hardestDescent: true },

    twilight: "5:13 AM",
    sunrise: "5:44 AM",
    sunset: "8:22 PM",
    dark: "8:52 PM",
    wake: "3:30–4:00 AM — earlier for Tooth of Time",
    onTrail: "5:35 AM",
    scheduleNote: "Summit Tooth early and get off exposed areas by 11:00 AM.",

    whatToExpect: "This is the big finish. It is the longest official mileage day and the largest listed elevation gain and loss of the trek. We climb the Tooth of Time and hike into Base Camp.",
    plannedActivities: [
      "Tooth of Time summit — 9,003 ft",
      "Hike into Base Camp",
      "Closing Campfire",
    ],
    opportunisticActivities: [
      "Crew photo moments at the Tooth and the final approach, only if weather and safety allow",
      "Tooth of Time Traders if time allows after arriving at Base Camp",
    ],
    crewNotes: [
      "Crew rule: be off the Tooth summit and exposed ridge by 11:00 AM, no later than 12:00.",
      "This is not a victory lap until we are safely in Base Camp. Stay together and keep eating and drinking.",
      "12.8 miles. After 11 days of trail, legs and feet will hurt. Keep moving.",
      "Plan to arrive mid-afternoon — crew stays together through check-in and gear staging at Camping Headquarters before anyone wanders off.",
    ],
    crewLeaderWatch: [
      "Underestimating Tooth day — it is the longest mileage day",
      "Weather on the Tooth Ridge",
      "Separation on the final descent",
      "Letting celebration replace safety discipline",
    ],
    crewLeaderFocus: "Start very early. Keep the crew tight. Summit Tooth early and get off exposed areas by 11:00 AM. Keep eating and drinking through the finish.",

    mealBreakfast: "B7",
    mealLunch: "L7",
    mealDinner: null,
    mealBreakfastNote: null,
    mealLunchNote: null,
    mealDinnerNote: "Base Camp dining hall",
  },

  // -------------------------------------------------------------------------
  // Jun 28 — Post-Trek · Fly Home
  // -------------------------------------------------------------------------
  {
    philmontDay: null,
    trailDay: null,
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
    flags: {},

    twilight: null,
    sunrise: null,
    sunset: null,
    dark: null,
    wake: "Base Camp schedule",
    onTrail: null,
    scheduleNote: null,

    whatToExpect: "Travel-home day. We leave tired, proud, and probably ready for real food and a real shower.",
    plannedActivities: [
      "Breakfast at Base Camp dining hall",
      "Gear return — return all Philmont-issued equipment before departure. Missing or damaged gear is billed to the crew.",
      "Pick up any held mail at the Mail Room",
      "Trek award distribution — Arrowhead, Tooth of Time patch, and other recognition",
      "Tooth of Time Traders if time allows",
      "Load vans and travel home",
    ],
    opportunisticActivities: [
      "Tooth of Time Traders if schedule allows",
    ],
    crewNotes: [
      "Check for lost gear before leaving Philmont.",
      "Be patient. Everyone will be tired.",
      "The trip is not over until everyone is home safely.",
    ],
    crewLeaderWatch: [
      "Lost gear at Base Camp",
      "Tired crew behavior in airports and vans",
      "Assuming the trip is over before everyone is home",
    ],
    crewLeaderFocus: "Keep the crew together through breakfast, packing, vans, and airports. Check for gear before leaving Philmont.",

    mealBreakfast: null,
    mealLunch: null,
    mealDinner: null,
    mealBreakfastNote: "Base Camp dining hall",
    mealLunchNote: "Meal on road",
    mealDinnerNote: null,
  },
];
