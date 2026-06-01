# UX Conventions — Tooth of Time

_Last updated: 2026-05-26_

Reference for anyone building new pages or components. Describes patterns that are already established — don't invent alternatives without a strong reason.

---

## Layout

**Max width:** 900px, centered via `max-w-[900px] mx-auto`.

**Page padding:** `px-6 pt-8 pb-16`. All content lives inside this wrapper — use the `<Page>` primitive, not custom layout.

**Mobile bottom padding:** Mobile users have a fixed BottomNav at 56px. The `pb-16` on `<Page>` clears it. If a page opts out of `<Page>`, replicate this clearance.

**Content spacing:** Sections within a page are spaced `space-y-10`. Items within a section are `space-y-3`.

---

## Primitives

Use these components. Build new ones only when none of these fit.

### `<Page>`
Top-level page wrapper. Renders an eyebrow/title/meta header with a 2px solid ink border-bottom, then a `space-y-10` content area.

```tsx
<Page eyebrow="Trek 12-23" title="My Pack" meta="Optional subtitle line">
  ...
</Page>
```

Props: `eyebrow`, `title` (required), `meta`, `action` (right of eyebrow row), `headerRight` (right of eyebrow row alongside action), `titleRight` (right of h1 line).

### `<Section>`
Named content block within a page. Heading is 13px uppercase, font-semibold, tracking-[0.05em], with a `.section-rule` (1.5px solid ink) underline.

```tsx
<Section num="01" title="Shelter">
  ...
</Section>
```

`num` is optional — use it when sections benefit from numbering (reference pages). Omit on action-heavy pages.

`id` is optional — add it to make a section deep-linkable. The URL updates to `#<id>` as the user scrolls past the section. Treat these slugs as stable permalinks: once a link has been shared, do not rename the slug (heading text is free to change). Use short, lowercase, hyphenated slugs (e.g. `cooking`, `bear-bag`, `check-in`).

### `<Panel>`
White card with 0.5px border, rounded-lg, p-4. Use for grouped data that needs visual containment. Optional `title` renders as a mono uppercase label above children.

```tsx
<Panel title="Base Weight">...</Panel>
```

### `<Box>`
Left-border callout. 12px text, 3px left border. Use for contextual notes and status messages that live inline with content.

```tsx
<Box variant="info">Your personal packing list. Items pre-seeded from the troop gear list.</Box>
```

Variants: `info` (High Country Blue) · `ok` (green) · `warn` (amber) · `danger` (red)

### `<Stat>`
Mono number card. Rounded-md, 0.5px border. Use for key metrics.

```tsx
<Stat value="18.4" label="Base weight (lbs)" tone="ok" />
```

Tones: `default` · `gain` (dark green) · `loss` (dark red)

### `<StatusBadge>`
Inline mono pill. 11px, px-2, py-[3px], rounded. Use for status labels on rows and cards.

```tsx
<StatusBadge tone="warn">25% body weight</StatusBadge>
```

Tones: `info` · `ok` · `warn` · `over` · `critical` · `danger` · `issued` · `crew` · `neutral`

---

## Navigation

**TopNav** — desktop only (`hidden sm:block`). Horizontal link bar. Not fixed — scrolls with the page. Do not add `sm:top-14` offsets for sticky elements; use `top-0`.

**BottomNav** — mobile only (`sm:hidden`). Fixed at bottom, z-50. Icon + short label per section.

**SubNav** — secondary tabs within a section (e.g., Estimator / My Packing List / Food). Horizontal scrollable pills. Use `-mx-6 px-6 sm:mx-0 sm:px-0` to break out of page padding on mobile.

Active nav state: `bg-ink text-bg`. Inactive: `text-ink-muted hover:text-ink hover:bg-surface-2`.

---

## Typography

| Use | Size | Family | Weight | Tracking |
|---|---|---|---|---|
| Page h1 | 26px | sans | semibold | -0.02em |
| Section h2 | 13px | sans | semibold | 0.05em, uppercase |
| Eyebrow | 11px | mono | regular | 0.1em, uppercase |
| Body | 13px | sans | regular | — |
| Labels, captions | 11px | — | — | — |
| Numbers, data | — | mono | — | tabular nums |
| Nav brand | 15px | condensed | semibold | 0.02em, uppercase |

**Fonts:**
- `font-sans` → IBM Plex Sans (body, headings)
- `font-condensed` → IBM Plex Sans Condensed (nav brand only)
- `font-mono` → IBM Plex Mono (labels, numbers, badges, eyebrows)
- `font-num` → IBM Plex Mono with `font-feature-settings: "tnum" 1` (aligned numeric columns)

Base body size is 13px. Don't go below 11px for any readable text.

---

## Color Tokens

Always use CSS tokens (via Tailwind utilities). Never hardcode hex values except inside components that already do so (weight calculators use inline styles for dynamic status colors because Tailwind can't generate dynamic class names safely).

**Core:**
| Token | Value | Use |
|---|---|---|
| `bg` | #f5f1e8 | Page background (Bone) |
| `ink` | #2a2a28 | Primary text (Granite) |
| `ink-muted` | #6b6860 | Secondary text, labels |
| `ink-faint` | #9b9890 | Placeholder, disabled text |
| `surface` | #ffffff | Cards, panels |
| `surface-2` | #f0efe9 | Hover backgrounds, column headers |
| `border` | #e0ddd4 | Hairline borders |
| `border-strong` | #c8c4b8 | Table dividers |
| `hcblue` | #1e4d6b | High Country Blue — primary accent |

**Accent (use sparingly):**
- `trail-dust` — #b8845a — warm earth tone
- `aspen` — #d4b547 — gold accent

**Semantic (map to status):**
- `info-*` — High Country Blue tones — informational
- `ok-*` — green — within limits / complete
- `warn-*` — amber — approaching a threshold
- `danger-*` / `over-*` — red — over limit
- `critical-*` — solid red with white text — hard over-limit
- `issued-*` — blue — officially issued gear, leadership roles
- `crew-*` — green — crew-assigned items

---

## Status / Weight Zones

Pack weight status uses four zones based on % of body weight:

| Zone | Threshold | Token |
|---|---|---|
| OK | ≤ 20% | `ok` |
| Warn | 21–25% | `warn` |
| Over | 25–30% | `over` |
| Critical | > 30% | `critical` |

Cell shading (weight tables) uses matching `cell-ok`, `cell-warn`, `cell-over`, `cell-critical` tokens. These are applied as inline styles in data tables where Tailwind class generation would be dynamic.

---

## Borders

| Use | Spec |
|---|---|
| Panel / card | `border border-border` + `style={{ borderWidth: "0.5px" }}` |
| Page header | `border-b-2 border-ink` |
| Section heading | `.section-rule` — `border-b-[1.5px] border-ink` |
| Table hairline | `.hairline` — `border-color: border` |
| Table strong divider | `.hairline-strong` — `border-color: border-strong` |

The 0.5px panel border requires an inline style override because Tailwind's `border` utility maps to 1px. Don't use `border-[0.5px]` — it's unreliable across browsers.

---

## Buttons and Controls

**Primary action:** `bg-ink text-bg` with `rounded-md`, `px-5 py-2.5`, `text-[13px] font-medium`. Hover: `hover:opacity-90`. Active: `active:scale-95`. Focus: `focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-bg`.

**Disabled:** `disabled:opacity-60 disabled:cursor-wait` (saving) or `disabled:cursor-not-allowed` (unavailable).

**Ghost / text actions:** `text-ink-muted hover:text-ink hover:bg-surface-2 rounded-md px-3 py-1.5`.

**Checkboxes:** `accent-ink w-4 h-4`. When an item is not-packing, its packed checkbox is `disabled:opacity-30 disabled:cursor-not-allowed`.

**Toggle icons:** Use inline SVG. No icon library dependency. Not-packing uses a circle-slash SVG (14×14, stroke 1.5, `strokeLinecap: round`). Nav icons use strokeWidth 1.6 inactive, 2.2 active.

---

## Interactivity Patterns

**Auto-save:** Editable fields (weights, flags) debounce at 400ms then call a Server Action. No save button; no confirmation message unless admin-level.

**Optimistic UI:** Apply the change to local state immediately (`useState`), fire the Server Action in `startTransition`. Don't await before updating the UI.

**Form saves (admin):** Use `useFormStatus` for pending state. Disable the submit button and show a spinner + "Saving…" label while pending.

**Sticky summary bars:** Use `sticky top-0` (not `top-14` — TopNav is not fixed). Break out of page padding with `-mx-6 !mt-0`. Use a sentinel `<div>` + scroll handler to drive collapse/expand animation; never `IntersectionObserver` for scroll-linked animation (creates feedback loops).

**Filters:** Default `false` — show everything by default, let the user hide things. Label as "Hide X items", not "Show only X".

**First-visit panels:** Auto-open once using `localStorage` to gate, then remain user-controlled.

---

## Responsive

Mobile-first. The single breakpoint is `sm:` (640px).

- Below `sm:`: BottomNav visible, TopNav hidden. SubNav breaks out to edge. Content is full-width within px-6.
- At `sm:` and above: TopNav visible, BottomNav hidden. SubNav sits inline.

Don't add intermediate breakpoints (md, lg) — the design is intentionally two-state.

**Safe area:** BottomNav uses `paddingBottom: env(safe-area-inset-bottom)` for iPhone notch clearance.

---

## Numbers and Weights

- Always display in `font-mono` or `font-num` for alignment.
- Format: `X lbs Y oz` (e.g., "18 lbs 4 oz"). Use `formatLbsOz()` from `src/app/pack/gear/PackingListEditor.tsx` or `src/app/crew/weights/page.tsx` — don't re-implement.
- Short summary format: `X.X lbs` (one decimal, `toFixed(1)`).
- Elevation: feet, no decimals.
- Distance: miles, one decimal.

---

## Icons

Inline SVG only. Don't add an icon library.

Standard attributes: `width`, `height`, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeLinecap="round"`, `strokeLinejoin="round"`, `aria-hidden="true"`.

Stroke weight: 1.5–1.6 for default, 2.0–2.2 for active/emphasized state.

---

## Print

Pages that support printing include a `<PrintButton>` (client component, calls `window.print()`). The `--color-bg` token overrides to white in `@media print` — don't set `background: white` manually on individual elements. Use `print-color-adjust: exact` (already set globally) for colored backgrounds that must survive print.

The `.gear-print-header` class shows a hidden `<thead>` in print for the gear check grid — use this pattern for any table that needs a repeated header in print.

---

**See also:** `docs/handoff.md` · `docs/gotchas.md` · `docs/brand.md` · `docs/ARCHITECTURE.md §11–12`
