export type TrainingEvent = {
  id: string;
  dateLabel: string;
  iso?: string;
  title: string;
  desc: string;
  type: "milestone" | "training_block" | "ongoing" | "taper";
  daysOut: number | null;
};

export const TRAINING_TIMELINE: TrainingEvent[] = [
  {
    id: "shakedown",
    dateLabel: "Sat May 16",
    iso: "2026-05-16",
    title: "Pack shakedown hike",
    desc: "Full pack at or near trek weight. Entire crew hikes together. Weigh every pack. Anyone over 25% ceiling must cut weight before departure. Identify fit issues and hot spots.",
    type: "milestone",
    daysOut: 29,
  },
  {
    id: "loaded_hikes",
    dateLabel: "May 17 – Jun 7",
    title: "Loaded hikes — progressive distance and weight",
    desc: "2–3 hikes per week with actual pack at trek weight. Minimum 3–5 miles per session. Use elevation gain where available — hills, stairs, stadium steps. Goal is time on feet with weight, not speed.",
    type: "training_block",
    daysOut: null,
  },
  {
    id: "hydration_training",
    dateLabel: "Now – Jun 14",
    title: "Hydration training — start today",
    desc: "Drink 3–4 liters per day starting now. Alternate electrolyte drinks on training days. Body needs to adapt to this volume. Most impactful single prep action for Philmont.",
    type: "ongoing",
    daysOut: null,
  },
  {
    id: "boot_mileage",
    dateLabel: "Now – Jun 14",
    title: "Boot mileage",
    desc: "20–30 miles minimum before the shakedown. Wear your actual trail socks. Break in the boots you are actually bringing — not a different pair.",
    type: "ongoing",
    daysOut: null,
  },
  {
    id: "taper",
    dateLabel: "Jun 8 – 13",
    title: "Taper — rest and recover",
    desc: "Reduce mileage. Focus on sleep, hydration, and nutrition. Do not do a long hard hike 2–3 days before you fly out. Arrive rested, not depleted.",
    type: "taper",
    daysOut: 6,
  },
  {
    id: "fly_day",
    dateLabel: "Sun Jun 14",
    iso: "2026-06-14",
    title: "Fly day — hydrate on the plane",
    desc: "Airplane cabin air is extremely dry. Drink water throughout the flight. Avoid alcohol. Being well-hydrated before stepping off the plane at 6,500 ft makes a real difference on Day 1.",
    type: "milestone",
    daysOut: 0,
  },
];
