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
  "Orient the map before leaving camp — confirm the route with Crew Leader and Lead Advisor",
  "Read contour lines to understand elevation changes before they happen",
  "Identify trail junctions on the map before you reach them",
  "Stop when confused — never guess a junction. Guessing wrong costs miles.",
  "Keep the crew together. No one hikes alone. Rule of four applies.",
  "Map lives in a hip belt pocket or top lid — not buried in the pack",
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
  rule: "Philmont requires a minimum 10–12 minute gap between crews on trail at all times. This is not a suggestion — it is how Philmont manages trail congestion and keeps the backcountry experience what it is supposed to be.",
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
