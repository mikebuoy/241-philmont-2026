export type WeightType =
  | "verified"
  | "weighed"
  | "statedMfr"
  | "stated"
  | "estimated"
  | "unverified";

export type GearItem = {
  item: string;
  weightEach: string;
  weightEachOz: number;
  qty: number | string;
  totalOz: number;
  source: "issued" | "crew";
  weightType?: WeightType;
  notes: string;
};

export const ISSUED_GEAR: GearItem[] = [
  {
    item: "Crew cook pots (8-quart)",
    weightEach: "1 lb 5.8 oz",
    weightEachOz: 21.8,
    qty: 1,
    totalOz: 21.8,
    source: "issued",
    weightType: "verified",
    notes: "Rehydration, serving, wash/rinse",
  },
  {
    item: "Dishwashing pot no lid (8-quart)",
    weightEach: "1 lb 4 oz",
    weightEachOz: 20,
    qty: 1,
    totalOz: 20,
    source: "issued",
    weightType: "verified",
    notes: "Wash + rinse station",
  },
  {
    item: "Bear bags (woven polypropylene)",
    weightEach: "~3 oz",
    weightEachOz: 3,
    qty: 4,
    totalOz: 12,
    source: "issued",
    weightType: "verified",
    notes: "Distributed at HQ to balance loads",
  },
  {
    item: "Bear ropes (100 ft × ¼\" nylon)",
    weightEach: "1 lb 1 oz",
    weightEachOz: 17,
    qty: 2,
    totalOz: 34,
    source: "issued",
    weightType: "verified",
    notes: "¼\" diameter mandatory — no Dyneema",
  },
  {
    item: "Carabiners (issued)",
    weightEach: "~1.5 oz",
    weightEachOz: 1.5,
    qty: 2,
    totalOz: 3,
    source: "issued",
    weightType: "estimated",
    notes: "With bear rope carrier",
  },
  {
    item: "Camp suds (decanted)",
    weightEach: "~0.5 oz",
    weightEachOz: 0.5,
    qty: 1,
    totalOz: 0.5,
    source: "issued",
    weightType: "estimated",
    notes: "1 per crew",
  },
  {
    item: "Scrubby + sump material",
    weightEach: "~1.5 oz",
    weightEachOz: 1.5,
    qty: 1,
    totalOz: 1.5,
    source: "issued",
    weightType: "estimated",
    notes: "Cut into pieces on trail",
  },
  {
    item: "Food strainer & scraper",
    weightEach: "8 oz",
    weightEachOz: 8,
    qty: 1,
    totalOz: 8,
    source: "issued",
    weightType: "verified",
    notes: "Grey water sump, yum yum bag",
  },
  {
    item: "Large spoon / ladle",
    weightEach: "2.6 oz",
    weightEachOz: 2.6,
    qty: 1,
    totalOz: 2.6,
    source: "issued",
    weightType: "verified",
    notes: "With cook kit",
  },
  {
    item: "Hot-pot tongs",
    weightEach: "3.5 oz",
    weightEachOz: 3.5,
    qty: 1,
    totalOz: 3.5,
    source: "issued",
    weightType: "verified",
    notes: "Issued — use what Philmont provides",
  },
  {
    item: "Toilet paper (crew supply)",
    weightEach: "~5 oz",
    weightEachOz: 5,
    qty: 1,
    totalOz: 5,
    source: "issued",
    weightType: "unverified",
    notes: "Goes in smellables at night. Resupplied.",
  },
  {
    item: "Micropur purification tabs",
    weightEach: "~1.5 oz",
    weightEachOz: 1.5,
    qty: "10/person",
    totalOz: 1.5,
    source: "issued",
    weightType: "verified",
    notes: "Kills protozoa + bacteria + viruses.",
  },
];

export const CREW_SUPPLIED_GEAR: GearItem[] = [
  {
    item: "Carabiners (climbing-rated locking)",
    weightEach: "~1.5 oz",
    weightEachOz: 1.5,
    qty: 2,
    totalOz: 3,
    source: "crew",
    weightType: "stated",
    notes: "MUST be climbing-rated. NOT issued.",
  },
  {
    item: "Multi-tool with pliers",
    weightEach: "2–5 oz",
    weightEachOz: 3.5,
    qty: 2,
    totalOz: 7,
    source: "crew",
    weightType: "stated",
    notes:
      "Leatherman Squirt ~2 oz · Skeletool ~5 oz. NOT issued. 2 required per Philmont spec.",
  },
  {
    item: "Dining fly (crew-supplied)",
    weightEach: "2 lb 6 oz",
    weightEachOz: 38,
    qty: 1,
    totalOz: 38,
    source: "crew",
    weightType: "stated",
    notes:
      "Use trekking poles — do NOT carry Philmont-issued dining fly poles (saves 1 lb 6 oz)",
  },
  {
    item: "Cook kit bundle (stove + HE pot + fuel + lighter)",
    weightEach: "28.47 oz",
    weightEachOz: 28.47,
    qty: 2,
    totalOz: 56.94,
    source: "crew",
    weightType: "weighed",
    notes: "Fire Maple FMS-118 + Bulin 1.5L/2.1L HE pot. Nested. 1 per cook team.",
  },
  {
    item: "Spare fuel canister",
    weightEach: "10.76 oz",
    weightEachOz: 10.76,
    qty: 1,
    totalOz: 10.76,
    source: "crew",
    weightType: "stated",
    notes: "Backup — 3rd canister. Likely unused based on prior trek data.",
  },
  {
    item: "Platypus QuickDraw filter",
    weightEach: "2.9 oz",
    weightEachOz: 2.9,
    qty: 2,
    totalOz: 5.8,
    source: "crew",
    weightType: "statedMfr",
    notes: "Screws onto CNOC bag or any 28mm bottle",
  },
  {
    item: "Sawyer Squeeze filter",
    weightEach: "3.0 oz",
    weightEachOz: 3.0,
    qty: 2,
    totalOz: 6.0,
    source: "crew",
    weightType: "statedMfr",
    notes: "4 independent filter paths total",
  },
  {
    item: "CNOC Vecto 2L dirty bag",
    weightEach: "2.6 oz",
    weightEachOz: 2.6,
    qty: 2,
    totalOz: 5.2,
    source: "crew",
    weightType: "statedMfr",
    notes: "Wide-mouth collection. Pairs with QuickDraw.",
  },
  {
    item: "First aid kit (crew-level)",
    weightEach: "~14 oz",
    weightEachOz: 14,
    qty: 1,
    totalOz: 14,
    source: "crew",
    weightType: "estimated",
    notes: "1 advisor carries. Top of pack — not buried.",
  },
  {
    item: "Sectional maps + compass",
    weightEach: "~4 oz",
    weightEachOz: 4,
    qty: 1,
    totalOz: 4,
    source: "crew",
    weightType: "estimated",
    notes: "Crew leader carries. Hip belt or top lid pocket.",
  },
  {
    item: "Repair kit",
    weightEach: "~3 oz",
    weightEachOz: 3,
    qty: 1,
    totalOz: 3,
    source: "crew",
    weightType: "estimated",
    notes: "Tent tape · pole sleeve · needle/thread · spare buckle",
  },
];

export type ShelterAssignment = {
  role: string;
  setup: string;
  weight: string;
  split: boolean;
  carries?: string;
  notes: string;
};

export const SHELTER_BY_ROLE: ShelterAssignment[] = [
  {
    role: "Crew leader",
    setup: "Personal 1P tent",
    weight: "~2.0 lbs",
    split: false,
    notes: "All self-carried",
  },
  {
    role: "Advisor",
    setup: "Personal 1P tent",
    weight: "1.5–2.0 lbs",
    split: false,
    notes: "Lighter = direct personal benefit",
  },
  {
    role: "Scout Partner A",
    setup: "Thunder Ridge split",
    weight: "~2 lb 11 oz",
    split: true,
    carries: "Tent body + groundsheet (Tyvek 55\"×86\") + half poles",
    notes: "",
  },
  {
    role: "Scout Partner B",
    setup: "Thunder Ridge split",
    weight: "~2 lb 11 oz",
    split: true,
    carries: "Fly + stakes (8) + half poles",
    notes: "",
  },
];

export const HEAVIEST_ITEMS = [
  { item: "Dining fly", weight: "2 lb 6 oz", assignTo: "Strongest carrier 160+ lbs" },
  { item: "Both bear ropes", weight: "2 lb 2 oz", assignTo: "1 carrier, or split" },
  { item: "Cook kit bundle", weight: "1 lb 12.5 oz", assignTo: "160+ lbs" },
  { item: "Cooking pot w/ lid", weight: "1 lb 5.8 oz", assignTo: "150+ lbs" },
  { item: "Food strainer/scraper", weight: "8 oz", assignTo: "Any 150+ lbs with cook kit" },
];
