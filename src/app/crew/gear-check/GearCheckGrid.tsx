"use client";

import { useEffect, useRef, useState } from "react";
import type { CrewRole } from "@/data/roster";
import { PACK_WEIGHT_CONSTANTS } from "@/data/packWeights";
import { setAdvisorNote, setPackedState, setCrewMemberBaseWeightSettings } from "./actions";

const PHILMONT_TENT_OZ = PACK_WEIGHT_CONSTANTS.philmontTentOz;

export type CellData = {
  itemId: string;
  isPacked: boolean;
  isNotPacking: boolean;
  advisorNote: string | null;
};

export type GridRow = {
  category: string;
  itemName: string;
  isRequired: boolean | null;
};

export type CrewGrid = {
  crewId: number;
  members: {
    id: string;
    name: string;
    role: CrewRole;
    usesPhilmontTent: boolean;
    baseWeightLbs: number | null;
    baseWeightStatus: "ok" | "warn" | "over" | "critical" | null;
    estMaxLbs: number | null;
    weightStatus: "ok" | "warn" | "over" | "critical" | null;
  }[];
  rows: GridRow[];
  cells: Record<string, Record<string, CellData | null>>;
};

const ROLE_ABBR: Record<CrewRole, string> = {
  crew_leader: "CL",
  chaplain_aide: "CA",
  guia: "G",
  scout: "S",
  lead_advisor: "LA",
  advisor: "A",
};

const STATUS_COLORS = {
  ok:       { bg: "#d4edda", text: "#155724" },
  warn:     { bg: "#fff3cd", text: "#856404" },
  over:     { bg: "#f8d7da", text: "#721c24" },
  critical: { bg: "#dc3545", text: "#ffffff" },
} as const;

function rowKey(row: GridRow): string {
  return `${row.category}||${row.itemName}`;
}

type EditingCell = {
  crewId: number;
  memberId: string;
  memberName: string;
  itemName: string;
  rk: string;
  itemId: string;
};

type EditingBaseWeight = {
  memberId: string;
  memberName: string;
  currentLbs: number | null;
};

export function GearCheckGrid({
  grids,
  isAdmin,
}: {
  grids: CrewGrid[];
  isAdmin: boolean;
}) {
  const [activeCrew, setActiveCrew] = useState(grids[0]?.crewId ?? 1);
  const activeGrid = grids.find((g) => g.crewId === activeCrew) ?? grids[0];

  const [localCells, setLocalCells] = useState<
    Record<number, Record<string, Record<string, CellData | null>>>
  >(() => {
    const result: Record<number, Record<string, Record<string, CellData | null>>> = {};
    for (const g of grids) result[g.crewId] = g.cells;
    return result;
  });

  const [mode, setMode] = useState<"flag" | "pack">("flag");
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [editingBaseWeight, setEditingBaseWeight] = useState<EditingBaseWeight | null>(null);
  const [baseWeightValue, setBaseWeightValue] = useState(18);
  const [useActualBase, setUseActualBase] = useState(true);
  const [tentToggle, setTentToggle] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseWeightInputRef = useRef<HTMLInputElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);

  // Sync header scroll position with body on horizontal scroll
  function syncScroll() {
    if (headerScrollRef.current && bodyScrollRef.current) {
      headerScrollRef.current.scrollLeft = bodyScrollRef.current.scrollLeft;
    }
  }

  // Read initial tab from URL hash on mount
  useEffect(() => {
    const match = window.location.hash.match(/^#crew-(\d+)$/);
    if (match) {
      const id = parseInt(match[1], 10);
      if (grids.some((g) => g.crewId === id)) setActiveCrew(id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep URL hash in sync with active tab
  useEffect(() => {
    history.replaceState(null, "", `#crew-${String(activeCrew).padStart(2, "0")}`);
  }, [activeCrew]);

  // Reset scroll positions when switching crews
  useEffect(() => {
    if (bodyScrollRef.current) bodyScrollRef.current.scrollLeft = 0;
    if (headerScrollRef.current) headerScrollRef.current.scrollLeft = 0;
  }, [activeCrew]);

  useEffect(() => {
    if (editingCell) inputRef.current?.focus();
  }, [editingCell]);

  useEffect(() => {
    if (editingBaseWeight) baseWeightInputRef.current?.focus();
  }, [editingBaseWeight]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setEditingCell(null); setEditingBaseWeight(null); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function openEdit(crewId: number, member: { id: string; name: string }, row: GridRow) {
    const rk = rowKey(row);
    const cell = localCells[crewId]?.[rk]?.[member.id];
    if (!cell) return;
    setSaveError(null);
    setNoteInput(cell.advisorNote ?? "");
    setEditingCell({
      crewId,
      memberId: member.id,
      memberName: member.name,
      itemName: row.itemName,
      rk,
      itemId: cell.itemId,
    });
  }

  async function saveNote(note: string | null) {
    if (!editingCell) return;
    setSaving(true);
    setSaveError(null);
    const { crewId, memberId, rk, itemId } = editingCell;
    setLocalCells((prev) => ({
      ...prev,
      [crewId]: {
        ...prev[crewId],
        [rk]: {
          ...prev[crewId][rk],
          [memberId]: { ...(prev[crewId][rk][memberId] as CellData), advisorNote: note },
        },
      },
    }));
    setEditingCell(null);
    setSaving(false);
    const result = await setAdvisorNote(itemId, note);
    if (result?.error) setSaveError(result.error);
  }

  async function togglePacked(
    crewId: number,
    member: { id: string; name: string },
    row: GridRow,
  ) {
    const rk = rowKey(row);
    const cell = localCells[crewId]?.[rk]?.[member.id];
    if (!cell || cell.isNotPacking) return;
    const newIsPacked = !cell.isPacked;
    setLocalCells((prev) => ({
      ...prev,
      [crewId]: {
        ...prev[crewId],
        [rk]: { ...prev[crewId][rk], [member.id]: { ...cell, isPacked: newIsPacked } },
      },
    }));
    const result = await setPackedState(cell.itemId, newIsPacked);
    if (result?.error) {
      setLocalCells((prev) => ({
        ...prev,
        [crewId]: {
          ...prev[crewId],
          [rk]: { ...prev[crewId][rk], [member.id]: cell },
        },
      }));
      setSaveError(result.error);
    }
  }

  async function saveBaseWeightSettings(lbs: number | null) {
    if (!editingBaseWeight) return;
    setSaving(true);
    setSaveError(null);
    setEditingBaseWeight(null);
    const result = await setCrewMemberBaseWeightSettings(editingBaseWeight.memberId, lbs, tentToggle);
    setSaving(false);
    if (result?.error) setSaveError(result.error);
  }

  if (!activeGrid) return null;

  const bodyRows = buildBodyRows(activeGrid);
  const colMinWidth = 160 + activeGrid.members.length * 56;

  return (
    <div className="space-y-0">
      {saveError && (
        <div className="rounded-md bg-danger-bg border border-danger-border text-danger-text px-3 py-2 mb-3 text-[11px] font-mono">
          Error saving: {saveError}
        </div>
      )}

      {/*
        Sticky bar — two rows:
          1. Crew tab switcher + legend
          2. Member name header (scrolls in sync with body via JS)
        The header div uses overflow-x-scroll with hidden scrollbar so that
        sticky left-0 works on the first cell, and scrollLeft can be set by JS.
      */}
      <div className="sticky top-0 z-40 -mx-6 bg-bg shadow-sm print:hidden">
        {/* Row 1: tabs + legend */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1.5 sm:gap-4 px-6 pt-2 pb-0">
          <div className="flex gap-1.5 shrink-0 items-end -mb-px">
            {grids.map((g) => (
              <button
                key={g.crewId}
                type="button"
                onClick={() => setActiveCrew(g.crewId)}
                className={`px-4 py-1.5 rounded-t-md font-mono text-[12px] font-medium transition-colors border ${
                  activeCrew === g.crewId
                    ? "relative z-10 border-border border-b-bg bg-bg text-ink font-semibold"
                    : "border-border bg-surface-2 text-ink-muted hover:text-ink"
                }`}
              >
                Crew {g.crewId} ({g.members.length})
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 sm:gap-x-3 sm:gap-y-1 sm:justify-end">
            {[
              { bg: "bg-ok-bg", text: "text-ok-text", symbol: "✓", label: "Packed" },
              { bg: "", text: "text-ink-muted", symbol: "□", label: "Not packed", bgStyle: { backgroundColor: "#fde8e8" } },
              { bg: "bg-warn-bg", text: "text-warn-text", symbol: "⚑", label: "Flag" },
              { bg: "bg-surface-2", text: "text-ink-muted", symbol: "⊘", label: "Not Taking", symbolClass: "text-[12px]" },
            ].map(({ bg, text, symbol, label, symbolClass, bgStyle }) => (
              <span key={label} style={{ ...bgStyle, borderWidth: "0.5px" }} className={`inline-flex items-center gap-0.5 rounded border border-border px-1 py-0 sm:px-1.5 sm:py-0.5 font-mono text-[9px] ${bg} ${text}`}>
                <span className={symbolClass}>{symbol}</span>{label}
              </span>
            ))}
          </div>
        </div>

        {/* Row 1.5: always-present border line; active tab's border-b-bg punches through it.
            When admin, also shows the centered mode toggle below the border. */}
        <div className="border-t border-border">
          {isAdmin && (
            <div className="flex justify-center py-1.5">
              <div
                className="relative inline-flex items-center bg-surface border border-border rounded-full p-[2px]"
                style={{ borderWidth: "0.5px" }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-[2px] bottom-[2px] rounded-full bg-hcblue transition-all duration-200"
                  style={{
                    left: mode === "flag" ? "2px" : "50%",
                    right: mode === "flag" ? "50%" : "2px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMode("flag")}
                  title="Flag mode — click cells to add advisor notes"
                  className={`relative z-10 px-3 py-1 rounded-full font-mono text-[11px] font-medium whitespace-nowrap transition-colors ${
                    mode === "flag" ? "text-white" : "text-ink-muted"
                  }`}
                >
                  ⚑ Flag
                </button>
                <button
                  type="button"
                  onClick={() => setMode("pack")}
                  title="Check mode — click cells to mark items packed"
                  className={`relative z-10 px-3 py-1 rounded-full font-mono text-[11px] font-medium whitespace-nowrap transition-colors ${
                    mode === "pack" ? "text-white" : "text-ink-muted"
                  }`}
                >
                  ✓ Check
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Row 2: member name header — synced horizontally with body */}
        <div ref={headerScrollRef} className="overflow-x-scroll no-scrollbar">
          <div className="px-6">
            <table
              className="border-collapse text-[11px] w-full"
              style={{ tableLayout: "fixed", minWidth: `${colMinWidth}px` }}
            >
              <colgroup>
                <col style={{ width: 160 }} />
                {activeGrid.members.map((m) => (
                  <col key={m.id} style={{ width: 56 }} />
                ))}
              </colgroup>
              <tbody>
                <tr>
                  <td className="sticky left-0 z-10 bg-bg text-left px-2 py-1 font-mono text-[9px] uppercase tracking-[0.06em] text-ink-muted font-normal">
                    Item
                  </td>
                  {activeGrid.members.map((m) => (
                    <td
                      key={m.id}
                      className="px-0.5 py-1 text-center font-medium text-[9px] leading-tight"
                      title={`${m.name} · ${ROLE_ABBR[m.role]}`}
                    >
                      <div className="truncate">{m.name.split(" ")[0]}</div>
                      <div className="font-mono text-[8px] font-normal text-ink-faint">
                        {ROLE_ABBR[m.role]}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Border wrapper — left/right/bottom border continues the tab bar outline */}
      <div className="-mx-6 border-x border-b border-border rounded-b-md overflow-hidden print:mx-0 print:border-0">

      {/* Print-only crew label */}
      <div className="hidden print:block font-mono text-[10px] text-ink-muted mb-2 px-6">
        Crew {activeGrid.crewId} — {activeGrid.members.length} members
      </div>

      {/* Body scroll — horizontal only; page handles vertical scroll */}
      <div
        ref={bodyScrollRef}
        className="overflow-x-auto print:overflow-visible"
        onScroll={syncScroll}
      >
        <div className="px-6 print:px-0">
          <table
            className="border-collapse text-[11px] w-full"
            style={{ tableLayout: "fixed", minWidth: `${colMinWidth}px` }}
          >
            <colgroup>
              <col style={{ width: 160 }} />
              {activeGrid.members.map((m) => (
                <col key={m.id} style={{ width: 56 }} />
              ))}
            </colgroup>

            {/* Print-only header — hidden on screen, shown via .gear-print-header in @media print */}
            <thead className="hidden gear-print-header">
              <tr>
                <th className="text-left px-2 py-1 border-b border-border font-mono text-[9px] uppercase tracking-[0.06em] text-ink-muted font-normal">
                  Item
                </th>
                {activeGrid.members.map((m) => (
                  <th
                    key={m.id}
                    className="px-0.5 py-1 border-b border-border text-center font-medium text-[9px] leading-tight"
                    title={`${m.name} · ${ROLE_ABBR[m.role]}`}
                  >
                    <div className="truncate">{m.name.split(" ")[0]}</div>
                    <div className="font-mono text-[8px] font-normal text-ink-faint">
                      {ROLE_ABBR[m.role]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Base weight row */}
              <tr>
                <td className="sticky left-0 bg-bg z-10 px-2 py-1 border-b border-border font-mono text-[9px] uppercase tracking-[0.06em] text-ink-muted print:static">
                  Base Weight
                </td>
                {activeGrid.members.map((m) => {
                  const colors = m.baseWeightStatus ? STATUS_COLORS[m.baseWeightStatus] : null;
                  const label = m.baseWeightLbs != null ? m.baseWeightLbs.toFixed(1) : "—";
                  const clickable = isAdmin && mode === "pack";
                  return (
                    <td
                      key={m.id}
                      className="border-b border-border text-center px-0.5 py-0 h-[28px]"
                      style={colors ? { backgroundColor: colors.bg, color: colors.text } : undefined}
                    >
                      {clickable ? (
                        <button
                          type="button"
                          onClick={() => {
                            setUseActualBase(m.baseWeightLbs != null);
                            setBaseWeightValue(m.baseWeightLbs ?? 18);
                            setTentToggle(m.usesPhilmontTent);
                            setEditingBaseWeight({ memberId: m.id, memberName: m.name, currentLbs: m.baseWeightLbs });
                          }}
                          className="w-full h-full flex items-center justify-center font-mono text-[10px] font-semibold leading-none"
                          title="Set actual base weight"
                        >
                          {label}
                        </button>
                      ) : (
                        <span className="font-mono text-[10px] font-semibold leading-none">{label}</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Est Max weight row */}
              <tr>
                <td className="sticky left-0 bg-bg z-10 px-2 py-1 border-b border-border font-mono text-[9px] uppercase tracking-[0.06em] text-ink-muted print:static">
                  Est Max Pack Weight
                </td>
                {activeGrid.members.map((m) => {
                  const colors = m.weightStatus ? STATUS_COLORS[m.weightStatus] : null;
                  return (
                    <td
                      key={m.id}
                      className="border-b border-border text-center px-0.5 py-1 h-[28px]"
                      style={colors ? { backgroundColor: colors.bg, color: colors.text } : undefined}
                    >
                      <span className="font-mono text-[10px] font-semibold leading-none">
                        {m.estMaxLbs != null ? m.estMaxLbs.toFixed(1) : "—"}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Category + item rows */}
              {bodyRows.map((entry) => {
                if (entry.type === "category") {
                  return (
                    <tr key={`cat-${entry.category}`}>
                      <td className="sticky left-0 z-10 bg-hcblue text-white px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em] font-semibold print:static">
                        {entry.category}
                      </td>
                      {activeGrid.members.map((m) => (
                        <td key={m.id} className="bg-hcblue" />
                      ))}
                    </tr>
                  );
                }

                const { row } = entry;
                const rk = rowKey(row);

                return (
                  <tr key={rk}>
                    <td
                      className="sticky left-0 z-10 px-2 py-1 border-b border-border text-left leading-snug print:static"
                      style={{ backgroundColor: "var(--color-bg)" }}
                    >
                      <span className="font-medium text-[10px]">{row.itemName}</span>
                      {row.isRequired === false && (
                        <span className="ml-1 font-mono text-[8px] text-ink-faint">(opt)</span>
                      )}
                    </td>
                    {activeGrid.members.map((m) => {
                      const cell = (localCells[activeGrid.crewId] ?? {})[rk]?.[m.id] ?? null;
                      return (
                        <GridCell
                          key={m.id}
                          cell={cell}
                          isAdmin={isAdmin}
                          onEdit={
                            mode === "pack"
                              ? () => togglePacked(activeGrid.crewId, m, row)
                              : () => openEdit(activeGrid.crewId, m, row)
                          }
                        />
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </div>{/* end border wrapper */}

      {/* Admin edit modal */}
      {editingCell && (
        <div
          className="print:hidden fixed inset-0 z-50 flex items-center justify-center bg-ink/40"
          onClick={() => setEditingCell(null)}
        >
          <div
            className="bg-surface rounded-lg shadow-xl border border-border p-5 w-[340px] max-w-[92vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted mb-0.5">
                {editingCell.memberName}
              </div>
              <div className="font-semibold text-[13px] leading-snug">{editingCell.itemName}</div>
            </div>

            <label className="block font-mono text-[10px] uppercase tracking-[0.06em] text-ink-muted mb-1.5">
              Advisor note
            </label>
            <input
              ref={inputRef}
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveNote(noteInput.trim() || null);
              }}
              placeholder="e.g. needs newer sleeping bag"
              className="w-full border border-border rounded-md px-3 py-2 text-[13px] bg-surface focus:outline-none focus:border-border-strong"
            />

            <div className="flex gap-2 mt-4 justify-end">
              <button
                type="button"
                onClick={() => saveNote(null)}
                disabled={saving}
                className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.05em] text-ink-muted border border-border rounded-md hover:bg-surface-2 disabled:opacity-50"
                style={{ borderWidth: "0.5px" }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => saveNote(noteInput.trim() || null)}
                disabled={saving}
                className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.05em] bg-ink text-bg rounded-md hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Base weight edit modal */}
      {editingBaseWeight && (
        <div
          className="print:hidden fixed inset-0 z-50 flex items-center justify-center bg-ink/40"
          onClick={() => setEditingBaseWeight(null)}
        >
          <div
            className="bg-surface rounded-lg shadow-xl border border-border p-5 w-[380px] max-w-[92vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Member name */}
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-muted mb-3">
              {editingBaseWeight.memberName}
            </div>

            {/* Same card UI as PackingListEditor settings drawer */}
            <div className="rounded-lg border border-info-border bg-info-bg p-3 space-y-3" style={{ borderWidth: "0.5px" }}>
              <div>
                <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em]">Base Pack Weight</div>
                <div className="text-[11px] text-ink-muted mt-0.5">Pack weight before Trail Load</div>
              </div>

              {/* Scale weight / From list toggle */}
              <div className="space-y-1.5">
                <div className="relative inline-flex items-center bg-surface border border-border rounded-full p-[2px]" style={{ borderWidth: "0.5px" }}>
                  <span aria-hidden className="pointer-events-none absolute top-[2px] bottom-[2px] rounded-full bg-hcblue transition-all duration-200"
                    style={{ left: useActualBase ? "2px" : "50%", right: useActualBase ? "50%" : "2px" }} />
                  <button type="button" onClick={() => setUseActualBase(true)}
                    className={`relative z-10 px-10 py-1 rounded-full font-mono text-[11px] font-medium whitespace-nowrap transition-colors ${useActualBase ? "text-white" : "text-ink-muted"}`}>
                    Scale weight
                  </button>
                  <button type="button" onClick={() => setUseActualBase(false)}
                    className={`relative z-10 px-10 py-1 rounded-full font-mono text-[11px] font-medium whitespace-nowrap transition-colors ${!useActualBase ? "text-white" : "text-ink-muted"}`}>
                    From list
                  </button>
                </div>
                <p className="font-mono text-ink-muted text-[11px]">
                  {useActualBase ? "Using the pack weight I entered." : "Using item weights from gear list."}
                </p>
              </div>

              {/* Slider + number input */}
              <div className={useActualBase ? "" : "opacity-40"}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em]">Scale weight</span>
                  <span className="font-mono text-[10px] text-ink-faint">Base Pack Weight</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min={5} max={50} step={0.5}
                    value={baseWeightValue}
                    disabled={!useActualBase}
                    onChange={(e) => setBaseWeightValue(Number(e.target.value))}
                    className="flex-1 accent-ink disabled:cursor-not-allowed"
                  />
                  <input
                    ref={baseWeightInputRef}
                    type="number" min={0} max={100} step={0.5}
                    value={baseWeightValue}
                    disabled={!useActualBase}
                    onChange={(e) => setBaseWeightValue(Number(e.target.value))}
                    className="w-20 font-mono text-[13px] bg-surface border border-border rounded px-2 py-1 text-right disabled:cursor-not-allowed"
                  />
                  <span className="font-mono text-[11px] text-ink-muted shrink-0">lbs</span>
                </div>
              </div>

              {/* Tent toggle — same as PackingListEditor */}
              {useActualBase ? (
                <div className="border-t border-border pt-3 space-y-2" style={{ borderWidth: "0.0px" }}>
                  <div className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.08em]">Shelter</div>
                  <div className="space-y-1.5">
                    <div className="relative inline-flex items-center bg-surface border border-border rounded-full p-[2px]" style={{ borderWidth: "0.5px" }}>
                      <span aria-hidden className="pointer-events-none absolute top-[2px] bottom-[2px] rounded-full bg-hcblue transition-all duration-200"
                        style={{ left: tentToggle ? "2px" : "50%", right: tentToggle ? "50%" : "2px" }} />
                      <button type="button" onClick={() => setTentToggle(true)}
                        className={`relative z-10 px-10 py-1 rounded-full font-mono text-[11px] font-medium whitespace-nowrap transition-colors ${tentToggle ? "text-white" : "text-ink-muted"}`}>
                        Philmont tent
                      </button>
                      <button type="button" onClick={() => setTentToggle(false)}
                        className={`relative z-10 px-10 py-1 rounded-full font-mono text-[11px] font-medium whitespace-nowrap transition-colors ${!tentToggle ? "text-white" : "text-ink-muted"}`}>
                        My tent
                      </button>
                    </div>
                    <p className="font-mono text-ink-muted text-[11px]">
                      {tentToggle
                        ? `Philmont tent added to Trail Load: ${(PHILMONT_TENT_OZ / 16).toFixed(1)} lbs.`
                        : "Tent weight included in Base Pack Weight."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md bg-surface-2 px-3 py-2 text-[11px] text-ink-muted leading-snug">
                  Base Pack Weight comes from your gear list. Tent weight comes from your gear list too.
                </div>
              )}
            </div>

            {/* Save / Cancel */}
            <div className="flex gap-2 mt-4 justify-end">
              <button
                type="button"
                onClick={() => setEditingBaseWeight(null)}
                className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.05em] text-ink-muted border border-border rounded-md hover:bg-surface-2"
                style={{ borderWidth: "0.5px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveBaseWeightSettings(useActualBase ? baseWeightValue : null)}
                disabled={saving}
                className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.05em] bg-ink text-bg rounded-md hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GridCell({
  cell,
  isAdmin,
  onEdit,
}: {
  cell: CellData | null;
  isAdmin: boolean;
  onEdit: () => void;
}) {
  const baseClass = "border-b border-border text-center align-middle px-0.5 py-0.5 h-[28px]";

  if (cell === null) {
    return (
      <td className={`${baseClass} bg-surface`}>
        <span className="font-mono text-[9px] text-ink-faint italic">?</span>
      </td>
    );
  }

  if (cell.isNotPacking) {
    const inner = <span className="font-mono text-[18px] text-ink-faint leading-none">⊘</span>;
    return (
      <td className={`${baseClass} bg-surface-2`}>
        {isAdmin ? (
          <button
            type="button"
            onClick={onEdit}
            className="w-full h-full flex items-center justify-center"
            title="Set advisor note"
          >
            {inner}
          </button>
        ) : inner}
      </td>
    );
  }

  if (cell.advisorNote) {
    const inner = (
      <div className="flex flex-col items-center justify-center gap-0.5 px-0.5">
        <span className="font-mono text-[11px] leading-none text-warn-text">⚑</span>
        <span className="font-mono text-[7px] text-warn-text leading-tight line-clamp-1 text-center w-full">
          {cell.advisorNote}
        </span>
      </div>
    );
    return (
      <td className={`${baseClass} bg-warn-bg`}>
        {isAdmin ? (
          <button
            type="button"
            onClick={onEdit}
            className="w-full h-full flex items-center justify-center"
            title={cell.advisorNote}
          >
            {inner}
          </button>
        ) : (
          <div className="flex items-center justify-center h-full" title={cell.advisorNote}>
            {inner}
          </div>
        )}
      </td>
    );
  }

  if (cell.isPacked) {
    const inner = (
      <span className="font-mono text-[13px] font-semibold text-ok-text leading-none">✓</span>
    );
    return (
      <td className={`${baseClass} bg-ok-bg`}>
        {isAdmin ? (
          <button
            type="button"
            onClick={onEdit}
            className="w-full h-full flex items-center justify-center"
            title="Set advisor note"
          >
            {inner}
          </button>
        ) : inner}
      </td>
    );
  }

  const inner = <span className="font-mono text-[12px] text-ink-faint leading-none">□</span>;
  return (
    <td className={baseClass} style={{ backgroundColor: "#fde8e8" }}>
      {isAdmin ? (
        <button
          type="button"
          onClick={onEdit}
          className="w-full h-full flex items-center justify-center"
          title="Set advisor note"
        >
          {inner}
        </button>
      ) : inner}
    </td>
  );
}

type BodyEntry =
  | { type: "category"; category: string }
  | { type: "row"; row: GridRow };

function buildBodyRows(grid: CrewGrid): BodyEntry[] {
  const entries: BodyEntry[] = [];
  let lastCategory = "";
  for (const row of grid.rows) {
    if (row.category !== lastCategory) {
      entries.push({ type: "category", category: row.category });
      lastCategory = row.category;
    }
    entries.push({ type: "row", row });
  }
  return entries;
}
