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
    "Toothpaste and floss",
    "Sunscreen and lip balm",
    "Insect repellent",
    "Soap and hand sanitizer",
    "Trash and food wrappers",
    "Chapstick",
    "Scented lotion or wipes",
    "Any scented medication",
    "Empty food bags",
    "Gum and candy",
  ],
  prohibitedInBackcountry: [
    "Deodorant — NOT ALLOWED in Philmont backcountry",
  ],
  note: "Philmont ranger staff will check. This is not a suggestion.",
} as const;

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
