# Project Status — Tooth of Time

_Last updated: 2026-05-27_

This is a living doc. Update it at the end of every session before closing. The next session reads this first.

---

## What's Working (verified on localhost)

- **`/pack/gear`** — Personal packing list, full feature set:
  - Items grouped by category, pre-seeded from admin gear list
  - Weight entry with auto-save (400ms debounce)
  - Packed checkbox per item
  - Not-packing toggle (circle-slash SVG icon)
  - Packed checkbox disabled when item is marked not-packing
  - Filters: "Hide non-packing items" and "Hide packed items" (both default false)
  - Sticky weight summary bar with expanded/compact dual-layer layout
  - Compact bar shows: `Base: X lbs | Est. Max: Y lbs | [Edit]`
  - Edit mode column headers
  - Blue info note above the green bar, scrolls away with page
  - SubNav (Estimator / My Packing List / Food) scrolls away correctly
  - React key warnings resolved
  - Desktop: no erroneous top margin above sticky bar
  - Scroll-linked collapse/expand animation working (feedback loop bug fixed)

- **`/pack/calculator`** — Ephemeral weight estimator, no DB

- **`/pack/food`** — Meal plan display

- **`/trip/itinerary`** and **`/trip/itinerary/[day]`** — Full itinerary with elevation profiles, day schedule, what-to-expect narratives, meals, crew notes, and crew leader notes (pending migration + seed below)

- **`/trip/training`** — Training plan

- **`/crew/roster`**, **`/crew/weights`**, **`/crew/gear-check`**, **`/crew/gear`** — All crew dashboards

- **`/reference/*`** — All reference pages, PWA-cached

- **`/admin/*`** — Roster editor, gear editor, itinerary editor

- **Auth + claim flow** — Sign-in → claim → personalized session

---

## In Progress / Broken

**Itinerary enrichment — awaiting DB migration + seed run (code complete, build passing):**

New data (day schedule, light table, what-to-expect, meals, crew notes, crew leader notes) is coded and build-verified but won't display until:
1. Run the new SQL block at the bottom of `supabase/migration.sql` in the Supabase SQL editor
2. Run `npx tsx scripts/seed.ts` from project root

The app degrades gracefully before migration — existing itinerary pages work fine, new sections just don't appear.

---

## Next Up

- Run migration + seed to activate itinerary enrichment
- Consider print layout for `/trip/itinerary` (full itinerary on one page)

---

## Deploy Status

- **Do not push to prod without Mike verifying on localhost first.**
- Last known prod state: all features except scroll animation bug.

---

**See also:** `docs/handoff.md` · `docs/gotchas.md`
