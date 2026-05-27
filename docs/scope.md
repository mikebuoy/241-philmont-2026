# Project Scope

_Last updated: 2026-05-26_

## What It Is

**Tooth of Time** is a private, mobile-first web app for BSA Troop 241's Philmont 2026 trek (Trek 12-23). It centralizes trip logistics, personal packing, and crew coordination in one place — replacing scattered spreadsheets, group texts, and PDF gear lists.

- **URL:** toothoftime.app
- **Stack:** Next.js 16 (App Router), Supabase (auth + DB), Tailwind, PWA-installable
- **Trek:** June 14–27, 2026 · 81 miles · Super Strenuous · Sister crews

## Goals

- Give each crew member a personalized packing list they can manage on their phone: track what's packed, what's not coming, and see live weight totals.
- Let advisors monitor the full crew's pack weights and gear check status from one view.
- Surface the full trek itinerary (day-by-day camps, elevation, meals) without requiring sign-in.
- Provide reference material (gear standards, duty rotation, cooking guide, bear bag procedure) offline — available after PWA install even without cell service.
- Give the trip leadership an admin panel to manage the roster, crew gear assignments, and itinerary content.

## Non-Goals

- Not a general-purpose scout trip app — all content and logic is specific to Trek 12-23.
- Not a communication platform — no messaging, notifications, or push alerts.
- Not connected to Philmont's systems — itinerary data is maintained manually by the trip admin.
- No public registration — roster is seeded by admin; scouts claim their slot after signing in.

## Constraints

- **Cell service:** Philmont backcountry has no reliable signal — offline capability via PWA service worker is required for reference pages.
- **Auth:** Supabase email magic-link. Each crew member claims a roster slot on first sign-in; no account creation flow beyond that.
- **Roster is closed:** 22 participants across two sister crews. Admin manages additions/removals.
- **Date:** Trek departs June 14, 2026. App is in active use through late June 2026.

---

**See also:** `docs/handoff.md` · `docs/audiences.md` · `docs/use-cases.md` · `docs/ARCHITECTURE.md`
