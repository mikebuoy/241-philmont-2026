"use client";

import { useState } from "react";
import { computeTargets, PACK_WEIGHT_CONSTANTS } from "@/data/packWeights";
import { StatusBadge } from "./primitives/StatusBadge";

// Shelter is tracked as a personal packing item; excluded from the Day-1 constant
const GF = PACK_WEIGHT_CONSTANTS.gearAndFoodLbs - PACK_WEIGHT_CONSTANTS.shelterLbs;

function fmt(n: number, digits = 1): string {
  return n.toFixed(digits);
}

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

export function PackWeightCalculator() {
  const [bw, setBw] = useState<number>(170);
  const [actual, setActual] = useState<number>(18);
  const targets = computeTargets(bw);
  const actualNum = actual;
  const validActual = actualNum > 0;

  let status: "ok" | "warn" | "danger" | null = null;
  let totalDay1: number | null = null;
  let pctOfBody: number | null = null;
  const deltaLines: string[] = [];

  if (validActual && targets) {
    totalDay1 = actualNum + GF;
    pctOfBody = (totalDay1 / bw) * 100;
    const deltaTarget = totalDay1 - targets.target20;
    const deltaMax = totalDay1 - targets.max25;
    if (totalDay1 <= targets.target20) status = "ok";
    else if (totalDay1 <= targets.max25) status = "warn";
    else status = "danger";

    if (deltaMax > 0) {
      deltaLines.push(`Cut ${formatLbsOz(deltaMax)} to hit max`);
      deltaLines.push(`Cut ${formatLbsOz(deltaTarget)} to hit target`);
    } else {
      if (deltaTarget > 0) {
        deltaLines.push(`Cut ${formatLbsOz(deltaTarget)} to hit target`);
      } else if (deltaTarget < -0.05) {
        deltaLines.push(`${formatLbsOz(-deltaTarget)} under target`);
      } else {
        deltaLines.push("At target");
      }
      const marginToMax = -deltaMax;
      if (marginToMax > 0.05) {
        deltaLines.push(`${formatLbsOz(marginToMax)} under max`);
      }
    }
  }

  const statusBg = {
    ok: "bg-ok-bg",
    warn: "bg-warn-bg",
    danger: "bg-danger-bg",
  };
  const statusText = {
    ok: "text-ok-text",
    warn: "text-warn-text",
    danger: "text-danger-text",
  };

  return (
    <div className="space-y-3">
      {/* 1. CALCULATOR */}
      <div
        className="bg-surface border border-border rounded-lg p-3.5"
        style={{ borderWidth: "0.5px" }}
      >
        <p className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em] mb-2.5">
          Calculator
        </p>
        <label className="block">
          <span className="text-[12px] font-medium text-ink">
            Your body weight (lbs)
          </span>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={110}
              max={220}
              step={5}
              value={bw}
              onChange={(e) => setBw(Number(e.target.value))}
              className="flex-1 accent-ink"
            />
            <input
              type="number"
              min={110}
              max={220}
              step={5}
              value={bw}
              onChange={(e) => setBw(Number(e.target.value) || 0)}
              className="w-20 font-mono text-[13px] bg-surface-2 border border-border rounded px-2 py-1 text-right"
            />
          </div>
        </label>
      </div>

      {/* 2. TARGET BASE WEIGHT — hero */}
      <div
        className="bg-ok-bg text-ok-text rounded-lg p-4 sm:p-5 text-center"
        style={{ borderLeft: "4px solid var(--color-ok-border)" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] opacity-80 mb-2">
          Target Base Weight — what you control
        </p>
        <div className="font-mono text-[34px] sm:text-[44px] font-semibold leading-none mb-2">
          {targets ? `≤ ${fmt(targets.targetBase)} lbs` : "—"}
        </div>
        <p className="text-[11px] sm:text-[12px] leading-relaxed opacity-90">
          Everything in your pack. Does <strong>NOT</strong> include worn
          clothes, food, water, shelter, and crew gear.
        </p>
      </div>

      {/* 3. TARGET MAX + ABSOLUTE MAX — side by side always, center aligned */}
      {targets && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-info-bg text-info-text rounded-lg p-3 text-center">
            <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.08em] opacity-80 leading-tight">
              Target Max Total
            </p>
            <div className="font-mono text-[20px] sm:text-[26px] font-semibold mt-1">
              {fmt(targets.target20)} lbs
            </div>
            <p className="text-[10px] sm:text-[11px] opacity-80 mt-1 leading-snug">
              Day-1 total at 20% body weight
            </p>
          </div>
          <div className="bg-danger-bg text-danger-text rounded-lg p-3 text-center">
            <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.08em] opacity-80 leading-tight">
              Absolute Max (Ceiling)
            </p>
            <div className="font-mono text-[20px] sm:text-[26px] font-semibold mt-1">
              {fmt(targets.max25)} lbs
            </div>
            <p className="text-[10px] sm:text-[11px] opacity-80 mt-1 leading-snug">
              Above this you MUST cut weight
            </p>
          </div>
        </div>
      )}

      {/* 4. ESTIMATED TOTAL PACK WEIGHT — input + conditional result */}
      <div
        className="bg-surface border border-border rounded-lg p-3.5"
        style={{ borderWidth: "0.5px" }}
      >
        <p className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em] mb-2.5">
          Estimated Total Pack Weight
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
            className={`${statusBg[status]} ${statusText[status]} rounded-lg p-4 sm:p-5 text-center mt-3`}
            style={{ borderLeft: `4px solid var(--color-${status}-border)` }}
          >
            <div className="font-mono text-[34px] sm:text-[44px] font-semibold leading-none">
              {fmt(totalDay1)} lbs
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
              {status === "ok" && (
                <StatusBadge tone="ok">ON TARGET</StatusBadge>
              )}
              {status === "warn" && (
                <StatusBadge tone="warn">CAUTION · cut weight</StatusBadge>
              )}
              {status === "danger" && (
                <StatusBadge tone="danger">OVER LIMIT · MUST CUT</StatusBadge>
              )}
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
            {status === "danger" && (
              <p className="text-[11px] sm:text-[12px] mt-2 font-semibold">
                Above the 25% hard ceiling. No exceptions.
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
          <li className="flex justify-between border-t border-border pt-1.5 mt-1 text-ink font-medium">
            <span>Total Gear &amp; Food</span>
            <span className="font-mono">{GF} lbs</span>
          </li>
        </ul>
        <p className="text-[11px] text-ink-faint mt-2.5 leading-snug">
          Shelter weight is tracked individually in your packing list.
        </p>
      </div>
    </div>
  );
}
