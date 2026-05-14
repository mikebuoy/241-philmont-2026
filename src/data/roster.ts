export type CrewRole = "crew_leader" | "lead_advisor" | "advisor" | "scout";

export type CrewMember = {
  /** Display name as it appears in the spreadsheet */
  name: string;
  /** Last name initial — for sorting */
  lastInitial: string;
  /** Role */
  role: CrewRole;
  /** Which sister crew */
  crewId: 1 | 2;
};

export type Crew = {
  id: 1 | 2;
  name: string;
  members: CrewMember[];
};

/**
 * Trek 12-23 · Sister crews · Same itinerary
 * Crew Leader = youth scout (Scout-led principle).
 * Lead Advisor = adult responsible for entire crew.
 */
export const CREWS: Crew[] = [
  {
    id: 1,
    name: "Crew 1",
    members: [
      { name: "Seth C.", lastInitial: "C", role: "crew_leader", crewId: 1 },
      { name: "Joshua B.", lastInitial: "B", role: "scout", crewId: 1 },
      { name: "Stephen B.", lastInitial: "B", role: "scout", crewId: 1 },
      { name: "Collin D.", lastInitial: "D", role: "scout", crewId: 1 },
      { name: "Lucas D.", lastInitial: "D", role: "scout", crewId: 1 },
      { name: "Rick T.", lastInitial: "T", role: "lead_advisor", crewId: 1 },
      { name: "Walt T.", lastInitial: "T", role: "advisor", crewId: 1 },
      { name: "Carl D.", lastInitial: "D", role: "advisor", crewId: 1 },
      { name: "Matt C.", lastInitial: "C", role: "advisor", crewId: 1 },
      { name: "Ira B.", lastInitial: "B", role: "advisor", crewId: 1 },
    ],
  },
  {
    id: 2,
    name: "Crew 2",
    members: [
      { name: "Asher D.", lastInitial: "D", role: "crew_leader", crewId: 2 },
      { name: "Rhys R.", lastInitial: "R", role: "scout", crewId: 2 },
      { name: "Brooks B.", lastInitial: "B", role: "scout", crewId: 2 },
      { name: "Luke C.", lastInitial: "C", role: "scout", crewId: 2 },
      { name: "Logan C.", lastInitial: "C", role: "scout", crewId: 2 },
      { name: "Gabriel G.", lastInitial: "G", role: "scout", crewId: 2 },
      { name: "Christian L.", lastInitial: "L", role: "scout", crewId: 2 },
      { name: "Mike B.", lastInitial: "B", role: "lead_advisor", crewId: 2 },
      { name: "David C.", lastInitial: "C", role: "advisor", crewId: 2 },
      { name: "Brian L.", lastInitial: "L", role: "advisor", crewId: 2 },
      { name: "Kris R.", lastInitial: "R", role: "advisor", crewId: 2 },
      { name: "Ari D.", lastInitial: "D", role: "advisor", crewId: 2 },
    ],
  },
];

export const ALL_MEMBERS: CrewMember[] = CREWS.flatMap((c) => c.members);

export const ROLE_LABEL: Record<CrewRole, string> = {
  crew_leader: "Crew Leader",
  lead_advisor: "Lead Advisor",
  advisor: "Advisor",
  scout: "Scout",
};
