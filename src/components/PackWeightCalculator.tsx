"use client";

import { useEffect, useState, useTransition } from "react";
import { computeTargets, PACK_WEIGHT_CONSTANTS } from "@/data/packWeights";
import { StatusBadge } from "./primitives/StatusBadge";

// Estimator uses the full 14.7 lb constant including tent estimate.
// My Gear uses 12.2 (no tent) since users track actual tent weight there.
const GF = PACK_WEIGHT_CONSTANTS.gearAndFoodLbs;

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
}: {
  initialBodyWeight?: number | null;
  onBodyWeightChange?: (lbs: number) => void;
  initialActualBaseWeight?: number | null;
  onActualBaseWeightChange?: (lbs: number) => void;
} = {}) {
  const [bw, setBw] = useState<number>(initialBodyWeight ?? 160);
  const [actual, setActual] = useState<number>(initialActualBaseWeight ?? 18);
  const [, startTransition] = useTransition();
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("estimator-help-seen");
    if (!seen) {
      setHelpOpen(true);
      localStorage.setItem("estimator-help-seen", "1");
    }
  }, []);

  function handleBwChange(val: number) {
    setBw(val);
    if (onBodyWeightChange && val > 0) {
      startTransition(() => { onBodyWeightChange(val); });
    }
  }

  function handleActualChange(val: number) {
    setActual(val);
    if (onActualBaseWeightChange && val > 0) {
      startTransition(() => { onActualBaseWeightChange(val); });
    }
  }
  const targets = computeTargets(bw);
  const actualNum = actual;
  const validActual = actualNum > 0;

  let status: "ok" | "warn" | "over" | "critical" | null = null;
  let totalDay1: number | null = null;
  let pctOfBody: number | null = null;
  const deltaLines: string[] = [];

  if (validActual && targets) {
    totalDay1 = actualNum + GF;
    pctOfBody = (totalDay1 / bw) * 100;
    const deltaTarget = totalDay1 - targets.target20;

    if (totalDay1 <= targets.target20) status = "ok";
    else if (totalDay1 <= targets.max25) status = "warn";
    else if (totalDay1 <= targets.hardMax30) status = "over";
    else status = "critical";

    if (totalDay1 > targets.hardMax30) {
      deltaLines.push(`Cut ${formatLbsOz(totalDay1 - targets.hardMax30)} to hit 30% hard max`);
      deltaLines.push(`Cut ${formatLbsOz(deltaTarget)} to hit 20% target`);
    } else if (totalDay1 > targets.max25) {
      deltaLines.push(`Cut ${formatLbsOz(totalDay1 - targets.max25)} to hit 25% crew standard`);
      deltaLines.push(`${formatLbsOz(targets.hardMax30 - totalDay1)} under 30% hard max`);
    } else if (deltaTarget > 0) {
      deltaLines.push(`Cut ${formatLbsOz(deltaTarget)} to hit 20% target`);
      deltaLines.push(`${formatLbsOz(targets.max25 - totalDay1)} under 25% crew standard`);
    } else if (deltaTarget < -0.05) {
      deltaLines.push(`${formatLbsOz(-deltaTarget)} under 20% target`);
    } else {
      deltaLines.push("At 20% target");
    }
  }


  // Progress bar zone widths (proportional to body weight percentages)
  // ok: 0-20% = 20/30 = 66.67%, warn: 20-25% = 16.67%, over: 25-30% = 16.67%
  const okPct = (20 / 30) * 100;
  const warnEdgePct = (25 / 30) * 100;
  const markerPct = targets && totalDay1 != null
    ? Math.min(100, Math.max(0, (totalDay1 / targets.hardMax30) * 100))
    : 0;
  const isCritical = status === "critical";

  return (
    <div className="space-y-3">

      {/* ───── How to use this estimator (auto-open first visit) ───── */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden" style={{ borderWidth: "0.5px" }}>
        <button
          type="button"
          onClick={() => setHelpOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-surface-2 transition-colors"
        >
          <span className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em]">
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
                Plan your pack weight before you weigh anything. Play &ldquo;what if&rdquo; with body weight and base weight to see where you&apos;ll land.
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
                  <span className="text-ink-muted text-[11px] leading-snug">Amber &mdash; above goal, still under crew standard.</span>
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[10px] font-semibold rounded shrink-0 inline-flex items-center justify-center w-9 h-5" style={{ backgroundColor: STATUS_COLORS.over.bg, color: STATUS_COLORS.over.text }}>25+</span>
                  <span className="text-ink-muted text-[11px] leading-snug">Pink &mdash; over crew standard. Cut weight.</span>
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[10px] font-semibold rounded shrink-0 inline-flex items-center justify-center w-9 h-5" style={{ backgroundColor: STATUS_COLORS.critical.bg, color: STATUS_COLORS.critical.text }}>30+</span>
                  <span className="text-ink-muted text-[11px] leading-snug">Red &mdash; over hard ceiling. No exceptions.</span>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted font-semibold">
                3. The zones
              </h3>
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
                Switch to My Gear and weigh each item. That page tracks your actual list and is more accurate than this estimator.
              </p>
            </section>

          </div>
        )}
      </div>

      {/* ───── Target Base hero — what you control ───── */}
      <div
        className="bg-info-bg text-info-text rounded-lg p-4 sm:p-5"
        style={{ borderLeft: "5px solid var(--color-info-border)" }}
      >
        <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.1em] opacity-80 mb-2">
          Target Base Weight &mdash; what you control
        </p>
        <div className="flex items-baseline gap-2 flex-wrap mb-1.5">
          <span className="font-mono text-[34px] sm:text-[44px] font-bold leading-none">
            {targets ? `≤ ${fmt(targets.targetBase)}` : "—"}
          </span>
          <span className="font-mono text-[16px] sm:text-[18px] opacity-80">lbs</span>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] opacity-75 mb-2">
          20% of your body weight
        </p>
        <p className="text-[12px] sm:text-[13px] leading-relaxed opacity-90">
          Everything you stuff in your pack. <strong>Weigh it at home</strong> before you leave. Does <strong>not</strong> include worn clothes, food, water, shelter, or crew gear.
        </p>
      </div>

      {/* ───── Progress bar card — where your total will land ───── */}
      <div className="bg-surface border border-border rounded-lg" style={{ borderWidth: "0.5px" }}>
        <div className="px-4 py-3">

          {/* Top: Est Max + percent */}
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em] shrink-0">Est Max</span>
              <span className="font-mono text-[22px] sm:text-[24px] font-semibold leading-none text-ink">
                {totalDay1 != null ? fmt(totalDay1) : "—"} <span className="text-[14px] sm:text-[15px] text-ink-muted font-normal">lbs</span>
              </span>
            </div>
            {pctOfBody != null && (
              <span className="font-mono text-[11px] text-ink-muted shrink-0">{fmt(pctOfBody, 1)}% of body</span>
            )}
          </div>

          {/* Delta line */}
          {targets && deltaLines.length > 0 && (
            <div className="font-mono text-[11px] text-ink mb-2.5 leading-snug">
              {deltaLines[0]}
            </div>
          )}

          {/* Progress bar */}
          {targets ? (
            <div className="mb-1.5">
              {/* % labels above the bar */}
              <div className="relative h-3 font-mono text-[10px] font-semibold text-ink-muted leading-none mb-1">
                <span className="absolute" style={{ left: `${okPct}%`, transform: "translateX(-50%)" }}>20%</span>
                <span className="absolute" style={{ left: `${warnEdgePct}%`, transform: "translateX(-50%)" }}>25%</span>
                <span className="absolute right-0">30%</span>
              </div>
              <div className="relative pt-2.5">
                {/* Down arrow marker above bar */}
                <div className="absolute top-0 z-10" style={{ left: `${markerPct}%`, transform: "translateX(-50%)" }}>
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
                {/* The bar */}
                <div className="relative flex h-[30px] rounded-md overflow-hidden border border-border" style={{ borderWidth: "0.5px" }}>
                  <div style={{ width: `${okPct}%`, backgroundColor: STATUS_COLORS.ok.bg }} />
                  <div style={{ width: `${warnEdgePct - okPct}%`, backgroundColor: STATUS_COLORS.warn.bg }} />
                  <div style={{ width: `${100 - warnEdgePct}%`, backgroundColor: STATUS_COLORS.over.bg }} />
                  <div className="absolute inset-0 pointer-events-none font-mono text-ink">
                    <div className="absolute top-1/2 left-2 -translate-y-1/2 text-[18px] font-bold leading-none">0</div>
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
              Enter your body weight below to see targets.
            </div>
          )}

          {/* Active source line */}
          <div className="font-mono text-[10px] text-ink-muted mt-2">
            Using base {fmt(actualNum)} lbs <span className="text-ink-faint">+ {GF} gear &amp; food</span>
          </div>
        </div>
      </div>

      {/* ───── Inputs card (always visible) ───── */}
      <div className="bg-surface-2 border border-border rounded-lg px-4 py-3" style={{ borderWidth: "0.5px" }}>

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
              value={bw}
              onChange={(e) => handleBwChange(Number(e.target.value))}
              className="flex-1 accent-ink"
            />
            <input
              type="number"
              min={100} max={220} step={5}
              value={bw}
              onChange={(e) => handleBwChange(Number(e.target.value) || 0)}
              className="w-20 font-mono text-[13px] bg-surface border border-border rounded px-2 py-1 text-right"
            />
            <span className="font-mono text-[11px] text-ink-muted shrink-0">lbs</span>
          </div>
        </div>

        {/* Actual base weight */}
        <div className="border-t border-border pt-3 mt-3" style={{ borderWidth: "0.5px" }}>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em]">Actual base weight</span>
            <span className="font-mono text-[10px] text-ink-faint">pack minus body, no worn / no food</span>
          </div>
          <div className="flex items-center gap-3">
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
              className="w-20 font-mono text-[13px] bg-surface border border-border rounded px-2 py-1 text-right"
            />
            <span className="font-mono text-[11px] text-ink-muted shrink-0">lbs</span>
          </div>
        </div>
      </div>

      {/* ───── Day-1 Gear & Food breakdown (what gets stacked) ───── */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden" style={{ borderWidth: "0.5px" }}>
        <div className="px-4 py-2.5 bg-surface-2 border-b border-border" style={{ borderWidth: "0.5px" }}>
          <p className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em]">
            What&apos;s stacked on your base
          </p>
          <p className="font-mono text-[9px] text-ink-faint mt-0.5">
            The {GF} lbs added on top to get your Est Max
          </p>
        </div>
        <ul className="text-[12px] text-ink-muted divide-y divide-border" style={{ borderWidth: "0.5px" }}>
          <li className="flex justify-between px-4 py-1.5">
            <span>Food (per person, 1st carry segment)</span>
            <span className="font-mono">{PACK_WEIGHT_CONSTANTS.foodPerPersonLbs} lbs</span>
          </li>
          <li className="flex justify-between px-4 py-1.5">
            <span>Water (2L standard)</span>
            <span className="font-mono">{PACK_WEIGHT_CONSTANTS.waterTwoLitersLbs} lbs</span>
          </li>
          <li className="flex justify-between px-4 py-1.5">
            <span>Crew gear (avg, varies 0&ndash;3 lbs)</span>
            <span className="font-mono">{PACK_WEIGHT_CONSTANTS.crewGearAvgLbs} lbs</span>
          </li>
          <li className="flex justify-between px-4 py-1.5">
            <span>Tent (estimated &middot; 2&ndash;3 lbs typical)</span>
            <span className="font-mono">{PACK_WEIGHT_CONSTANTS.shelterLbs} lbs</span>
          </li>
          <li className="flex justify-between px-4 py-2 bg-surface-2 text-ink font-medium">
            <span>Total stacked on base</span>
            <span className="font-mono">{GF} lbs</span>
          </li>
        </ul>
        <p className="text-[11px] text-ink-faint px-4 py-2 border-t border-border leading-snug" style={{ borderWidth: "0.5px" }}>
          Estimated values. Actual tent weight is tracked in My Gear.
        </p>
      </div>

    </div>
  );
}
