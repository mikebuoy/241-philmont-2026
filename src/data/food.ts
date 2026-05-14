export type Resupply = {
  stop: string;
  philmontDay: number;
  uiDayLabel: string;
  camp: string;
  foodDays: string;
  daysCount: number | string;
  buddyPairTotalLbs: number;
  perPersonLbs: number;
  also: string[];
};

export const RESUPPLY_SCHEDULE: Resupply[] = [
  {
    stop: "HQ pickup",
    philmontDay: 1,
    uiDayLabel: "HQ Day",
    camp: "Camping HQ",
    foodDays: "Trail Days 1–4",
    daysCount: 4,
    buddyPairTotalLbs: 11.6,
    perPersonLbs: 5.8,
    also: ["Issued crew gear", "Micropur tabs (10/person)", "Toilet paper"],
  },
  {
    stop: "Baldy Town",
    philmontDay: 6,
    uiDayLabel: "Trail Day 5",
    camp: "Baldy Town",
    foodDays: "Trail Days 5–6",
    daysCount: 2,
    buddyPairTotalLbs: 5.8,
    perPersonLbs: 2.9,
    also: ["Micropur exchange", "TP resupply"],
  },
  {
    stop: "Ponil",
    philmontDay: 8,
    uiDayLabel: "Trail Day 7",
    camp: "Ponil",
    foodDays: "Trail Days 7–11",
    daysCount: "4 + final lunch",
    buddyPairTotalLbs: 11.6,
    perPersonLbs: 5.8,
    also: ["Micropur exchange", "TP resupply"],
  },
];

export const DRY_CAMP = {
  camp: "Santa Claus",
  uiDayLabel: "Trail Day 2",
  date: "Thursday, June 18, 2026",
  waterSource: "None at campsite",
  protocol: [
    "Cook and eat DINNER at last water source during lunch stop",
    "Carry cold lunch bag into camp — eat as camp dinner",
    "Breakfast next morning is no-cook",
    "Carry 1–2L drinking water into camp only",
    "Zero cooking or cleaning at the dry camp",
  ],
} as const;

export const WATER_SYSTEM = {
  filters: [
    { item: "Platypus QuickDraw", weightOz: 2.9, qty: 2, notes: "Pairs with CNOC 2L bag" },
    { item: "Sawyer Squeeze", weightOz: 3.0, qty: 2, notes: "Independent filter paths" },
    { item: "CNOC Vecto 2L dirty bag", weightOz: 2.6, qty: 2, notes: "Wide-mouth collection" },
  ],
  totalFilterPaths: 4,
  supplemental:
    "Micropur MP1 tabs — 10/person/resupply. Kills protozoa + bacteria + viruses.",
  dailyTargetL: "3–4 liters per person",
  standardCarryL: "1–2L",
  extendedCarryL: "up to 2L additional for dry stretches",
  hydrationCue: "Sip every 15–20 minutes. Do not wait for thirst.",
  electrolyteGuidance: "Alternate water with sports drink on strenuous days.",
} as const;
