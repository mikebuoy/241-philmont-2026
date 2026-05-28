# Project Handoff — Tooth of Time (Philmont 2026)

_Last updated: 2026-05-27_

This doc is for an AI agent (or human) picking up this project cold. Read it first, then check `docs/status.md` for current state before touching code.

---

## What This Is

**Tooth of Time** is a private, mobile-first web app for BSA Troop 241's Philmont 2026 trek. It serves 22 crew members across two sister crews on Trek 12-23 (June 14–27, 2026 · 81 miles · Super Strenuous). Think field manual + pack weight calculator + crew logistics dashboard — built to work offline on trail.

- **Live URL:** toothoftime.app
- **Stack:** Next.js 16 App Router · React 19 · TypeScript strict · Tailwind CSS v4 · Supabase (Postgres + Auth) · Vercel
- **Repo:** `/Users/mbuoy/git-projects/philmont-2026`
- **Dev:** `npm run dev` → http://localhost:3000. This intentionally runs `next dev --webpack`; do not use raw `next dev` until the Turbopack reload loop in `docs/gotchas.md` is resolved.

---

## Who Uses It

| Audience | What they do in the app |
|---|---|
| **Scouts** | Manage their personal packing list, check weights, read itinerary and reference pages |
| **Advisors** | Everything scouts do + crew pack weight dashboard, gear-check, crew gear assignments |
| **Trip admin (Mike Buoy)** | Admin panel — manages roster, gear list, itinerary content |
| **Future AI** | Read `docs/` before editing. `docs/ARCHITECTURE.md` is the authoritative technical reference. |

Auth is Supabase (Google OAuth + magic link). After sign-in, each user claims a roster slot from a pre-seeded list of 22 names. One claim per user. No public registration.

---

## App Sections (Nav)

| Route | What's here |
|---|---|
| `/` | Overview — trek stats, personalized greeting |
| `/trip/itinerary` | Day-by-day camp list with miles, elevation, badges |
| `/trip/itinerary/[day]` | Single-day detail — elevation profile, notes, programs |
| `/trip/training` | Pre-trek training plan |
| `/pack/calculator` | Ephemeral weight estimator (no DB) |
| `/pack/gear` | Personal packing list — weights, packed/not-packing flags, auto-save |
| `/pack/food` | Meal plan and food assignments |
| `/crew/roster` | All 22 members with roles and crew assignment |
| `/crew/weights` | Everyone's base weight + est. max, color-coded by zone |
| `/crew/gear-check` | Pass/fail gear check dashboard (admin-updatable) |
| `/crew/gear` | Shared crew gear with assigned carriers |
| `/reference/*` | Gear standards, duty rotation, cooking, bear bag, altitude — cached offline |
| `/admin/*` | Admin panel — roster, gear editor, itinerary editor |
| `/claim` | Roster-slot claiming page (post-signup) |
| `/install` | PWA install guide + iOS profile download |

---

## Database (Supabase)

Five key tables. All use Row-Level Security.

| Table | What it holds |
|---|---|
| `admins` | Email allow-list (2 admins: `mikebuoy@gmail.com`, `rickdtownsend@gmail.com`) |
| `crew_members` | 22 roster rows — user bindings, body weights, certification status, settings |
| `packing_items` | Personal packing list rows — one set per crew member, seeded from core items |
| `core_gear_items` | Admin-managed master gear list — source of truth for packing list seeding |
| `gear_categories` | Ordered category list for gear display |
| `itinerary_days` | One row per calendar day — camp, route, elevation, notes, GPX path |

Migrations are in `supabase/` (SQL files, run manually in Supabase SQL editor — no CLI migration runner in use). Seeds in `scripts/seed.ts` and `scripts/seed-crew.ts`.

For the full schema with all columns and RLS policies, see `docs/ARCHITECTURE.md §4`.

---

## Code Layout

```
src/
├── app/                # Routes — all pages and server actions live here
│   ├── admin/          # Admin-only pages (gated via layout redirect)
│   ├── crew/           # Crew dashboards
│   ├── pack/           # Packing tools
│   ├── reference/      # Static reference pages (offline-cached)
│   ├── trip/           # Itinerary + training
│   ├── globals.css     # All design tokens (@theme)
│   └── layout.tsx      # Root layout — fonts, nav, PWA
├── components/
│   ├── nav/            # TopNav, BottomNav, SubNav, navItems.ts
│   ├── primitives/     # Page, Section, Panel, Box, Stat, StatusBadge
│   └── admin/          # SaveButton, EditPageButton, etc.
├── data/               # Static TypeScript — no DB, no fetch
│   ├── meta.ts         # Trek dates, distance, elevation, crew count
│   ├── roster.ts       # CREWS array, CrewRole type, ROLE_LABEL map
│   ├── packWeights.ts  # PACK_WEIGHT_CONSTANTS, computeTargets(), weight table
│   ├── coreItems.ts    # CORE_ITEMS array, TRAVEL_ONLY_CATEGORIES Set
│   └── itinerary.ts    # isoToSlug(), CampType, ItineraryDay type
└── lib/                # Server-only utilities (import "server-only")
    ├── crew.ts         # getMyCrewMember(), getAllCrewMembers()
    ├── packing.ts      # getPackingItems(), seedCoreItemsForCrewMember()
    ├── packing-types.ts # PackingItem, Totals, computeTotals() — client-safe
    ├── gear.ts         # getGearCategories(), getCoreGearItems()
    ├── itinerary.ts    # getItinerary(), getDayByIso()
    └── supabase/       # client.ts (browser), server.ts (SSR), admin.ts (service-role)
```

Key rules:
- Files in `src/lib/` are server-only — never import them from client components (`"use client"`)
- `src/lib/packing-types.ts` is the exception — client-safe pure types and math
- All server actions live in `actions.ts` co-located with the route they serve
- Use `@/` import alias throughout — never relative imports across directories

---

## Key Domain Logic

### Weight math

Pack weight targets are a percentage of body weight:
- **20%** = crew goal
- **25%** = crew standard (warn zone)
- **30%** = Philmont hard ceiling (over/critical zone)

Base weight = sum of non-worn, non-not-packing items in oz (from `computeTotals()` in `src/lib/packing-types.ts`). Trail load adds ~14.7 lbs for food, water, and crew gear share. `computeTargets(bodyWeight)` in `src/data/packWeights.ts` returns the three thresholds.

Items in `"Travel / Basecamp Only"` category are excluded from all weight math (`TRAVEL_ONLY_CATEGORIES` Set in `src/data/coreItems.ts`).

### Gear seeding

`seedCoreItemsForCrewMember()` in `src/lib/packing.ts` runs on every `/pack/gear` page load — idempotent, inserts any missing core items, preserves user edits. Role-aware: scouts and advisors get different default shelter configs.

### Admin access

Email allow-list in `admins` table only. Check via `isCurrentUserAdmin()` in `src/lib/supabase/admin.ts` before any `createAdminClient()` call. Admin layout at `src/app/admin/(private)/layout.tsx` redirects non-admins to sign-in.

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=        # Required — from Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Required — from Supabase project settings
SUPABASE_SERVICE_KEY=            # Server-only — service-role key, never expose to client
# Build-time (injected by next.config.ts, do not set manually):
NEXT_PUBLIC_BUILD_SHA=
NEXT_PUBLIC_BUILD_DATE=
```

---

## What's In Progress / Known Issues

- **Core items in code, not DB**: `src/data/coreItems.ts` is still a static TypeScript array. A TODO comment in that file notes a future admin UI to move it to Supabase. Until then, gear list changes require a code push.

---

## Go Deeper

All docs live in `docs/`. Read in this order for a specific area:

| Doc | What it covers |
|---|---|
| `docs/status.md` | **Current state** — what's working, what's broken, next up. Read before starting work. |
| `docs/gotchas.md` | Non-obvious foot-guns — read before editing a feature area |
| `docs/ARCHITECTURE.md` | Full schema, data access layer, auth flow, component conventions, design tokens, OG image pattern, all architectural decisions — **authoritative** |
| `docs/brand.md` | Color philosophy, typography, voice, anti-patterns — read before any UI work |
| `docs/ux-conventions.md` | Primitives usage, layout rules, button patterns, responsive behavior, print |
| `docs/scope.md` | Goals, non-goals, constraints |
| `docs/audiences.md` | Who uses the app and what they need |
| `docs/use-cases.md` | 15 use cases with happy paths and edge cases |
| `AGENTS.md` | Next.js version warning + branding reminder |

**Before writing any code**: read `docs/ARCHITECTURE.md`. It has the full DB schema, all lib function signatures, every architectural decision, and naming conventions. It's authoritative.

---

**See also:** `docs/status.md` · `docs/gotchas.md` · `docs/scope.md` · `docs/audiences.md` · `docs/use-cases.md` · `docs/ux-conventions.md` · `docs/ARCHITECTURE.md` · `docs/brand.md`
