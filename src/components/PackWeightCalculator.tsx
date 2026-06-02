"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { computeTargets, PACK_WEIGHT_CONSTANTS } from "@/data/packWeights";


const BASE_ADD_ON_LBS =
  PACK_WEIGHT_CONSTANTS.foodPerPersonLbs +
  PACK_WEIGHT_CONSTANTS.waterTwoLitersLbs +
  PACK_WEIGHT_CONSTANTS.crewGearAvgLbs;
const PHILMONT_TENT_OZ = PACK_WEIGHT_CONSTANTS.philmontTentOz;
const PHILMONT_TENT_LBS = PHILMONT_TENT_OZ / 16;
const SAVE_DEBOUNCE_MS = 400;

function fmt(n: number, digits = 1): string {
  return n.toFixed(digits);
}

const STATUS_COLORS = {
  ok:       { bg: "#d4edda", text: "#155724", border: "#b8ddb8" },
  warn:     { bg: "#fff3cd", text: "#856404", border: "#f0d090" },
  over:     { bg: "#f8d7da", text: "#721c24", border: "#f0b8b8" },
  critical: { bg: "#dc3545", text: "#ffffff", border: "#b02a37" },
} as const;

/** Convert decimal lbs to "X lb(s) Y oz" with correct pluralization. */
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

export function PackWeightCalculator({
  initialBodyWeight,
  onBodyWeightChange,
  initialActualBaseWeight,
  onActualBaseWeightChange,
  initialUsesPhilmontTent,
  onUsesPhilmontTentChange,
}: {
  initialBodyWeight?: number | null;
  onBodyWeightChange?: (lbs: number) => void;
  initialActualBaseWeight?: number | null;
  onActualBaseWeightChange?: (lbs: number) => void;
  initialUsesPhilmontTent?: boolean | null;
  onUsesPhilmontTentChange?: (usesPhilmontTent: boolean) => void;
} = {}) {
  const [bw, setBw] = useState<number>(initialBodyWeight ?? 160);
  const [actual, setActual] = useState<number>(initialActualBaseWeight ?? 18);
  const [usesPhilmontTent, setUsesPhilmontTent] = useState(initialUsesPhilmontTent ?? true);
  const [, startTransition] = useTransition();
  const [helpOpen, setHelpOpen] = useState(false);

  const bwSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actualSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);


  useEffect(() => () => {
    if (bwSaveTimer.current) clearTimeout(bwSaveTimer.current);
    if (actualSaveTimer.current) clearTimeout(actualSaveTimer.current);
  }, []);

  function handleBwChange(val: number) {
    setBw(val);
    if (!onBodyWeightChange || val <= 0) return;
    if (bwSaveTimer.current) clearTimeout(bwSaveTimer.current);
    bwSaveTimer.current = setTimeout(() => {
      startTransition(() => { onBodyWeightChange(val); });
    }, SAVE_DEBOUNCE_MS);
  }

  function handleActualChange(val: number) {
    setActual(val);
    if (!onActualBaseWeightChange || val <= 0) return;
    if (actualSaveTimer.current) clearTimeout(actualSaveTimer.current);
    actualSaveTimer.current = setTimeout(() => {
      startTransition(() => { onActualBaseWeightChange(val); });
    }, SAVE_DEBOUNCE_MS);
  }

  function handleUsesPhilmontTentChange(nextUsesPhilmontTent: boolean) {
    setUsesPhilmontTent(nextUsesPhilmontTent);
    if (!onUsesPhilmontTentChange) return;
    startTransition(() => {
      onUsesPhilmontTentChange(nextUsesPhilmontTent);
    });
  }

  const targets = computeTargets(bw);
  const actualNum = actual;
  const validActual = actualNum > 0;
  const shelterTrailLoadLbs = usesPhilmontTent ? PHILMONT_TENT_LBS : 0;
  const trailLoadLbs = BASE_ADD_ON_LBS + shelterTrailLoadLbs;
  const targetBase = targets ? targets.target20 - trailLoadLbs : null;

  let status: "ok" | "warn" | "over" | "critical" | null = null;
  let totalDay1: number | null = null;
  let deltaLine: string | null = null;

  if (validActual && targets) {
    totalDay1 = actualNum + trailLoadLbs;
    const deltaTarget = totalDay1 - targets.target20;

    if (totalDay1 <= targets.target20) status = "ok";
    else if (totalDay1 <= targets.max25) status = "warn";
    else if (totalDay1 <= targets.hardMax30) status = "over";
    else status = "critical";

    if (totalDay1 > targets.hardMax30) {
      deltaLine = `Cut ${formatLbsOz(totalDay1 - targets.hardMax30)} to hit 30% hard max`;
    } else if (totalDay1 > targets.max25) {
      deltaLine = `Cut ${formatLbsOz(totalDay1 - targets.max25)} to hit 25% crew standard`;
    } else if (deltaTarget > 0) {
      deltaLine = `Cut ${formatLbsOz(deltaTarget)} to hit 20% target`;
    } else if (deltaTarget < -0.05) {
      deltaLine = `${formatLbsOz(-deltaTarget)} under 20% target`;
    } else {
      deltaLine = "At 20% target";
    }
  }

  // Progress bar zone widths (proportional to body weight percentages)
  // ok: 0-20% = 20/30 = 66.67%, warn: 20-25% = 16.67%, over: 25-30% = 16.67%
  const okPct = (20 / 30) * 100;
  const warnEdgePct = (25 / 30) * 100;
  const markerPct = targets && totalDay1 != null
    ? Math.min(100, Math.max(0, (totalDay1 / targets.hardMax30) * 100))
    : 0;
  const basePct = targets
    ? Math.min(100, Math.max(0, (actualNum / targets.hardMax30) * 100))
    : 0;
  const isCritical = status === "critical";

  return (
    <div className="space-y-3">

      {/* ───── How to use this estimator (auto-open first visit) ───── */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden" style={{ borderWidth: "0.5px" }}>
        <button
          type="button"
          onClick={() => setHelpOpen((o) => !o)}
          className="w-full flex items-center justify-between bg-hcblue px-4 py-2.5 text-left text-white hover:bg-info-text transition-colors"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.08em]">
            How to use this estimator
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
                1. What this does
              </h3>
              <p className="text-ink-muted text-[11px] leading-snug">
                Plan your pack weight before you weigh anything. Play &ldquo;what if&rdquo; with body weight and Base Pack Weight to see where you&apos;ll land.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted font-semibold">
                2. How to use it
              </h3>
              <p className="text-ink-muted text-[11px] leading-snug">
                Drag the sliders below. Watch the marker on the bar move. The color tells you where you stand:
              </p>
              <div className="space-y-1.5">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[10px] font-semibold rounded shrink-0 inline-flex items-center justify-center w-9 h-5" style={{ backgroundColor: STATUS_COLORS.ok.bg, color: STATUS_COLORS.ok.text }}>OK</span>
                  <span className="text-ink-muted text-[11px] leading-snug">Green &mdash; on goal, at or under 20%.</span>
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[10px] font-semibold rounded shrink-0 inline-flex items-center justify-center w-9 h-5" style={{ backgroundColor: STATUS_COLORS.warn.bg, color: STATUS_COLORS.warn.text }}>20+</span>
                  <span className="text-ink-muted text-[11px] leading-snug">Yellow &mdash; above goal, still under crew standard.</span>
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[10px] font-semibold rounded shrink-0 inline-flex items-center justify-center w-9 h-5" style={{ backgroundColor: STATUS_COLORS.over.bg, color: STATUS_COLORS.over.text }}>25+</span>
                  <span className="text-ink-muted text-[11px] leading-snug">Red &mdash; over crew standard. Cut weight.</span>
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[10px] font-semibold rounded shrink-0 inline-flex items-center justify-center w-9 h-5" style={{ backgroundColor: STATUS_COLORS.critical.bg, color: STATUS_COLORS.critical.text }}>30+</span>
                  <span className="text-ink-muted text-[11px] leading-snug">Warning &mdash; over hard ceiling. No exceptions.</span>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted font-semibold">
                3. The zones
              </h3>
              <p className="text-ink-muted text-[11px] leading-snug">
                The zones are calculated based on your body weight:
                </p>
              <ul className="text-ink-muted text-[11px] leading-snug pl-4 space-y-1 list-disc marker:text-ink-faint">
                <li>20% &mdash; crew goal</li>
                <li>25% &mdash; crew standard (don&apos;t go higher)</li>
                <li>30% &mdash; hard ceiling, no exceptions</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted font-semibold">
                4. When you have real gear
              </h3>
              <p className="text-ink-muted text-[11px] leading-snug">
                Switch to My Packing List and weigh each item. That page tracks your actual list and is more accurate than this estimator.
              </p>
            </section>

          </div>
        )}
      </div>

      {/* ───── ESTIMATED PACK WEIGHT card ───── */}
      <div className="bg-surface border border-border rounded-lg p-3.5 space-y-3" style={{ borderWidth: "0.5px" }}>
        <p className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em]">
          Estimated Pack Weight
        </p>

        {targets ? (
          <div>
            {/* Est Max Weight + delta — status-colored box */}
            {totalDay1 != null && status ? (
              <div
                className="mb-6 rounded-lg px-4 py-3 text-center"
                style={{
                  backgroundColor: STATUS_COLORS[status].bg,
                  color: STATUS_COLORS[status].text,
                  borderLeft: `4px solid ${STATUS_COLORS[status].border}`,
                }}
              >
                <div className="font-mono text-[44px] font-bold leading-none mb-1">
                  {fmt(totalDay1)} lbs
                </div>
                {targetBase != null && (
                  <p className="font-mono text-[11px] opacity-70 mb-3">
                    (target base: {fmt(targetBase)} lbs)
                  </p>
                )}
                {deltaLine && (
                  <p className="font-mono text-[11px] font-bold opacity-80">{deltaLine}</p>
                )}
              </div>
            ) : (
              <div className="mb-3 rounded-lg px-4 py-3 text-center bg-surface-2 border border-border" style={{ borderWidth: "0.5px" }}>
                <span className="font-mono text-[22px] font-bold text-ink-faint leading-none">&mdash;</span>
                <p className="font-mono text-[11px] text-ink-faint mt-1">enter settings below</p>
              </div>
            )}

            {/* % labels above the bar */}
            <div className="relative h-3 font-mono text-[10px] font-semibold text-ink-muted leading-none mb-1">
              <span className="absolute" style={{ left: `${okPct}%`, transform: "translateX(-50%)" }}>20%</span>
              <span className="absolute" style={{ left: `${warnEdgePct}%`, transform: "translateX(-50%)" }}>25%</span>
              <span className="absolute right-0">30%</span>
            </div>
            <div className="relative pt-2.5">
              {/* Down arrow marker above bar */}
              <div className="absolute top-0 z-20" style={{ left: `${markerPct}%`, transform: "translateX(-50%)" }}>
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
              {/* The bar — zones + blue base fill + striped Trail Load + Est Max line */}
              <div className="relative flex h-[30px] rounded-md overflow-hidden border border-border" style={{ borderWidth: "0.5px" }}>
                <div style={{ width: `${okPct}%`, backgroundColor: STATUS_COLORS.ok.bg }} />
                <div style={{ width: `${warnEdgePct - okPct}%`, backgroundColor: STATUS_COLORS.warn.bg }} />
                <div style={{ width: `${100 - warnEdgePct}%`, backgroundColor: STATUS_COLORS.over.bg }} />
                <div
                  className="absolute left-0 top-0 bottom-0"
                  style={{
                    width: `${basePct}%`,
                    backgroundColor: "rgba(30, 106, 145, 0.35)",
                    borderRight: "2px solid #1e6a91",
                  }}
                />
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
                <div
                  className="absolute top-0 bottom-0 z-10 pointer-events-none"
                  style={{
                    left: `${markerPct}%`,
                    width: "2px",
                    transform: "translateX(-50%)",
                    backgroundColor: isCritical ? STATUS_COLORS.critical.bg : "var(--color-ink)",
                  }}
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[12px] sm:text-[13px] font-bold whitespace-nowrap pointer-events-none" style={{ color: "#0d3d5a" }}>
                  Base: {fmt(actualNum, 1)}
                </div>
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

            {/* Legend */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-ink-muted">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-7 h-3 rounded-sm shrink-0 border border-border"
                  style={{ backgroundColor: "rgba(30, 106, 145, 0.35)", borderWidth: "0.5px" }}
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-ink">Base Pack Weight</strong> &mdash; {fmt(actualNum, 1)} lbs
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
                  <strong className="text-ink">Trail Load</strong> &mdash; {fmt(trailLoadLbs)} lbs
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-ink-muted bg-surface-2 rounded px-3 py-2">
            Enter your body weight in Settings below to see estimates.
          </div>
        )}
      </div>

      {/* ───── SETTINGS card ───── */}
      <div className="bg-surface border border-border rounded-lg p-3.5 space-y-3" style={{ borderWidth: "0.5px" }}>
        <p className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em]">
          Settings
        </p>

        {/* Body weight slider */}
        <label className="block">
          <span className="text-[12px] font-medium text-ink">Your body weight (lbs)</span>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={100} max={220} step={5}
              value={bw}
              onChange={(e) => handleBwChange(Number(e.target.value))}
              className="flex-1 accent-ink"
            />
            <input
              type="number"
              min={100} max={220} step={5}
              value={bw}
              onChange={(e) => handleBwChange(Number(e.target.value) || 0)}
              className="w-20 font-mono text-[13px] bg-surface-2 border border-border rounded px-2 py-1 text-right"
            />
          </div>
        </label>

        {/* Base Pack Weight slider + definition */}
        <div className="space-y-1.5">
          <label className="block">
            <span className="text-[12px] font-medium text-ink">Your Base Pack Weight (lbs)</span>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={5} max={50} step={0.5}
                value={actual}
                onChange={(e) => handleActualChange(Number(e.target.value))}
                className="flex-1 accent-ink"
              />
              <input
                type="number"
                min={0} max={100} step={0.5}
                value={actual}
                onChange={(e) => handleActualChange(Number(e.target.value) || 0)}
                className="w-20 font-mono text-[13px] bg-surface-2 border border-border rounded px-2 py-1 text-right"
              />
            </div>
          </label>
          <p className="text-[11px] text-ink-muted leading-snug">
            Your pack before food, water, crew gear, and worn clothes. <strong className="text-ink">Weigh it at home</strong> before you leave.
          </p>
        </div>

        {/* Tent toggle + explanation */}
        <div className="space-y-1.5">
          <p className="text-[12px] font-medium text-ink mt-2">Your Shelter</p>
          <div
            className="relative inline-flex items-center bg-surface border border-border rounded-full p-[2px]"
            style={{ borderWidth: "0.5px" }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute top-[2px] bottom-[2px] rounded-full bg-hcblue transition-all duration-200"
              style={{
                left: usesPhilmontTent ? "2px" : "50%",
                right: usesPhilmontTent ? "50%" : "2px",
              }}
            />
            <button
              type="button"
              onClick={() => handleUsesPhilmontTentChange(true)}
              className={`relative z-10 px-10 py-1 rounded-full font-mono text-[11px] font-medium whitespace-nowrap transition-colors ${
                usesPhilmontTent ? "text-white" : "text-ink-muted"
              }`}
            >
              Philmont tent
            </button>
            <button
              type="button"
              onClick={() => handleUsesPhilmontTentChange(false)}
              className={`relative z-10 px-10 py-1 rounded-full font-mono text-[11px] font-medium whitespace-nowrap transition-colors ${
                !usesPhilmontTent ? "text-white" : "text-ink-muted"
              }`}
            >
              My tent
            </button>
          </div>
          <p className="font-mono text-ink-muted text-[11px]">
            {usesPhilmontTent
              ? `Philmont tent added to Trail Load: ${fmt(PHILMONT_TENT_LBS, 1)} lbs.`
              : "Using your own tent. Count it in Base Pack Weight."}
          </p>
        </div>
      </div>

      {/* ───── Trail Load breakdown ───── */}
      <div className="bg-surface border border-info-border rounded-lg overflow-hidden" style={{ borderWidth: "0.5px" }}>
        <div className="px-4 py-2.5 bg-info-bg border-b border-info-border" style={{ borderWidth: "0.5px" }}>
          <p className="font-mono text-[10px] text-info-text uppercase tracking-[0.08em] font-semibold">
            Estimated Trail Load
          </p>
          <p className="font-mono text-[9px] text-info-text mt-0.5">
            {usesPhilmontTent
              ? "Food, water, crew gear, and your half of a Philmont tent."
              : "Food, water, crew gear. Your tent is part of your base weight."}
          </p>
        </div>
        <ul className="text-[12px] text-ink divide-y divide-border" style={{ borderWidth: "0.5px" }}>
          <li className="flex justify-between gap-4 px-4 py-1.5">
            <span>Food (per person, 1st carry segment)</span>
            <span className="font-mono font-semibold text-ink">{PACK_WEIGHT_CONSTANTS.foodPerPersonLbs} lbs</span>
          </li>
          <li className="flex justify-between gap-4 px-4 py-1.5">
            <span>Water (2L standard)</span>
            <span className="font-mono font-semibold text-ink">{PACK_WEIGHT_CONSTANTS.waterTwoLitersLbs} lbs</span>
          </li>
          <li className="flex justify-between gap-4 px-4 py-1.5">
            <span>Crew gear (avg, varies 0&ndash;3 lbs)</span>
            <span className="font-mono font-semibold text-ink">{PACK_WEIGHT_CONSTANTS.crewGearAvgLbs} lbs</span>
          </li>
          {usesPhilmontTent && (
            <li className="flex justify-between gap-4 px-4 py-1.5">
              <span>Philmont tent</span>
              <span className="font-mono font-semibold text-ink">{fmt(PHILMONT_TENT_LBS)} lbs</span>
            </li>
          )}
          <li className="flex justify-between gap-4 px-4 py-2 bg-info-bg text-info-text font-semibold">
            <span>Total Trail Load</span>
            <span className="font-mono">{fmt(trailLoadLbs)} lbs</span>
          </li>
        </ul>
        <p className="text-[11px] text-ink-muted px-4 py-2 border-t border-info-border leading-snug" style={{ borderWidth: "0.5px" }}>
          Trail Load is added to your Base Pack Weight to estimate your heaviest pack.
        </p>
      </div>

    </div>
  );
}
