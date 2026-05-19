"use client";

import React, { type ReactNode, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { PackingItem } from "@/lib/packing-types";
import { computeTotals } from "@/lib/packing-types";
import { computeTargets, PACK_WEIGHT_CONSTANTS } from "@/data/packWeights";
import { TRAVEL_ONLY_CATEGORIES } from "@/data/coreItems";
import {
  updateItemField,
  toggleItemFlag,
  addPersonalItem,
  deletePersonalItem,
  saveMyBodyWeight,
  saveMyActualBaseWeight,
  saveMyBaseWeightMode,
  saveUsesPhilmontTent,
} from "./actions";

// Shelter is tracked as an actual packing item, so exclude it from the Trail Load constant
const BASE_TRAIL_LOAD_LBS = PACK_WEIGHT_CONSTANTS.gearAndFoodLbs - PACK_WEIGHT_CONSTANTS.shelterLbs;
const PHILMONT_TENT_OZ = PACK_WEIGHT_CONSTANTS.philmontTentOz;
const SAVE_DEBOUNCE_MS = 400;

function ozToLbs(oz: number): number {
  return oz / 16;
}
function fmt(n: number, digits = 1): string {
  return n.toFixed(digits);
}

const STATUS_COLORS = {
  ok:       { bg: "#d4edda", text: "#155724", border: "#b8ddb8" },
  warn:     { bg: "#fff3cd", text: "#856404", border: "#f0d090" },
  over:     { bg: "#f8d7da", text: "#721c24", border: "#f0b8b8" },
  critical: { bg: "#dc3545", text: "#ffffff", border: "#b02a37" },
} as const;
function formatLbsOz(decimalLbs: number): string {
  const abs = Math.abs(decimalLbs);
  let whole = Math.floor(abs);
  let oz = Math.round((abs - whole) * 16);
  if (oz === 16) {
    whole += 1;
    oz = 0;
  }
  const lbsLabel = whole === 1 ? "lb" : "lbs";
  return `${whole} ${lbsLabel} ${oz} oz`;
}

type Mode = "pack" | "edit";

export function PackingListEditor({
  items: initialItems,
  bodyWeightLbs: initialBodyWeight,
  actualBaseWeightLbs: initialActualBase,
  useActualBaseWeight: initialUseActual,
  usesPhilmontTent: initialUsesPhilmontTent,
  categoryOrder: propCategoryOrder,
  aboveHeader,
  children,
}: {
  items: PackingItem[];
  bodyWeightLbs: number | null;
  actualBaseWeightLbs?: number | null;
  useActualBaseWeight?: boolean;
  usesPhilmontTent?: boolean;
  categoryOrder?: string[];
  /** Renders above the sticky green box (e.g. SubNav). Scrolls away on scroll. */
  aboveHeader?: ReactNode;
  children?: ReactNode;
}) {
  const [items, setItems] = useState<PackingItem[]>(initialItems);
  const [bodyWeight, setBodyWeight] = useState<number | null>(initialBodyWeight);
  const [actualBase, setActualBase] = useState<number>(initialActualBase ?? 18);
  const [useActualBase, setUseActualBase] = useState(initialUseActual ?? true);
  const [usesPhilmontTent, setUsesPhilmontTent] = useState(initialUsesPhilmontTent ?? true);
  const [hideNotPacking, setHideNotPacking] = useState(false);
  const [hidePacked, setHidePacked] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("pack");
  const [, startTransition] = useTransition();

  // First-visit help panel: auto-open once, then remembered as collapsed
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem("pack-gear-howto-seen");
    if (!seen) {
      window.setTimeout(() => setHelpOpen(true), 0);
      window.localStorage.setItem("pack-gear-howto-seen", "1");
    }
  }, []);

  // Order categories: prefer server-supplied order (from gear_categories DB), fallback to alpha
  const categoryOrder = useMemo(() => {
    const present = new Set(items.map((i) => i.category));
    if (propCategoryOrder) {
      const ordered = propCategoryOrder.filter((c) => present.has(c));
      const extras = Array.from(present).filter((c) => !propCategoryOrder.includes(c));
      return [...ordered, ...extras.sort()];
    }
    return Array.from(present).sort();
  }, [items, propCategoryOrder]);

  const totals = useMemo(() => computeTotals(items), [items]);
  const targets = useMemo(
    () => (bodyWeight ? computeTargets(bodyWeight) : null),
    [bodyWeight],
  );

  // Build status + delta lines using 4-zone Philmont model
  const baseLbs = ozToLbs(totals.baseOz);
  const activeBaseLbs = useActualBase ? actualBase : baseLbs;
  // Add Philmont tent weight only when using a typed scale weight. In item-list
  // mode, tent weight is already represented by the tent line item.
  const shelterTrailLoadLbs = useActualBase && usesPhilmontTent ? PHILMONT_TENT_OZ / 16 : 0;
  const trailLoadLbs = BASE_TRAIL_LOAD_LBS + shelterTrailLoadLbs;
  const totalDay1Lbs = activeBaseLbs + trailLoadLbs;
  let status: "ok" | "warn" | "over" | "critical" | null = null;
  const deltaLines: string[] = [];
  if (targets) {
    if (totalDay1Lbs <= targets.target20) status = "ok";
    else if (totalDay1Lbs <= targets.max25) status = "warn";
    else if (totalDay1Lbs <= targets.hardMax30) status = "over";
    else status = "critical";

    const deltaTarget = totalDay1Lbs - targets.target20;

    if (totalDay1Lbs > targets.hardMax30) {
      deltaLines.push(`Cut ${formatLbsOz(totalDay1Lbs - targets.hardMax30)} to hit 30% hard max`);
      deltaLines.push(`Cut ${formatLbsOz(deltaTarget)} to hit 20% target`);
    } else if (totalDay1Lbs > targets.max25) {
      deltaLines.push(`Cut ${formatLbsOz(totalDay1Lbs - targets.max25)} to hit 25% crew standard`);
      deltaLines.push(`${formatLbsOz(targets.hardMax30 - totalDay1Lbs)} under 30% hard max`);
    } else if (deltaTarget > 0) {
      deltaLines.push(`Cut ${formatLbsOz(deltaTarget)} to hit 20% target`);
      deltaLines.push(`${formatLbsOz(targets.max25 - totalDay1Lbs)} under 25% crew standard`);
    } else if (deltaTarget < -0.05) {
      deltaLines.push(`${formatLbsOz(-deltaTarget)} under 20% target`);
    } else {
      deltaLines.push("At 20% target");
    }
  }

  // Local mutations for optimistic UI
  function patchLocal(itemId: string, patch: Partial<PackingItem>) {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
    );
  }
  function removeLocal(itemId: string) {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  }
  function addLocal(item: PackingItem) {
    setItems((prev) => [...prev, item]);
  }

  function onToggle(
    itemId: string,
    flag:
      | "isWorn"
      | "isConsumable"
      | "isSmellable"
      | "isPacked"
      | "isNotPacking",
    value: boolean,
  ) {
    patchLocal(itemId, { [flag]: value });
    const dbField = flagToDb(flag);
    startTransition(async () => {
      try {
        await toggleItemFlag(itemId, dbField, value);
      } catch {
        // revert on error
        patchLocal(itemId, { [flag]: !value });
      }
    });
  }

  function onFieldChange(
    itemId: string,
    field: "name" | "qty" | "weightOz",
    value: string | number,
  ) {
    const dbField =
      field === "weightOz"
        ? ("weight_oz" as const)
        : (field as "name" | "qty");
    patchLocal(itemId, { [field]: value });
    startTransition(async () => {
      await updateItemField(itemId, { [dbField]: value });
    });
  }

  async function onAddPersonal(category: string) {
    const tempId = `temp-${Date.now()}`;
    const optimistic: PackingItem = {
      id: tempId,
      crewMemberId: items[0]?.crewMemberId ?? "",
      category,
      name: "New item",
      qty: 1,
      weightOz: 0,
      isCore: false,
      isRequired: null,
      isWorn: false,
      isConsumable: false,
      isSmellable: false,
      isPacked: false,
      isNotPacking: false,
      notes: null,
      sortOrder: 9999,
    };
    addLocal(optimistic);
    try {
      const newId = await addPersonalItem(category);
      patchLocal(tempId, { id: newId });
    } catch {
      removeLocal(tempId);
    }
  }

  async function onDelete(itemId: string) {
    if (!confirm("Delete this item?")) return;
    const backup = items.find((i) => i.id === itemId);
    if (!backup) return;
    removeLocal(itemId);
    try {
      await deletePersonalItem(itemId);
    } catch {
      addLocal(backup);
    }
  }

  // Debounce slider saves so rapid drags don't queue dozens of POSTs
  const bwSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actualSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (bwSaveTimer.current) clearTimeout(bwSaveTimer.current);
    if (actualSaveTimer.current) clearTimeout(actualSaveTimer.current);
  }, []);

  function onBodyWeightChange(lbs: number | null) {
    setBodyWeight(lbs);                                       // immediate UI update
    if (bwSaveTimer.current) clearTimeout(bwSaveTimer.current);
    bwSaveTimer.current = setTimeout(() => {
      startTransition(async () => {
        await saveMyBodyWeight(lbs);
      });
    }, SAVE_DEBOUNCE_MS);
  }

  function onActualBaseChange(lbs: number) {
    setActualBase(lbs);                                       // immediate UI update
    if (actualSaveTimer.current) clearTimeout(actualSaveTimer.current);
    actualSaveTimer.current = setTimeout(() => {
      startTransition(() => saveMyActualBaseWeight(lbs));
    }, SAVE_DEBOUNCE_MS);
  }

  function onUsesPhilmontTentChange(v: boolean) {
    setUsesPhilmontTent(v);
    startTransition(() => saveUsesPhilmontTent(v));
  }

  // Progress bar zone widths (proportional to body weight percentages)
  // ok: 0-20% = 20/30 = 66.67%, warn: 20-25% = 5/30 = 16.67%, over: 25-30% = 16.67%
  const okPct = (20 / 30) * 100;
  const warnEdgePct = (25 / 30) * 100;
  const overEdgePct = 100;
  const markerPct = targets
    ? Math.min(100, Math.max(0, (totalDay1Lbs / targets.hardMax30) * 100))
    : 0;
  const basePct = targets
    ? Math.min(100, Math.max(0, (activeBaseLbs / targets.hardMax30) * 100))
    : 0;
  const isCritical = status === "critical";

  // Apply filters
  const visible = items.filter((it) => {
    if (it.isNotPacking && hideNotPacking) return false;
    if (it.isPacked && hidePacked) return false;
    return true;
  });

  const isEditMode = mode === "edit";

  return (
    <div>
      {/* ───── Above-header slot (SubNav) — scrolls away ───── */}
      {aboveHeader}

      <div className="space-y-4">

      {/* ───── Sticky totals header ───── */}
      {/* ───── How to use (auto-open first visit; scrolls away) ───── */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden" style={{ borderWidth: "0.5px" }}>
        <button
          type="button"
          onClick={() => setHelpOpen((o) => !o)}
          className="w-full flex items-center justify-between bg-hcblue px-4 py-2.5 text-left text-white hover:bg-info-text transition-colors"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.08em]">
            How to use the My Gear page
          </span>
          <svg
            width="12" height="12" viewBox="0 0 14 14" fill="none"
            style={{ transform: helpOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}
          >
            <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {helpOpen && (
          <div className="px-4 pb-4 pt-3 text-[12px] text-ink border-t border-border space-y-4" style={{ borderWidth: "0.5px" }}>

            <section className="space-y-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted font-semibold">
                1. Pick your weight method
              </h3>
              <p className="text-ink-muted text-[11px] leading-snug">
                Open <strong className="text-ink">Settings</strong>. Use your scale weight if you weighed your pack, or use the gear list if you weighed each item.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted font-semibold">
                2. Check off packed items
              </h3>
              <p className="text-ink-muted text-[11px] leading-snug">
                Check the box next to an item once it&apos;s in your pack.
              </p>
              <div className="space-y-1.5">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[10px] font-semibold bg-ok-bg text-ok-text rounded shrink-0 inline-flex items-center justify-center w-16 h-5">Wear</span>
                  <span className="text-ink-muted text-[11px] leading-snug">You wear it, so it does not count in Base Pack Weight.</span>
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[10px] font-semibold bg-info-bg text-info-text rounded shrink-0 inline-flex items-center justify-center w-16 h-5">Food/water</span>
                  <span className="text-ink-muted text-[11px] leading-snug">Consumable items are tracked separately from Base Pack Weight.</span>
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[10px] font-semibold bg-surface-2 text-ink-muted rounded shrink-0 inline-flex items-center justify-center w-16 h-5">Not taking</span>
                  <span className="text-ink-muted text-[11px] leading-snug">You are not bringing it. It is skipped from your totals.</span>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted font-semibold">
                3. Edit gear only when needed
              </h3>
              <p className="text-ink-muted text-[11px] leading-snug">
                Tap <strong className="text-ink">Edit Gear</strong> to change weights, quantities, item names, or mark items as Wear, Food/water, or Not taking.
              </p>
              <p className="text-ink-muted text-[11px] leading-snug">
                Tap Done when you&apos;re finished. The page saves automatically.
              </p>
            </section>

          </div>
        )}
      </div>

      {/* ───── Sticky calc bar — always compact, drawer pushes content ───── */}
      <div className="sticky top-0 z-30 -mx-6 !mt-0" style={{ overflowAnchor: "none" }}>

        {/* ── Status bar (always visible) ── */}
        <div className="bg-surface border-b border-border shadow-sm">
          <div className="max-w-[900px] mx-auto px-6 py-3">

            {/* Top row: Est Max + buttons */}
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em] shrink-0">Est Max</span>
                <div className="min-w-0">
                  <span className="font-mono text-[20px] sm:text-[20px] font-semibold leading-none text-ink">
                    {fmt(totalDay1Lbs)} <span className="text-[14px] sm:text-[15px] text-ink-muted font-normal">lbs</span>
                  </span>
                  {/*<span className="block text-[10px] text-ink-muted leading-tight mt-0.5">
                    Heaviest pack estimate
                  </span>*/}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setAdjustOpen((o) => !o)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium font-mono uppercase tracking-[0.05em] bg-surface-2 border border-border hover:bg-surface-3 transition-colors"
                  style={{ borderWidth: "0.5px" }}
                  aria-expanded={adjustOpen}
                >
                  Settings
                  <svg width="9" height="9" viewBox="0 0 14 14" fill="none" style={{ transform: adjustOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}>
                    <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setMode(isEditMode ? "pack" : "edit")}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-medium font-mono uppercase tracking-[0.05em] bg-surface-2 border border-border hover:bg-surface-3 transition-colors"
                  style={{ borderWidth: "0.5px" }}
                >
                  {isEditMode ? "Done" : "Edit Gear"}
                </button>
              </div>
            </div>

            {/* Delta line */}
            {targets && deltaLines.length > 0 && (
              <div className="font-mono text-[11px] text-ink mb-1.6 leading-snug">
                {deltaLines[0]}
              </div>
            )}

            {/* Progress bar */}
            {targets ? (
              <div className="mb-1.0">
                {/* Percent labels above the bar — centered above the weight numbers inside */}
                <div className="relative h-3 font-mono text-[10px] font-semibold text-ink-muted leading-none mb-0">
                  <span className="absolute" style={{ left: `${okPct}%`, transform: "translateX(-50%)" }}>20%</span>
                  <span className="absolute" style={{ left: `${warnEdgePct}%`, transform: "translateX(-50%)" }}>25%</span>
                  <span className="absolute right-0">30%</span>
                </div>
                <div className="relative pt-2.5">
                  {/* Down arrow marker above bar */}
                  <div
                    className="absolute top-0 z-20"
                    style={{ left: `${markerPct}%`, transform: "translateX(-50%)" }}
                  >
                    <div
                      className="w-0 h-0"
                      style={{
                        borderLeft: "7px solid transparent",
                        borderRight: "7px solid transparent",
                        borderTop: `9px solid ${isCritical ? STATUS_COLORS.critical.bg : "var(--color-ink)"}`,
                        filter: isCritical ? "none" : "drop-shadow(0 0 1px white)",
                      }}
                    />
                  </div>
                  {/* The bar — 30px, zones + translucent blue base overlay + weight numbers + base label */}
                  <div className="relative flex h-[30px] rounded-md overflow-hidden border border-border" style={{ borderWidth: "0.5px" }}>
                    <div style={{ width: `${okPct}%`, backgroundColor: STATUS_COLORS.ok.bg }} />
                    <div style={{ width: `${warnEdgePct - okPct}%`, backgroundColor: STATUS_COLORS.warn.bg }} />
                    <div style={{ width: `${overEdgePct - warnEdgePct}%`, backgroundColor: STATUS_COLORS.over.bg }} />
                    {/* Translucent blue base fill — overlays zones from 0 to base position */}
                    <div
                      className="absolute left-0 top-0 bottom-0"
                      style={{
                        width: `${basePct}%`,
                        backgroundColor: "rgba(30, 106, 145, 0.35)",
                        borderRight: "2px solid #1e6a91",
                      }}
                    />
                    {/* Striped pattern fill — Trail Load portion, from base to Est Max */}
                    {markerPct > basePct && (
                      <div
                        className="absolute top-0 bottom-0"
                        style={{
                          left: `${basePct}%`,
                          width: `${markerPct - basePct}%`,
                          backgroundColor: "rgba(30, 106, 145, 0.1)",
                          backgroundImage:
                            "repeating-linear-gradient(45deg, rgba(30, 106, 145, 0.5) 0, rgba(30, 106, 145, 0.5) 2px, transparent 2px, transparent 7px)",
                        }}
                      />
                    )}
                    {/* Vertical marker line under arrow — runs through the bar at Est Max */}
                    <div
                      className="absolute top-0 bottom-0 z-10 pointer-events-none"
                      style={{
                        left: `${markerPct}%`,
                        width: "2px",
                        transform: "translateX(-50%)",
                        backgroundColor: isCritical ? STATUS_COLORS.critical.bg : "var(--color-ink)",
                      }}
                    />
                    {/* Base label — inside the bar at left, in blue (no actual/calc differentiation here) */}
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[12px] sm:text-[13px] font-bold whitespace-nowrap pointer-events-none" style={{ color: "#0d3d5a" }}>
                      Base: {fmt(activeBaseLbs, 1)}
                    </div>
                    {/* Weight numbers at threshold positions */}
                    <div className="absolute inset-0 pointer-events-none font-mono text-ink">
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-[18px] font-bold leading-none" style={{ left: `${okPct}%` }}>
                        {fmt(targets.target20, 0)}
                      </div>
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-[18px] font-bold leading-none" style={{ left: `${warnEdgePct}%` }}>
                        {fmt(targets.max25, 0)}
                      </div>
                      <div className="absolute top-1/2 right-2 -translate-y-1/2 text-[18px] font-bold leading-none">
                        {fmt(targets.hardMax30, 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-ink-muted bg-surface-2 rounded px-3 py-2 mb-1">
                Enter your body weight in <strong>Weight Settings</strong> to see targets.
              </div>
            )}

            {/* Legend — explains the in-bar labels & color fills */}
            {/*}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-ink-muted">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-7 h-3 rounded-sm shrink-0 border border-border"
                  style={{ backgroundColor: "rgba(30, 106, 145, 0.35)", borderWidth: "0.5px" }}
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-ink">Base Pack Weight</strong> &mdash; {useActualBase ? "scale weight" : "item list"} &middot; {fmt(activeBaseLbs, 1)} lbs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-7 h-3 rounded-sm shrink-0 border border-border"
                  style={{
                    backgroundColor: "rgba(30, 106, 145, 0.1)",
                    backgroundImage:
                      "repeating-linear-gradient(45deg, rgba(30, 106, 145, 0.5) 0, rgba(30, 106, 145, 0.5) 2px, transparent 2px, transparent 7px)",
                    borderWidth: "0.5px",
                  }}
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-ink">Trail Load</strong> &mdash; {fmt(trailLoadLbs, 1)} lbs
                </span>
              </div>
            </div>*/}
            <div className="mt-1 font-mono text-[10px] text-ink-faint">
              Base Pack Weight + Trail Load = Est Max
            </div>
          </div>
        </div>

        {/* ── Adjust drawer (pushes content) ── */}
        {adjustOpen && (
          <div className="bg-surface-2 border-b border-border shadow-sm" style={{ borderWidth: "0.5px" }}>
            <div className="max-w-[600px] mx-auto px-6 py-4 space-y-4">

              {/* Body weight */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em]">Body weight</span>
                  <span className="font-mono text-[10px] text-ink-faint">drives target zones</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={100} max={220} step={5}
                    value={bodyWeight ?? 160}
                    onChange={(e) => onBodyWeightChange(Number(e.target.value))}
                    className="flex-1 accent-ink"
                  />
                  <input
                    type="number"
                    min={100} max={220} step={5}
                    value={bodyWeight ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      onBodyWeightChange(v === "" ? null : Number(v));
                    }}
                    placeholder="160"
                    className="w-20 font-mono text-[13px] bg-surface border border-border rounded px-2 py-1 text-right"
                  />
                  <span className="font-mono text-[11px] text-ink-muted shrink-0">lbs</span>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-surface p-3 space-y-3" style={{ borderWidth: "0.5px" }}>
                <div>
                  <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em]">
                    Base Pack Weight
                  </div>
                  <div className="text-[11px] text-ink-muted mt-0.5">
                    Pack weight before Trail Load
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={useActualBase}
                    onChange={(e) => {
                      const v = e.target.checked;
                      setUseActualBase(v);
                      startTransition(() => saveMyBaseWeightMode(v));
                    }}
                    className="peer sr-only"
                  />
                  <span
                    className="mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-surface-2 p-0.5 ring-1 ring-border transition-colors peer-checked:bg-info-text peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-info-text"
                    aria-hidden="true"
                  >
                    <span className="h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
                  </span>
                  <span className="text-[12px] text-ink leading-snug">
                    <strong>Use my scale weight</strong>
                    <span className="block text-ink-muted text-[11px] mt-0.5">
                      {useActualBase
                        ? "Using the pack weight I entered."
                        : "Using item weights from my gear list."}
                    </span>
                  </span>
                </label>

                <div className={useActualBase ? "" : "opacity-40"}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em]">Scale weight</span>
                    <span className="font-mono text-[10px] text-ink-faint">Base Pack Weight</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={5} max={50} step={0.5}
                      value={actualBase}
                      disabled={!useActualBase}
                      onChange={(e) => onActualBaseChange(Number(e.target.value))}
                      className="flex-1 accent-ink disabled:cursor-not-allowed"
                    />
                    <input
                      type="number"
                      min={0} max={100} step={0.5}
                      value={actualBase}
                      disabled={!useActualBase}
                      onChange={(e) => onActualBaseChange(Number(e.target.value))}
                      className="w-20 font-mono text-[13px] bg-surface border border-border rounded px-2 py-1 text-right disabled:cursor-not-allowed"
                    />
                    <span className="font-mono text-[11px] text-ink-muted shrink-0">lbs</span>
                  </div>
                </div>

                {useActualBase ? (
                  <div className="border-t border-border pt-3 space-y-2" style={{ borderWidth: "0.0px" }}>
                    <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em]">Shelter</div>
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        role="switch"
                        checked={usesPhilmontTent}
                        onChange={(e) => onUsesPhilmontTentChange(e.target.checked)}
                        className="peer sr-only"
                      />
                      <span
                        className="mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-surface p-0.5 ring-1 ring-border transition-colors peer-checked:bg-info-text peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-info-text"
                        aria-hidden="true"
                      >
                        <span className="h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
                      </span>
                      <span className="text-[12px] text-ink leading-snug">
                        <strong>I&apos;m using a Philmont tent</strong>
                        <span className="block font-mono text-ink-muted text-[11px] mt-0.5">
                          {usesPhilmontTent
                            ? `Philmont tent added to Trail Load: ${fmt(PHILMONT_TENT_OZ / 16, 1)} lbs.`
                            : "Tent weight included in Base Pack Weight."}
                        </span>
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="rounded-md bg-surface-2 px-3 py-2 text-[11px] text-ink-muted leading-snug">
                    Base Pack Weight comes from your gear list. Tent weight comes from your gear list too.
                  </div>
                )}
              </div>

              {/* Reference values */}
              <div className="rounded-lg border border-border bg-surface p-3 space-y-3" style={{ borderWidth: "0.5px" }}>
                {/* <div className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.06em] mb-2">Reference</div>*/}

                {/* Trail Load breakdown */}
                <div className="font-mono text-[11px] space-y-0.5 mb-2">
                  <div className="text-ink-muted font-semibold uppercase tracking-[0.06em]">
                    Trail Load
                  </div>
                  {([
                    ["Food",      PACK_WEIGHT_CONSTANTS.foodPerPersonLbs],
                    ["Water",     PACK_WEIGHT_CONSTANTS.waterTwoLitersLbs],
                    ["Crew gear", PACK_WEIGHT_CONSTANTS.crewGearAvgLbs],
                  ] as [string, number][]).map(([label, lbs]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <span className="text-ink-muted">{label}</span>
                      <span className="text-ink-faint">{fmt(lbs, 1)} lbs</span>
                    </div>
                  ))}
                  {useActualBase && usesPhilmontTent && (
                    <div className="flex justify-between gap-4">
                      <span className="text-ink-muted">Philmont tent</span>
                      <span className="text-ink-faint">{fmt(PHILMONT_TENT_OZ / 16, 1)} lbs</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-4 border-t border-border pt-0.5 mt-0.5" style={{ borderWidth: "0.5px" }}>
                    <span className="text-ink font-medium">Total Trail Load</span>
                    <span className="text-ink font-semibold">{fmt(trailLoadLbs, 1)} lbs</span>
                  </div>
                </div>

                {/* Base + targets */}

                {!useActualBase && (
                  <div className="font-mono text-[10px] text-ink-faint mt-2">
                    Worn {fmt(ozToLbs(totals.wornOz))} lbs · Consumable {fmt(ozToLbs(totals.consumableOz))} lbs
                  </div>
                )}
                {deltaLines.length > 1 && (
                  <div className="mt-2 font-mono text-[11px] text-ink-muted">
                    {deltaLines.slice(1).map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}


        {/* Column headers — edit mode only */}
        {isEditMode && (
          <div
            className="bg-surface-2 border-x border-b border-border px-3 py-1.5 flex items-center gap-2 text-[10px] font-mono text-ink-faint uppercase tracking-[0.05em] shadow-sm"
            style={{ borderWidth: "0.5px" }}
          >
            <span className="w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 min-w-0">Item</span>
            <span className="w-12 text-center shrink-0">QTY</span>
            <span className="w-16 text-right shrink-0">oz</span>
            <span className="w-9 text-center shrink-0">Wear</span>
            <span className="w-10 text-center shrink-0">Food</span>
            <span className="w-8 text-center shrink-0">Not</span>
          </div>
        )}
      </div>{/* end sticky header */}

      {/* ───── Blue info note ───── */}
      {children}

      {/* ───── Filters ───── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setHidePacked((v) => !v)}
          aria-pressed={hidePacked}
          className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${
            hidePacked
              ? "border-info-text bg-info-bg text-info-text"
              : "border-border bg-surface text-ink-muted hover:text-ink"
          }`}
          style={{ borderWidth: "0.5px" }}
        >
          Hide packed items ({totals.packedCount})
        </button>
        <button
          type="button"
          onClick={() => setHideNotPacking((v) => !v)}
          aria-pressed={hideNotPacking}
          className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${
            hideNotPacking
              ? "border-info-text bg-info-bg text-info-text"
              : "border-border bg-surface text-ink-muted hover:text-ink"
          }`}
          style={{ borderWidth: "0.5px" }}
        >
          Hide items marked <b>Not Taking</b> ({totals.notPackingCount})
        </button>
      </div>

      {/* ───── Pack categories (counted) ───── */}
      {categoryOrder
        .filter((cat) => !TRAVEL_ONLY_CATEGORIES.has(cat))
        .map((cat) => {
          const catItems = visible.filter((it) => it.category === cat);
          const allCatItems = items.filter((it) => it.category === cat);
          const catSubtotalOz = allCatItems
            .filter((it) => !it.isNotPacking && !it.isWorn)
            .reduce((sum, it) => sum + it.qty * it.weightOz, 0);
          if (catItems.length === 0 && hideNotPacking) return null;

          return (
            <section key={cat}>
              <div className="flex items-baseline justify-between mb-2 rounded-md bg-info-bg px-2 py-1">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.06em] text-info-text font-semibold">
                  {cat}
                </h2>
                <span className="font-mono text-[10px] text-info-text">
                  {catItems.length} · {fmt(catSubtotalOz, 1)} oz
                </span>
              </div>
              <ul
                className="bg-surface border border-border rounded-md overflow-hidden divide-y divide-border"
                style={{ borderWidth: "0.5px" }}
              >
                {catItems.map((it) => (
                  <ItemRow
                    key={it.id}
                    item={it}
                    mode={mode}
                    onToggle={onToggle}
                    onFieldChange={onFieldChange}
                    onDelete={() => onDelete(it.id)}
                  />
                ))}
                {isEditMode && (
                  <li className="px-3 py-2 bg-surface-2/50">
                    <button
                      onClick={() => onAddPersonal(cat)}
                      className="font-mono text-[11px] text-ink-muted hover:text-ink"
                    >
                      + Add gear
                    </button>
                  </li>
                )}
              </ul>
            </section>
          );
        })}

      {/* ───── Travel / Basecamp Only — NOT counted ───── */}
      {categoryOrder
        .filter((cat) => TRAVEL_ONLY_CATEGORIES.has(cat))
        .map((cat) => {
          const catItems = visible.filter((it) => it.category === cat);
          if (catItems.length === 0 && hideNotPacking) return null;

          return (
            <section key={cat} className="pt-4 border-t border-border-strong">
              <div className="flex items-baseline justify-between mb-1.5 px-1">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
                  {cat}
                </h2>
                <span className="font-mono text-[10px] text-ink-faint italic">
                  not in pack totals
                </span>
              </div>
              <p className="text-[11px] text-ink-faint mb-2 px-1 italic leading-snug">
                These travel to and from Philmont but don&apos;t go on trail.
                Not counted in Base Pack Weight or Trail Load.
              </p>
              <ul
                className="bg-surface-2 border border-border rounded-md overflow-hidden divide-y divide-border"
                style={{ borderWidth: "0.5px" }}
              >
                {catItems.map((it) => (
                  <ItemRow
                    key={it.id}
                    item={it}
                    mode={mode}
                    onToggle={onToggle}
                    onFieldChange={onFieldChange}
                    onDelete={() => onDelete(it.id)}
                  />
                ))}
                {isEditMode && (
                  <li className="px-3 py-2 bg-surface-2/70">
                    <button
                      onClick={() => onAddPersonal(cat)}
                      className="font-mono text-[11px] text-ink-muted hover:text-ink"
                    >
                      + Add gear
                    </button>
                  </li>
                )}
              </ul>
            </section>
          );
        })}
      </div>{/* end space-y-4 */}
    </div>
  );
}

function flagToDb(
  flag:
    | "isWorn"
    | "isConsumable"
    | "isSmellable"
    | "isPacked"
    | "isNotPacking",
):
  | "is_worn"
  | "is_consumable"
  | "is_smellable"
  | "is_packed"
  | "is_not_packing" {
  return (
    {
      isWorn: "is_worn",
      isConsumable: "is_consumable",
      isSmellable: "is_smellable",
      isPacked: "is_packed",
      isNotPacking: "is_not_packing",
    } as const
  )[flag];
}

type ItemRowProps = {
  item: PackingItem;
  mode: Mode;
  onToggle: (
    id: string,
    flag: "isWorn" | "isConsumable" | "isSmellable" | "isPacked" | "isNotPacking",
    v: boolean,
  ) => void;
  onFieldChange: (id: string, field: "name" | "qty" | "weightOz", v: string | number) => void;
  onDelete: () => void;
};

function ItemRow({ item, mode, onToggle, onFieldChange, onDelete }: ItemRowProps) {
  if (mode === "pack") {
    return <PackRow item={item} onToggle={onToggle} />;
  }
  return <EditRow item={item} onToggle={onToggle} onFieldChange={onFieldChange} onDelete={onDelete} />;
}

function PackRow({
  item,
  onToggle,
}: {
  item: PackingItem;
  onToggle: ItemRowProps["onToggle"];
}) {
  const isNote = item.isCore && item.isRequired === null;
  const dimmed = item.isNotPacking;

  if (isNote) {
    return (
      <li className="px-3 py-2 flex items-center gap-2 text-[13px]" style={{ backgroundColor: "#fff9db" }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <RequiredBadge isRequired={item.isRequired} isCore={item.isCore} />
            <span className="font-medium leading-snug">{item.name}</span>
          </div>
          {item.description && (
            <div className="font-normal text-[11px] leading-snug mt-0.5" style={{ color: "#856404" }}>
              {item.description}
            </div>
          )}
        </div>
      </li>
    );
  }

  return (
    <li className={`px-3 py-2.5 flex items-center gap-3 text-[13px] ${dimmed ? "opacity-40" : ""}`}>
      <label className="shrink-0 -m-2 flex h-9 w-9 items-center justify-center cursor-pointer">
        <input
          type="checkbox"
          checked={item.isPacked}
          disabled={item.isNotPacking}
          onChange={(e) => onToggle(item.id, "isPacked", e.target.checked)}
          className="accent-ink w-5 h-5 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Packed"
          title="Packed"
        />
      </label>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <RequiredBadge isRequired={item.isRequired} isCore={item.isCore} />
          <span className={`font-medium leading-snug ${item.isPacked ? "line-through opacity-60" : ""}`}>
            {item.name}
          </span>
        </div>
        {item.description && (
          <div className="text-ink-muted font-normal text-[11px] leading-snug mt-0.5">
            {item.description}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {item.isWorn && (
          <span className="rounded bg-ok-bg px-1.5 py-0.5 font-mono text-[9px] font-semibold text-ok-text" title="Wear">Wear</span>
        )}
        {item.isConsumable && (
          <span className="rounded bg-info-bg px-1.5 py-0.5 font-mono text-[9px] font-semibold text-info-text" title="Food/water">Food</span>
        )}
      </div>
      <div className="shrink-0 font-mono text-[11px] text-ink-muted text-right whitespace-nowrap">
        {item.qty > 1 && <span>{item.qty} &times; </span>}
        {item.weightOz} oz
      </div>
    </li>
  );
}

function EditRow({
  item,
  onToggle,
  onFieldChange,
  onDelete,
}: {
  item: PackingItem;
  onToggle: ItemRowProps["onToggle"];
  onFieldChange: ItemRowProps["onFieldChange"];
  onDelete: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(String(item.qty));
  const [weight, setWeight] = useState(String(item.weightOz));
  const dimmed = item.isNotPacking;
  const isNote = item.isCore && item.isRequired === null;

  if (isNote) {
    return (
      <li className="px-3 py-2 flex items-center gap-2 text-[12px]" style={{ backgroundColor: "#fff9db" }}>
        <span className="w-4 shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
          <RequiredBadge isRequired={item.isRequired} isCore={item.isCore} />
          <span className="font-medium">{item.name}</span>
          {item.description && (
            <span className="font-normal text-[11px] shrink-0" style={{ color: "#856404" }}>
              {item.description}
            </span>
          )}
        </div>
      </li>
    );
  }

  return (
    <li className={`px-3 py-2 flex items-center gap-2 text-[12px] ${dimmed ? "opacity-50" : ""}`}>
      <input
        type="checkbox"
        checked={item.isPacked}
        disabled={item.isNotPacking}
        onChange={(e) => onToggle(item.id, "isPacked", e.target.checked)}
        className="accent-ink shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Packed"
        title="Packed"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
          <RequiredBadge isRequired={item.isRequired} isCore={item.isCore} />
          {item.isCore ? (
            <span className="font-medium">{item.name}</span>
          ) : (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                if (name !== item.name) onFieldChange(item.id, "name", name);
              }}
              className="flex-1 font-medium bg-transparent border-b border-transparent focus:border-border-strong outline-none"
            />
          )}
          {/* -- Hides item description in edit mode to save space, but could be re-added if desired — would need some design tweaks to avoid looking too cluttered --*/}
          {/*
          }
          }
          {item.description && (
            <span className="text-ink-muted font-normal text-[11px] leading-snug shrink-0">
              {item.description}
            </span>
          )}
          */}
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0 w-12 justify-end">
        <span className="font-mono text-[11px] text-ink-faint">&times;</span>
        <input
          type="number"
          min={0}
          max={99}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          onBlur={() => {
            const n = parseInt(qty, 10) || 0;
            if (n !== item.qty) onFieldChange(item.id, "qty", n);
          }}
          className={`w-8 font-mono text-[12px] text-center bg-surface-2 border border-border rounded px-1 py-0.5 ${item.qty > 1 ? "font-semibold" : ""}`}
          aria-label="Quantity"
        />
      </div>

      <div className="flex items-center shrink-0 w-16 justify-end">
        <input
          type="number"
          min={0}
          step={0.1}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onBlur={() => {
            const n = parseFloat(weight) || 0;
            if (n !== item.weightOz) onFieldChange(item.id, "weightOz", n);
          }}
          className="w-14 font-mono text-[12px] text-right bg-surface-2 border border-border rounded px-1.5 py-0.5"
          aria-label="Weight in oz"
        />
      </div>

      <FlagButton
        active={item.isWorn}
        onClick={() => onToggle(item.id, "isWorn", !item.isWorn)}
        label="Wear"
        title="Wear"
        tone="ok"
      />
      <FlagButton
        active={item.isConsumable}
        onClick={() => onToggle(item.id, "isConsumable", !item.isConsumable)}
        label="Food"
        title="Food/water"
        tone="info"
      />

      <button
        onClick={() => onToggle(item.id, "isNotPacking", !item.isNotPacking)}
        className={`shrink-0 w-5 h-5 flex items-center justify-center rounded transition-colors ${
          item.isNotPacking ? "text-ink" : "text-ink-faint hover:text-ink"
        }`}
        title={item.isNotPacking ? "Mark as taking" : "Mark as not taking"}
        aria-label={item.isNotPacking ? "Mark as taking" : "Mark as not taking"}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <circle cx="7" cy="7" r="6" />
          <line x1="2.5" y1="11.5" x2="11.5" y2="2.5" />
        </svg>
      </button>

      {!item.isCore && (
        <button
          onClick={onDelete}
          className="text-ink-faint hover:text-danger-text shrink-0"
          aria-label="Delete"
          title="Delete gear"
        >
          &#x2715;
        </button>
      )}
    </li>
  );
}

function RequiredBadge({
  isRequired,
  isCore,
}: {
  isRequired: boolean | null;
  isCore: boolean;
}) {
  if (!isCore) return null;
  if (isRequired === true) {
    return (
      <span
        className="font-mono text-[9px] font-bold text-ok-text shrink-0 uppercase tracking-[0.04em]"
        title="Required"
      >
        REQ
      </span>
    );
  }
  if (isRequired === false) {
    return (
      <span
        className="font-mono text-[9px] text-ink-faint shrink-0 lowercase tracking-[0.04em]"
        title="Optional"
      >
        opt
      </span>
    );
  }
  // isRequired === null && isCore → Note item
  return (
    <span
      className="font-mono text-[9px] font-bold shrink-0 uppercase tracking-[0.04em]"
      style={{ color: "#856404" }}
      title="Note"
    >
      NOTE
    </span>
  );
}

function FlagButton({
  active,
  onClick,
  label,
  title,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  title: string;
  tone: "ok" | "info" | "warn";
}) {
  const activeCls = {
    ok: "bg-ok-bg text-ok-text",
    info: "bg-info-bg text-info-text",
    warn: "bg-warn-bg text-warn-text",
  }[tone];
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`shrink-0 font-mono text-[9px] font-semibold min-w-9 h-5 px-1 rounded transition-colors ${
        active ? activeCls : "text-ink-faint hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
