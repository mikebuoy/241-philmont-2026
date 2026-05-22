"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CrewCoreGearItem } from "@/lib/crew-gear";
import {
  addCoreCrewGearItem,
  updateCoreCrewGearItem,
  deleteCoreCrewGearItem,
  reorderCoreCrewGear,
  syncAllCrewsAction,
} from "./actions";

type Supplier = "Philmont Issued" | "Troop Supplied";

export function CrewGearEditor({ items: initialItems }: { items: CrewCoreGearItem[] }) {
  const [items, setItems] = useState<CrewCoreGearItem[]>(initialItems);
  const [syncResult, setSyncResult] = useState<{ crewsProcessed: number; itemsAdded: number } | null>(null);
  const [, startTransition] = useTransition();

  const philmontItems = items.filter((i) => i.supplier === "Philmont Issued");
  const troopItems = items.filter((i) => i.supplier === "Troop Supplied");

  function updateLocal(id: string, patch: Partial<CrewCoreGearItem>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function handleAdd(supplier: Supplier) {
    startTransition(async () => {
      const newItem = await addCoreCrewGearItem({ name: "New item", supplier, qty: 1, weight_oz: 0, description: "" });
      setItems((prev) => [...prev, newItem]);
    });
  }

  function handleUpdate(id: string, field: Parameters<typeof updateCoreCrewGearItem>[1], value: string | number | boolean) {
    // Map field to local state key
    const localKey =
      field === "weight_oz" ? "weightOz" :
      field === "default_is_not_taking" ? "defaultIsNotTaking" :
      field;
    updateLocal(id, { [localKey]: value } as Partial<CrewCoreGearItem>);
    startTransition(() => { updateCoreCrewGearItem(id, field, value); });
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    startTransition(() => { deleteCoreCrewGearItem(id); });
  }

  function handleReorder(supplier: Supplier, newOrder: CrewCoreGearItem[]) {
    setItems((prev) => {
      const other = prev.filter((i) => i.supplier !== supplier);
      return [...other, ...newOrder];
    });
    startTransition(() => { reorderCoreCrewGear(newOrder.map((i) => i.id)); });
  }

  async function handleSync() {
    setSyncResult(null);
    startTransition(async () => {
      const result = await syncAllCrewsAction();
      setSyncResult(result);
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] text-ink-muted">
          Drag rows to reorder. Toggle <strong>Not Taking</strong> to mark items crews should skip by default — cascades to all crew checklists. Use <strong>Sync All Crews</strong> to push new items.
        </p>
        <button
          onClick={handleSync}
          className="ml-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink text-bg rounded-md text-[11px] font-medium font-mono uppercase tracking-[0.05em] hover:opacity-90 active:scale-95 transition-all whitespace-nowrap shrink-0"
        >
          Sync All Crews
        </button>
      </div>

      {syncResult && (
        <div className="mb-4 px-3 py-2 rounded-md bg-ok-bg text-ok-text border border-ok-border text-[11px] font-mono" style={{ borderWidth: "0.5px" }}>
          Synced {syncResult.crewsProcessed} crews · {syncResult.itemsAdded} new items added
        </div>
      )}

      <SupplierSection
        label="Troop Supplied"
        items={troopItems}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onAdd={() => handleAdd("Troop Supplied")}
        onReorder={(order) => handleReorder("Troop Supplied", order)}
      />

      <SupplierSection
        label="Philmont Issued"
        items={philmontItems}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onAdd={() => handleAdd("Philmont Issued")}
        onReorder={(order) => handleReorder("Philmont Issued", order)}
      />
    </div>
  );
}

// ─── Section with sortable context ───────────────────────────────────────────

function SupplierSection({
  label,
  items,
  onUpdate,
  onDelete,
  onAdd,
  onReorder,
}: {
  label: string;
  items: CrewCoreGearItem[];
  onUpdate: (id: string, field: Parameters<typeof updateCoreCrewGearItem>[1], value: string | number | boolean) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onReorder: (order: CrewCoreGearItem[]) => void;
}) {
  // Local order state for drag-and-drop (parent manages data; this manages display order)
  const [orderedIds, setOrderedIds] = useState<string[]>(() => items.map((i) => i.id));

  // Sync orderedIds when the item set changes (add/delete from parent)
  const itemIds = items.map((i) => i.id).join(",");
  const localIds = orderedIds.join(",");
  if (itemIds !== localIds) {
    setOrderedIds(items.map((i) => i.id));
  }

  const orderedItems = orderedIds
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean) as CrewCoreGearItem[];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = orderedItems.findIndex((i) => i.id === active.id);
    const newIdx = orderedItems.findIndex((i) => i.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(orderedItems, oldIdx, newIdx);
    setOrderedIds(reordered.map((i) => i.id));
    onReorder(reordered);
  }

  const totalWeight = orderedItems.reduce((sum, i) => sum + i.weightOz * i.qty, 0);
  const lbs = Math.floor(totalWeight / 16);
  const oz = Math.round(totalWeight % 16);
  const notTakingCount = orderedItems.filter((i) => i.defaultIsNotTaking).length;

  return (
    <div className="mb-8">
      <div
        className="bg-surface border rounded-md overflow-hidden overflow-x-auto"
        style={{ borderWidth: "0.5px", borderColor: "#1e4d6b" }}
      >
        {/* Section header */}
        <div className="flex items-center justify-between px-3 py-1.5" style={{ backgroundColor: "#1e4d6b" }}>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-white font-medium">
            {label}
          </span>
          <span className="font-mono text-[10px] text-white/60">
            {orderedItems.length} items ·{" "}
            {lbs > 0 ? `${lbs} lb ` : ""}{oz} oz total
            {notTakingCount > 0 && ` · ${notTakingCount} not taking`}
          </span>
        </div>

        {/* Column headers */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-2 border-b border-border text-[10px] font-mono font-medium uppercase tracking-[0.04em] text-ink-muted" style={{ borderBottomWidth: "0.5px", minWidth: 640 }}>
          <span className="w-5 shrink-0" /> {/* drag handle */}
          <span className="flex-1 min-w-[160px]">Name</span>
          <span className="w-10 text-center shrink-0">Qty</span>
          <span className="w-14 text-right shrink-0">Wt (oz)</span>
          <span className="w-20 text-center shrink-0">Not Taking</span>
          <span className="flex-1 min-w-[140px]">Description</span>
          <span className="w-8 shrink-0" /> {/* delete */}
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderedItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ul>
              {orderedItems.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        {/* Add item */}
        <div className="px-3 py-2 border-t border-border bg-surface-2" style={{ borderTopWidth: "0.5px" }}>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-ink-muted hover:text-ink transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add item
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sortable row ─────────────────────────────────────────────────────────────

function SortableRow({
  item,
  onUpdate,
  onDelete,
}: {
  item: CrewCoreGearItem;
  onUpdate: (id: string, field: Parameters<typeof updateCoreCrewGearItem>[1], value: string | number | boolean) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={{ ...style, minWidth: 640, borderBottomWidth: "0.5px" }}
      className="flex items-center gap-2 px-3 py-1.5 border-b border-border last:border-0 hover:bg-surface-2 transition-colors text-[11px]"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="w-5 shrink-0 flex items-center justify-center text-ink-faint hover:text-ink cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
        tabIndex={-1}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="9" cy="5" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="5" r="1" fill="currentColor" stroke="none" />
          <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="9" cy="19" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="19" r="1" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {/* Name */}
      <input
        defaultValue={item.name}
        onBlur={(e) => {
          const v = e.target.value.trim();
          if (v && v !== item.name) onUpdate(item.id, "name", v);
        }}
        className="flex-1 min-w-[160px] bg-transparent focus:outline-none focus:underline text-ink"
        placeholder="Item name"
      />

      {/* Qty */}
      <input
        type="number"
        defaultValue={item.qty}
        min={1}
        onBlur={(e) => {
          const v = parseInt(e.target.value, 10) || 1;
          if (v !== item.qty) onUpdate(item.id, "qty", v);
        }}
        className="w-10 bg-transparent text-center font-mono focus:outline-none focus:underline text-ink shrink-0"
      />

      {/* Weight */}
      <input
        type="number"
        defaultValue={item.weightOz}
        min={0}
        step={0.1}
        onBlur={(e) => {
          const v = parseFloat(e.target.value) || 0;
          if (v !== item.weightOz) onUpdate(item.id, "weight_oz", v);
        }}
        className="w-14 bg-transparent text-right font-mono focus:outline-none focus:underline text-ink shrink-0"
      />

      {/* Not Taking toggle */}
      <div className="w-20 flex items-center justify-center shrink-0">
        <button
          onClick={() => onUpdate(item.id, "default_is_not_taking", !item.defaultIsNotTaking)}
          title={item.defaultIsNotTaking ? "Remove 'Not Taking' default" : "Set as 'Not Taking' default"}
          className={`px-2 py-0.5 rounded text-[9px] font-mono font-medium border transition-colors ${
            item.defaultIsNotTaking
              ? "bg-danger-bg text-danger-text border-danger-border"
              : "bg-surface-2 text-ink-faint border-border hover:text-ink hover:border-ink-muted"
          }`}
          style={{ borderWidth: "0.5px" }}
        >
          {item.defaultIsNotTaking ? "NOT TAKING" : "Not Taking"}
        </button>
      </div>

      {/* Description */}
      <input
        defaultValue={item.description}
        onBlur={(e) => {
          const v = e.target.value;
          if (v !== item.description) onUpdate(item.id, "description", v);
        }}
        className="flex-1 min-w-[140px] bg-transparent focus:outline-none focus:underline text-ink-muted placeholder:text-ink-faint"
        placeholder="Description"
      />

      {/* Delete */}
      <button
        onClick={() => onDelete(item.id)}
        className="w-8 shrink-0 flex items-center justify-center text-ink-faint hover:text-danger-text transition-colors"
        title={`Delete "${item.name}"`}
        aria-label={`Delete ${item.name}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" /><path d="M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </li>
  );
}
