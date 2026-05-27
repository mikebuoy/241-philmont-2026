<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Branding

For any branding, design, color, typography, or copy decisions, read `docs/brand.md` first and follow it. Do not invent colors, fonts, or tone that contradict it.

# Project docs

All docs live in `docs/`. Read these before writing any code:

```
docs/
├── handoff.md        ← Start here — cold-start overview, key domain logic
├── status.md         ← Current state: what's working, what's broken, next up
├── gotchas.md        ← Non-obvious foot-guns specific to this codebase
├── ARCHITECTURE.md   ← Full schema, data access, auth flow, decisions — authoritative
├── brand.md          ← Color, typography, voice — read before any UI work
├── ux-conventions.md ← Primitives, layout rules, button patterns, responsive
├── scope.md          ← Goals, non-goals, constraints
├── audiences.md      ← Who uses the app and what they need
└── use-cases.md      ← 15 use cases with happy paths and edge cases
```

**Do not deploy to prod without Mike Buoy (mikebuoy@gmail.com) verifying on localhost first.**
