/**
 * Core packing list — parsed from PSR 2026 Gear List.xlsx.
 * Source of truth for the LighterPack clone (P2) and the static gear reference (P0).
 *
 * Core items cannot be deleted by a crew member; they can only be marked "not packing".
 * Personal items can be added on top in P2.
 *
 * TODO (polish session): build admin UI to edit this list. Fields per item:
 * name, description, required (Required/Optional/Note), category, default qty,
 * default weight (oz). Moves this static array into Supabase so edits don't
 * require a code push. New seed flow reads from DB instead of this file.
 */

export type Required = "Required" | "Optional" | "Note";

export type CoreItem = {
  category: string;
  item: string;
  required: Required;
  qty: string;
};

/** Note attached to a category in the spreadsheet but rendered as a category-level callout. */
export type CategoryNote = {
  category: string;
  note: string;
};

export const CATEGORY_NOTES: CategoryNote[] = [
  {
    category: "First Aid - Personal",
    note: "We will build standardized kits as a group — Do NOT Buy individual items.",
  },
];

export const CORE_ITEMS: CoreItem[] = [
  // 10 Essentials
  { category: "10 Essentials", item: "Headlamp/Flashlight", required: "Required", qty: "1" },
  { category: "10 Essentials", item: "Whistle (likely on pack sternum strap)", required: "Required", qty: "1" },
  { category: "10 Essentials", item: "Sunglasses", required: "Required", qty: "1" },
  { category: "10 Essentials", item: "Compass", required: "Required", qty: "1" },

  // Clothing
  { category: "Clothing", item: "Troop Red Activity Shirt", required: "Required", qty: "1" },
  { category: "Clothing", item: "Hiking Socks", required: "Required", qty: "2" },
  { category: "Clothing", item: "Hiking underwear", required: "Required", qty: "2" },
  { category: "Clothing", item: "Crew Hat", required: "Required", qty: "1" },
  { category: "Clothing", item: "Pants for Hiking and Cons Project", required: "Required", qty: "1" },
  { category: "Clothing", item: "Shorts for Hiking", required: "Required", qty: "1" },
  { category: "Clothing", item: "Crew Shirt (2 if desired)", required: "Required", qty: "1" },
  { category: "Clothing", item: "Hiking Socks (Toe Socks Recommended)", required: "Required", qty: "2" },
  { category: "Clothing", item: "Camp/Sleep Socks", required: "Optional", qty: "1" },
  { category: "Clothing", item: "Camp/Sleep Shirt", required: "Optional", qty: "1" },
  { category: "Clothing", item: "Camp/Sleep Pants or Shorts", required: "Optional", qty: "1" },
  { category: "Clothing", item: "Camp/Sleep Beanie", required: "Optional", qty: "1" },
  { category: "Clothing", item: "Long Sleeve Base Layer", required: "Required", qty: "1" },
  { category: "Clothing", item: "Moisture Wicking Underwear", required: "Required", qty: "2" },
  { category: "Clothing", item: "Mid Layer Fleece", required: "Optional", qty: "1" },
  { category: "Clothing", item: "Top Layer Jacket", required: "Required", qty: "1" },
  { category: "Clothing", item: "Hiking Gloves (Sun Protection)", required: "Optional", qty: "1" },

  // First Aid - Personal
  { category: "First Aid - Personal", item: "Electrolites (liquid IV, ELMNT, etc)", required: "Required", qty: "12" },
  { category: "First Aid - Personal", item: "Medical Form A & B", required: "Required", qty: "1" },
  { category: "First Aid - Personal", item: "1 Qt ziplock bag", required: "Required", qty: "2" },
  { category: "First Aid - Personal", item: "4\" sterile gauze pads", required: "Required", qty: "2" },
  { category: "First Aid - Personal", item: "Nitrile Gloves (not black)", required: "Required", qty: "2 Pair" },
  { category: "First Aid - Personal", item: "CPR Barrier Mask", required: "Required", qty: "1" },
  { category: "First Aid - Personal", item: "4\"x10' Small Roll of Gauze", required: "Required", qty: "1" },
  { category: "First Aid - Personal", item: "Duct Tape & Needle", required: "Required", qty: "1" },
  { category: "First Aid - Personal", item: "Lukotape", required: "Required", qty: "1" },
  { category: "First Aid - Personal", item: "Honey Packet", required: "Required", qty: "1" },
  { category: "First Aid - Personal", item: "Mustard Packet", required: "Required", qty: "1" },
  { category: "First Aid - Personal", item: "Sugar Packets", required: "Required", qty: "3" },
  { category: "First Aid - Personal", item: "Salt Packet", required: "Required", qty: "1" },
  { category: "First Aid - Personal", item: "Band Aids", required: "Required", qty: "1" },
  { category: "First Aid - Personal", item: "Alcohol Wipes", required: "Required", qty: "1" },
  { category: "First Aid - Personal", item: "Hand Sanitizer", required: "Required", qty: "1" },

  // Food
  { category: "Food", item: "1 Gallon Ziplock Bags", required: "Required", qty: "10" },

  // Footwear
  { category: "Footwear", item: "Hiking Boots/Trail Runners", required: "Required", qty: "1" },
  { category: "Footwear", item: "Camp Shoes (Crocs, Sandals, Water Shoes)", required: "Optional", qty: "1" },

  // Mess Kit
  { category: "Mess Kit", item: "Folding Bowl (supplied by troop)", required: "Required", qty: "1" },
  { category: "Mess Kit", item: "Spoon or Spork", required: "Required", qty: "1" },
  { category: "Mess Kit", item: "Mug (Adults recommended for Advisor Coffee)", required: "Optional", qty: "1" },

  // Money
  { category: "Money", item: "Money", required: "Optional", qty: "$40-$50" },

  // Pack
  { category: "Pack", item: "60 - 75 Liter Backpack (20% Available Space)", required: "Required", qty: "1" },
  { category: "Pack", item: "Pack Liner (unscented trash compactor bag)", required: "Required", qty: "1" },
  { category: "Pack", item: "Pack Cover", required: "Optional", qty: "1" },
  { category: "Pack", item: "10 - 15 Liter Summit/Day Pack", required: "Required", qty: "1" },

  // Personal Gear
  { category: "Personal Gear", item: "Bandana/Buff/Shemagh", required: "Required", qty: "1" },
  { category: "Personal Gear", item: "Stuff Sacks", required: "Optional", qty: "3" },
  { category: "Personal Gear", item: "Batteries/Battery Pack", required: "Required", qty: "1" },
  { category: "Personal Gear", item: "Trekking Poles (Rubber tips mandatory)", required: "Optional", qty: "1" },
  { category: "Personal Gear", item: "1 pair Backup tips for trekking pole", required: "Optional", qty: "1" },
  { category: "Personal Gear", item: "Watch", required: "Required", qty: "1" },
  { category: "Personal Gear", item: "Camp Towel (compact microfiber)", required: "Required", qty: "1" },
  { category: "Personal Gear", item: "Pen/Pencil/Notepad", required: "Required", qty: "1" },
  { category: "Personal Gear", item: "Sit Pad/Camp Chair", required: "Optional", qty: "1" },
  { category: "Personal Gear", item: "30' Paracord", required: "Required", qty: "1" },

  // Personal Toiletries
  { category: "Personal Toiletries", item: "1 QT ziplock bag", required: "Required", qty: "2" },
  { category: "Personal Toiletries", item: "Toothbrush", required: "Required", qty: "1" },
  { category: "Personal Toiletries", item: "Toothpaste (travel size)", required: "Required", qty: "1" },
  { category: "Personal Toiletries", item: "Foot Powder", required: "Required", qty: "1" },
  { category: "Personal Toiletries", item: "Body Glide", required: "Required", qty: "1" },
  { category: "Personal Toiletries", item: "Lip Balm/Chap Stick", required: "Required", qty: "1" },
  { category: "Personal Toiletries", item: "Sunscreen", required: "Required", qty: "1" },
  { category: "Personal Toiletries", item: "Medications", required: "Required", qty: "1" },
  { category: "Personal Toiletries", item: "Biodegradable Soap", required: "Required", qty: "1" },

  // Rain Gear
  { category: "Rain Gear", item: "Rain Jacket/Suit", required: "Required", qty: "1" },

  // Sleep System
  { category: "Sleep System", item: "Sleeping Bag/Quilt — min 40 degree", required: "Required", qty: "1" },
  { category: "Sleep System", item: "Sleeping Bag Liner", required: "Optional", qty: "1" },
  { category: "Sleep System", item: "Sleeping Pad", required: "Required", qty: "1" },
  { category: "Sleep System", item: "Pillow", required: "Optional", qty: "1" },

  // Shelter — pick ONE tent option; the other stays "not packing"
  { category: "Shelter", item: "Philmont Thunder Ridge tent (your half)", required: "Required", qty: "1" },
  { category: "Shelter", item: "Personal 1P tent (enter weight)", required: "Required", qty: "1" },
  { category: "Shelter", item: "Ground Sheet (Tyvek)", required: "Required", qty: "1" },
  { category: "Shelter", item: "Tent Stakes", required: "Required", qty: "5" },

  // Water
  { category: "Water", item: "1 Liter Smartwater Bottle (with water)", required: "Required", qty: "2" },
  { category: "Water", item: "2 Liters Additional Capacity (collapsible)", required: "Required", qty: "1" },
  { category: "Water", item: "Total of 4 Liters Capacity", required: "Note", qty: "—" },

  // Travel / Basecamp Only — NOT counted in pack weight
  { category: "Travel / Basecamp Only", item: "Field Uniform", required: "Required", qty: "1" },
  { category: "Travel / Basecamp Only", item: "Gear Duffle for Checked Luggage", required: "Required", qty: "1" },
];

export const CORE_CATEGORIES: string[] = [
  "10 Essentials",
  "Clothing",
  "First Aid - Personal",
  "Food",
  "Footwear",
  "Mess Kit",
  "Money",
  "Pack",
  "Personal Gear",
  "Personal Toiletries",
  "Rain Gear",
  "Shelter",
  "Sleep System",
  "Water",
  "Travel / Basecamp Only",
];

/** Categories whose items are NOT counted toward pack weight totals. */
export const TRAVEL_ONLY_CATEGORIES = new Set<string>([
  "Travel / Basecamp Only",
]);
