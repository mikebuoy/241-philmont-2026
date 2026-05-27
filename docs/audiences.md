# Audiences

_Last updated: 2026-05-26_

## Primary Audiences
_Direct users of the app._

### Scouts (Youth Crew Members)
- **Who they are:** BSA youth participants in Trek 12-23. Each belongs to Crew 1 or Crew 2. One per crew holds a leadership role (Crew Leader, Chaplain Aide, or Guia).
- **What they need:** Their personal packing list (weights, packed/not-packing status), the trek itinerary day by day, and offline access to reference material on trail.
- **Technical level:** Mobile-native. Will install the PWA and use it primarily on phone.
- **Key concern:** Knowing their pack weight, what they still need to pack, and day-specific trail details without needing cell service.

### Advisors (Adult Participants)
- **Who they are:** Adult leaders accompanying the crew. One Lead Advisor per crew is responsible for the crew overall.
- **What they need:** Everything scouts need, plus crew-level views: all members' pack weights, gear check status, crew gear assignments, and duty rotation.
- **Technical level:** Comfortable with mobile apps; non-technical relative to the codebase.
- **Key concern:** Ensuring every crew member is trail-ready (correct gear, weight within limits) before departure.

---

## Secondary Audiences

### Trip Admin (Mike Buoy)
- **Who they are:** The app developer and trip organizer. Manages roster, crew gear, and itinerary content via the `/admin` panel (Supabase-authenticated).
- **Role in app:** Seeds the roster, assigns crew gear, edits itinerary days, resets gear state. Only user with admin-level Supabase access.

### Future AI Assistant
- **Who they are:** Any Claude session (or other AI) resuming work on this codebase after context reset.
- **Role in app:** Must be able to navigate the Next.js App Router structure, understand the Supabase schema, and contribute to features without re-deriving the data model. Read `docs/handoff.md` and `docs/status.md` first, then read relevant `src/` files before editing.

---

**See also:** `docs/handoff.md` · `docs/scope.md` · `docs/use-cases.md`
