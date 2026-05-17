export const PACK_WEIGHT_CONSTANTS = {
  /** Crew recommended target — 20% of body weight. */
  targetPct: 0.2,
  /** Crew standard / secondary target — 25% of body weight. */
  maxPct: 0.25,
  /** Philmont hard ceiling — 30% of body weight. No exceptions. */
  hardMaxPct: 0.30,
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
  hardMax30: number;
  targetBase: number;
  maxBase: number;
  hardMaxBase: number;
  shade: "ok" | "warn" | "danger";
  note: string;
};

// Base = pct × bw − 14.7 lbs GF constant
export const PACK_WEIGHT_TABLE: PackWeightRow[] = [
  { bodyWeight: 100, target20: 20.0, max25: 25.0, hardMax30: 30.0, targetBase:  5.3, maxBase: 10.3, hardMaxBase: 15.3, shade: "danger", note: "UL setup required · review every item" },
  { bodyWeight: 120, target20: 24.0, max25: 30.0, hardMax30: 36.0, targetBase:  9.3, maxBase: 15.3, hardMaxBase: 21.3, shade: "danger", note: "UL setup required · bear bag only" },
  { bodyWeight: 140, target20: 28.0, max25: 35.0, hardMax30: 42.0, targetBase: 13.3, maxBase: 20.3, hardMaxBase: 27.3, shade: "warn",   note: "Very tight · disciplined gear selection" },
  { bodyWeight: 160, target20: 32.0, max25: 40.0, hardMax30: 48.0, targetBase: 17.3, maxBase: 25.3, hardMaxBase: 33.3, shade: "warn",   note: "Achievable · standard UL" },
  { bodyWeight: 180, target20: 36.0, max25: 45.0, hardMax30: 54.0, targetBase: 21.3, maxBase: 30.3, hardMaxBase: 39.3, shade: "ok",     note: "Good margin" },
  { bodyWeight: 200, target20: 40.0, max25: 50.0, hardMax30: 60.0, targetBase: 25.3, maxBase: 35.3, hardMaxBase: 45.3, shade: "ok",     note: "Good margin" },
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
  const hardMax30 = bodyWeight * PACK_WEIGHT_CONSTANTS.hardMaxPct;
  const GF = PACK_WEIGHT_CONSTANTS.gearAndFoodLbs;
  return {
    target20,
    max25,
    hardMax30,
    targetBase: target20 - GF,
    maxBase: max25 - GF,
    hardMaxBase: hardMax30 - GF,
  };
}
