export const PACK_WEIGHT_CONSTANTS = {
  /** Crew target — non-negotiable. NOT the Philmont official 25–30%. */
  targetPct: 0.2,
  /** Hard ceiling — must cut weight before departure if exceeded. */
  maxPct: 0.25,
  /** Day-1 Gear & Food: food 5.8 + water 4.4 + crew gear 2.0 + shelter 2.5 = 14.7 lbs. */
  gearAndFoodLbs: 14.7,
  foodPerPersonLbs: 5.8,
  waterTwoLitersLbs: 4.4,
  crewGearAvgLbs: 2.0,
  shelterLbs: 2.5,
  /** Food consumed per day per person */
  dropRatePerDayLbs: 1.45,
} as const;

export type PackWeightRow = {
  bodyWeight: number;
  target20: number;
  max25: number;
  targetBase: number;
  maxBase: number;
  shade: "ok" | "warn" | "danger";
  note: string;
};

// Base = 20% × bw − 14.7; Max base = 25% × bw − 14.7
export const PACK_WEIGHT_TABLE: PackWeightRow[] = [
  {
    bodyWeight: 110,
    target20: 22.0,
    max25: 27.5,
    targetBase: 7.3,
    maxBase: 12.8,
    shade: "danger",
    note: "Essentially impossible · review every item",
  },
  {
    bodyWeight: 120,
    target20: 24.0,
    max25: 30.0,
    targetBase: 9.3,
    maxBase: 15.3,
    shade: "danger",
    note: "UL setup required · bear bag only",
  },
  {
    bodyWeight: 130,
    target20: 26.0,
    max25: 32.5,
    targetBase: 11.3,
    maxBase: 17.8,
    shade: "danger",
    note: "UL setup required · no heavy crew gear",
  },
  {
    bodyWeight: 140,
    target20: 28.0,
    max25: 35.0,
    targetBase: 13.3,
    maxBase: 20.3,
    shade: "danger",
    note: "Very tight · disciplined gear selection",
  },
  {
    bodyWeight: 150,
    target20: 30.0,
    max25: 37.5,
    targetBase: 15.3,
    maxBase: 22.8,
    shade: "warn",
    note: "Tight · UL setup required",
  },
  {
    bodyWeight: 160,
    target20: 32.0,
    max25: 40.0,
    targetBase: 17.3,
    maxBase: 25.3,
    shade: "warn",
    note: "Achievable · standard UL",
  },
  {
    bodyWeight: 170,
    target20: 34.0,
    max25: 42.5,
    targetBase: 19.3,
    maxBase: 27.8,
    shade: "ok",
    note: "Good margin",
  },
  {
    bodyWeight: 180,
    target20: 36.0,
    max25: 45.0,
    targetBase: 21.3,
    maxBase: 30.3,
    shade: "ok",
    note: "Good margin",
  },
  {
    bodyWeight: 190,
    target20: 38.0,
    max25: 47.5,
    targetBase: 23.3,
    maxBase: 32.8,
    shade: "ok",
    note: "Good margin",
  },
  {
    bodyWeight: 200,
    target20: 40.0,
    max25: 50.0,
    targetBase: 25.3,
    maxBase: 35.3,
    shade: "ok",
    note: "Good margin",
  },
  {
    bodyWeight: 210,
    target20: 42.0,
    max25: 52.5,
    targetBase: 27.3,
    maxBase: 37.8,
    shade: "ok",
    note: "Good margin",
  },
  {
    bodyWeight: 220,
    target20: 44.0,
    max25: 55.0,
    targetBase: 29.3,
    maxBase: 40.3,
    shade: "ok",
    note: "Good margin",
  },
];

export type AssignmentTier = {
  bodyWeightLabel: string;
  eligibility: string;
  eligible: string[];
  excluded: string[];
  notes: string;
};

export const GEAR_ASSIGNMENT: AssignmentTier[] = [
  {
    bodyWeightLabel: "110–120 lbs",
    eligibility: "None",
    eligible: [],
    excluded: ["Dining fly", "Cook kit", "Issued pots", "Bear ropes", "Fuel"],
    notes: "Base weight must be ≤ 7–9 lbs. Review every item.",
  },
  {
    bodyWeightLabel: "130 lbs",
    eligibility: "None or bear bag",
    eligible: ["1 bear bag (~3 oz)"],
    excluded: ["Dining fly", "Cook kit", "Issued pot", "Bear ropes", "Fuel"],
    notes: "UL setup required. Bear bag only if assigned anything.",
  },
  {
    bodyWeightLabel: "140 lbs",
    eligibility: "1 light item max",
    eligible: ["Bear bag", "1 rope", "Spare fuel"],
    excluded: ["Dining fly", "Cook kit", "Issued pot"],
    notes: "1 light item max.",
  },
  {
    bodyWeightLabel: "150–200 lbs",
    eligibility: "Full rotation",
    eligible: ["Any shared item"],
    excluded: [],
    notes: "Full rotation eligible. Heavier items to 170+ where possible.",
  },
  {
    bodyWeightLabel: "170+ lbs",
    eligibility: "Heavy items preferred",
    eligible: [
      "Dining fly (2 lb 6 oz)",
      "Cook kit bundle (1 lb 12.5 oz)",
      "Issued pot (1 lb 5.8 oz)",
    ],
    excluded: [],
    notes: "Preferred carriers for heaviest single items.",
  },
];

/**
 * Compute live targets from a body weight input.
 * Returns null inputs as null so the UI can hold an empty state.
 */
export function computeTargets(bodyWeight: number | null) {
  if (bodyWeight == null || bodyWeight <= 0) return null;
  const target20 = bodyWeight * PACK_WEIGHT_CONSTANTS.targetPct;
  const max25 = bodyWeight * PACK_WEIGHT_CONSTANTS.maxPct;
  const targetBase = target20 - PACK_WEIGHT_CONSTANTS.gearAndFoodLbs;
  const maxBase = max25 - PACK_WEIGHT_CONSTANTS.gearAndFoodLbs;
  return { target20, max25, targetBase, maxBase };
}
