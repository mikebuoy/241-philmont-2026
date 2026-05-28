# Architecture Reference

Philmont 2026 trek planning app for BSA Troop 241, Trek 12-23, June 14–28, 2026.
**Update this document in the same commit as the code change it describes.**

For brand voice, color philosophy, and design anti-patterns see [`docs/brand.md`](./brand.md).

---

## Table of Contents

1. [Overview](#1-overview)
2. [Repository Layout](#2-repository-layout)
3. [Environment Variables](#3-environment-variables)
4. [Database Schema](#4-database-schema)
5. [TypeScript Domain Types](#5-typescript-domain-types)
6. [Data Access Layer](#6-data-access-layer)
7. [Static Data Files](#7-static-data-files)
8. [Auth & Claim Flow](#8-auth--claim-flow)
9. [Admin Guard Pattern](#9-admin-guard-pattern)
10. [Server Actions Convention](#10-server-actions-convention)
11. [Component Conventions](#11-component-conventions)
12. [Design Tokens](#12-design-tokens)
13. [OG Image Convention](#13-og-image-convention)
14. [Key Architectural Decisions](#14-key-architectural-decisions)
15. [Naming Conventions](#15-naming-conventions)

---

## 1. Overview

| | |
|---|---|
| **Framework** | Next.js 16 App Router · React 19 · TypeScript strict |
| **Styling** | Tailwind CSS v4 with `@theme` tokens in `globals.css` |
| **Database** | Supabase (PostgreSQL) with Row-Level Security |
| **Auth** | Supabase Auth — Google OAuth + email magic link |
| **Deployment** | Vercel, auto-deploy on push to `main` |
| **Build info** | `NEXT_PUBLIC_BUILD_SHA` and `NEXT_PUBLIC_BUILD_DATE` injected at build time |

**Crew**: 22 members across two sister crews (Crew 1 and Crew 2), each with scouts, a crew leader, chaplain aide, guia, and advisors.

---

## 2. Repository Layout

```
src/
├── app/                    # Next.js App Router — routes and page components
│   ├── _og/                # OG image factory (private, not a route)
│   ├── admin/              # Admin routes (roster editor, gear editor, itinerary editor)
│   │   └── (private)/      # Auth-gated admin pages
│   ├── auth/callback/      # OAuth/OTP exchange route
│   ├── claim/              # Roster-slot claiming page
│   ├── crew/               # Crew dashboards (roster, weights, gear-check, duty)
│   ├── install/            # PWA install page + iOS profile download
│   ├── pack/               # Packing list, weight calculator, food reference
│   ├── reference/          # Static reference pages (gear, cooking, bear bag, altitude)
│   ├── trip/               # Itinerary, training plan
│   ├── globals.css         # Design tokens + base styles
│   ├── layout.tsx          # Root layout (fonts, nav, PWA, metadata)
│   └── manifest.ts         # PWA manifest
├── components/
│   ├── admin/              # Admin UI controls (save button, edit toggle, etc.)
│   ├── nav/                # TopNav, BottomNav, SubNav, navItems
│   └── primitives/         # Core building blocks (Page, Section, Box, StatusBadge, etc.)
├── data/                   # Static TypeScript data (no DB) — itinerary, roster, gear lists
└── lib/                    # Server-only utilities and Supabase clients
    └── supabase/           # client.ts (browser), server.ts (SSR), admin.ts (service-role)

supabase/                   # SQL migration files — run manually in Supabase SQL editor
scripts/                    # Seed scripts — run with: npx tsx scripts/<file>.ts
docs/                       # Architecture reference (this file) + brand guide
public/                     # Static assets — icons, service worker, mobileconfig
```

---

## 3. Environment Variables

```bash
# Supabase — both required at runtime
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Service-role key — server-only, never expose to client
SUPABASE_SERVICE_KEY=

# Injected automatically at build time by next.config.ts (do not set manually)
NEXT_PUBLIC_BUILD_SHA=   # git short SHA or "dev"
NEXT_PUBLIC_BUILD_DATE=  # YYYY-MM-DD
```

---

## 4. Database Schema

Migrations are in `supabase/`. Run them in order in the Supabase SQL editor. All tables use Row-Level Security.

### `admins`

Explicit allow-list. Not role-based — only emails in this table get admin access.

| Column | Type | Notes |
|--------|------|-------|
| `email` | `text` PK | Admin's email address |
| `name` | `text` | Display name |
| `added_at` | `timestamptz` | default `now()` |

**RLS**: Admins can read. No self-service writes (seeded in migration).

**Seeded admins**: `mikebuoy@gmail.com`, `rickdtownsend@gmail.com`

---

### `crew_members`

One row per person on the roster. `user_id` is null until the person signs in and claims their slot.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `name` | `text` | Display name, e.g. "Seth C." |
| `last_initial` | `text` | For sorting |
| `role` | `text` | `crew_leader` · `chaplain_aide` · `guia` · `scout` · `lead_advisor` · `advisor` |
| `crew_id` | `int` | `1` or `2` — sister crew assignment |
| `user_id` | `uuid` FK → `auth.users` | `null` = unclaimed; unique when set |
| `claimed_at` | `timestamptz` | Set when user claims slot |
| `body_weight_lbs` | `numeric` | User-entered, visible to all crew |
| `actual_base_weight_lbs` | `numeric` | User-entered pack base weight estimate |
| `use_actual_base_weight` | `boolean` | `false` = calculate from items; `true` = use entry above |
| `uses_philmont_tent` | `boolean` | default `true`; `false` = personal 1P tent |
| `wfa_certification_status` | `text` | `null` · `certified` · `not_certified` · `tbd` |
| `cpr_certification_status` | `text` | `null` · `certified` · `not_certified` · `tbd` |
| `med_form_received` | `boolean` | default `false`; admin marks received BSA medical form parts A/B/C |
| `is_disabled` | `boolean` | default `false`; hides member from normal views |
| `updated_at` | `timestamptz` | Auto-touched by trigger on update |

**Indexes**: Unique on `user_id` where not null; composite on `(crew_id, role)`.

**RLS**:
- `crew_members public read` — any authenticated user can read all rows
- `crew_members self update` — user can update an unclaimed row (claim) or their own row; `WITH CHECK` enforces `user_id = auth.uid()` preventing slot theft
- `crew_members admin all` — admins bypass all RLS

---

### `packing_items`

Personal packing list for each crew member. Core items are seeded automatically on first visit; personal items can be added freely.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `crew_member_id` | `uuid` FK → `crew_members` | Cascade delete |
| `category` | `text` | Must match a `gear_categories.name` for display grouping |
| `name` | `text` | Item name — matched to `core_gear_items.name` for cascades |
| `qty` | `int` | default `1` |
| `weight_oz` | `numeric` | Canonical unit is **oz**. UI may display lbs or g. |
| `is_core` | `boolean` | `true` = from `core_gear_items`; user cannot delete, only flag `is_not_packing` |
| `is_required` | `boolean \| null` | `true` = Required · `false` = Optional · `null` = Note type |
| `is_worn` | `boolean` | Excluded from base weight |
| `is_consumable` | `boolean` | In base weight; tracked separately |
| `is_smellable` | `boolean` | Visual reminder for bear-bag duty; no weight impact |
| `is_packed` | `boolean` | Pack-out checkbox state |
| `is_not_packing` | `boolean` | Hidden by default; excluded from all weight totals |
| `notes` | `text` | User notes |
| `advisor_note` | `text` | Admin-set note visible on gear-check dashboard |
| `sort_order` | `int` | Display order within category |
| `created_at` / `updated_at` | `timestamptz` | Auto-touched by trigger |

**Indexes**: On `crew_member_id`; composite on `(crew_member_id, category, sort_order)`.

**RLS**:
- `packing_items public read` — any authenticated user can read any item (for crew dashboard)
- `packing_items owner write` — user can write only items where `crew_member_id` maps to their own claimed slot
- `packing_items admin all` — admins bypass all RLS

---

### `core_gear_items`

Admin-managed master gear list. Source of truth for the packing list. Changes here cascade to `packing_items` via server actions.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `category` | `text` | Must match `gear_categories.name` |
| `name` | `text` | Matched to `packing_items.name` for cascades |
| `description` | `text` | Tooltip/reference text; default `''` |
| `required` | `text` | `Required` · `Optional` · `Note` |
| `qty` | `text` | Display string, e.g. `"2"` or `"$40-$50"` |
| `weight_oz` | `numeric` | default `0`; admins fill in via gear editor |
| `sort_order` | `integer` | Display order |
| `default_is_worn` | `boolean` | Applied when seeding new crew member |
| `default_is_consumable` | `boolean` | Applied when seeding new crew member |
| `default_is_not_packing` | `boolean` | Applied when seeding new crew member |
| `created_at` / `updated_at` | `timestamptz` | |

**RLS**: Authenticated users can read. All writes go through service-role client in server actions (admin only).

---

### `gear_categories`

Ordered list of categories. Drives display order in packing list and gear editor.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` PK | |
| `name` | `text` | Unique; matches `core_gear_items.category` and `packing_items.category` |
| `sort_order` | `integer` | Display order |
| `created_at` / `updated_at` | `timestamptz` | |

**RLS**: Authenticated users can read. Writes via service-role client (admin only).

**Current categories (in order)**: 10 Essentials, Clothing, First Aid - Personal, Food, Footwear, Mess Kit, Money, Pack, Personal Gear, Personal Toiletries, Rain Gear, Shelter, Sleep System, Water, Travel / Basecamp Only

---

### `itinerary_days`

One row per calendar day of the trip (pre-trek, trek, post-trek). Seeded from `scripts/seed.ts` and editable via admin UI.

| Column | Type | Notes |
|--------|------|-------|
| `iso` | `date` PK | `YYYY-MM-DD` format, e.g. `2026-06-14` |
| `philmont_day` | `int` | Philmont day number 1–12; `null` for non-trek days |
| `label` | `text` | Route description, e.g. "Ute Park to Cimarroncita" |
| `date_long` / `date_short` / `weekday` | `text` | Pre-formatted date strings |
| `camp` | `text` | Camp or location name |
| `type` | `text` | `travel` · `acclimation` · `base` · `trail` · `staffed` · `dry` · `layover` |
| `miles` / `gain` / `loss` | `numeric` / `int` | Daily trail stats; null for non-trail days |
| `cum_miles` / `cum_gain` / `cum_loss` | `numeric` / `int` | Cumulative stats |
| `elevation` | `int` | Approx elevation at camp (ft) |
| `food_pickup` | `text` | Location, if any |
| `notes` | `text` | Free-form notes; default `''` |
| `flags` | `jsonb` | `{dryCamp, burroPickup, burroDropoff, summit, conservation, longestDay, hardestDescent}` |
| `programs` | `text[]` | Program/activity names for the day |
| `gpx_path` | `text` | Filename in `gpx` storage bucket, e.g. `"2026-06-18.gpx"` |
| `gpx_partial` | `boolean` | `true` if GPX only covers part of the day |
| `gpx_note` | `text` | Explanation for partial coverage |
| `updated_at` / `updated_by` | `timestamptz` / `text` | Admin tracking |

**RLS**: World-readable (anon + authenticated). Admin-only writes.

**Storage**: GPX files in public `gpx` bucket; admin-uploadable via itinerary editor.

---

### SQL Helper Function

```sql
-- Used by RLS policies across all tables
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.admins a
    join auth.users u on u.email = a.email
    where u.id = auth.uid()
  );
$$;
```

---

## 5. TypeScript Domain Types

Key types — match exactly to DB columns (snake_case → camelCase).

```ts
// src/data/roster.ts
type CrewRole =
  | "crew_leader" | "chaplain_aide" | "guia" | "scout"
  | "lead_advisor" | "advisor";

// src/lib/crew.ts
type CertificationStatus = "certified" | "not_certified" | "tbd";

type CrewMember = {
  id: string;
  name: string;
  lastInitial: string;
  role: CrewRole;
  crewId: 1 | 2;
  userId: string | null;
  bodyWeightLbs: number | null;
  actualBaseWeightLbs: number | null;
  useActualBaseWeight: boolean;
  usesPhilmontTent: boolean;
  wfaCertificationStatus: CertificationStatus | null;
  cprCertificationStatus: CertificationStatus | null;
  claimedAt: string | null;
  isDisabled: boolean;
};

// src/lib/packing-types.ts
type PackingItem = {
  id: string;
  crewMemberId: string;
  category: string;
  name: string;
  qty: number;
  weightOz: number;
  isCore: boolean;
  isRequired: boolean | null;  // null = Note type
  isWorn: boolean;
  isConsumable: boolean;
  isSmellable: boolean;
  isPacked: boolean;
  isNotPacking: boolean;
  notes: string | null;
  advisorNote: string | null;
  sortOrder: number;
  description?: string;        // merged server-side from core_gear_items
};

type Totals = {
  baseOz: number;
  wornOz: number;
  consumableOz: number;
  smellableCount: number;
  notPackingCount: number;
  packedCount: number;
  unpackedCount: number;
};

// src/data/itinerary.ts
type CampType =
  | "travel" | "acclimation" | "base" | "trail"
  | "staffed" | "dry" | "layover";

// src/components/primitives/StatusBadge.tsx
type Tone =
  | "info" | "ok" | "warn" | "over" | "critical"
  | "danger" | "issued" | "crew" | "neutral";
```

---

## 6. Data Access Layer

All files in `src/lib/` are server-only (`import "server-only"`). Never import them from client components.

### Supabase Clients

| File | Auth | Use for |
|------|------|---------|
| `src/lib/supabase/client.ts` | Anon key + browser storage | Client components |
| `src/lib/supabase/server.ts` — `createClient()` | Anon key + cookies (SSR) | Server components, server actions; respects RLS |
| `src/lib/supabase/admin.ts` — `createAdminClient()` | Service-role key | Privileged mutations in server actions after `isCurrentUserAdmin()` check |

**Rule**: Never call `createAdminClient()` without first verifying the user is an admin. Never expose `SUPABASE_SERVICE_KEY` to client code.

### `src/lib/crew.ts`

| Function | Returns | Notes |
|----------|---------|-------|
| `getMyCrewMember()` | `CrewMember \| null` | Current user's claimed row; null if not claimed |
| `getAllCrewMembers()` | `CrewMember[]` | All non-disabled members, sorted by crew → role → name |
| `getAllCrewMembersAdmin()` | `CrewMember[]` | Includes disabled members; admin use only |
| `ROLE_ORDER` | `Record<CrewRole, number>` | Sort precedence constant |
| `sortCrewMembers(members)` | `CrewMember[]` | Sort by crew_id → ROLE_ORDER → name |

### `src/lib/packing.ts`

| Function | Notes |
|----------|-------|
| `getPackingItems(crewMemberId)` | Fetch one member's list, ordered by category → sort_order → name |
| `getAllPackingItems()` | All items for all members; paginated at 1000/page |
| `seedCoreItemsForCrewMember(member)` | Insert missing core items on first visit — idempotent, role-aware shelter defaults |
| `syncCoreItemsForAllMembers()` | Admin bulk-sync; inserts missing items, updates sort_order/is_required on drift |
| `computeTotals(items)` | Pure function — see [Decision 6](#14-key-architectural-decisions) |

### `src/lib/gear.ts`

| Function | Notes |
|----------|-------|
| `getGearCategories()` | All categories ordered by sort_order |
| `getCoreGearItems()` | All core items ordered by sort_order → name |
| `getCoreGearDescriptions()` | Returns `Record<name, description>` — used for tooltips |

### `src/lib/itinerary.ts`

| Function | Notes |
|----------|-------|
| `getItinerary()` | All days ordered by iso; used for SSG |
| `getDayByIso(iso)` | Single day lookup; returns null if not found |

### `src/lib/supabase/admin.ts`

| Function | Notes |
|----------|-------|
| `isCurrentUserAdmin()` | Server-side; checks admins table via service-role client |

---

## 7. Static Data Files

Immutable TypeScript data — no DB, no fetch. Import directly in server or client components.

| File | Key Exports | Shape |
|------|-------------|-------|
| `src/data/roster.ts` | `CREWS`, `ALL_MEMBERS`, `ROLE_LABEL` | 22-member crew split across Crew 1 & 2 |
| `src/data/itinerary.ts` | `ITINERARY`, `isoToSlug()` | 15-day array with trail metrics, programs, flags |
| `src/data/coreItems.ts` | `CORE_ITEMS`, `CATEGORY_NOTES`, `TRAVEL_ONLY_CATEGORIES` | 80+ canonical items from PSR gear list |
| `src/data/packWeights.ts` | `PACK_WEIGHT_CONSTANTS`, `PACK_WEIGHT_TABLE`, `computeTargets()` | Body weight → pack limit lookup; constants for all weight math |
| `src/data/duty.ts` | `DUTY_ROLES` | 6 rotational duty roles with cadence and tone |
| `src/data/training.ts` | `TRAINING_TIMELINE` | Pre-trek training milestones |
| `src/data/meta.ts` | Trek metadata | Dates, distance, elevation, crew count |
| `src/data/food.ts` | Meal plans | Calorie/nutrition data |
| `src/data/cooking.ts` | Cook techniques | Water requirements, pot capacity |
| `src/data/safety.ts` | Safety protocols | Altitude, hypothermia, bear safety |
| `src/data/gear.ts` | Static gear reference | Equipment descriptions |

**`TRAVEL_ONLY_CATEGORIES`** is a `Set<string>` — items in these categories are excluded from all pack-weight math. Currently contains `"Travel / Basecamp Only"`.

**`PACK_WEIGHT_CONSTANTS`** (key values):

```ts
targetPct: 0.20        // 20% body weight = crew goal
maxPct: 0.25           // 25% = crew standard (max comfort)
hardMaxPct: 0.30       // 30% = Philmont hard ceiling
philmontTentOz: 43     // Issued Thunder Ridge tent
foodPerPersonLbs: 5.8
waterTwoLitersLbs: 4.4
crewGearAvgLbs: 2.0
```

---

## 8. Auth & Claim Flow

```
1. /admin/signin → Google OAuth or email magic link
        ↓
2. /auth/callback?code=...&next=...
   - Exchange code for session
   - Check if user has a claimed crew_members row
   - Yes → redirect to ?next (default /)
   - No  → redirect to /claim
        ↓
3. /claim → user selects their name from unclaimed roster rows
   - claimRosterSlot(crewMemberId) server action
   - UPDATE crew_members SET user_id = auth.uid(), claimed_at = now()
   - RLS USING (user_id IS NULL) allows the update
   - RLS WITH CHECK (user_id = auth.uid()) prevents stealing another slot
   - Redirect to / (or ?next)
        ↓
4. Subsequent visits: session cookie → SSR client reads user, getMyCrewMember()
```

**One claim per user**: Unique index on `crew_members(user_id) WHERE user_id IS NOT NULL` enforces this at the DB level.

---

## 9. Admin Guard Pattern

```ts
// In a server action or server component:
const isAdmin = await isCurrentUserAdmin();
if (!isAdmin) return; // or throw / redirect

const admin = createAdminClient(); // service-role, bypasses RLS
await admin.from("core_gear_items").insert({ ... });
```

`isCurrentUserAdmin()` (in `src/lib/supabase/admin.ts`):
1. Gets current user via `createServerClient()` (cookie-based)
2. Looks up their email in `admins` table via service-role client
3. Returns `boolean`

**Admin-only routes** are under `src/app/admin/(private)/` with a layout that redirects non-admins.

---

## 10. Server Actions Convention

- Live in `actions.ts` co-located with the route or component they serve
- Always begin with `"use server"`
- Auth pattern: use `createClient()` for user-scoped writes (RLS enforces ownership); use `createAdminClient()` only after `isCurrentUserAdmin()` check
- End with `revalidatePath()` for any path affected by the mutation
- Return nothing on success; throw or return an error object on failure

```ts
// Typical pattern
"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleItemFlag(itemId: string, flag: string, value: boolean) {
  const supabase = await createClient();
  await supabase.from("packing_items").update({ [flag]: value }).eq("id", itemId);
  revalidatePath("/pack/gear");
}
```

**Where server actions live**:
- `src/app/claim/actions.ts` — roster claiming
- `src/app/pack/gear/actions.ts` — personal packing list mutations
- `src/app/pack/calculator/actions.ts` — body weight + base weight saves
- `src/app/crew/gear-check/actions.ts` — admin gear-check dashboard
- `src/app/admin/(private)/roster/actions.ts` — admin roster management
- `src/app/admin/(private)/gear/actions.ts` — gear editor (categories + items)
- `src/app/admin/(private)/itinerary/[day]/actions.ts` — itinerary day editing

---

## 11. Component Conventions

### Primitives (`src/components/primitives/`)

These are the only approved building blocks. Do not create ad-hoc wrappers around HTML that duplicate their purpose.

| Component | Props | Purpose |
|-----------|-------|---------|
| `Page` | `title`, `eyebrow`, `meta?`, `action?`, `titleRight?` | Page header + wrapper |
| `Section` | `num?`, `title`, `children` | Content section with ruled header |
| `Panel` | `title?`, `children`, `className?` | Card container |
| `Box` | `variant` (`info`·`ok`·`warn`·`danger`), `children` | Callout/alert box |
| `Stat` | `value`, `label`, `tone?` (`default`·`gain`·`loss`) | Single metric display |
| `StatusBadge` | `tone`, `children`, `className?` | Inline status pill |
| `PrintButton` | — | Client "Print" button (hidden from page flow) |

### Nav (`src/components/nav/`)

- `navItems.ts` — `NAV_ITEMS[]` + sub-nav arrays (`TRIP_SUB`, `PACK_SUB`, `CREW_SUB`, `REFERENCE_SUB`) + `isActive()`
- `TopNav` — header bar (hidden on mobile)
- `BottomNav` — mobile tab bar, `z-50`
- `SubNav` — section sub-navigation dropdown
- `NavAuthButton` — sign in / user avatar

### Z-Index Stack

| Layer | z-index |
|-------|---------|
| BottomNav | `z-50` |
| PWAInstallBanner | `z-[55]` |
| HeroChallenge overlay | `z-[60]` |

---

## 12. Design Tokens

Defined in `src/app/globals.css` via `@theme`. For tone, voice, and anti-patterns see [`docs/brand.md`](./brand.md).

### Color Palette

```css
/* Core */
--color-bg: #f5f1e8          /* Bone — page background */
--color-ink: #2a2a28         /* Granite — primary text */
--color-hcblue: #1e4d6b      /* High Country Blue — accent, CTAs */

/* Surfaces */
--color-surface: #ffffff
--color-surface-2: #f0efe9
--color-border: #e0ddd4      /* Use at 0.5px for hairlines */
--color-border-strong: #c8c4b8

/* Ink hierarchy */
--color-ink-muted: #6b6860   /* Sub-labels, metadata */
--color-ink-faint: #9b9890   /* Captions, hints */

/* Trek metrics */
--color-gain: #1a5c1a        /* Elevation gain (green) */
--color-loss: #a32d2d        /* Elevation loss (red) */

/* Status (weight calculator + badges) */
/* ok / warn / danger / critical / over / issued / crew */
```

### Typography

| Token | Font | Weights | Use for |
|-------|------|---------|---------|
| `--font-plex-sans` | IBM Plex Sans | 400, 500, 600 | Body text, UI labels |
| `--font-plex-sans-condensed` | IBM Plex Sans Condensed | 500, 600 | Display headers only |
| `--font-plex-mono` | IBM Plex Mono | 400, 500 | **All numbers**, dates, labels, eyebrows |

**Rule**: Any number displayed to the user (weights, miles, elevation, percentages, dates) must use `font-mono` / Plex Mono.

**Base font size**: 13px body. UI labels use 10–11px. Large display text uses 20–28px.

**Border widths**: Hairlines at `0.5px` via `style={{ borderWidth: "0.5px" }}` (Tailwind's `border` class produces 1px). Section rules use `1.5px`.

---

## 13. OG Image Convention

Each significant route has its own OG image. Two patterns are used:

### Pattern A — Static pre-built PNG (most routes)

Place `opengraph-image.png` directly in the route's directory. Next.js file convention serves it automatically at `/<route>/opengraph-image.png?<hash>`.

```
src/app/trip/itinerary/opengraph-image.png   → /trip/itinerary/opengraph-image.png
src/app/crew/weights/opengraph-image.png     → /crew/weights/opengraph-image.png
```

### Pattern B — Dynamic generated (reference and specialty routes)

Create `opengraph-image.tsx` in the route directory using the `generateOgImage` factory:

```ts
// src/app/reference/altitude/opengraph-image.tsx
import { generateOgImage } from "../../_og/generateOgImage";

export const alt = "Altitude & Safety — Tooth of Time Trek 12-23";
export const size = { width: 1280, height: 500 };
export const contentType = "image/png";

export default function OgImage() {
  return generateOgImage({
    section: "reference",           // "home" | "trip" | "pack" | "crew" | "reference"
    sectionLabel: "REFERENCE",      // eyebrow text (all caps)
    title: "Altitude & Safety",
    subtitle: "AMS symptoms · 12,441 ft peak · critical descents",  // optional
  });
}
```

### `force-dynamic` workaround

Next.js does **not** inject route-level `opengraph-image.png` into metadata for `force-dynamic` pages. These pages must set `openGraph.images` explicitly in their metadata export:

```ts
export const metadata: Metadata = {
  title: "Gear Check",
  openGraph: { images: [{ url: "/crew/gear-check/opengraph-image.png" }] },
  twitter: { card: "summary_large_image" },
};
export const dynamic = "force-dynamic";
```

**Affected pages** (all `force-dynamic`): `crew/weights`, `crew/gear-check`, `crew/roster`, `pack/gear`, `pack/calculator`.

---

## 14. Key Architectural Decisions

**1. Static data vs. database**
Trip data that doesn't change (itinerary structure, crew roster, gear reference) lives in `src/data/` as TypeScript. Only user-mutable data (packing lists, weights, certifications, itinerary admin edits) is in Supabase. This makes the app fast to build and testable without a DB connection.

**2. Idempotent gear seeding**
`seedCoreItemsForCrewMember()` runs on every `/pack/gear` page load for the current user. It uses an upsert keyed on `(crew_member_id, name)` — inserts are skipped if the item already exists. This means new items added to `core_gear_items` automatically appear in users' lists on next visit without manual migration.

**3. Role-aware shelter defaults**
Scouts get the Philmont Thunder Ridge tent (43 oz, `is_core=true`, `is_packed=true`) and the Personal 1P option (`is_not_packing=true`). Advisors get the reverse. This logic lives in `seedCoreItemsForCrewMember()` and is replicated in `resetCrewMemberGearList()` and `syncCoreItemsForAllMembers()`.

**4. Cascading core item updates**
When an admin renames an item, changes `required`, or updates `sort_order` in the gear editor, the server action cascades those changes to all matching `packing_items` rows (`WHERE name = $name AND is_core = true`). User-entered weights, flags, and notes are preserved.

**5. Travel-only category exclusion**
Items in `"Travel / Basecamp Only"` are excluded from all pack-weight math. `computeTotals()` checks `TRAVEL_ONLY_CATEGORIES` (a `Set`) and skips matching items entirely. They still track `is_packed` state for departure checklists.

**6. Admin allow-list, not role-based**
Admin access is an explicit email allow-list in the `admins` table — not a column on `crew_members` or a Supabase custom claim. This prevents privilege escalation via the claim flow and keeps the admin set small and auditable.

**7. Weight calculation modes**
Users toggle between:
- **Calculated** (`use_actual_base_weight = false`): base weight computed by `computeTotals()` from their `packing_items`
- **Actual** (`use_actual_base_weight = true`): user-entered `actual_base_weight_lbs` is used directly

The Philmont tent's weight (`uses_philmont_tent`) is added on top in actual mode because it's shared crew gear not always reflected in personal item lists.

**8. Print-first layout**
The gear-check grid, roster, and packing list are designed to print well. CSS uses `color-adjust: exact` to preserve status colors. Print styles hide nav elements and show section headers. Layouts are dense grids, not card stacks.

---

## 15. Naming Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| Component files | `PascalCase.tsx` | `PackWeightCalculator.tsx` |
| Route pages | `page.tsx`, `layout.tsx` | (fixed by Next.js) |
| Server actions | `actions.ts` (co-located) | `src/app/pack/gear/actions.ts` |
| Lib utilities | `camelCase.ts` | `packing.ts`, `crew.ts` |
| Types-only modules | `*-types.ts` | `packing-types.ts` |
| Static data | `camelCase.ts` | `packWeights.ts`, `coreItems.ts` |
| Domain types | Singular noun, PascalCase | `CrewMember`, `PackingItem` |
| Tone/variant unions | string literal union | `"info" \| "ok" \| "warn"` |
| DB columns | `snake_case` | `crew_member_id`, `is_packed` |
| TypeScript properties | `camelCase` (mapped from DB) | `crewMemberId`, `isPacked` |

**Import paths** — always use the `@/` alias:
```ts
import { Section } from "@/components/primitives/Section";
import { getMyCrewMember } from "@/lib/crew";
import { PACK_WEIGHT_TABLE } from "@/data/packWeights";
```

**Forbidden**: Default exports from `lib/` utilities. Named exports only.
