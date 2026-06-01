export type BreakType = {
  name: string;
  duration: string;
  rules: string[];
};

export const BREAK_TYPES: BreakType[] = [
  {
    name: "2-minute break",
    duration: "2 min",
    rules: [
      "Standing rest only — packs stay on",
      "Water and a quick snack",
      "No sitting, no pack removal",
      "Crew Leader calls it and restarts it",
    ],
  },
  {
    name: "20-minute break",
    duration: "20 min",
    rules: [
      "Packs off, real rest, real food",
      "Set a timer the moment the break starts",
      "Call a 2-minute warning so everyone has packs on and is ready",
      "The break ends when the Crew Leader says it ends — not when the last person decides to stand up",
      "Whoever calls the break owns the restart",
    ],
  },
];

export const CATERPILLAR_DESC = {
  whenToUse: "When the crew starts to struggle or spread out on a steep ascent.",
  howItWorks: [
    "The lead hiker steps to the side of the trail when they start to struggle",
    "The second hiker steps up, becomes the new leader, hikes 20–30 feet, then also steps aside",
    "The rotation continues down the line",
    "When the last person passes the original leader, that hiker rejoins at the back — cycle repeats",
  ],
  whyItWorks: "Stopping and restarting builds lactic acid and costs more energy than continuous slow movement. The caterpillar gives each hiker a standing rest while the line passes, keeps the crew condensed on hard terrain, and prevents anyone from getting dropped or separated on a climb.",
  videoUrl: "https://www.youtube.com/watch?v=pMxiJsJUjM0",
  videoLabel: "Caterpillar Hiking — Scouting America · Patriots' Path Council (YouTube)",
} as const;

export const NAVIGATION_RULES = [
  "Orient the map before leaving camp, at every junction, and any time you're unsure — never navigate from an unoriented map",
  "Identify junctions on the map before you reach them — the Navigator reads ahead, not in the moment",
  "Stop when confused. Never guess a junction — a wrong turn costs the crew an hour.",
  "Before moving out, ask 'Is anybody not ready?' — a single 'no' gets missed in a chorus of 'yes'",
  "Keep spacing to 8–10 feet — together enough to stay as a unit, spread enough to catch a wrong turn at a junction",
  "Map lives in a hip belt pocket or top lid — not buried in the pack",
] as const;

export const MAP_ORIENTATION_STEPS: { title: string; items: string[] }[] = [
  {
    title: "Set declination compensation",
    items: [
      "Turn the compass dial to align 352° with the base plate arrow",
      "Philmont's declination is 8° east — leave this setting for the entire trek",
    ],
  },
  {
    title: "Align compass to map",
    items: [
      "Place the compass on the map with the base plate aligned to the lines of longitude",
    ],
  },
  {
    title: "Rotate until red in the shed",
    items: [
      "Turn the map (with compass on it) until the red magnetic needle points to the N on the dial",
      "The map now matches your actual surroundings — use it to decide which trail to take",
    ],
  },
];

export const TRIANGULATION_STEPS: { title: string; items: string[] }[] = [
  {
    title: "Orient the map",
    items: [
      "Red in the shed before anything else — triangulation only works on an oriented map",
    ],
  },
  {
    title: "Shoot a bearing to a landmark",
    items: [
      "Point the compass at a distinct, identifiable feature you can also find on the map — a peak, a mesa",
      "Turn the dial until the red needle aligns with the shed",
      "Read the bearing off the dial (example: Baldy Mountain at 200°)",
    ],
  },
  {
    title: "Draw the line on the map",
    items: [
      "Place a corner of the compass on the landmark's location on the map",
      "Rotate the compass until the magnetic needle aligns with the shed",
      "Draw a line from the landmark along the compass edge — you're somewhere on this line",
    ],
  },
  {
    title: "Shoot two more bearings",
    items: [
      "Repeat with two more identifiable landmarks",
      "Where two lines intersect is your approximate position",
      "A third bearing creates a triangle — the smaller the triangle, the better your fix",
    ],
  },
];

export const CONTOUR_LINE_RULES = [
  "Contour lines show elevation — lines close together mean steep terrain; far apart means gradual",
  "V-shapes pointing uphill indicate a valley or stream; V-shapes pointing downhill indicate a ridge",
  "Closed circles indicate peaks; check the legend for the contour interval",
  "Before each segment, count contour crossings to estimate total elevation gain or loss",
  "If you're gaining elevation but your trail on the map doesn't cross contour lines, you're on the wrong trail",
] as const;

export const FOOT_CARE = {
  beforeTrek: [
    "Boots or trail runners must be broken in before Philmont — new footwear is not ready",
    "Toenails cut short and square, not rounded at corners — do this a week before departure, not the night before",
    "Address existing foot issues (ingrown nails, calluses) before arrival",
  ],
  onTrail: [
    "At any rest stop, if part of your foot feels hot or rubbing, stop and deal with it before it becomes a blister — a hot spot treated immediately takes 30 seconds",
    "Change socks daily — wet socks cause blisters faster than anything else",
    "Treatment: moleskin cut in a donut shape, surrounding the blister — do not place moleskin directly on the blister",
    "Do not pop blisters unless under high pressure — once opened, they are prone to infection",
    "If a blister has already formed, reduce friction and protect it",
  ],
} as const;

export const HIKING_ETIQUETTE = [
  "Single file on trail",
  "Crew stays together — no one hikes alone",
  "Pace is set by the crew, not the fastest Scout",
  "Short, controlled breaks on schedule",
  "Clear communication front to back when stopping, turning, or hazard ahead",
  "Yield to uphill hikers on narrow trail",
] as const;

export const CREW_SEPARATION = {
  rule: "Philmont requires a minimum 10–12 minute gap between crews on trail at all times. This is not a suggestion — it is how Philmont keeps the trail uncrowded and the backcountry experience what it should be for every crew out there.",
  passing: [
    "A faster crew that wants to pass must ask the slower crew for permission — do not push through",
    "The slower crew is expected to yield: step off trail, let the faster crew through, then take a mandatory 20-minute rest before continuing",
    "If you are the faster crew, ask the Crew Leader of the other crew directly and politely",
    "If you are the slower crew and asked to yield, comply — do not argue the point on trail",
  ],
  selfCheck: [
    "If you can see another crew ahead of you, you are too close — slow down or take an unscheduled break",
    "Do not tailgate. A compressed trail creates crowding at water sources, campsites, and program areas",
  ],
} as const;
