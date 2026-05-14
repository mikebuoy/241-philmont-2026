export type DutyRole = {
  id: string;
  name: string;
  cadence: string;
  desc: string;
  tone: "issued" | "crew" | "warn" | "info" | "danger";
};

export const DUTY_ROLES: DutyRole[] = [
  {
    id: "cook",
    name: "Cook team",
    cadence: "2 scouts · rotates every meal",
    desc: "Boil water, rehydrate the meal, serve. Sterilize bowls in boiling water before serving. Use the hybrid HE pot + issued pot method.",
    tone: "warn",
  },
  {
    id: "cleanup",
    name: "Cleanup",
    cadence: "Whoever cooked",
    desc: "Wash and rinse pots and personal bowls. Strain grey water through the sump kit into a sump hole. Strained food particles to the yum yum bag — out at next staffed camp.",
    tone: "info",
  },
  {
    id: "water",
    name: "Water",
    cadence: "Rotates daily",
    desc: "Fill at every reliable source. Monitor crew hydration — call out anyone who hasn't sipped in 15–20 minutes. Carry the dirty bag and one of the four filters.",
    tone: "info",
  },
  {
    id: "navigation",
    name: "Navigation",
    cadence: "Crew Leader + 1 scout",
    desc: "Route-find using sectional map + compass. Crew Leader leads; the assigned scout learns. Map lives in a hip belt or top lid pocket — not buried.",
    tone: "crew",
  },
  {
    id: "first_aid",
    name: "First aid",
    cadence: "Advisor-carried · all crew aware",
    desc: "Lead Advisor or designate carries the crew kit at the top of pack. Everyone carries a personal kit. Standardized — we built them as a group.",
    tone: "danger",
  },
  {
    id: "bear_hang",
    name: "Bear hang",
    cadence: "Last duty of the day · everyone helps",
    desc: "Every smellable in the bear bags before crew sleeps. ¼\" nylon ropes only. Two locking carabiners on the rope carrier. No food, no toothpaste, no chapstick in tents. Ever.",
    tone: "issued",
  },
];
