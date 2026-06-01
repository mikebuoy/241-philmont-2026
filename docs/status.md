# Project Status — Tooth of Time

_Last updated: 2026-06-01_

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

- **`/trip/itinerary`** and **`/trip/itinerary/[day]`** — Full itinerary with elevation profiles, day schedule, what-to-expect narratives, meals, crew notes, and crew leader notes

- **`/trip/training`** — Training plan

- **`/crew/roster`**, **`/crew/weights`**, **`/crew/gear-check`**, **`/crew/gear`** — All crew dashboards
  - Roster shows WFA, CPR, and required medical form status. The MED column displays `ABC` green when received and red when missing.

- **`/reference/*`** — Restructured from 5 to 6 pages: Trek · Duties · On Trail · In Camp · Safety · Gear
  - `/reference/trek` — NEW: Big picture, crew roles, development phases (Forming→Adjourning), Arrowhead requirements, medical recheck, burro, trading posts, cell/electronics
  - `/reference/duty` — UPDATED: Added Patrol Method, Crew Roles (from trek data), Ranger Release Standard sections before existing duty types
  - `/reference/on-trail` — NEW: Pace & breaks, caterpillar technique, navigation + video, foot care, hiking etiquette
  - `/reference/in-camp` — NEW: Absorbs Cooking + Bear Bag; morning sequence, campsite setup, cook method, bear hang, water, hygiene/LNT, evening/nightly brief — all with videos
  - `/reference/safety` — NEW: Absorbs Altitude; AMS, defenses, critical descents, lightning, emergency, wildfire
  - `/reference/gear` — UPDATED: Added Pack & Fit videos section
  - Old routes `/reference/altitude`, `/reference/cooking`, `/reference/bear-bag` are deleted (404 cleanly)
  - `/reference` now redirects to `/reference/trek`
  - `tsc --noEmit` clean

- **`/admin/*`** — Roster editor, gear editor, itinerary editor
  - Admin roster uses a compact one-row-per-member table with narrow status columns and icon-only row actions.
  - Daily itinerary editor exposes editable public day fields. Calculated fields are either hidden because they already appear in the header or are read-only context: weekday/date labels, Philmont/trail day numbers, cumulative metrics, sun/light times, and meal codes.

- **Auth + claim flow** — Sign-in → claim → personalized session

- **Local dev server** — `npm run dev` runs Next.js in Webpack mode (`next dev --webpack`) to avoid a Turbopack localhost reload loop on admin itinerary edit pages. See `docs/gotchas.md`.

- **Scroll spy / deep linking** — URL hash updates as user scrolls through sections. 59 sections across 12 pages are addressable. Shared links (e.g. `/reference/skills#cooking`) scroll directly to that section on load. Scrolling to top clears the hash. `useScrollSpy` hook + `ScrollSpy` null component mount automatically via `<Page>`. See `docs/ARCHITECTURE.md` §11 and `docs/ux-conventions.md`.

---

## In Progress / Broken

**Turbopack local dev loop — worked around:**

Do not use raw `next dev` for local verification. It can repeatedly reload `/admin/itinerary/[day]` and make auth controls appear to flicker, with terminal panics mentioning `/admin/(private)/roster/page` and `Next.js package not found`. `npm run dev` now uses Webpack and was verified to stabilize the edit page.

**Crew medical form flag — awaiting DB migration:**

Run `supabase/migration-crew-med-form.sql` in the Supabase SQL editor to add `crew_members.med_form_received`. Until that migration is applied, the roster pages that read or update the MED field can fail with a missing-column error.

---

## Next Up

- Verify reference section on localhost: all 6 sub-nav items, all videos, all sections
- Consider print layout for `/trip/itinerary` (full itinerary on one page)

---

## Deploy Status

- **Do not push to prod without Mike verifying on localhost first.**
- Last known prod state: all features except scroll animation bug.

---

**See also:** `docs/handoff.md` · `docs/gotchas.md`
