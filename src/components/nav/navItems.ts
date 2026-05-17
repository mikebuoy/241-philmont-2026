export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  match: string[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", shortLabel: "Overview", match: ["/"] },
  { href: "/trip", label: "My Trip", shortLabel: "Trip", match: ["/trip"] },
  { href: "/pack", label: "My Pack", shortLabel: "Pack", match: ["/pack"] },
  { href: "/crew", label: "My Crew", shortLabel: "Crew", match: ["/crew"] },
  { href: "/reference", label: "Reference", shortLabel: "Reference", match: ["/reference"] },
];

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.match.includes("/")) return pathname === "/";
  return item.match.some((m) => m !== "/" && pathname.startsWith(m));
}

export const TRIP_SUB = [
  { href: "/trip/itinerary", label: "Itinerary" },
  { href: "/trip/training", label: "Training" },
];

export const PACK_SUB = [
  { href: "/pack/calculator", label: "Estimator" },
  { href: "/pack/gear", label: "My Gear" },
  { href: "/pack/food", label: "Food" },
];

export const CREW_SUB = [
  { href: "/crew/roster", label: "Roster" },
  { href: "/crew/duty", label: "Duty Roster" },
  { href: "/crew/weights", label: "Pack Weights" },
];

export const REFERENCE_SUB = [
  { href: "/reference/gear", label: "Gear" },
  { href: "/reference/cooking", label: "Cooking" },
  { href: "/reference/bear-bag", label: "Bear Bag" },
  { href: "/reference/altitude", label: "Altitude & Safety" },
];
