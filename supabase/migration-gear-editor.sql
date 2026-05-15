-- ============================================================
-- Core Gear Items table — source of truth for gear editor.
-- Run once in Supabase SQL Editor after migration-packing-v2.sql.
-- ============================================================

create table if not exists public.core_gear_items (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  name        text not null,
  description text not null default '',
  required    text not null default 'Optional'
                check (required in ('Required', 'Optional', 'Note')),
  qty         text not null default '1',
  weight_oz   numeric not null default 0,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS: authenticated can read; writes go through service-role in server actions.
alter table public.core_gear_items enable row level security;

create policy "Authenticated can read core gear" on public.core_gear_items
  for select using (auth.role() = 'authenticated');

-- Seed all core items (weights default 0; admins can fill in via gear editor).
insert into public.core_gear_items (category, name, required, qty, sort_order) values

-- 10 Essentials
('10 Essentials', 'Headlamp/Flashlight', 'Required', '1', 0),
('10 Essentials', 'Whistle (likely on pack sternum strap)', 'Required', '1', 1),
('10 Essentials', 'Sunglasses', 'Required', '1', 2),
('10 Essentials', 'Compass', 'Required', '1', 3),

-- Clothing
('Clothing', 'Troop Red Activity Shirt', 'Required', '1', 4),
('Clothing', 'Hiking Socks', 'Required', '2', 5),
('Clothing', 'Hiking underwear', 'Required', '2', 6),
('Clothing', 'Crew Hat', 'Required', '1', 7),
('Clothing', 'Pants for Hiking and Cons Project', 'Required', '1', 8),
('Clothing', 'Shorts for Hiking', 'Required', '1', 9),
('Clothing', 'Crew Shirt (2 if desired)', 'Required', '1', 10),
('Clothing', 'Hiking Socks (Toe Socks Recommended)', 'Required', '2', 11),
('Clothing', 'Camp/Sleep Socks', 'Optional', '1', 12),
('Clothing', 'Camp/Sleep Shirt', 'Optional', '1', 13),
('Clothing', 'Camp/Sleep Pants or Shorts', 'Optional', '1', 14),
('Clothing', 'Camp/Sleep Beanie', 'Optional', '1', 15),
('Clothing', 'Long Sleeve Base Layer', 'Required', '1', 16),
('Clothing', 'Moisture Wicking Underwear', 'Required', '2', 17),
('Clothing', 'Mid Layer Fleece', 'Optional', '1', 18),
('Clothing', 'Top Layer Jacket', 'Required', '1', 19),
('Clothing', 'Hiking Gloves (Sun Protection)', 'Optional', '1', 20),

-- First Aid - Personal
('First Aid - Personal', 'Electrolites (liquid IV, ELMNT, etc)', 'Required', '12', 21),
('First Aid - Personal', 'Medical Form A & B', 'Required', '1', 22),
('First Aid - Personal', '1 Qt ziplock bag', 'Required', '2', 23),
('First Aid - Personal', '4" sterile gauze pads', 'Required', '2', 24),
('First Aid - Personal', 'Nitrile Gloves (not black)', 'Required', '2 Pair', 25),
('First Aid - Personal', 'CPR Barrier Mask', 'Required', '1', 26),
('First Aid - Personal', '4"x10'' Small Roll of Gauze', 'Required', '1', 27),
('First Aid - Personal', 'Duct Tape & Needle', 'Required', '1', 28),
('First Aid - Personal', 'Lukotape', 'Required', '1', 29),
('First Aid - Personal', 'Honey Packet', 'Required', '1', 30),
('First Aid - Personal', 'Mustard Packet', 'Required', '1', 31),
('First Aid - Personal', 'Sugar Packets', 'Required', '3', 32),
('First Aid - Personal', 'Salt Packet', 'Required', '1', 33),
('First Aid - Personal', 'Band Aids', 'Required', '1', 34),
('First Aid - Personal', 'Alcohol Wipes', 'Required', '1', 35),
('First Aid - Personal', 'Hand Sanitizer', 'Required', '1', 36),

-- Food
('Food', '1 Gallon Ziplock Bags', 'Required', '10', 37),

-- Footwear
('Footwear', 'Hiking Boots/Trail Runners', 'Required', '1', 38),
('Footwear', 'Camp Shoes (Crocs, Sandals, Water Shoes)', 'Optional', '1', 39),

-- Mess Kit
('Mess Kit', 'Folding Bowl (supplied by troop)', 'Required', '1', 40),
('Mess Kit', 'Spoon or Spork', 'Required', '1', 41),
('Mess Kit', 'Mug (Adults recommended for Advisor Coffee)', 'Optional', '1', 42),

-- Money
('Money', 'Money', 'Optional', '$40-$50', 43),

-- Pack
('Pack', '60 - 75 Liter Backpack (20% Available Space)', 'Required', '1', 44),
('Pack', 'Pack Liner (unscented trash compactor bag)', 'Required', '1', 45),
('Pack', 'Pack Cover', 'Optional', '1', 46),
('Pack', '10 - 15 Liter Summit/Day Pack', 'Required', '1', 47),

-- Personal Gear
('Personal Gear', 'Bandana/Buff/Shemagh', 'Required', '1', 48),
('Personal Gear', 'Stuff Sacks', 'Optional', '3', 49),
('Personal Gear', 'Batteries/Battery Pack', 'Required', '1', 50),
('Personal Gear', 'Trekking Poles (Rubber tips mandatory)', 'Optional', '1', 51),
('Personal Gear', '1 pair Backup tips for trekking pole', 'Optional', '1', 52),
('Personal Gear', 'Watch', 'Required', '1', 53),
('Personal Gear', 'Camp Towel (compact microfiber)', 'Required', '1', 54),
('Personal Gear', 'Pen/Pencil/Notepad', 'Required', '1', 55),
('Personal Gear', 'Sit Pad/Camp Chair', 'Optional', '1', 56),
('Personal Gear', '30'' Paracord', 'Required', '1', 57),

-- Personal Toiletries
('Personal Toiletries', '1 QT ziplock bag', 'Required', '2', 58),
('Personal Toiletries', 'Toothbrush', 'Required', '1', 59),
('Personal Toiletries', 'Toothpaste (travel size)', 'Required', '1', 60),
('Personal Toiletries', 'Foot Powder', 'Required', '1', 61),
('Personal Toiletries', 'Body Glide', 'Required', '1', 62),
('Personal Toiletries', 'Lip Balm/Chap Stick', 'Required', '1', 63),
('Personal Toiletries', 'Sunscreen', 'Required', '1', 64),
('Personal Toiletries', 'Medications', 'Required', '1', 65),
('Personal Toiletries', 'Biodegradable Soap', 'Required', '1', 66),

-- Rain Gear
('Rain Gear', 'Rain Jacket/Suit', 'Required', '1', 67),

-- Shelter (pick ONE; role-aware seed handles defaults)
('Shelter', 'Philmont Thunder Ridge tent (your half)', 'Required', '1', 68),
('Shelter', 'Personal 1P tent (enter weight)', 'Required', '1', 69),
('Shelter', 'Ground Sheet (Tyvek)', 'Required', '1', 70),
('Shelter', 'Tent Stakes', 'Required', '5', 71),

-- Sleep System
('Sleep System', 'Sleeping Bag/Quilt — min 40 degree', 'Required', '1', 72),
('Sleep System', 'Sleeping Bag Liner', 'Optional', '1', 73),
('Sleep System', 'Sleeping Pad', 'Required', '1', 74),
('Sleep System', 'Pillow', 'Optional', '1', 75),

-- Water
('Water', '1 Liter Smartwater Bottle (with water)', 'Required', '2', 76),
('Water', '2 Liters Additional Capacity (collapsible)', 'Required', '1', 77),
('Water', 'Total of 4 Liters Capacity', 'Note', '—', 78),

-- Travel / Basecamp Only (excluded from pack-weight math)
('Travel / Basecamp Only', 'Field Uniform', 'Required', '1', 79),
('Travel / Basecamp Only', 'Gear Duffle for Checked Luggage', 'Required', '1', 80);
