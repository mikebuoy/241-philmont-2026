# Scroll Spy / Deep-Linkable Sections

_Date: 2026-06-01_

## Problem

Users want to share links that land recipients at a specific section of a multi-section page (e.g. `/reference/skills#cooking`). Sections had no `id` attributes, so deep links were impossible.

## Solution

As a user scrolls, the URL hash updates to reflect the current section. Shared links with a hash scroll the recipient directly to that section on page load (native browser behavior). Scrolling to the top clears the hash.

## Architecture

### New files

- **`src/hooks/useScrollSpy.ts`** — core hook. Queries `section[id]` elements at mount, observes them with `IntersectionObserver` (`rootMargin: '0px 0px -70% 0px'`), and calls `history.replaceState()` to update the URL hash. A passive `scroll` listener clears the hash when `scrollY < 50`.
- **`src/components/ui/ScrollSpy.tsx`** — `'use client'` null component that calls `useScrollSpy()`. Exists to keep `Page.tsx` a server component.

### Modified files

- **`src/components/primitives/Section.tsx`** — added optional `id?: string` prop, rendered as `id` on `<section>`.
- **`src/components/primitives/Page.tsx`** — renders `<ScrollSpy />` inside the wrapper. All pages using `<Page>` get scroll spy automatically.
- **12 page files** — added `id` props to all addressable sections.

## Section ID Mapping

### `/reference/skills`
`stove` · `cooking` · `equipment` · `water` · `hygiene` · `bear-bag`

### `/reference/overview`
`timing` · `morning` · `staffed-camps` · `campsite` · `dinner` · `nightly-brief`

### `/reference/on-trail`
`etiquette` · `navigation` · `pace` · `caterpillar` · `foot-care`

### `/reference/safety`
`elevation` · `ams` · `defenses` · `descents` · `speak-up` · `lightning` · `emergency` · `wildfire`

### `/trip/overview`
`overview` · `experience` · `arrowhead` · `pledge` · `fifty-miler`

### `/trip/itinerary`
`pre-trek` · `trek` · `post-trek`

### `/trip/logistics`
`check-in` · `medical` · `burro` · `trading-posts` · `cell-service` · `food-resupply` · `dry-camp`

### `/trip/meals`
`numbering` · `schedule` · `meals` · `allergens`

### `/trip/training`
`timeline` · `crew-notes`

### `/pack/calculator`
`guidelines` · `planning` · `weight-ref`

### `/crew/roster`
`patrol-method` · `sister-crews` · `roles` · `duties` · `rotation` · `ranger-release` · `development`

### `/crew/weights`
`summary` · `columns`

## Key decisions

- **Explicit slugs, not auto-generated** — heading text can change freely without breaking links; the `id` slug is the stable permalink.
- **`Page.tsx` integration, not per-page** — zero per-page opt-in; any page using `<Page>` and `<Section id="...">` gets the behavior.
- **`history.replaceState`, not `router.push`** — no navigation, no re-renders, no scroll-to-top side effect.
- **Hybrid detection** — `IntersectionObserver` handles section changes; a passive scroll listener handles the "back at top → clear hash" case.
