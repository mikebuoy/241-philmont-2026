export const BIG_PICTURE = {
  headline: "This trek will be hard. It is going to be one of the best adventures of your life.",
  activities: "We will climb Baldy Mountain, hike over the Tooth of Time, pick up and manage a burro, build trail for conservation, rock climb at Dean Cow, experience campfire programs, and move through some of the most spectacular parts of Philmont.",
  crewCode: [
    "One crew, one pace, one goal.",
    "The early start is the best move of the day.",
    "Just one more mile.",
    "Respond, don't react.",
    "Check on the person next to you.",
    "Trust the Crew Leader.",
    "Let advisors be advisors.",
    "We don't finish until everyone finishes.",
  ],
  trekStats: {
    miles: 81,
    difficulty: "Super Strenuous",
    trailDays: 11,
    highPoint: "Baldy Mountain · 12,441 ft",
  },
} as const;

export type CrewRole = {
  id: string;
  name: string;
  type: "fixed" | "advisory";
  desc: string;
};

export const CREW_ROLES: CrewRole[] = [
  {
    id: "crew_leader",
    name: "Crew Leader",
    type: "fixed",
    desc: "Leads the crew on trail and in camp. Sets the pace, calls breaks, makes route decisions, runs the nightly brief, and owns the Crew Leader copy. Primary point of contact for all crew — Scouts go to the Crew Leader first, not advisors.",
  },
  {
    id: "chaplains_aide",
    name: "Chaplain's Aide",
    type: "fixed",
    desc: "Watches the spiritual and emotional health of the crew. Leads chapel and reflective moments. Pays attention to how people are doing, not just how far they hiked. If someone is struggling and won't say so, the Chaplain's Aide is often the first to notice.",
  },
  {
    id: "wpg",
    name: "Wilderness Pledge Guía",
    type: "fixed",
    desc: "Leads the crew in Leave No Trace practices and the Wilderness Pledge. Keeps the crew accountable for camp cleanliness, water use, trail behavior, and how we treat Philmont's land.",
  },
  {
    id: "scout",
    name: "Scout",
    type: "fixed",
    desc: "Full crew member and the heartbeat of the crew. Rotates through every duty — cook, clean, filter water, navigate, hang the bear bag. Every Scout runs every role, and by Trail Day 3 the crew can operate without a guide because of it.",
  },
  {
    id: "lead_advisor",
    name: "Lead Advisor",
    type: "advisory",
    desc: "Oversees crew safety and logistics from the adult side. Works through the Crew Leader, not around them. Handles Philmont check-in, the Crew Leader copy, and any escalation required.",
  },
  {
    id: "advisors",
    name: "Advisors",
    type: "advisory",
    desc: "Support, coach, and protect safety. Do not make decisions the Crew Leader should make. If a Scout has a question or issue, the standard response is: “Ask your Crew Leader.”",
  },
];

export type DevelopmentPhase = {
  name: string;
  window: string;
  signs: string;
  focus: string;
};

export const CREW_DEVELOPMENT_PHASES: DevelopmentPhase[] = [
  {
    name: "Forming",
    window: "Before Philmont through Trail Day 2",
    signs: "Scouts are cooperative but look to the Ranger and advisors for answers. Roles are not yet instinctive. Crew is excited, polite, and unsure.",
    focus: "Set expectations early. Let the Crew Leader lead small moments. Redirect questions and decisions to youth leaders consistently.",
  },
  {
    name: "Storming",
    window: "Trail Days 2–4 (approx. Jun 18–20)",
    signs: "Fatigue, chores, altitude, pack weight, and personality differences surface. Arguments about duties. Scouts questioning Crew Leader decisions. Camp taking too long.",
    focus: "Keep conflict small and early. Correct behaviors, not personalities. Hold the duty roster. Protect the Crew Leader from being bypassed. Debrief briefly each night.",
  },
  {
    name: "Norming",
    window: "Trail Days 5–8 (approx. Jun 20–23)",
    signs: "Systems start working. Scouts begin to know their jobs. Crew gets faster in the morning and calmer at night.",
    focus: "Reinforce what is working specifically. Keep standards high before Baldy, burro, and conservation days. Push ownership back to youth leaders.",
  },
  {
    name: "Performing",
    window: "Trail Days 9–11 (approx. Jun 24–27)",
    signs: "Moving with purpose. Jobs are understood. Scouts help before being asked. Crew Leader is clearly in command. Advisors are mostly watching.",
    focus: "Watch for overconfidence on the last two days. Protect weather windows on Tooth day. Keep nutrition and hydration visible. Maintain early starts.",
  },
  {
    name: "Adjourning",
    window: "Day 12 and departure (Jun 27–28)",
    signs: "Emotional, tired, proud. Some Scouts may become reflective or quiet. Some may crash after Base Camp arrival.",
    focus: "Celebrate without losing safety discipline. Keep everyone together through Base Camp and travel. Thank the Crew Leader and youth leaders specifically.",
  },
];

export const FIFTY_MILER_REQUIREMENTS = [
  "Travel at least 50 miles entirely under human power — hiking, canoeing, or cycling",
  "Complete the journey over consecutive days with an appropriate adult leader present",
  "Carry out a conservation or community service project during the trip",
  "Keep a log or journal of the trip",
  "Submit the completed application through your unit",
] as const;

export const ARROWHEAD_REQUIREMENTS = [
  "Complete the trek (all trail days)",
  "Complete the conservation project — Day 8, Sioux, 2:00 PM, new trail construction",
  "Follow the Wilderness Pledge throughout the trek",
  "Maintain Leave No Trace practices every day",
  "No graffiti, no shortcuts, no mistreatment of land or facilities",
] as const;

export const MEDICAL_STANDARDS = {
  bmiUnder21: 40,
  bmiAdult: 32,
  bpMax: "160/100",
  note: "Denied means denied. Philmont will not allow backcountry access to anyone who does not meet their standards. There is no negotiating at the gate.",
  medRequirements: [
    "All prescription medications in original labeled containers — no exceptions",
    "Emergency medications (EpiPens, inhalers) must be present, in-date, and sufficient for full trek",
    "Annual Health and Medical Record complete, signed, and uploaded to Philmont Gateway before arrival",
    "Blood pressure medication must be taken consistently before arrival — altitude raises BP above home baseline",
  ],
} as const;

export type TradingPost = {
  name: string;
  when: string;
  notes: string;
  budget: string;
};

export const TRADING_POSTS: TradingPost[] = [
  {
    name: "Baldy Town",
    when: "Trail Day 5",
    notes: "Snacks, patches, gear items. Accepts cards and Apple/Google Pay.",
    budget: "$20–40",
  },
  {
    name: "Ponil",
    when: "Trail Day 7",
    notes: "Trading post and cantina — root beer, snacks, patches. Accepts cards.",
    budget: "$20–40",
  },
  {
    name: "Clarks Fork",
    when: "Trail Day 10",
    notes: "Possibly limited items.",
    budget: "$10–20",
  },
  {
    name: "Tooth of Time Traders",
    when: "Day 12 (Base Camp return)",
    notes: "Full gear store — leather belts and buckles, Philmont jackets, branded gear, patches. Accepts cards.",
    budget: "$50–100+",
  },
];

export const ARRIVAL_SCHEDULE = [
  {
    date: "Sun Jun 14",
    label: "Depart home · Arrive at Philmont",
    desc: "Fly to Albuquerque or drive to Cimarron. Transfer to Philmont. Check in at Villa Philmonte. Do not plan evening activities — rest and stay hydrated.",
  },
  {
    date: "Mon Jun 15",
    label: "Stay & Play · Medical recheck",
    desc: "Medical recheck happens this morning — do not schedule anything else until it is complete. After recheck, medications can be repackaged for the trail. Afternoon is Stay & Play: high adventure activities, trading post access.",
  },
  {
    date: "Tue Jun 16",
    label: "Base Camp check-in day",
    desc: "Ranger orientation. Gear check and final pack weights. Food issue. Crew and advisor briefings. Eat dinner at the Base Camp dining hall. Early bed — trail starts tomorrow.",
  },
  {
    date: "Wed Jun 17",
    label: "Trail start · Day 1",
    desc: "Breakfast at the Base Camp dining hall. Ranger leads us to the trailhead. On trail by mid-morning.",
  },
  {
    date: "Sat Jun 27",
    label: "Trail Day 11 · Return to Base Camp",
    desc: "Final trail day. Crew hikes out and returns to Base Camp. Showers, laundry, and a real meal. Tooth of Time Traders open for gear and patches.",
  },
  {
    date: "Sun Jun 28",
    label: "Fly home",
    desc: "Depart Philmont. Transfer to Albuquerque for return flights. Trek complete.",
  },
] as const;

export type BasecampStop = {
  step: number;
  title: string;
  notes: string[];
};

export const BASECAMP_CHECKIN: {
  intro: string;
  arrivalTip: string;
  stops: BasecampStop[];
  schedule: { time: string; event: string }[];
  departureTip: string;
} = {
  intro: "The first day at Base Camp is very busy — many stops to complete before you're cleared for the backcountry. The Ranger guides the crew through the entire process.",
  arrivalTip: "Crews that arrive before 10:00 AM typically complete all Base Camp procedures in a single day.",
  stops: [
    {
      step: 1,
      title: "Welcome Center",
      notes: [
        "Crew Leader and Lead Advisor check in and receive tent assignments",
        "Ranger meets the crew here immediately after check-in",
      ],
    },
    {
      step: 2,
      title: "Drop off gear at tents",
      notes: [
        "Everyone carries water, rain gear, and prescription medications for the rest of the day's stops",
        "Lead Advisor brings any roster changes and payment paperwork",
        "Crew Leader brings an unmarked overall map and their Crew Leader Fieldbook",
      ],
    },
    {
      step: 3,
      title: "Crew photo",
      notes: [
        "Can be taken in field uniforms or crew t-shirts",
        "Extra prints available via the Philmont Photo Archive",
      ],
    },
    {
      step: 4,
      title: "Camping Registration",
      notes: [
        "Ranger, all Advisors, and Scouts 18+ go inside — rest of crew waits outside",
        "Outstanding payments made; certifications and IDs checked",
        "Crew roster turned in",
      ],
    },
    {
      step: 5,
      title: "Outfitting Services",
      notes: [
        "Receive crew gear: tents, bear bags, bear rope, pots, dining fly, etc.",
        "Receive food for the first days of the trek",
        "Purchase fuel for the stove",
      ],
    },
    {
      step: 6,
      title: "Medical Recheck",
      notes: [
        "All crew members review medical forms with Philmont Infirmary staff",
        "All prescriptions must be in original labeled containers — including EpiPens and inhalers",
      ],
    },
    {
      step: 7,
      title: "Mail Room",
      notes: ["Pick up any gear shipped to Philmont ahead of time"],
    },
    {
      step: 8,
      title: "Shakedown",
      notes: [
        "Ranger runs a full gear check — necessary gear confirmed for trail, non-essential gear stored at Base Camp",
      ],
    },
    {
      step: 9,
      title: "Logistics Trip Plan",
      notes: [
        "Crew Leader and Lead Advisor called into Logistics separately",
        "Receive info on campsites, trails, programs, water sources, and horse rides",
        "Crew Leader needs unmarked overall map and Crew Leader Fieldbook",
      ],
    },
    {
      step: 10,
      title: "Security",
      notes: ["Receive lockers if the crew did not travel in personal vehicles"],
    },
  ],
  schedule: [
    { time: "Before 10:00 AM", event: "Arrive at Welcome Center (target)" },
    { time: "11:30 AM", event: "Lunch — Base Camp Dining Hall" },
    { time: "4:45 PM", event: "Dinner — Base Camp Dining Hall" },
    { time: "5:45 PM", event: "Crew Leadership Meetings — Hardesty Casa Center (Crew Leader, Chaplain's Aide, WPG, Advisors)" },
    { time: "7:00 PM", event: "Chapel Services" },
    { time: "8:15 PM", event: "Opening Campfire — meet at Welcome Center" },
    { time: "6:30 AM (next morning)", event: "Breakfast — Base Camp Dining Hall" },
  ],
  departureTip: "First buses to the backcountry leave at 8:00 AM; last buses at 3:00 PM. Most crews depart roughly 24 hours after arriving at Philmont.",
};

export const TREK_LOGISTICS = {
  cellService: {
    summary: "Essentially none in the Philmont backcountry. Once we leave Base Camp on Day 2, do not count on calling or texting until Day 12.",
    emergencyNumber: "(575) 376-2281",
    emergencyNote: "This is the Philmont emergency number. Brief your family before you leave. Philmont staff can reach crews in the backcountry but it takes time.",
  },
  electronics: {
    summary: "No electricity in the backcountry. Bring a charged battery pack — it is your only option.",
    rules: [
      "Phone in airplane mode at the trailhead — keeps it there",
      "Offline maps, photos, and planning reference only",
      "Battery pack charged to full before we step off the bus",
    ],
  },
  burro: {
    pickupDay: "Trail Day 6 (Jun 22) · Miranda Burro Pens",
    dropoffDay: "Trail Day 7 (Jun 23) · Ponil",
    notes: [
      "Staff at Miranda will show us how to load the burro — follow their instructions exactly",
      "Burros are stubborn by design. They will stop. This is not a malfunction.",
      "The crew's pace adjusts to the burro, not the other way around",
      "Assign handlers in rotation so no one person manages the burro all day",
      "Do not let the burro eat along the trail without staff guidance",
    ],
  },
} as const;
