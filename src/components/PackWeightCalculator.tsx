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
}: {
  initialBodyWeight?: number | null;
  onBodyWeightChange?: (lbs: number) => void;
} = {}) {
  const [bw, setBw] = useState<number>(initialBodyWeight ?? 160);
  const [actual, setActual] = useState<number>(18);
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


  return (
    <div className="space-y-3">

      {/* HOW TO USE — accordion */}
      <div
        className="bg-surface border border-border rounded-lg overflow-hidden"
        style={{ borderWidth: "0.5px" }}
      >
        <button
          onClick={() => setHelpOpen((o) => !o)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 text-left bg-hcblue text-white rounded-lg"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.08em]">
            How to use the estimator
          </span>
          <svg
            className="shrink-0 text-white"
            style={{ transform: helpOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}
            width="14" height="14" viewBox="0 0 14 14" fill="none"
          >
            <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {helpOpen && (
          <div className="px-3.5 pb-3.5 space-y-2 border-t border-border" style={{ borderWidth: "0.5px" }}>
            <ol className="text-[12px] text-ink space-y-2 pt-3 list-decimal list-inside">
              <li>
                <strong>Enter your body weight</strong> using the slider below.
              </li>
              <li>
                <strong>Weigh your packed backpack</strong> — without worn
                clothes or your tent. Step on a bathroom scale holding your
                pack, then subtract your body weight. That number is your{" "}
                <strong>base weight</strong>.
              </li>
              <li>
                <strong>Enter your base weight</strong> in the bottom section to
                see your estimated Day-1 total.
              </li>
            </ol>
            <p className="text-[11px] text-ink-muted leading-snug">
              Your Day-1 total is your base weight plus food, water, tent, and
              crew gear. Try to stay under the 20% target.
            </p>
          </div>
        )}
      </div>

      {/* 1. CALCULATOR — body weight + derived targets */}
      <div
        className="bg-surface border border-border rounded-lg p-3.5 space-y-3"
        style={{ borderWidth: "0.5px" }}
      >
        <p className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em]">
          Calculator
        </p>
        <label className="block">
          <span className="text-[12px] font-medium text-ink">
            Your body weight (lbs)
          </span>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={100}
              max={220}
              step={5}
              value={bw}
              onChange={(e) => handleBwChange(Number(e.target.value))}
              className="flex-1 accent-ink"
            />
            <input
              type="number"
              min={100}
              max={220}
              step={5}
              value={bw}
              onChange={(e) => handleBwChange(Number(e.target.value) || 0)}
              className="w-20 font-mono text-[13px] bg-surface-2 border border-border rounded px-2 py-1 text-right"
            />
          </div>
        </label>

        {/* Target base weight hero */}
        <div
          className="bg-info-bg text-info-text rounded-lg p-3.5 text-center"
          style={{ borderLeft: "4px solid var(--color-info-border)" }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] opacity-80 mb-1.5">
            Target Base Weight — what you control
          </p>
          <div className="font-mono text-[30px] sm:text-[38px] font-semibold leading-none mb-1">
            {targets ? `≤ ${fmt(targets.targetBase)} lbs` : "—"}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] opacity-70 mb-1.5">
            Based on 20% of your body weight
          </p>
          <p className="text-[11px] leading-relaxed opacity-90">
            Everything in your pack. Does <strong>NOT</strong> include worn
            clothes, food, water, shelter, and crew gear.
          </p>
        </div>

        {targets && (
          <div className="border border-border rounded-lg p-3 space-y-2.5" style={{ borderWidth: "0.5px" }}>
            <p className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em] font-semibold">
              Target Max Pack Weight
            </p>
            <p className="font-mono text-[9px] text-ink-faint uppercase tracking-[0.06em] mt-0.5">
              (Base Weight + Gear &amp; Food) &middot; Based on % Body Weight
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-ok-bg text-ok-text rounded-lg p-2.5 text-center">
                <p className="font-mono text-[9px] uppercase tracking-[0.08em] opacity-80 leading-tight">20% Goal</p>
                <div className="font-mono text-[17px] sm:text-[20px] font-semibold mt-1">≤ {fmt(targets.target20)} lbs</div>
                <p className="text-[9px] opacity-80 mt-0.5 leading-snug">Crew target</p>
              </div>
              <div className="bg-warn-bg text-warn-text rounded-lg p-2.5 text-center">
                <p className="font-mono text-[9px] uppercase tracking-[0.08em] opacity-80 leading-tight">25% Ceiling</p>
                <div className="font-mono text-[17px] sm:text-[20px] font-semibold mt-1">≤ {fmt(targets.max25)} lbs</div>
                <p className="text-[9px] opacity-80 mt-0.5 leading-snug">Crew max</p>
              </div>
              <div className="bg-danger-bg text-danger-text rounded-lg p-2.5 text-center">
                <p className="font-mono text-[9px] uppercase tracking-[0.08em] opacity-80 leading-tight">30% Hard Limit</p>
                <div className="font-mono text-[17px] sm:text-[20px] font-semibold mt-1">≤ {fmt(targets.hardMax30)} lbs</div>
                <p className="text-[9px] opacity-80 mt-0.5 leading-snug">No exceptions</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4. ESTIMATED TOTAL PACK WEIGHT — input + conditional result */}
      <div
        className="bg-surface border border-border rounded-lg p-3.5"
        style={{ borderWidth: "0.5px" }}
      >
        <p className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em] mb-2.5">
          Estimated Max Pack Weight
        </p>
        <label className="block">
          <span className="text-[12px] font-medium text-ink">
            Your actual base weight (lbs)
          </span>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={5}
              max={50}
              step={0.5}
              value={actual}
              onChange={(e) => setActual(Number(e.target.value))}
              className="flex-1 accent-ink"
            />
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={actual}
              onChange={(e) => setActual(Number(e.target.value) || 0)}
              className="w-20 font-mono text-[13px] bg-surface-2 border border-border rounded px-2 py-1 text-right"
            />
          </div>
        </label>

        {status && totalDay1 != null && pctOfBody != null && (
          <div
            className="rounded-lg p-4 sm:p-5 text-center mt-3"
            style={{
              backgroundColor: STATUS_COLORS[status].bg,
              color: STATUS_COLORS[status].text,
              borderLeft: `4px solid ${STATUS_COLORS[status].border}`,
            }}
          >
            <div className="font-mono text-[34px] sm:text-[44px] font-semibold leading-none">
              {fmt(totalDay1)} lbs
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
              {status === "ok" && <StatusBadge tone="ok">ON TARGET</StatusBadge>}
              {status === "warn" && <StatusBadge tone="warn">ABOVE TARGET</StatusBadge>}
              {status === "over" && <StatusBadge tone="over">OVER 25%</StatusBadge>}
              {status === "critical" && <StatusBadge tone="critical">OVER HARD MAX</StatusBadge>}
              <span className="text-[11px] sm:text-[12px] opacity-90">
                {fmt(pctOfBody, 1)}% of body weight
              </span>
            </div>
            {deltaLines.length > 0 && (
              <div className="mt-2 space-y-0.5">
                {deltaLines.map((line) => (
                  <div
                    key={line}
                    className="font-mono text-[13px] sm:text-[14px] font-semibold"
                  >
                    {line}
                  </div>
                ))}
              </div>
            )}
            <p className="font-mono text-[10px] sm:text-[11px] opacity-75 mt-1.5">
              Base {fmt(actualNum)} + {GF} Gear &amp; Food = {fmt(totalDay1)}{" "}
              lbs
            </p>
            {status === "over" && (
              <p className="text-[11px] sm:text-[12px] mt-2 font-semibold">
                Above 25% crew standard. Cut weight before departure.
              </p>
            )}
            {status === "critical" && (
              <p className="text-[11px] sm:text-[12px] mt-2 font-semibold">
                Above the 30% hard ceiling. Must cut weight. No exceptions.
              </p>
            )}
          </div>
        )}

      </div>

      {/* 5. DAY-1 GEAR & FOOD BREAKDOWN */}
      <div
        className="bg-surface border border-border rounded-lg p-3.5"
        style={{ borderWidth: "0.5px" }}
      >
        <p className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em] mb-2.5">
          Day-1 Gear &amp; Food (Constant)
        </p>
        <ul className="text-[12px] text-ink-muted space-y-1">
          <li className="flex justify-between">
            <span>Food (per person, 1st carry segment)</span>
            <span className="font-mono">
              {PACK_WEIGHT_CONSTANTS.foodPerPersonLbs} lbs
            </span>
          </li>
          <li className="flex justify-between">
            <span>Water (2L standard)</span>
            <span className="font-mono">
              {PACK_WEIGHT_CONSTANTS.waterTwoLitersLbs} lbs
            </span>
          </li>
          <li className="flex justify-between">
            <span>Crew gear (avg, varies 0–3 lbs)</span>
            <span className="font-mono">
              {PACK_WEIGHT_CONSTANTS.crewGearAvgLbs} lbs
            </span>
          </li>
          <li className="flex justify-between">
            <span>Tent (estimated · 2–3 lbs typical)</span>
            <span className="font-mono">
              {PACK_WEIGHT_CONSTANTS.shelterLbs} lbs
            </span>
          </li>
          <li className="flex justify-between border-t border-border pt-1.5 mt-1 text-ink font-medium">
            <span>Total Gear &amp; Food</span>
            <span className="font-mono">{GF} lbs</span>
          </li>
        </ul>
        <p className="text-[11px] text-ink-faint mt-2.5 leading-snug">
          Estimated values — actual tent weight is tracked in My Gear.
        </p>
      </div>
    </div>
  );
}
