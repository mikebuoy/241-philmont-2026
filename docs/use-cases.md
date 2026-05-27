# Use Cases

_Last updated: 2026-05-26_

_Format: As a [audience], I want to [action] so that [outcome]._
_Tag each case: **MVP** (built) or **Future** (not yet built)_

---

## Scouts & Advisors — Personal Pack

### UC-01 — Manage my personal packing list
**As a** crew member, **I want to** see all gear items pre-seeded from the troop list, mark items I'm not bringing, enter actual weights, and check off items as I pack them **so that** I have a live, accurate picture of what's going into my pack.
- **Scope:** MVP
- **Happy path:** User opens `/pack/gear`; items grouped by category with checkboxes, weights, and not-packing toggle. Changes auto-save to Supabase.
- **Edge cases:** First visit — items pre-seeded from admin-defined gear list. Not-packing items disable the packed checkbox and are filterable.

### UC-02 — See my pack weight at a glance
**As a** crew member, **I want to** see my base weight and estimated max weight (with food and water) without doing any math **so that** I know if I'm within a safe load before the trek.
- **Scope:** MVP
- **Happy path:** Sticky weight summary bar at top of `/pack/gear` shows Base and Est. Max weight live; collapses to compact bar on scroll.
- **Edge cases:** Weight changes as items are toggled not-packing or weights are edited — bar updates in real time without page reload.

### UC-03 — Estimate pack weight before entering individual gear weights
**As a** crew member, **I want to** enter category-level estimates (shelter, clothing, etc.) **so that** I can get a ballpark pack weight before I've weighed every item.
- **Scope:** MVP
- **Happy path:** User opens `/pack/calculator`, enters lump-sum estimates per category, sees total with food and water.
- **Edge cases:** Does not save to DB — ephemeral estimator only.

### UC-04 — Check what food I'm responsible for
**As a** crew member, **I want to** see the food assignments for each day of the trek **so that** I know what to pack and what gets resupplied.
- **Scope:** MVP
- **Happy path:** `/pack/food` shows meal plan by day with assignments.

---

## Scouts & Advisors — Trip & Reference

### UC-05 — Follow the itinerary day by day
**As a** crew member, **I want to** see each trail day's camp, mileage, elevation, and notes **so that** I know what to expect on and off trail.
- **Scope:** MVP
- **Happy path:** `/trip/itinerary` shows all days; each day links to a detail page with elevation profile and admin-authored notes.
- **Edge cases:** Available without sign-in; cached by service worker for offline use.

### UC-06 — Access reference material without cell service
**As a** crew member, **I want to** read gear standards, duty rotation, cooking procedures, and bear bag instructions while on trail **so that** I don't need to carry printed guides.
- **Scope:** MVP
- **Happy path:** User installs PWA before departure; `/reference/*` pages served from service worker cache on trail.
- **Edge cases:** Content updated after install — stale cache served until next online visit.

### UC-07 — See the training plan before the trek
**As a** crew member, **I want to** review the recommended training schedule **so that** I arrive physically prepared for an 81-mile Super Strenuous trek.
- **Scope:** MVP
- **Happy path:** `/trip/training` shows training recommendations by weeks-out.

---

## Advisors — Crew Management

### UC-08 — Monitor the full crew's pack weights
**As an** advisor, **I want to** see every crew member's current base weight and estimated max weight in one table **so that** I can flag anyone who is over-weight before departure.
- **Scope:** MVP
- **Happy path:** `/crew/weights` shows all members with their live weights pulled from Supabase.
- **Edge cases:** Members who haven't entered weights show as 0 lbs — distinguishable from members who have zeroed out items.

### UC-09 — Track crew gear check status
**As an** advisor, **I want to** mark each crew member's gear check as passed or not-yet-checked **so that** I have a completion view for pre-departure inspection.
- **Scope:** MVP
- **Happy path:** `/crew/gear-check` shows grid of members with pass/fail status; advisors can toggle status.

### UC-10 — See crew gear assignments
**As an** advisor, **I want to** see which shared crew gear items (stoves, water filters, etc.) are assigned to which crew members **so that** nothing is left behind and no item is doubled up.
- **Scope:** MVP
- **Happy path:** `/crew/gear` shows crew gear list with assigned carriers.

### UC-11 — View the full crew roster
**As an** advisor, **I want to** see all crew members with their roles and crew assignment **so that** I know who is in each sister crew.
- **Scope:** MVP
- **Happy path:** `/crew/roster` shows both crews with names, roles, and certifications.

---

## Trip Admin

### UC-12 — Manage the crew roster
**As an** admin, **I want to** add, edit, or remove roster entries and reset a member's gear state **so that** the roster stays accurate as the trip evolves.
- **Scope:** MVP
- **Happy path:** `/admin/roster` — admin signs in with Supabase, edits rows, saves changes.

### UC-13 — Edit itinerary day content
**As an** admin, **I want to** author or update the notes, mileage, and highlights for each trail day **so that** crew members see accurate day-by-day information.
- **Scope:** MVP
- **Happy path:** `/admin/itinerary/[day]` — admin edits structured fields, saves to Supabase.

### UC-14 — Manage the master gear list
**As an** admin, **I want to** add, edit, or remove items from the troop gear list and sync changes to all crew members' packing lists **so that** everyone starts from the same baseline.
- **Scope:** MVP
- **Happy path:** `/admin/gear` — admin edits items; Sync All button pushes changes to member packing rows.

---

## Future AI Assistant

### UC-15 — Resume development after context reset
**As a** future AI session, **I want to** read `docs/handoff.md` and `docs/status.md` to orient myself, then read relevant `src/` files **so that** I can contribute to features without re-deriving the data model or app structure.
- **Scope:** MVP
- **Happy path:** AI reads handoff for context, status for current state, identifies the relevant route (`src/app/<section>/`), reads the page and editor files, then makes targeted edits.
- **Edge cases:** Docs may lag behind recent changes — always verify against actual `src/` files before assuming docs are current.

---

**See also:** `docs/handoff.md` · `docs/scope.md` · `docs/audiences.md` · `docs/ARCHITECTURE.md §10`
