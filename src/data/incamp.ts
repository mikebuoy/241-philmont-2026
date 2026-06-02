export const LIGHT_SLEEP = {
  wakeTarget: "4:30 AM",
  moveTarget: "~15 minutes before sunrise",
  bedtime: "Hiker's midnight — when it gets dark (roughly 30 min after sunset)",
  headlampNote: "Headlamps are mainly for morning wake-up, packing, breakfast, and early trail movement. After the first few days it becomes routine.",
  specialDays: "Baldy day and Tooth day start earlier than normal. Goal is off Baldy and off the Tooth summit area no later than 11:00 AM.",
} as const;

export type SequenceStep = {
  time?: string;
  title: string;
  items: string[];
};

export const MORNING_STEPS: SequenceStep[] = [
  {
    time: "4:30 AM",
    title: "Wake-up",
    items: [
      "Crew Leader and Bear Bag crew are first to wake and rise",
      "Everyone gets up — no negotiating",
    ],
  },
  {
    time: "4:30–4:50 AM",
    title: "Pack and break camp",
    items: [
      "Change into hiking clothes inside your tent",
      "Pack sleeping bag, sleep pad, camp clothes, and all personal items — still inside the tent",
      "Get out, pack up your tent with your tent buddy",
      "Bear bags come down — get your smellables, finish packing",
      "Stage breakfast food somewhere easy to reach while hiking (top pocket or hip belt pocket)",
      "Stack your pack in the pack line",
      "Help your crewmates",
      "Walk the campsite for Leave No Trace — nothing left behind",
    ],
  },
  {
    time: "4:50–5:00 AM",
    title: "Pack line and final check",
    items: [
      "Wilderness Guía walks the campsite — nothing left behind, sump covered if required",
      "Packs staged in the pack line",
      "Start eating breakfast items while you wait",
    ],
  },
  {
    time: "~5:00–5:10 AM",
    title: "Hike On",
    items: [
      "Goal: moving when it is light enough to see your shoelaces — watch sunrise from the trail",
      "Breakfast comes with you — eat on trail or at the first 20-minute break",
      "Be bold and start cold — keep moving and you will warm up fast",
    ],
  },
];

export const STAFFED_CAMP_STEPS: SequenceStep[] = [
  {
    title: "Check in with staff",
    items: [
      "Crew Leader checks in at the staff shelter or program area first — before anything else",
      "Staff will confirm arrival, direct to campsite, and tell us what programs are available and when",
      "Activity sign-ups are first come, first served — check in promptly",
    ],
  },
  {
    title: "Establish the pack line",
    items: [
      "Stack all packs together in the designated area",
      "Crew Leader counts packs and confirms everyone arrived",
    ],
  },
  {
    title: "Porch talks",
    items: [
      "Attend informal talks from staff on camp history, program, or terrain",
      "Stay engaged and ask questions — these are often one of the best parts of the day",
    ],
  },
  {
    title: "Camp program",
    items: [
      "Participate in the scheduled program",
      "Programs are the point of staffed camps — do not skip or arrive so late the crew misses out",
    ],
  },
];

export const CAMPSITE_STEPS: SequenceStep[] = [
  {
    title: "Pack line",
    items: [
      "Stack all packs together in the designated area",
      "Crew Leader counts packs and confirms everyone arrived",
    ],
  },
  {
    title: "Identify the Bearmuda Triangle",
    items: [
      "Find the fire ring, bear cable, and sump — these three form the triangle",
      "All smellable items stay inside this zone for the entire stay",
      "Tents go at least 50 feet outside it",
    ],
  },
  {
    title: "Hang bear bags — first priority",
    items: [
      "Sort gear into three piles near the fire ring: food · crew gear (dining fly, stoves, pots, ropes) · personal smellables (toiletries, medications, chapstick, sunscreen)",
      "Hang bear bags before setting up tents or cooking — this is the first priority, not the last",
    ],
  },
  {
    title: "Set up the dining fly",
    items: [
      "Inside the Bearmuda Triangle, near the fire ring",
      "Check the four W's: Wind (corner facing into wind), Water (avoid drainage lines), Wildlife (avoid game trails and ant hills), Widow Makers (no dead trees overhead)",
    ],
  },
  {
    title: "Set up tents",
    items: [
      "At least 50 feet from the Bearmuda Triangle",
      "Cluster tents 5–7 feet apart — no isolated tents",
      "Packs are smellable — keep them in the Bearmuda Triangle or leaned against a tree in the fire ring area",
    ],
  },
];

export const STOVE_SAFETY = [
  "Set up stove on stable, level ground",
  "Closed-toe shoes required whenever stoves are on — no exceptions",
  "Do not sit or kneel directly over a lit stove",
  "Keep extra water nearby at all times",
  "Never leave a lit stove unattended",
  "Steam burns happen fast — warn the crew before opening pot lids, never hand a pot of boiling water over another person",
  "Safe fuel handling: do not puncture canisters, keep away from flame, store outside the Bearmuda Triangle",
] as const;

export const DINNER_STEPS: SequenceStep[] = [
  {
    title: "Cook dinner",
    items: [
      "Cooks set up the kitchen inside the Bearmuda Triangle, near the fire ring",
      "Only cooks inside the kitchen area",
      "Closed-toe shoes required when stoves are on",
      "Boil-sanitize all dishes, utensils, and pots before serving",
    ],
  },
  {
    title: "Eat dinner",
    items: [
      "Eat everything — every calorie matters at altitude",
      "Lick your bowl clean — every bit of food left becomes a smellable",
    ],
  },
  {
    title: "Human sump",
    items: [
      "Someone eats whatever is left in the pot before dishwasher starts cleanup — waste nothing",
    ],
  },
  {
    title: "Dishwasher cleans up",
    items: [
      "Wash and rinse all dishes, utensils, and pots",
      "Strain food particles into the yum-yum bag — out at next staffed camp",
      "Use the sump correctly",
    ],
  },
];

export const NIGHTLY_BRIEF_STEPS: SequenceStep[] = [
  {
    title: "Crew Leader, Navigator, and Lead Advisor meet",
    items: [
      "Map out tomorrow's route",
      "Identify water sources, navigation decision points, and timing",
      "Questions get answered in private first — the crew hears a clear plan, not a debate",
    ],
  },
  {
    title: "Crew Leader runs the nightly crew brief",
    items: [
      "Route and distance",
      "Elevation and major climbs",
      "Water sources",
      "Program timing",
      "Food pickup if applicable",
      "Wake-up time",
    ],
  },
  {
    title: "Everyone checks pockets and pack for smellables",
    items: [
      "Double-check the site — nothing left out",
    ],
  },
  {
    title: "Oops bag hung",
    items: [
      "All remaining smellables in the oops bag — food, first aid kit, toiletries, smellable water bottles",
      "Hung on the bear cable last",
      "In tents before dark when possible",
    ],
  },
];

export const WATER_PURIFICATION = [
  "Every water source must be purified — springs, streams, and wells included",
  "Philmont standard: Micropur tablets (chlorine dioxide). Wait the full treatment time before drinking.",
  "Filters alone do not remove viruses — use purifier tablets or a certified purifier, not just a filter",
  "Most staffed camps have treated water — confirm with staff before filling",
  "On dry camp days, plan your water carry carefully. The Water Gatherer duty is the most critical job in camp.",
] as const;

export const LNT_AREAS = [
  {
    area: "Litter and graffiti",
    rule: "Pack out everything. No graffiti anywhere on Philmont land, facilities, or rock.",
  },
  {
    area: "Wildlife",
    rule: "Observe from a distance. Do not feed, approach, or interact with wildlife.",
  },
  {
    area: "Water",
    rule: "Never wash in or near springs or streams. All grey water through the sump strainer.",
  },
  {
    area: "Trails",
    rule: "Stay on designated trail. Never cut switchbacks. Camp only where assigned.",
  },
  {
    area: "Campsites",
    rule: "Leave no trace of your stay. Walk the site before departing — nothing left behind.",
  },
] as const;

export const HYGIENE_RULES = [
  "Wash or sanitize hands before handling any food or eating utensils",
  "Catholes at least 200 feet from trail, water sources, and campsites — pack out toilet paper or use the provided waste bags",
  "Keep personal and crew dishes clean and sterilized before each meal",
  "Keep smellables organized — loose wrappers and food remnants attract bears and get crews in trouble at inspection",
] as const;

export const RANGER_RELEASE_CHECKLIST = [
  "Wake up and pack efficiently without drama",
  "Follow the route using map and compass",
  "Move together as a crew — no one separated or ahead alone",
  "Set up camp correctly including the Bearmuda Triangle",
  "Cook safely using the Philmont method",
  "Clean correctly and use the sump",
  "Hang bear bags correctly every night",
  "Treat all water before drinking",
  "Manage smellables consistently",
  "Handle basic first aid",
  "Make safe weather decisions — off exposed terrain before storms",
] as const;
