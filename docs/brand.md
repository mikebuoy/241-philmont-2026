# Tooth of Time — Brand Identity

**Domain:** toothoftime.app
**Product:** Philmont trek planning and pack weight management app
**Audience:** BSA crews preparing for Philmont Scout Ranch — scouts (teens), advisors (adults), parents

---

## Positioning

Tooth of Time is a **field manual, not a consumer hiking app.**

- **Not** Strava (athletic, aspirational, performance)
- **Not** AllTrails (consumer-friendly, lifestyle green)
- **Not** REI co-op aesthetic (catalog warmth, gear-as-identity)
- **Yes** — flight-ops briefing meets USGS topo map meets a well-loved field journal

The name anchors to the iconic granite formation hikers summit on Day 12 — the "you made it back" landmark. The brand should feel like the rock itself: pragmatic, solid, slightly austere, with warmth coming from materials and typography rather than decoration. Information-dense, weatherworn, earned.

### Voice

- Direct. Functional. No marketing fluff.
- Treats the reader as capable. Doesn't condescend to scouts. Doesn't talk down to parents.
- Comfortable with weight, numbers, consequences ("Ounces = Pounds. Pounds = Pain.").
- Warm where it matters (training, safety, hydration). Cold where precision matters (gear, weights, water).

---

## Color Palette

### Primary

| Token | Hex | Use |
|---|---|---|
| **Granite** | `#2A2A28` | Text, primary UI, logo mark. Near-black with warm undertone — reads like wet basalt. |
| **Bone** | `#F5F1E8` | Background. Warm off-white, slightly warmer than the crew brief's `#f5f4f0`. More vellum, less gallery. |
| **High Country Blue** | `#1E4D6B` | Buttons, links, accent rules. The color of the Philmont sky 30 minutes after sunset at 9,000 ft. Not navy, not cobalt. |

### Earth Accents (use sparingly — these are seasoning, not staples)

| Token | Hex | Use |
|---|---|---|
| **Trail Dust** | `#B8845A` | Warm tan/ochre. Highlights, "you are here" markers, hover states. |
| **Aspen** | `#D4B547` | Muted gold. Reserved for celebratory moments (trek complete, milestones hit). Aspen leaves in late September — not yellow. |

### Functional / Status (siloed to the weight calculator and status systems)

| State | Text | Background | Use |
|---|---|---|---|
| **On target** | `#155724` | `#D4EDDA` | Pack weight ≤ 20% body weight |
| **Caution** | `#856404` | `#FFF3CD` | Pack weight 20–25% body weight |
| **Over limit** | `#721C24` | `#F8D7DA` | Pack weight > 25% body weight |

### Surface & Border Tokens (from the crew brief — keep)

| Token | Hex | Use |
|---|---|---|
| Surface | `#FFFFFF` | Cards, panels |
| Surface 2 | `#F0EFE9` | Inset blocks, code, secondary panels |
| Border | `#E0DDD4` | 0.5px hairlines |
| Border strong | `#C8C4B8` | 1px dividers, totals rows |
| Text muted | `#6B6860` | Sublabels, metadata |
| Text faint | `#9B9890` | Captions, source citations |

### Palette Rules

1. **Granite + Bone + High Country Blue** is the 3-color foundation. Any screen should hold up using only these three.
2. Earth accents (Trail Dust, Aspen) appear only when something deserves attention. If everything is highlighted, nothing is.
3. Functional colors stay inside the weight calculator and status badges. Do not bleed status green into "success" toasts elsewhere — let the functional palette have a single, clear job.

---

## Typography

### Type Family

**IBM Plex** — free, open-source, ships from Google Fonts. Already used in the crew brief.

- **IBM Plex Sans** — body, headlines, UI
- **IBM Plex Sans Condensed** — wordmark, display, large section headers
- **IBM Plex Mono** — numbers, data, labels, tags, eyebrows

### Why Plex

Plex Sans has the slightly geometric, technical feel of a field manual without being cold. Plex Mono gives numbers (weights, elevations, distances, dates) the "instrument readout" texture this app lives or dies by. Plex Sans Condensed compresses display text into something that reads like a stamped trail sign or USGS map label.

### Type Scale

| Use | Family | Weight | Size | Tracking | Line height |
|---|---|---|---|---|---|
| Wordmark / display | Plex Sans Condensed | 600 | varies | +0.02 to +0.04em | 1.0 |
| Page title | Plex Sans | 600 | 26px | -0.02em | 1.2 |
| Section title | Plex Sans | 600 | 13px UPPER | +0.05em | 1.3 |
| Subsection (h3) | Plex Mono | 600 | 12px UPPER | +0.04em | 1.3 |
| Body | Plex Sans | 400 | 13px | 0 | 1.6 |
| Caption / sub | Plex Sans | 400 | 11px | 0 | 1.5 |
| Numbers / data | Plex Mono | 400–500 | matches context | 0 | 1.4 |
| Eyebrow / section num | Plex Mono | 500 | 10–11px UPPER | +0.08em to +0.1em | 1.2 |
| Badge / tag | Plex Mono | 500 | 10–11px | 0 | 1.0 |

### Type Rules

1. **Numbers go in Plex Mono. Always.** Weights, elevations, distances, dates, percentages, counts. The mono treatment is what makes the app feel like an instrument.
2. Plex Sans Condensed is for display only. Do not use it for body or UI labels — it reads as too "designed" at small sizes.
3. Section headers use the mono eyebrow + condensed/sans title pairing established in the crew brief. Keep this pattern app-wide.
4. Never stack three weights of Plex Sans in one screen. Pick two (typically 400 + 600) and hold the line.

---

## Logo

### Recommended Direction

**Stamp mark.** Rectangular or rounded-rectangle treatment, `TOOTH OF TIME` in Plex Sans Condensed caps, with `9003 FT` as a Plex Mono subline below. No illustration.

**Why:** Most type-forward, ages best, hardest to do wrong, scales from favicon to swag. Reinforces the field-manual brand. Easy to render in single-color contexts (embroidery, stamp, monochrome print).

### Alternate Direction

**Silhouette mark.** The Tooth of Time's actual profile — a wedge of granite jutting off a ridge — rendered as a simple 2-color geometric shape, not photorealistic. Pairs with wordmark below or beside. Strongest emotional pull for anyone who has been to Philmont.

### Logo Rules

- **Primary color:** Granite `#2A2A28` on Bone `#F5F1E8`
- **Inverted:** Bone on Granite for dark surfaces, app icon dark mode
- **Single-color:** Always reduces cleanly to one color — no gradients, no drop shadows, no inner glows
- **Minimum size:** Wordmark legible at 16px height. Stamp legible at 32px. Favicon: silhouette mark only, no text.
- **Clear space:** Equal to the cap height of the wordmark on all sides
- **Don't:** Outline it. Italicize it. Rotate it. Animate it on entry. Add a tagline.

### App Icon

Silhouette mark (peak profile) centered on a Granite or High Country Blue field, with subtle Bone-toned vignette. No text in the icon — text is unreadable at iOS/Android icon sizes anyway.

---

## Visual Language

### Density

The crew brief established it: **dense beats sparse.** This is a reference app, not a feed. Scouts and advisors need information packed efficiently into a small screen. White space is structural, not decorative.

### Borders & Surfaces

- 0.5px hairlines for routine dividers (Border `#E0DDD4`)
- 1px dividers for section transitions and totals rows (Border strong `#C8C4B8`)
- 6–8px border-radius on cards. No rounder. This is a field manual, not a SaaS dashboard.
- Cards sit on Surface 2 (`#F0EFE9`) inset blocks when they need to recede

### Iconography

- Use real icons where they earn their space (warning, water, weight, shelter, compass, food)
- Prefer line/stroke icons over filled — matches the field-manual feel
- Emoji is acceptable in the existing crew brief style for scannable status (📋 ⛺ 🎒 💧 ⚖) but use it sparingly and never in body prose

### Photography & Illustration

If photography is ever used: **black and white or duotone (Granite + Bone or Granite + High Country Blue).** No saturated landscape photos. The brand draws its color from the type and UI, not from imagery.

Illustrations, if any: thin-stroke linework, single-color, USGS-topo-inspired. No flat-illustration mascots, no isometric people, no rounded-corner sticker art.

### Layout Rhythm

- Section number + section title in a fixed eyebrow pattern (e.g. `01 KNOW YOUR PACK WEIGHT LIMIT`)
- Stat grids and panel grids — 2 or 3 columns on desktop, collapse to 1 on mobile
- Tables get horizontal scroll on mobile, never reformat into card stacks

---

## Anti-Patterns (Things This Brand Does Not Do)

- ❌ Drop shadows on cards
- ❌ Gradients in the UI or logo
- ❌ Hand-drawn or "friendly" illustration styles
- ❌ Stock photography of smiling hikers
- ❌ Saturated REI green or AllTrails green
- ❌ Rounded-pill buttons larger than 4px radius
- ❌ Emoji in headlines or marketing copy
- ❌ Glassmorphism, neumorphism, or any decorative depth treatments
- ❌ "Adventure awaits" / "Find your trail" voice
- ❌ Talking down to scouts. Talking up to parents.

---

## Quick-Reference CSS Tokens

```css
:root {
  /* Primary */
  --granite: #2A2A28;
  --bone: #F5F1E8;
  --high-country-blue: #1E4D6B;

  /* Earth accents */
  --trail-dust: #B8845A;
  --aspen: #D4B547;

  /* Functional — on-target */
  --status-green-bg: #D4EDDA;
  --status-green-text: #155724;

  /* Functional — caution */
  --status-amber-bg: #FFF3CD;
  --status-amber-text: #856404;

  /* Functional — over limit */
  --status-red-bg: #F8D7DA;
  --status-red-text: #721C24;

  /* Surfaces */
  --surface: #FFFFFF;
  --surface-2: #F0EFE9;
  --border: #E0DDD4;
  --border-strong: #C8C4B8;
  --text: #2A2A28;
  --text-muted: #6B6860;
  --text-faint: #9B9890;

  /* Type */
  --font-sans: 'IBM Plex Sans', system-ui, sans-serif;
  --font-condensed: 'IBM Plex Sans Condensed', 'IBM Plex Sans', sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
}
```

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Sans+Condensed:wght@500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

*Brand identity v1 — May 2026. Update as the product evolves.*
