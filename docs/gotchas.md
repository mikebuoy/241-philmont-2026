# Gotchas — Tooth of Time

_Last updated: 2026-05-27_

Non-obvious things that have caused problems or wasted time. Read before working on a feature area.

---

## Next.js / Framework

**This is Next.js 16, not the version in your training data.**  
APIs, file conventions, and routing may differ significantly. Read `node_modules/next/dist/docs/` before writing App Router code. `AGENTS.md` repeats this warning.

**`force-dynamic` pages don't get auto-injected OG images.**  
Next.js does not inject route-level `opengraph-image.png` into metadata for `force-dynamic` pages. You must set `openGraph.images` explicitly in the page's `metadata` export. Affected pages: `crew/weights`, `crew/gear-check`, `crew/roster`, `pack/gear`, `pack/calculator`. See `docs/ARCHITECTURE.md §13`.

---

## Tailwind CSS

**This is Tailwind v4 with `@theme` syntax — not v3.**  
Tokens are defined in `src/app/globals.css` under `@theme { }`. The v3 `tailwind.config.js` / `theme.extend` pattern does not exist here. Don't add a config file or use v3 plugin syntax.

**`border` utility produces 1px, not 0.5px.**  
Panel and card hairlines need `style={{ borderWidth: "0.5px" }}` as an inline override. `border-[0.5px]` is unreliable across browsers — don't use it. See `docs/ux-conventions.md` Borders section.

**Dynamic Tailwind classes aren't generated.**  
Tailwind scans source files at build time. A class like `` `bg-${status}` `` will never appear in the output. Weight status colors in `src/app/pack/gear/PackingListEditor.tsx` and `src/app/crew/weights/page.tsx` use inline styles (`style={{ background: STATUS_COLORS[status].bg }}`) for exactly this reason. Don't try to refactor these to Tailwind classes.

---

## Sticky Positioning

**TopNav is NOT fixed — it scrolls with the page.**  
`TopNav` (`src/components/nav/TopNav.tsx`) is `hidden sm:block` in normal document flow. It does not stay at the top when you scroll. Do not use `sm:top-14` or any offset to account for it on sticky elements — use `top-0`. Using `top-14` creates a visible gap between the sticky element and the top of the viewport on desktop. This caused a real bug on `/pack/gear` that took time to diagnose.

**`space-y-*` adds margin to every child including sticky wrappers.**  
When a sticky element is inside a `space-y-4` container, Tailwind adds `margin-top` to it. Override with `!mt-0` on the sticky wrapper. Also use `-mx-6` to break out of the page's `px-6` padding for full-width sticky bars.

---

## Scroll-Linked Animation

**`getBoundingClientRect().top` inside a scroll handler causes a feedback loop when it drives layout changes.**  
If you animate an element's height based on `getBoundingClientRect().top`, changing the height shifts the element's bounding rect, which changes the computed value, which changes the height again. The page blinks, bounces, and locks. This is the active bug on `/pack/gear`.

**Fix pattern:** Measure the sentinel's absolute scroll offset once on mount (`getBoundingClientRect().top + window.scrollY`) and store in a ref. Use `window.scrollY` in the scroll handler — it does not change when layout reflows. Full implementation in `docs/status.md`.

**`IntersectionObserver` is not suitable for scroll-linked animation.**  
It fires on threshold crossings, not continuously. Use a `scroll` event listener with a sentinel `<div>` for continuous progress tracking.

---

## React / JSX

**Prop-created elements passed as children trigger React key warnings.**  
When a component receives a `ReactNode` prop (like `aboveHeader`) and renders it alongside static siblings, the JSX transform (`jsxs`) compiles them into an array. React warns about missing keys because the prop-created element wasn't given one at the call site. Fix: add `key` at the point where the element is created (in the parent), not inside the receiving component.

Example in `src/app/pack/gear/page.tsx`:
```tsx
// These need keys because PackingListEditor renders them in an array
<PackingListEditor aboveHeader={<SubNav key="subnav" items={PACK_SUB} />}>
  <Box key="info" variant="info">...</Box>
</PackingListEditor>
```

---

## Supabase / Auth

**Never call `createAdminClient()` without `isCurrentUserAdmin()` first.**  
The service-role client bypasses all RLS. Always verify admin status with the server-side check before using it. See `docs/ARCHITECTURE.md §9`.

**`lib/` files import `"server-only"` — importing them from client components fails at build time.**  
The error message is not always obvious. If you see a build error about a server-only module, you've imported something from `src/lib/` (excluding `packing-types.ts`) in a `"use client"` file. Move the logic to a server component or server action.

**`packing_items` is paginated.**  
`getAllPackingItems()` in `src/lib/packing.ts` fetches in pages of 1000. The crew is small enough that this is one page, but don't assume a single `.select("*")` returns everything if you write a new bulk query.

---

## Numbers and Weights

**`formatLbsOz()` handles the oz = 16 rollover.**  
When rounding produces exactly 16 oz, the function increments the whole-pound count and resets oz to 0. Don't reimplement this inline — import the function. It exists in both `src/app/pack/gear/PackingListEditor.tsx` and `src/app/crew/weights/page.tsx` (duplicated). If you need it in a third place, extract it to `src/lib/packing-types.ts`.

**Canonical weight unit in the DB is oz (`weight_oz`).**  
The UI may show lbs or lbs+oz, but always read/write oz to Supabase. `computeTotals()` returns `baseOz`, `wornOz`, etc. — divide by 16 to get lbs.

---

## Itinerary / trail_meals

**Supabase FK join syntax requires the schema cache to know about the relationship.**  
The PostgREST embedded select syntax (`.select("*, rel:fk_col(fields)")`) only works after the FK constraint exists in the DB AND Supabase's schema cache has been refreshed. If you add a new FK and the build fails with "could not find relationship in schema cache", use a two-query approach instead: fetch the related table separately, then merge in application code with a `Map`. This is exactly the pattern used in `src/lib/itinerary.ts` for `trail_meals`.

**`trail_meals` is a hard FK dependency — seed it before `itinerary_days`.**  
`itinerary_days.meal_breakfast/lunch/dinner` reference `trail_meals.code`. If you run the itinerary seed before the meal seed, the upsert will fail with a FK violation. The seed script enforces order: `seedTrailMeals()` runs before `seedItinerary()`. Don't reorder them.

**`fetchMealsMap()` degrades gracefully before migration.**  
Before the `trail_meals` table exists, `fetchMealsMap()` returns an empty `Map` instead of throwing. Itinerary pages build and render correctly — meals just show no items. This is intentional so the build doesn't break before the migration is run.

---

**See also:** `docs/status.md` · `docs/handoff.md` · `docs/ux-conventions.md`
