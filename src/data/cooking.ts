export const COOK_EQUIPMENT = [
  {
    item: "Fire Maple FMS-118",
    type: "Stove",
    weight: "in bundle",
    qty: 2,
    notes: "1 per cook team",
  },
  {
    item: "Bulin 1.5L/2.1L HE pot",
    type: "Heat exchange pot",
    weight: "in bundle",
    qty: 2,
    notes: "Nested with stove",
  },
  {
    item: "Cook kit bundle total",
    type: "Stove + HE pot + fuel + lighter",
    weight: "28.47 oz [weighed]",
    qty: 2,
    notes: "Per cook team",
  },
  {
    item: "Fuel canister (primary)",
    type: "Isobutane",
    weight: "in bundle",
    qty: 2,
    notes: "1 per cook team",
  },
  {
    item: "Fuel canister (spare)",
    type: "Isobutane",
    weight: "10.76 oz [stated]",
    qty: 1,
    notes: "Backup · 3rd canister",
  },
  {
    item: "Philmont issued pot w/ lid",
    type: "8-quart aluminum",
    weight: "1 lb 5.8 oz",
    qty: 1,
    notes: "Rehydration + serving",
  },
  {
    item: "Philmont dishwashing pot",
    type: "8-quart aluminum, no lid",
    weight: "1 lb 4 oz",
    qty: 1,
    notes: "Wash + rinse",
  },
] as const;

export const COOK_METHOD_STEPS = [
  {
    n: 1,
    title: "Boil",
    body: "Fill HE pot. Ignite Fire Maple. Bring to a full rolling boil.",
  },
  {
    n: 2,
    title: "Sterilize",
    body: "Submerge all personal bowls and utensils in boiling water. Hold several seconds. This is the official Philmont method — do not skip.",
  },
  {
    n: 3,
    title: "Rehydrate & serve",
    body: "Transfer boiled water to the issued 8-qt pot. Add food. Cover. Rehydrate 10–15 min. Serve into sterilized bowls.",
  },
  {
    n: 4,
    title: "Eat clean",
    body: "Eat everything. Lick the bowl clean. Every bit of food left behind becomes a smellable.",
  },
  {
    n: 5,
    title: "Wash & rinse",
    body: "Water + 1 drop Camp Suds in the issued pot. Scrub with the scrubby. Rinse pots and personal bowls.",
  },
  {
    n: 6,
    title: "Sump & dispose",
    body: "Pour all grey water through the strainer into a sump hole. Strained food particles into the yum yum bag — out at the next staffed camp. Never pour grey water on the ground or near a water source.",
  },
  {
    n: 7,
    title: "Bear bag",
    body: "All food bags, wrappers, smellables into the bear bags. Hang before crew sleeps. No exceptions.",
  },
] as const;

export const COOK_TEAM_NOTE =
  "Cook team structure: 2–3 crew members run both stoves, both pots, and cleanup. Crew Leader assigns cook and cleanup roles. Rotate every meal so all crew know the system by Trail Day 2.";
