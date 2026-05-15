"use client";

import {
  useState,
  useTransition,
  useRef,
  useCallback,
} from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { GearCategory, CoreGearItem } from "@/lib/gear";
import {
  addCategory,
  updateCategoryName,
  deleteCategory,
  reorderCategories,
  addGearItem,
  deleteGearItem,
  updateGearItem,
  applyDefaultFlag,
  reorderItems,
  moveItemToCategory,
} from "./actions";

// ─── Drag ID helpers ─────────────────────────────────────────────────────────
const CAT_PREFIX = "cat::";
function catId(name: string) { return `${CAT_PREFIX}${name}`; }
function isCatId(id: string) { return id.startsWith(CAT_PREFIX); }
function catName(id: string) { return id.slice(CAT_PREFIX.length); }

// ─── Main component ───────────────────────────────────────────────────────────
export function GearEditor({
  initialCategories,
  initialItems,
}: {
  initialCategories: GearCategory[];
  initialItems: CoreGearItem[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Category reorder mode
  const [reorderingCats, setReorderingCats] = useState(false);
  const [catOrderSnapshot, setCatOrderSnapshot] = useState<GearCategory[]>([]);

  // Category management state
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [catErrors, setCatErrors] = useState<Record<string, string>>({});
  const [addingCat, setAddingCat] = useState(false);
  const newCatRef = useRef<HTMLInputElement>(null);
  const editCatRef = useRef<HTMLInputElement>(null);

  // Item add state
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const newItemRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const groupedItems = useCallback(
    (cat: string) => items.filter((i) => i.category === cat),
    [items],
  );

  function findItemCategory(itemId: string) {
    return items.find((i) => i.id === itemId)?.category ?? null;
  }

  // ─── Drag handlers ────────────────────────────────────────────────────────

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (isCatId(activeId) || activeId === overId) return;

    const srcCat = findItemCategory(activeId);
    const dstCat = isCatId(overId)
      ? catName(overId)
      : (findItemCategory(overId) ?? srcCat);

    if (srcCat && dstCat && srcCat !== dstCat) {
      setItems((prev) =>
        prev.map((it) => (it.id === activeId ? { ...it, category: dstCat } : it)),
      );
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (isCatId(activeId)) {
      // Reorder categories — in reorder mode, only update local state; Save persists
      const fromIdx = categories.findIndex((c) => catId(c.name) === activeId);
      const toIdx = categories.findIndex((c) => catId(c.name) === overId);
      if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
      setCategories((prev) => arrayMove(prev, fromIdx, toIdx));
    } else {
      // Item drag — category was already updated in onDragOver
      const currentCat = findItemCategory(activeId);
      const originalCat =
        initialItems.find((i) => i.id === activeId)?.category ??
        items.find((i) => i.id === activeId)?.category;

      if (currentCat && currentCat !== originalCat) {
        // Cross-category: persist move
        startTransition(() => moveItemToCategory(activeId, currentCat));
      } else if (currentCat) {
        // Same category: reorder
        const catItems = items.filter((i) => i.category === currentCat);
        const fromIdx = catItems.findIndex((i) => i.id === activeId);
        const overItem = isCatId(overId) ? null : catItems.find((i) => i.id === overId);
        const toIdx = overItem ? catItems.indexOf(overItem) : -1;
        if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
        const next = arrayMove(catItems, fromIdx, toIdx);
        setItems((prev) => {
          const rest = prev.filter((i) => i.category !== currentCat);
          return [...rest, ...next];
        });
        startTransition(() => reorderItems(next.map((i) => i.id)));
      }
    }
  }

  // ─── Category reorder mode ────────────────────────────────────────────────

  function handleStartReorder() {
    setCatOrderSnapshot(categories);
    setReorderingCats(true);
  }

  function handleSaveReorder() {
    setReorderingCats(false);
    startTransition(() => reorderCategories(categories.map((c) => c.name)));
  }

  function handleCancelReorder() {
    setCategories(catOrderSnapshot);
    setReorderingCats(false);
  }

  // ─── Category CRUD ────────────────────────────────────────────────────────

  function handleSaveNewCat() {
    const name = newCatRef.current?.value.trim();
    if (!name) return;
    setAddingCat(false);
    if (newCatRef.current) newCatRef.current.value = "";
    const tempCat: GearCategory = { id: crypto.randomUUID(), name, sortOrder: categories.length };
    setCategories((prev) => [...prev, tempCat]);
    startTransition(() => addCategory(name));
  }

  function handleSaveRename(oldName: string) {
    const newName = editCatRef.current?.value.trim();
    setEditingCat(null);
    if (!newName || newName === oldName) return;
    setCategories((prev) =>
      prev.map((c) => (c.name === oldName ? { ...c, name: newName } : c)),
    );
    setItems((prev) =>
      prev.map((i) => (i.category === oldName ? { ...i, category: newName } : i)),
    );
    startTransition(() => updateCategoryName(oldName, newName));
  }

  async function handleDeleteCat(name: string) {
    const count = items.filter((i) => i.category === name).length;
    if (count > 0) {
      setCatErrors((e) => ({ ...e, [name]: `Remove all ${count} item(s) first.` }));
      setTimeout(() => setCatErrors((e) => { const next = { ...e }; delete next[name]; return next; }), 3000);
      return;
    }
    setCategories((prev) => prev.filter((c) => c.name !== name));
    startTransition(() => deleteCategory(name));
  }

  // ─── Item CRUD ────────────────────────────────────────────────────────────

  function handleAddItem(category: string) {
    const name = newItemRef.current?.value.trim();
    if (!name) return;
    setAddingItemTo(null);
    if (newItemRef.current) newItemRef.current.value = "";
    const tempItem: CoreGearItem = {
      id: crypto.randomUUID(),
      category,
      name,
      description: "",
      required: "Optional",
      qty: "1",
      weightOz: 0,
      sortOrder: 9999,
      defaultIsWorn: false,
      defaultIsConsumable: false,
      defaultIsNotPacking: false,
    };
    setItems((prev) => [...prev, tempItem]);
    startTransition(() => addGearItem(category, name));
  }

  function handleDeleteItem(id: string, name: string) {
    if (!confirm(`Delete "${name}"?\n\nOnly affects future seeds — existing crew lists unchanged.`)) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    startTransition(() => deleteGearItem(id));
  }

  function handleFieldBlur(id: string, field: Parameters<typeof updateGearItem>[1], value: string | number | boolean) {
    startTransition(() => updateGearItem(id, field, value));
  }

  function handleFlagToggle(id: string, field: "default_is_worn" | "default_is_consumable", value: boolean) {
    patchItem(id, field === "default_is_worn" ? { defaultIsWorn: value } : { defaultIsConsumable: value });
    startTransition(() => applyDefaultFlag(id, field, value));
  }

  function patchItem(id: string, patch: Partial<CoreGearItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  // ─── Active drag preview data ─────────────────────────────────────────────

  const activeCat = activeId && isCatId(activeId)
    ? categories.find((c) => catId(c.name) === activeId)
    : null;
  const activeItem = activeId && !isCatId(activeId)
    ? items.find((i) => i.id === activeId)
    : null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Category reorder toolbar */}
      <div className="flex items-center justify-between mb-4">
        {reorderingCats ? (
          <>
            <p className="text-[12px] text-ink-muted">
              Drag categories into the order you want, then save.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelReorder}
                className="text-[12px] text-ink-muted hover:text-ink px-3 py-1.5 rounded-md hover:bg-surface-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReorder}
                className="text-[12px] font-medium px-3 py-1.5 bg-ink text-bg rounded-md hover:opacity-90"
              >
                Save order
              </button>
            </div>
          </>
        ) : (
          <>
            <span />
            <button
              onClick={handleStartReorder}
              className="text-[11px] font-mono text-ink-muted hover:text-ink border border-border rounded px-2.5 py-1 hover:bg-surface-2"
            >
              Reorder categories
            </button>
          </>
        )}
      </div>

      <SortableContext
        items={categories.map((c) => catId(c.name))}
        strategy={verticalListSortingStrategy}
      >
        {reorderingCats ? (
          /* ── Compact reorder mode ── */
          <div className="border border-border rounded-lg overflow-hidden" style={{ borderWidth: "0.5px" }}>
            {categories.map((cat, idx) => (
              <SortableCategoryRow
                key={cat.name}
                category={cat}
                itemCount={groupedItems(cat.name).length}
                isLast={idx === categories.length - 1}
              />
            ))}
          </div>
        ) : (
          /* ── Normal expanded mode ── */
          <div className="space-y-6">
            {categories.map((cat) => {
              const catItems = groupedItems(cat.name);
              return (
                <SortableCategorySection
                  key={cat.name}
                  category={cat}
                  items={catItems}
                  isEditing={editingCat === cat.name}
                  editRef={editCatRef}
                  catError={catErrors[cat.name]}
                  addingItemTo={addingItemTo}
                  newItemRef={newItemRef}
                  onStartEdit={() => {
                    setEditingCat(cat.name);
                    setTimeout(() => {
                      if (editCatRef.current) {
                        editCatRef.current.value = cat.name;
                        editCatRef.current.select();
                      }
                    }, 0);
                  }}
                  onSaveRename={() => handleSaveRename(cat.name)}
                  onCancelEdit={() => setEditingCat(null)}
                  onDelete={() => handleDeleteCat(cat.name)}
                  onStartAddItem={() => {
                    setAddingItemTo(cat.name);
                    setTimeout(() => newItemRef.current?.focus(), 0);
                  }}
                  onSaveNewItem={() => handleAddItem(cat.name)}
                  onCancelAddItem={() => setAddingItemTo(null)}
                  onDeleteItem={handleDeleteItem}
                  onFieldBlur={handleFieldBlur}
                  onPatchItem={patchItem}
                  onFlagToggle={handleFlagToggle}
                  onNotPackingChange={(id, val) => {
                    patchItem(id, { defaultIsNotPacking: val });
                    startTransition(() => updateGearItem(id, "default_is_not_packing", val));
                  }}
                  onRequiredChange={(id, val) => {
                    patchItem(id, { required: val });
                    startTransition(() => updateGearItem(id, "required", val));
                  }}
                />
              );
            })}
          </div>
        )}
      </SortableContext>

      {/* Add category — hidden in reorder mode */}
      {!reorderingCats && <div className="mt-6 pt-4 border-t border-border">
        {addingCat ? (
          <div className="flex items-center gap-2">
            <input
              ref={newCatRef}
              autoFocus
              placeholder="New category name…"
              className="flex-1 text-[13px] bg-surface border border-border rounded px-3 py-1.5"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveNewCat();
                if (e.key === "Escape") setAddingCat(false);
              }}
            />
            <button
              className="text-[12px] font-medium px-3 py-1.5 bg-ink text-bg rounded hover:opacity-90"
              onClick={handleSaveNewCat}
            >
              Add
            </button>
            <button
              className="text-[12px] text-ink-muted hover:text-ink px-2 py-1.5"
              onClick={() => setAddingCat(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            className="font-mono text-[11px] text-ink-muted hover:text-hcblue"
            onClick={() => setAddingCat(true)}
          >
            + Add category
          </button>
        )}
      </div>}

      {/* Drag overlay */}
      <DragOverlay dropAnimation={null}>
        {activeCat && (
          <div className="bg-surface border border-border-strong rounded-lg px-3 py-2 shadow-md opacity-90">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
              {activeCat.name}
            </span>
          </div>
        )}
        {activeItem && (
          <div className="bg-surface border border-border-strong rounded px-3 py-2 shadow-md opacity-90 text-[12px]">
            {activeItem.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// ─── SortableCategoryRow (compact reorder mode) ───────────────────────────────

function SortableCategoryRow({
  category,
  itemCount,
  isLast,
}: {
  category: GearCategory;
  itemCount: number;
  isLast: boolean;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id: catId(category.name) });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        borderWidth: "0.5px",
      }}
      className={`flex items-center gap-3 px-4 py-3 bg-surface hover:bg-surface-2 ${
        !isLast ? "border-b border-border" : ""
      }`}
    >
      <button
        className="cursor-grab active:cursor-grabbing text-ink-faint hover:text-ink-muted touch-none"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripIcon />
      </button>
      <span className="flex-1 font-mono text-[12px] uppercase tracking-[0.08em]">
        {category.name}
      </span>
      <span className="font-mono text-[11px] text-ink-faint">{itemCount} items</span>
    </div>
  );
}

// ─── SortableCategorySection ──────────────────────────────────────────────────

function SortableCategorySection({
  category,
  items,
  isEditing,
  editRef,
  catError,
  addingItemTo,
  newItemRef,
  onStartEdit,
  onSaveRename,
  onCancelEdit,
  onDelete,
  onStartAddItem,
  onSaveNewItem,
  onCancelAddItem,
  onDeleteItem,
  onFieldBlur,
  onPatchItem,
  onFlagToggle,
  onNotPackingChange,
  onRequiredChange,
}: {
  category: GearCategory;
  items: CoreGearItem[];
  isEditing: boolean;
  editRef: React.RefObject<HTMLInputElement | null>;
  catError?: string;
  addingItemTo: string | null;
  newItemRef: React.RefObject<HTMLInputElement | null>;
  onStartEdit: () => void;
  onSaveRename: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onStartAddItem: () => void;
  onSaveNewItem: () => void;
  onCancelAddItem: () => void;
  onDeleteItem: (id: string, name: string) => void;
  onFieldBlur: (id: string, field: Parameters<typeof updateGearItem>[1], value: string | number | boolean) => void;
  onPatchItem: (id: string, patch: Partial<CoreGearItem>) => void;
  onFlagToggle: (id: string, field: "default_is_worn" | "default_is_consumable", value: boolean) => void;
  onNotPackingChange: (id: string, val: boolean) => void;
  onRequiredChange: (id: string, val: CoreGearItem["required"]) => void;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: catId(category.name) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isAddingHere = addingItemTo === category.name;

  return (
    <section ref={setNodeRef} style={style}>
      {/* Category header */}
      <div className="flex items-center gap-2 mb-1 group">
        {/* Drag handle */}
        <button
          className="cursor-grab active:cursor-grabbing text-ink-faint hover:text-ink-muted p-0.5 rounded touch-none"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder category"
          title="Drag to reorder"
        >
          <GripIcon />
        </button>

        {isEditing ? (
          <input
            ref={editRef}
            defaultValue={category.name}
            className="flex-1 font-mono text-[11px] uppercase tracking-[0.1em] bg-surface border border-border-strong rounded px-2 py-0.5"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveRename();
              if (e.key === "Escape") onCancelEdit();
            }}
            onBlur={onSaveRename}
            autoFocus
          />
        ) : (
          <h2 className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted flex-1">
            {category.name}
            <span className="ml-1.5 text-ink-faint font-normal normal-case tracking-normal">
              ({items.length})
            </span>
          </h2>
        )}

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isEditing && (
            <button
              onClick={onStartEdit}
              className="font-mono text-[10px] text-ink-faint hover:text-ink px-1.5 py-0.5 rounded hover:bg-surface-2"
              title="Rename category"
            >
              rename
            </button>
          )}
          <button
            onClick={onDelete}
            className="font-mono text-[10px] text-ink-faint hover:text-danger-text px-1.5 py-0.5 rounded hover:bg-danger-bg"
            title="Delete category (must be empty)"
          >
            delete
          </button>
        </div>
      </div>

      {catError && (
        <p className="text-[11px] text-danger-text mb-1 pl-7">{catError}</p>
      )}

      {/* Items table */}
      <div
        className="border border-border rounded-lg overflow-hidden ml-5"
        style={{ borderWidth: "0.5px" }}
      >
        {/* Column headers */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto_auto_auto] gap-x-2 items-center px-2 py-1.5 bg-surface-2 border-b border-border text-[10px] font-mono uppercase tracking-[0.08em] text-ink-faint" style={{ borderWidth: "0.5px" }}>
          <span className="w-4" />
          <span>Name / Description</span>
          <span className="w-24 text-center">Required</span>
          <span className="w-14 text-center">Qty</span>
          <span className="w-16 text-center">Wt (oz)</span>
          <span className="w-5 text-center">W</span>
          <span className="w-5 text-center">C</span>
          <span className="w-7 text-center">Off</span>
          <span className="w-6" />
        </div>

        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item, idx) => (
            <SortableItemRow
              key={item.id}
              item={item}
              isLast={idx === items.length - 1 && !isAddingHere}
              onDelete={() => onDeleteItem(item.id, item.name)}
              onFieldBlur={onFieldBlur}
              onPatch={onPatchItem}
              onFlagToggle={onFlagToggle}
              onNotPackingChange={onNotPackingChange}
              onRequiredChange={onRequiredChange}
            />
          ))}
        </SortableContext>

        {/* Add item row */}
        {isAddingHere ? (
          <div
            className="flex items-center gap-2 px-3 py-2 border-t border-border bg-surface-2"
            style={{ borderWidth: "0.5px" }}
          >
            <input
              ref={newItemRef}
              placeholder="New item name…"
              className="flex-1 text-[12px] bg-surface border border-border rounded px-2 py-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveNewItem();
                if (e.key === "Escape") onCancelAddItem();
              }}
            />
            <button
              className="text-[11px] font-medium px-3 py-1 bg-ink text-bg rounded hover:opacity-90"
              onClick={onSaveNewItem}
            >
              Add
            </button>
            <button
              className="text-[11px] text-ink-muted hover:text-ink px-2 py-1"
              onClick={onCancelAddItem}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div
            className="px-3 py-2 border-t border-border bg-surface-2"
            style={{ borderWidth: "0.5px" }}
          >
            <button
              className="font-mono text-[11px] text-ink-muted hover:text-hcblue"
              onClick={onStartAddItem}
            >
              + Add item
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── SortableItemRow ──────────────────────────────────────────────────────────

const REQUIRED_OPTIONS = ["Required", "Optional", "Note"] as const;

function SortableItemRow({
  item,
  isLast,
  onDelete,
  onFieldBlur,
  onPatch,
  onFlagToggle,
  onNotPackingChange,
  onRequiredChange,
}: {
  item: CoreGearItem;
  isLast: boolean;
  onDelete: () => void;
  onFieldBlur: (id: string, field: Parameters<typeof updateGearItem>[1], value: string | number | boolean) => void;
  onPatch: (id: string, patch: Partial<CoreGearItem>) => void;
  onFlagToggle: (id: string, field: "default_is_worn" | "default_is_consumable", value: boolean) => void;
  onNotPackingChange: (id: string, val: boolean) => void;
  onRequiredChange: (id: string, val: CoreGearItem["required"]) => void;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderWidth: "0.5px" }}
      className={`group ${!isLast ? "border-b border-border" : ""}`}
    >
      {/* Main row */}
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto_auto_auto] gap-x-2 items-center px-2 py-1.5">
        {/* Drag handle */}
        <button
          className="w-4 cursor-grab active:cursor-grabbing text-ink-faint hover:text-ink-muted p-0.5 touch-none"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          title="Drag to reorder"
        >
          <GripIcon size={12} />
        </button>

        {/* Name */}
        <input
          className="w-full text-[12px] bg-transparent border border-transparent hover:border-border focus:border-border-strong rounded px-1.5 py-0.5 min-w-0"
          defaultValue={item.name}
          onBlur={(e) => {
            if (e.target.value !== item.name) {
              onPatch(item.id, { name: e.target.value });
              onFieldBlur(item.id, "name", e.target.value);
            }
          }}
        />

        {/* Required */}
        <select
          className="w-24 text-[11px] bg-transparent border border-transparent hover:border-border focus:border-border-strong rounded px-1 py-0.5 font-mono cursor-pointer"
          value={item.required}
          onChange={(e) => onRequiredChange(item.id, e.target.value as CoreGearItem["required"])}
        >
          {REQUIRED_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>

        {/* Qty */}
        <input
          className="w-14 text-[12px] text-center font-mono bg-transparent border border-transparent hover:border-border focus:border-border-strong rounded px-1 py-0.5"
          defaultValue={item.qty}
          onBlur={(e) => {
            if (e.target.value !== item.qty) {
              onPatch(item.id, { qty: e.target.value });
              onFieldBlur(item.id, "qty", e.target.value);
            }
          }}
        />

        {/* Weight */}
        <input
          type="number"
          step="0.1"
          min="0"
          className="w-16 text-[12px] text-right font-mono bg-transparent border border-transparent hover:border-border focus:border-border-strong rounded px-1.5 py-0.5"
          defaultValue={item.weightOz || ""}
          placeholder="0"
          onBlur={(e) => {
            const val = parseFloat(e.target.value) || 0;
            if (val !== item.weightOz) {
              onPatch(item.id, { weightOz: val });
              onFieldBlur(item.id, "weight_oz", val);
            }
          }}
        />

        {/* Worn default */}
        <button
          onClick={() => onFlagToggle(item.id, "default_is_worn", !item.defaultIsWorn)}
          title={item.defaultIsWorn ? "Default: Worn (click to unset)" : "Set default: Worn"}
          className={`w-5 h-5 rounded font-mono text-[10px] font-semibold transition-colors ${
            item.defaultIsWorn ? "bg-ok-bg text-ok-text" : "text-ink-faint hover:text-ink"
          }`}
        >
          W
        </button>

        {/* Consumable default */}
        <button
          onClick={() => onFlagToggle(item.id, "default_is_consumable", !item.defaultIsConsumable)}
          title={item.defaultIsConsumable ? "Default: Consumable (click to unset)" : "Set default: Consumable"}
          className={`w-5 h-5 rounded font-mono text-[10px] font-semibold transition-colors ${
            item.defaultIsConsumable ? "bg-info-bg text-info-text" : "text-ink-faint hover:text-ink"
          }`}
        >
          C
        </button>

        {/* Not packing default */}
        <button
          onClick={() => onNotPackingChange(item.id, !item.defaultIsNotPacking)}
          title={item.defaultIsNotPacking ? "Default: Not packing (click to unset)" : "Set default: Not packing"}
          className={`w-7 h-5 rounded font-mono text-[10px] font-semibold transition-colors ${
            item.defaultIsNotPacking ? "bg-warn-bg text-warn-text" : "text-ink-faint hover:text-ink"
          }`}
        >
          Off
        </button>

        {/* Delete */}
        <button
          className="w-6 h-6 flex items-center justify-center text-ink-faint hover:text-danger-text rounded hover:bg-danger-bg transition-colors text-[13px] opacity-0 group-hover:opacity-100"
          onClick={onDelete}
          title="Delete item"
        >
          ×
        </button>
      </div>

      {/* Description row */}
      <div className="pl-8 pr-3 pb-1.5 -mt-0.5">
        <input
          className="w-full text-[11px] text-ink-muted bg-transparent border border-transparent hover:border-border focus:border-border-strong rounded px-1.5 py-0.5 placeholder:text-ink-faint/50"
          defaultValue={item.description}
          placeholder="Description (shown to crew members)…"
          onBlur={(e) => {
            if (e.target.value !== item.description) {
              onPatch(item.id, { description: e.target.value });
              onFieldBlur(item.id, "description", e.target.value);
            }
          }}
        />
      </div>
    </div>
  );
}

// ─── Grip icon ────────────────────────────────────────────────────────────────

function GripIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="4" cy="3" r="1.1" />
      <circle cx="4" cy="7" r="1.1" />
      <circle cx="4" cy="11" r="1.1" />
      <circle cx="10" cy="3" r="1.1" />
      <circle cx="10" cy="7" r="1.1" />
      <circle cx="10" cy="11" r="1.1" />
    </svg>
  );
}
