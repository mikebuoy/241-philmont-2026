@AGENTS.md

# Tooth of Time — Philmont 2026 Trek App

Private mobile-first web app for BSA Troop 241, Trek 12-23.  
**Live:** toothoftime.app  
**Stack:** Next.js 16 App Router · Supabase · Tailwind CSS v4 · Vercel  
**Dev:** `npm run dev` → http://localhost:3000

---

## Start here for any new session

All docs are in `docs/`. Read in this order:

| Doc | What it covers |
|---|---|
| **`docs/handoff.md`** | Cold-start overview — what it is, who uses it, key domain logic |
| **`docs/status.md`** | Current state — what's working, what's broken, next up. **Read before starting work.** |
| **`docs/gotchas.md`** | Non-obvious foot-guns — read before editing a feature area |
| **`docs/ARCHITECTURE.md`** | Full DB schema, data access layer, auth flow, component conventions — **authoritative** |
| **`docs/brand.md`** | Color, typography, voice, anti-patterns — read before any UI work |
| **`docs/ux-conventions.md`** | Primitives, layout rules, button patterns, responsive behavior |
| **`docs/scope.md`** | Goals, non-goals, constraints |
| **`docs/audiences.md`** | Who uses the app and what they need |
| **`docs/use-cases.md`** | 15 use cases with happy paths and edge cases |

---

## Key facts

- **Supabase admins:** `mikebuoy@gmail.com`, `rickdtownsend@gmail.com`
- **Crew:** 22 members, two sister crews (Crew 1 and Crew 2)
- **Trek dates:** June 14–27, 2026
- **Do not deploy to prod until Mike verifies on localhost**

---

## Session-end checklist

Before closing any session, update these files:

1. **`docs/status.md`** — mark finished work as done, update "In Progress" with current state, refresh "Next Up"
2. **`docs/gotchas.md`** — add anything non-obvious that came up during the session
3. **`docs/handoff.md`** — update "What's In Progress / Known Issues" if a bug changed state
4. Update `_Last updated:` date on any doc you changed

Do not skip this. The next session starts by reading `docs/status.md`. If it's stale, the agent re-derives state from scratch.
