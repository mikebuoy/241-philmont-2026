"use client";

import { useTransition, useState, useRef } from "react";
import { CORE_CATEGORIES } from "@/data/coreItems";
import type { CoreGearItem } from "@/lib/gear";
import { updateGearItem, addGearItem, deleteGearItem } from "./actions";

const REQUIRED_OPTIONS = ["Required", "Optional", "Note"] as const;

type Props = { initialItems: CoreGearItem[] };

export function GearEditor({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [, startTransition] = useTransition();
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const newNameRef = useRef<HTMLInputElement>(null);

  // Group by category, preserving CORE_CATEGORIES order
  const groups: Record<string, CoreGearItem[]> = {};
  for (const item of items) {
    (groups[item.category] ??= []).push(item);
  }
  const orderedCategories = [
    ...CORE_CATEGORIES.filter((c) => groups[c]),
    ...Object.keys(groups).filter((c) => !CORE_CATEGORIES.includes(c)),
  ];

  function mutate(id: string, patch: Partial<CoreGearItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function handleFieldBlur(
    id: string,
    field: Parameters<typeof updateGearItem>[1],
    value: string | number,
  ) {
    startTransition(() => updateGearItem(id, field, value));
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?\n\nThis only affects future seeds — existing crew member lists are unchanged.`)) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
    startTransition(() => deleteGearItem(id));
  }

  async function handleAdd(category: string) {
    const name = newNameRef.current?.value.trim();
    if (!name) return;
    setAddingTo(null);
    if (newNameRef.current) newNameRef.current.value = "";

    // Optimistic — server will revalidate and return the real row
    const tempId = crypto.randomUUID();
    setItems((prev) => [
      ...prev,
      {
        id: tempId,
        category,
        name,
        description: "",
        required: "Optional",
        qty: "1",
        weightOz: 0,
        sortOrder: 9999,
      },
    ]);
    startTransition(() => addGearItem(category, name));
  }

  return (
    <div className="space-y-8">
      {orderedCategories.map((cat) => {
        const catItems = groups[cat];
        return (
          <section key={cat}>
            {/* Category header */}
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                {cat}
                <span className="ml-2 text-ink-faint font-normal">
                  ({catItems.length})
                </span>
              </h2>
            </div>

            {/* Item table */}
            <div className="border border-border rounded-lg overflow-hidden" style={{ borderWidth: "0.5px" }}>
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-2 items-center px-3 py-1.5 bg-surface-2 border-b border-border text-[10px] font-mono uppercase tracking-[0.08em] text-ink-faint">
                <span>Name</span>
                <span className="w-24 text-center">Required</span>
                <span className="w-16 text-center">Qty</span>
                <span className="w-16 text-center">Wt (oz)</span>
                <span className="w-6" />
              </div>

              {catItems.map((item, i) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-2 items-center px-3 py-1.5 ${
                    i < catItems.length - 1 ? "border-b border-border" : ""
                  }`}
                  style={{ borderWidth: "0.5px" }}
                >
                  {/* Name */}
                  <input
                    className="w-full text-[12px] bg-transparent border border-transparent hover:border-border focus:border-border-strong rounded px-1.5 py-0.5 min-w-0"
                    defaultValue={item.name}
                    onBlur={(e) => {
                      if (e.target.value !== item.name) {
                        mutate(item.id, { name: e.target.value });
                        handleFieldBlur(item.id, "name", e.target.value);
                      }
                    }}
                  />

                  {/* Required */}
                  <select
                    className="w-24 text-[11px] bg-transparent border border-transparent hover:border-border focus:border-border-strong rounded px-1.5 py-0.5 font-mono cursor-pointer"
                    value={item.required}
                    onChange={(e) => {
                      const val = e.target.value as CoreGearItem["required"];
                      mutate(item.id, { required: val });
                      startTransition(() => updateGearItem(item.id, "required", val));
                    }}
                  >
                    {REQUIRED_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>

                  {/* Qty */}
                  <input
                    className="w-16 text-[12px] text-center font-mono bg-transparent border border-transparent hover:border-border focus:border-border-strong rounded px-1.5 py-0.5"
                    defaultValue={item.qty}
                    onBlur={(e) => {
                      if (e.target.value !== item.qty) {
                        mutate(item.id, { qty: e.target.value });
                        handleFieldBlur(item.id, "qty", e.target.value);
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
                        mutate(item.id, { weightOz: val });
                        handleFieldBlur(item.id, "weight_oz", val);
                      }
                    }}
                  />

                  {/* Delete */}
                  <button
                    className="w-6 h-6 flex items-center justify-center text-ink-faint hover:text-danger-text rounded hover:bg-danger-bg transition-colors text-[13px]"
                    onClick={() => handleDelete(item.id, item.name)}
                    title="Delete item"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Add item row */}
              {addingTo === cat ? (
                <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-surface-2" style={{ borderWidth: "0.5px" }}>
                  <input
                    ref={newNameRef}
                    autoFocus
                    placeholder="New item name…"
                    className="flex-1 text-[12px] bg-surface border border-border rounded px-2 py-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdd(cat);
                      if (e.key === "Escape") setAddingTo(null);
                    }}
                  />
                  <button
                    className="text-[11px] font-medium px-3 py-1 bg-ink text-bg rounded hover:opacity-90"
                    onClick={() => handleAdd(cat)}
                  >
                    Add
                  </button>
                  <button
                    className="text-[11px] text-ink-muted hover:text-ink px-2 py-1"
                    onClick={() => setAddingTo(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2 border-t border-border bg-surface-2" style={{ borderWidth: "0.5px" }}>
                  <button
                    className="text-[11px] font-mono text-ink-muted hover:text-hcblue"
                    onClick={() => setAddingTo(cat)}
                  >
                    + Add item
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
