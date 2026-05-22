"use client";

import React, { type ReactNode, useState, useTransition, useRef, useEffect } from "react";
import type { CrewGearItem } from "@/lib/crew-gear";
import {
  toggleCrewGearChecked,
  toggleCrewGearNotTaking,
  updateCrewGearItemNotes,
  updateCrewGearItem,
  addCustomCrewGearItem,
  deleteCustomCrewGearItem,
} from "./actions";

type ViewMode = "check" | "flag";
type EditMode = "view" | "edit"; // edit is admin-only

export function CrewGearChecklist({
  crew1Items: initialCrew1,
  crew2Items: initialCrew2,
  isAdmin,
  canCheckCrew1,
  canCheckCrew2,
  myCrewId,
  aboveHeader,
}: {
  crew1Items: CrewGearItem[];
  crew2Items: CrewGearItem[];
  isAdmin: boolean;
  canCheckCrew1: boolean;
  canCheckCrew2: boolean;
  myCrewId: number | undefined;
  aboveHeader?: ReactNode;
}) {
  const [activeCrew, setActiveCrew] = useState<1 | 2>(
    myCrewId === 2 ? 2 : 1
  );
  const [viewMode, setViewMode] = useState<ViewMode>("check");
  const [editMode, setEditMode] = useState<EditMode>("view");
  const [hidePacked, setHidePacked] = useState(false);
  const [hideNotTaking, setHideNotTaking] = useState(false);
  const [showFlagged, setShowFlagged] = useState(false);

  // Local optimistic state — mirrors server data, updated immediately on action
  const [crew1Items, setCrew1Items] = useState<CrewGearItem[]>(initialCrew1);
  const [crew2Items, setCrew2Items] = useState<CrewGearItem[]>(initialCrew2);
  const [, startTransition] = useTransition();

  // Which item's note editor is open in flag mode
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const activeItems = activeCrew === 1 ? crew1Items : crew2Items;
  const setActiveItems = activeCrew === 1 ? setCrew1Items : setCrew2Items;
  const canCheck = activeCrew === 1 ? canCheckCrew1 : canCheckCrew2;

  function updateItem(id: string, patch: Partial<CrewGearItem>) {
    setActiveItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function filterItems(items: CrewGearItem[]): CrewGearItem[] {
    return items.filter((item) => {
      if (hidePacked && item.isChecked) return false;
      if (hideNotTaking && item.isNotTaking) return false;
      if (showFlagged && !item.notes) return false;
      return true;
    });
  }

  const philmontItems = filterItems(
    activeItems.filter((i) => i.supplier === "Philmont Issued")
  );
  const troopItems = filterItems(
    activeItems.filter((i) => i.supplier === "Troop Supplied")
  );

  const philmontAll = activeItems.filter((i) => i.supplier === "Philmont Issued");
  const troopAll = activeItems.filter((i) => i.supplier === "Troop Supplied");
  const philmontChecked = philmontAll.filter((i) => i.isChecked).length;
  const troopChecked = troopAll.filter((i) => i.isChecked).length;

  function handleCheck(item: CrewGearItem) {
    if (!canCheck || item.isNotTaking) return;
    const next = !item.isChecked;
    updateItem(item.id, { isChecked: next });
    startTransition(() => {
      toggleCrewGearChecked(item.id, next).catch(() =>
        updateItem(item.id, { isChecked: item.isChecked })
      );
    });
  }

  function handleNotTaking(item: CrewGearItem) {
    if (!isAdmin) return;
    const next = !item.isNotTaking;
    updateItem(item.id, { isNotTaking: next, isChecked: next ? false : item.isChecked });
    startTransition(() => {
      toggleCrewGearNotTaking(item.id, next).catch(() =>
        updateItem(item.id, { isNotTaking: item.isNotTaking, isChecked: item.isChecked })
      );
    });
  }

  function openNote(item: CrewGearItem) {
    setOpenNoteId(item.id);
    setNoteText(item.notes ?? "");
  }

  function saveNote(item: CrewGearItem) {
    const trimmed = noteText.trim() || null;
    updateItem(item.id, { notes: trimmed });
    setOpenNoteId(null);
    startTransition(() => {
      updateCrewGearItemNotes(item.id, trimmed).catch(() =>
        updateItem(item.id, { notes: item.notes })
      );
    });
  }

  function clearNote(item: CrewGearItem) {
    updateItem(item.id, { notes: null });
    setOpenNoteId(null);
    startTransition(() => {
      updateCrewGearItemNotes(item.id, null).catch(() =>
        updateItem(item.id, { notes: item.notes })
      );
    });
  }

  function handleAddItem(supplier: "Philmont Issued" | "Troop Supplied") {
    startTransition(async () => {
      await addCustomCrewGearItem(activeCrew, supplier);
    });
  }

  function handleDeleteItem(item: CrewGearItem) {
    setActiveItems((prev) => prev.filter((i) => i.id !== item.id));
    startTransition(() => {
      deleteCustomCrewGearItem(item.id).catch(() =>
        setActiveItems((prev) => [...prev, item])
      );
    });
  }

  function handleFieldUpdate(
    item: CrewGearItem,
    field: "name" | "qty" | "weight_oz",
    value: string
  ) {
    const parsed =
      field === "name" ? value : field === "qty" ? parseInt(value, 10) || 0 : parseFloat(value) || 0;
    updateItem(item.id, { [field === "weight_oz" ? "weightOz" : field]: parsed });
    startTransition(() => {
      updateCrewGearItem(item.id, { [field]: parsed }).catch(() =>
        updateItem(item.id, {})
      );
    });
  }

  const PILL =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors";
  const PILL_ON =
    "bg-ink text-bg";
  const PILL_OFF =
    "bg-surface-2 text-ink-muted hover:bg-surface-3";

  return (
    <div>
      {aboveHeader}

      {/* ── Sticky controls: tabs + mode toggle + filters (hidden in print) ── */}
      <div className="sticky top-0 z-20 -mx-6 px-6 bg-bg pt-3 print:hidden">

        {/* Row 1: Crew tabs (browser-tab style) */}
        <div className="flex gap-1.5 items-end -mb-px">
          {([1, 2] as const).map((crew) => (
            <button
              key={crew}
              onClick={() => { setActiveCrew(crew); setOpenNoteId(null); }}
              className={`px-4 py-1.5 rounded-t-md font-mono text-[12px] font-medium transition-colors border ${
                activeCrew === crew
                  ? "relative z-10 border-border border-b-bg bg-bg text-ink font-semibold"
                  : "border-border bg-surface-2 text-ink-muted hover:text-ink"
              }`}
            >
              Crew {crew}
            </button>
          ))}
        </div>

        {/* Separator + Row 2: mode toggle + edit button */}
        <div className="border-t border-border">
          <div className="flex items-center justify-between py-1.5">
            {/* Sliding pill toggle */}
            <div
              className="relative inline-flex items-center bg-surface border border-border rounded-full p-[2px]"
              style={{ borderWidth: "0.5px" }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute top-[2px] bottom-[2px] rounded-full bg-hcblue transition-all duration-200"
                style={{
                  left: viewMode === "check" ? "2px" : "50%",
                  right: viewMode === "check" ? "50%" : "2px",
                }}
              />
              <button
                onClick={() => { setViewMode("check"); setOpenNoteId(null); }}
                className={`relative z-10 px-3 py-1 rounded-full font-mono text-[11px] font-medium whitespace-nowrap transition-colors ${
                  viewMode === "check" ? "text-white" : "text-ink-muted"
                }`}
              >
                ✓ Check
              </button>
              <button
                onClick={() => { setViewMode("flag"); setEditMode("view"); }}
                className={`relative z-10 px-3 py-1 rounded-full font-mono text-[11px] font-medium whitespace-nowrap transition-colors ${
                  viewMode === "flag" ? "text-white" : "text-ink-muted"
                }`}
              >
                ⚑ Flag
              </button>
            </div>

            {/* Admin-only edit toggle */}
            {isAdmin && viewMode === "check" && (
              <button
                onClick={() => setEditMode((m) => (m === "edit" ? "view" : "edit"))}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-mono font-medium uppercase tracking-[0.05em] border transition-colors ${
                  editMode === "edit"
                    ? "bg-ink text-bg border-ink"
                    : "bg-surface-2 text-ink-muted border-border hover:text-ink"
                }`}
                style={{ borderWidth: "0.5px" }}
              >
                {editMode === "edit" ? "Done" : "Edit Gear"}
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Filter pills */}
        <div className="flex flex-wrap gap-1.5 pb-3">
          <button
            onClick={() => setHidePacked((v) => !v)}
            className={`${PILL} ${hidePacked ? PILL_ON : PILL_OFF}`}
          >
            {hidePacked ? "Showing all" : "Hide Packed"}
            {!hidePacked && activeItems.filter((i) => i.isChecked).length > 0 && (
              <span className="ml-0.5 opacity-60">({activeItems.filter((i) => i.isChecked).length})</span>
            )}
          </button>
          <button
            onClick={() => setHideNotTaking((v) => !v)}
            className={`${PILL} ${hideNotTaking ? PILL_ON : PILL_OFF}`}
          >
            {hideNotTaking ? "Showing all" : "Hide Not Taking"}
            {!hideNotTaking && activeItems.filter((i) => i.isNotTaking).length > 0 && (
              <span className="ml-0.5 opacity-60">({activeItems.filter((i) => i.isNotTaking).length})</span>
            )}
          </button>
          <button
            onClick={() => setShowFlagged((v) => !v)}
            className={`${PILL} ${showFlagged ? PILL_ON : PILL_OFF}`}
          >
            Show Flagged
            {activeItems.filter((i) => i.notes).length > 0 && (
              <span className="ml-0.5 opacity-60">({activeItems.filter((i) => i.notes).length})</span>
            )}
          </button>
        </div>

      </div>

      {/* Screen: active crew sections */}
      <div className="print:hidden">
        <GearSection
          label="Troop Supplied"
          items={troopItems}
          allItems={troopAll}
          checkedCount={troopChecked}
          viewMode={viewMode}
          editMode={editMode}
          isAdmin={isAdmin}
          canCheck={canCheck}
          openNoteId={openNoteId}
          noteText={noteText}
          onNoteTextChange={setNoteText}
          onCheck={handleCheck}
          onOpenNote={openNote}
          onSaveNote={saveNote}
          onClearNote={clearNote}
          onAddItem={() => handleAddItem("Troop Supplied")}
          onDeleteItem={handleDeleteItem}
          onFieldUpdate={handleFieldUpdate}
        />
        <GearSection
          label="Philmont Issued"
          items={philmontItems}
          allItems={philmontAll}
          checkedCount={philmontChecked}
          viewMode={viewMode}
          editMode={editMode}
          isAdmin={isAdmin}
          canCheck={canCheck}
          openNoteId={openNoteId}
          noteText={noteText}
          onNoteTextChange={setNoteText}
          onCheck={handleCheck}
          onOpenNote={openNote}
          onSaveNote={saveNote}
          onClearNote={clearNote}
          onAddItem={() => handleAddItem("Philmont Issued")}
          onDeleteItem={handleDeleteItem}
          onFieldUpdate={handleFieldUpdate}
        />
      </div>

      {/* Print: both crews, all items, no filters */}
      <div className="hidden print:block">
        {([{ id: 1, items: crew1Items }, { id: 2, items: crew2Items }] as const).map(({ id, items }, idx) => (
          <div key={id} style={{ breakBefore: idx > 0 ? "page" : "auto" }}>
            {/* Per-crew page header */}
            <div className="flex items-end justify-between mb-4 pb-2 border-b-2 border-ink">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-muted mb-0.5">
                  Philmont 2026 · My Crew
                </p>
                <h1 className="text-[22px] font-semibold tracking-[-0.02em] leading-tight">
                  Crew {id} — Gear List
                </h1>
              </div>
              <p className="font-mono text-[10px] text-ink-muted pb-0.5">
                {items.filter((i) => i.isChecked).length} of {items.length} items checked
              </p>
            </div>
            <div className="mb-8">
            {(["Troop Supplied", "Philmont Issued"] as const).map((supplier) => {
              const sectionItems = items.filter((i) => i.supplier === supplier);
              if (sectionItems.length === 0) return null;
              const totalWeight = sectionItems.reduce((s, i) => s + i.weightOz * i.qty, 0);
              const lbs = Math.floor(totalWeight / 16);
              const oz = Math.round(totalWeight % 16);
              return (
                <div key={supplier} className="mb-4">
                  <div className="flex items-center justify-between px-3 py-1" style={{ backgroundColor: "#1e4d6b" }}>
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-white font-medium">{supplier}</span>
                    <span className="font-mono text-[9px] text-white/60">{lbs > 0 ? `${lbs} lb ` : ""}{oz} oz</span>
                  </div>
                  <div className="border border-t-0 rounded-b-sm overflow-hidden" style={{ borderColor: "#1e4d6b" }}>
                    {sectionItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-2.5 px-3 py-1.5 text-[11px] ${idx < sectionItems.length - 1 ? "border-b border-border" : ""} ${item.isNotTaking ? "opacity-40" : ""}`}
                      >
                        <div className="mt-0.5 w-3.5 h-3.5 border border-ink rounded-sm shrink-0 flex items-center justify-center">
                          {item.isChecked && (
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{item.name}</span>
                          {item.isNotTaking && (
                            <span className="ml-2 text-[8px] font-mono uppercase tracking-[0.05em] text-ink-faint">not taking</span>
                          )}
                          {item.description && (
                            <div className="text-[9px] text-ink-faint leading-snug mt-0.5">{item.description}</div>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-ink-faint shrink-0">
                          {item.qty > 1 ? `${item.qty} × ${item.weightOz} oz` : `${item.weightOz} oz`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function GearSection({
  label,
  items,
  allItems,
  checkedCount,
  viewMode,
  editMode,
  isAdmin,
  canCheck,
  openNoteId,
  noteText,
  onNoteTextChange,
  onCheck,
  onOpenNote,
  onSaveNote,
  onClearNote,
  onAddItem,
  onDeleteItem,
  onFieldUpdate,
}: {
  label: string;
  items: CrewGearItem[];
  allItems: CrewGearItem[];
  checkedCount: number;
  viewMode: ViewMode;
  editMode: EditMode;
  isAdmin: boolean;
  canCheck: boolean;
  openNoteId: string | null;
  noteText: string;
  onNoteTextChange: (v: string) => void;
  onCheck: (item: CrewGearItem) => void;
  onOpenNote: (item: CrewGearItem) => void;
  onSaveNote: (item: CrewGearItem) => void;
  onClearNote: (item: CrewGearItem) => void;
  onAddItem: () => void;
  onDeleteItem: (item: CrewGearItem) => void;
  onFieldUpdate: (item: CrewGearItem, field: "name" | "qty" | "weight_oz", value: string) => void;
}) {
  const totalWeight = allItems.reduce((sum, i) => sum + i.weightOz * i.qty, 0);
  const lbs = Math.floor(totalWeight / 16);
  const oz = Math.round(totalWeight % 16);

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-t-md" style={{ backgroundColor: "#1e4d6b" }}>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-white font-medium">
          {label}
        </span>
        <span className="font-mono text-[10px] text-white/60">
          {checkedCount}/{allItems.length} checked · {lbs > 0 ? `${lbs} lb ` : ""}{oz} oz total
        </span>
      </div>

      <div
        className="bg-surface border border-border rounded-md overflow-hidden"
        style={{ borderWidth: "0.5px", borderColor: "#1e4d6b" }}
      >
        {items.length === 0 ? (
          <div className="px-3 py-4 text-[11px] text-ink-faint text-center">
            No items match the current filters.
          </div>
        ) : (
          <ul className="divide-y divide-border" style={{ borderWidth: "0.5px" }}>
            {items.map((item) => (
              <GearItemRow
                key={item.id}
                item={item}
                viewMode={viewMode}
                editMode={editMode}
                isAdmin={isAdmin}
                canCheck={canCheck}
                isNoteOpen={openNoteId === item.id}
                noteText={noteText}
                onNoteTextChange={onNoteTextChange}
                onCheck={() => onCheck(item)}
                onOpenNote={() => onOpenNote(item)}
                onSaveNote={() => onSaveNote(item)}
                onClearNote={() => onClearNote(item)}
                onDelete={() => onDeleteItem(item)}
                onFieldUpdate={(field, value) => onFieldUpdate(item, field, value)}
              />
            ))}
          </ul>
        )}

        {/* Add item (edit mode, admin only) */}
        {isAdmin && editMode === "edit" && viewMode === "check" && (
          <div className="px-3 py-2 border-t border-border bg-surface-2" style={{ borderTopWidth: "0.5px" }}>
            <button
              onClick={onAddItem}
              className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-ink-muted hover:text-ink transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

function GearItemRow({
  item,
  viewMode,
  editMode,
  isAdmin,
  canCheck,
  isNoteOpen,
  noteText,
  onNoteTextChange,
  onCheck,
  onOpenNote,
  onSaveNote,
  onClearNote,
  onDelete,
  onFieldUpdate,
}: {
  item: CrewGearItem;
  viewMode: ViewMode;
  editMode: EditMode;
  isAdmin: boolean;
  canCheck: boolean;
  isNoteOpen: boolean;
  noteText: string;
  onNoteTextChange: (v: string) => void;
  onCheck: () => void;
  onOpenNote: () => void;
  onSaveNote: () => void;
  onClearNote: () => void;
  onDelete: () => void;
  onFieldUpdate: (field: "name" | "qty" | "weight_oz", value: string) => void;
}) {
  const nameRef = useRef<HTMLInputElement>(null);
  const isEditing = editMode === "edit" && isAdmin && viewMode === "check";
  const dimmed = item.isNotTaking;
  const weightDisplay = item.qty > 1
    ? `${item.qty} × ${item.weightOz} oz`
    : `${item.weightOz} oz`;

  const rowClass = `flex items-start gap-2 px-3 py-2 text-[12px] transition-colors ${
    dimmed ? "opacity-40" : ""
  } ${viewMode === "flag" && !isNoteOpen ? "cursor-pointer hover:bg-surface-2 active:bg-surface-3" : ""}`;

  function handleRowClick() {
    if (viewMode !== "flag") return;
    if (isNoteOpen) return;
    onOpenNote();
  }

  if (isEditing) {
    return (
      <li className="px-3 py-2">
        <div className="flex items-center gap-2">
          {/* Name field */}
          <input
            ref={nameRef}
            defaultValue={item.name}
            onBlur={(e) => onFieldUpdate("name", e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-[12px] text-ink border-b border-border focus:outline-none focus:border-ink"
            placeholder="Item name"
          />
          {/* Qty */}
          <input
            type="number"
            defaultValue={item.qty}
            min={1}
            onBlur={(e) => onFieldUpdate("qty", e.target.value)}
            className="w-10 bg-transparent text-[11px] font-mono text-center border-b border-border focus:outline-none focus:border-ink"
          />
          {/* Weight */}
          <input
            type="number"
            defaultValue={item.weightOz}
            min={0}
            step={0.1}
            onBlur={(e) => onFieldUpdate("weight_oz", e.target.value)}
            className="w-12 bg-transparent text-[11px] font-mono text-right border-b border-border focus:outline-none focus:border-ink"
          />
          <span className="text-[10px] text-ink-faint font-mono">oz</span>

          {/* Delete (custom items only) */}
          {!item.isCore && (
            <button
              onClick={onDelete}
              title="Delete item"
              className="shrink-0 text-ink-faint hover:text-danger-text transition-colors"
              aria-label="Delete item"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          )}
        </div>
      </li>
    );
  }

  return (
    <li>
      <div className={rowClass} onClick={handleRowClick} role={viewMode === "flag" ? "button" : undefined}>
        {/* Checkbox (check mode only) */}
        {viewMode === "check" && (
          <button
            onClick={(e) => { e.stopPropagation(); onCheck(); }}
            disabled={!canCheck || item.isNotTaking}
            className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              item.isChecked
                ? "bg-ok-text border-ok-text text-bg"
                : "border-border bg-surface hover:border-ink-muted"
            } ${(!canCheck || item.isNotTaking) ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            aria-label={item.isChecked ? "Uncheck item" : "Check item"}
            aria-pressed={item.isChecked}
          >
            {item.isChecked && (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        )}

        {/* Flag indicator (flag mode) */}
        {viewMode === "flag" && (
          <span className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center ${
            item.notes ? "bg-warn-bg border-warn-border text-warn-text" : "border-border bg-surface"
          }`}>
            {item.notes && (
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
                <circle cx="12" cy="12" r="8" />
              </svg>
            )}
          </span>
        )}

        {/* Name + description + note pill */}
        <div className="flex-1 min-w-0">
          <div>
            <span
              className={`font-medium leading-snug ${
                item.isChecked && viewMode === "check" ? "line-through text-ink-muted" : "text-ink"
              }`}
            >
              {item.name}
            </span>
            {item.isNotTaking && (
              <span className="ml-2 text-[9px] font-mono font-medium uppercase tracking-[0.05em] text-ink-faint">
                not taking
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-[10px] text-ink-faint leading-snug mt-0.5">{item.description}</p>
          )}
          {item.notes && (
            <div className="mt-0.5 inline-block">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-warn-bg text-warn-text border border-warn-border" style={{ borderWidth: "0.5px" }}>
                {item.notes}
              </span>
            </div>
          )}
        </div>

        {/* Right side: qty·weight */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[10px] text-ink-faint">{weightDisplay}</span>
        </div>
      </div>

      {/* Inline note editor (flag mode) */}
      {viewMode === "flag" && isNoteOpen && (
        <div
          className="px-3 pb-2 pt-1 border-t border-border bg-warn-bg"
          style={{ borderTopWidth: "0.5px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            value={noteText}
            onChange={(e) => onNoteTextChange(e.target.value)}
            disabled={!isAdmin}
            placeholder={isAdmin ? "Add a flag note…" : "No note"}
            rows={2}
            autoFocus
            className="w-full text-[11px] bg-transparent text-ink resize-none focus:outline-none placeholder:text-ink-faint disabled:opacity-60"
          />
          {isAdmin && (
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={onSaveNote}
                className="text-[10px] font-mono font-medium px-2 py-0.5 bg-ink text-bg rounded transition-opacity hover:opacity-80"
              >
                Save
              </button>
              <button
                onClick={onClearNote}
                className="text-[10px] font-mono font-medium px-2 py-0.5 text-ink-muted hover:text-danger-text transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
