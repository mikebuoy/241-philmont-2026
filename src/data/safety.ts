export const ALTITUDE = {
  homeBaseElevation: 1000,
  philmontBaseElevation: 6500,
  trailCampRange: { min: 7132, max: 9698 },
  highPoint: {
    elevation: 12441,
    location: "Baldy Mountain",
    uiLabel: "Trail Day 5",
  },
  amsSymptoms: ["Headache", "Nausea", "Fatigue", "Dizziness"],
  amsNote:
    "AMS can affect anyone regardless of fitness level. Not a toughness issue.",
  defenses: [
    "Arrive hydrated",
    "Keep pack weight in check",
    "Hike at sustainable pace",
    "Eat and drink consistently",
    "Tell crew leader/advisor if symptoms develop — do not push through silently",
  ],
  criticalDescents: [
    {
      uiLabel: "Trail Day 5",
      desc: "Baldy descent",
      lossFt: 5820,
    },
    {
      uiLabel: "Trail Day 11 · Return",
      desc: "Final descent to HQ",
      lossFt: 6870,
    },
  ],
} as const;

export const SMELLABLES = {
  requiredInBearBag: [
    "All food and snacks",
    "Toothpaste and toothbrush",
    "Sunscreen and lip balm",
    "Insect repellent",
    "Soap and shampoo",
    "Trash and food wrappers",
    "Chapstick",
    "Scented lotion or wipes",
    "Any scented medication",
    "Empty food bags",
    "Gum and candy",
    "Feminine hygiene products",
    "Extra batteries",
    "Foot powder",
    "Personal first aid kit",
  ],
  oopsBag: [
    "Today's remaining meals",
    "Yum yum bag",
    "Food strainer and scraper",
    "Trash",
    "Micro-pure tablets",
    "Crew first aid kit",
    "Medicine and inhalers",
    "Unwashed dishes and squishy bowls",
    "Personal smellables needed tonight",
  ],
  prohibitedInBackcountry: [
    "Deodorant — NOT ALLOWED in Philmont backcountry",
  ],
  note: "Philmont ranger staff will check. This is not a suggestion.",
} as const;

export const LIGHTNING = {
  watchFor: [
    "Cumulus clouds building rapidly, especially over peaks and ridges, starting mid-morning",
    "Darkening sky to the west or southwest",
    "Distant thunder — if you hear it, lightning is already close enough to be dangerous",
    "Hair standing up, skin tingling, or metal gear buzzing — get off the ridge immediately",
  ],
  crewRules: [
    "Off Baldy summit by 11:00 AM, no later than 12:00 — no exceptions",
    "Off the Tooth summit and exposed ridge by 11:00 AM, no later than 12:00 — no exceptions",
    "Turn around if weather makes the summit unsafe — there is no negotiating this",
  ],
  position: [
    "Get off exposed ridges, peaks, and open ground",
    "Get away from lone trees, tall objects, wire fences, and metal equipment",
    "Do not shelter under a cliff or in a shallow cave — ground current can travel through rock",
    "Spread the crew out at least 30 feet apart so one strike does not take out multiple people",
    "Lightning position: crouch low on the balls of your feet, feet together, hands over ears — do not lie flat",
    "A lightning victim is not carrying a charge — it is safe to touch them and begin first aid",
  ],
  simpleRule: "If you can hear thunder, you are in the danger zone. Move to lower elevation and away from exposed terrain.",
} as const;

export const EMERGENCY_PROCEDURES = {
  ruleOfFour: "If someone needs help: one person treats the injured, two go for help, one stays with the injured person.",
  commonInjuries: [
    "Sprains and strains — most common backcountry injury",
    "Blisters — almost entirely preventable with early treatment",
    "Acute Mountain Sickness (AMS) — see Altitude section",
    "Dehydration — drink before you feel thirsty",
    "Upper respiratory infections — common at altitude",
    "Gastrointestinal issues — often from improper food handling or water treatment",
  ],
  escalation: [
    "Notify Crew Leader and Lead Advisor early — do not push through silently",
    "Use the crew first aid kit for minor issues; advisor carries the full crew kit",
    "Use staffed camps and radios for serious problems — staff can contact Philmont HQ",
    "For life-safety emergencies: stabilize, send two people for help, one stays with the patient",
  ],
} as const;

export const WILDFIRE_RULES = [
  "Follow all fire restrictions in effect — check with staff at each camp",
  "Use established fire rings only when fires are permitted",
  "Hold a match until it stops smoking, break it, step on it — do not toss matches",
  "Never leave a flame unattended",
  "Report smoke or suspected fire to the nearest staffed camp immediately",
  "Do not attempt to fight a wildfire as a crew",
] as const;

export type Waypoint = {
  name: string;
  elevation: number;
  uiDay: string[];
  type:
    | "base"
    | "trailhead"
    | "program"
    | "dry_camp"
    | "staffed"
    | "summit"
    | "food_pickup"
    | "staffed_food"
    | "conservation";
  note?: string;
};

export const WAYPOINTS: Waypoint[] = [
  { name: "Camping HQ", elevation: 6500, uiDay: ["HQ Day", "Trail Day 11"], type: "base" },
  { name: "Ute Park Trailhead", elevation: 6700, uiDay: ["Trail Day 1"], type: "trailhead", note: "Trek departs here" },
  { name: "Cimarroncita", elevation: 8000, uiDay: ["Trail Day 1"], type: "program", note: "Fire Ecology passthrough" },
  { name: "Santa Claus", elevation: 9200, uiDay: ["Trail Day 2"], type: "dry_camp", note: "NO WATER" },
  { name: "Head of Dean", elevation: 9300, uiDay: ["Trail Day 3"], type: "staffed" },
  { name: "Miranda", elevation: 9400, uiDay: ["Trail Day 4", "Trail Day 6"], type: "program", note: "Bent St. Vrain · Burro pickup Day 6" },
  { name: "French Henry", elevation: 11500, uiDay: ["Trail Day 5"], type: "program", note: "Claude Mining — optional" },
  { name: "Baldy Mountain", elevation: 12441, uiDay: ["Trail Day 5"], type: "summit", note: "Highest point on trek" },
  { name: "Baldy Town", elevation: 11200, uiDay: ["Trail Day 5"], type: "food_pickup", note: "Food resupply" },
  { name: "Pueblano", elevation: 8000, uiDay: ["Trail Day 6"], type: "staffed" },
  { name: "Ponil", elevation: 6700, uiDay: ["Trail Day 7"], type: "staffed_food", note: "Food resupply + burro drop-off" },
  { name: "Sioux", elevation: 7000, uiDay: ["Trail Day 7"], type: "conservation", note: "Trail Building 2:00pm" },
  { name: "Dean Cow", elevation: 7800, uiDay: ["Trail Day 8"], type: "staffed" },
  { name: "Harlan", elevation: 7600, uiDay: ["Trail Day 9"], type: "program", note: "Shotgun passthrough" },
  { name: "Clarks Fork", elevation: 7600, uiDay: ["Trail Day 10"], type: "staffed" },
  { name: "Tooth of Time", elevation: 9003, uiDay: ["Trail Day 11"], type: "summit", note: "Iconic Philmont landmark" },
];

export const BEAR_HANG_STEPS: { title: string; items: string[] }[] = [
  {
    title: "Sort smellables into bags",
    items: [
      "Main bags: everything not needed tonight — food, toiletries, trash, empty bags",
      "Oops bag: tonight's needs only — see the oops bag list; keep it light enough for two people to raise and lower",
      "Each crew member loads personal smellables into their ditty bag",
    ],
  },
  {
    title: "Move to the bear cable",
    items: [
      "Bring all bear bags, both ropes, and the carabiner",
      "Find two trees that do not support the cable for tie-off",
      "Stand on the tie-off side — clear the area below the cable before throwing",
    ],
  },
  {
    title: "Throw the first rope over",
    items: [
      "Loosely coil one rope starting from the center knot",
      "Throw the coiled end over the cable — rope weight is enough, do not add rocks or carabiners",
    ],
  },
  {
    title: "Attach bags with a lark's head",
    items: [
      "Find the center knot; create a loop on one side; reach through, grab the hanging strands, pull your fist out",
      "Twist the top of the bag through the loop; tighten the knot close to the bag",
      "Balance weight on both sides before clipping",
    ],
  },
  {
    title: "Set up the oops line",
    items: [
      "Clip the load-bearing carabiner to the loop",
      "Thread the second rope halfway through the carabiner from the center knot",
      "This line raises and lowers independently — no need to drop all bags to access the oops bag",
    ],
  },
  {
    title: "Raise and tie off",
    items: [
      "Multiple crew members on both loose ends raise the bags together",
      "Wrap the rope around the tie-off tree three times, placing sticks between rope and bark to protect the tree",
      "Coil the remaining rope and slide it under the line — do not tie a knot",
    ],
  },
  {
    title: "Verify before sleep",
    items: [
      "Bags at least 10 feet off the ground and 6 feet from the nearest tree",
      "Every crew member checks packs and pockets for smellables",
    ],
  },
];
