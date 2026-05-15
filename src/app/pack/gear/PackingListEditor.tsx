"use client";

import { useMemo, useState, useTransition } from "react";
import type { PackingItem } from "@/lib/packing-types";
import { computeTotals } from "@/lib/packing-types";
import { computeTargets, PACK_WEIGHT_CONSTANTS } from "@/data/packWeights";
import { CORE_CATEGORIES } from "@/data/coreItems";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import {
  updateItemField,
  toggleItemFlag,
  addPersonalItem,
  deletePersonalItem,
  saveMyBodyWeight,
} from "./actions";

const GF = PACK_WEIGHT_CONSTANTS.gearAndFoodLbs;

function ozToLbs(oz: number): number {
  return oz / 16;
}
function fmt(n: number, digits = 1): string {
  return n.toFixed(digits);
}
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

export function PackingListEditor({
  items: initialItems,
  bodyWeightLbs: initialBodyWeight,
}: {
  items: PackingItem[];
  bodyWeightLbs: number | null;
}) {
  const [items, setItems] = useState<PackingItem[]>(initialItems);
  const [bodyWeight, setBodyWeight] = useState<number | null>(
    initialBodyWeight,
  );
  const [showNotPacking, setShowNotPacking] = useState(false);
  const [showOnlyUnpacked, setShowOnlyUnpacked] = useState(false);
  const [, startTransition] = useTransition();

  // Order categories: existing first per CORE_CATEGORIES, then any extras
  const categoryOrder = useMemo(() => {
    const present = new Set(items.map((i) => i.category));
    const ordered = CORE_CATEGORIES.filter((c) => present.has(c));
    const extras = Array.from(present).filter(
      (c) => !ordered.includes(c),
    );
    return [...ordered, ...extras.sort()];
  }, [items]);

  const totals = useMemo(() => computeTotals(items), [items]);
  const targets = useMemo(
    () => (bodyWeight ? computeTargets(bodyWeight) : null),
    [bodyWeight],
  );

  // Build status + delta lines exactly like the public calculator
  const baseLbs = ozToLbs(totals.baseOz);
  const totalDay1Lbs = baseLbs + GF;
  let status: "ok" | "warn" | "danger" | null = null;
  const deltaLines: string[] = [];
  if (targets) {
    if (totalDay1Lbs <= targets.target20) status = "ok";
    else if (totalDay1Lbs <= targets.max25) status = "warn";
    else status = "danger";

    const deltaTarget = totalDay1Lbs - targets.target20;
    const deltaMax = totalDay1Lbs - targets.max25;
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

  function onBodyWeightChange(lbs: number | null) {
    setBodyWeight(lbs);
    startTransition(async () => {
      await saveMyBodyWeight(lbs);
    });
  }

  const statusBg = status
    ? { ok: "bg-ok-bg", warn: "bg-warn-bg", danger: "bg-danger-bg" }[status]
    : "bg-surface";
  const statusText = status
    ? {
        ok: "text-ok-text",
        warn: "text-warn-text",
        danger: "text-danger-text",
      }[status]
    : "text-ink";

  // Apply filters
  const visible = items.filter((it) => {
    if (it.isNotPacking && !showNotPacking) return false;
    if (showOnlyUnpacked && it.isPacked) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* ───── Sticky totals header ───── */}
      <div
        className={`${statusBg} ${statusText} rounded-lg p-4 sticky top-14 sm:top-14 z-30 shadow-sm`}
        style={{
          borderLeft: status
            ? `4px solid var(--color-${status}-border)`
            : "4px solid var(--color-border-strong)",
        }}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <label className="flex items-center gap-2 text-[12px]">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] opacity-80">
              Body weight
            </span>
            <input
              type="number"
              min={50}
              max={300}
              step={1}
              value={bodyWeight ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                onBodyWeightChange(v === "" ? null : Number(v));
              }}
              placeholder="170"
              className="w-20 font-mono text-[13px] bg-bg/40 border border-current/20 rounded px-2 py-1 text-right"
            />
            <span className="font-mono text-[11px] opacity-70">lbs</span>
          </label>

          {status && (
            <StatusBadge tone={status}>
              {status === "ok"
                ? "ON TARGET"
                : status === "warn"
                  ? "CAUTION"
                  : "OVER LIMIT"}
            </StatusBadge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center mb-2">
          <Stat label="Base" value={`${fmt(baseLbs)} lbs`} />
          <Stat label="Worn" value={`${fmt(ozToLbs(totals.wornOz))} lbs`} />
          <Stat
            label="Consumable"
            value={`${fmt(ozToLbs(totals.consumableOz))} lbs`}
          />
        </div>

        <div className="border-t border-current/10 pt-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] opacity-80">
              Total Day 1
            </span>
            <span className="font-mono text-[20px] font-semibold">
              {fmt(totalDay1Lbs)} lbs
            </span>
          </div>
          <div className="font-mono text-[10px] opacity-75 mt-0.5">
            {fmt(baseLbs)} base + {GF} Gear &amp; Food
          </div>
        </div>

        {deltaLines.length > 0 && (
          <div className="mt-2 space-y-0.5">
            {deltaLines.map((line) => (
              <div
                key={line}
                className="font-mono text-[12px] font-semibold text-center"
              >
                {line}
              </div>
            ))}
          </div>
        )}

        {!bodyWeight && (
          <p className="text-[11px] mt-2 opacity-75 text-center">
            Enter your body weight to see target / status.
          </p>
        )}
      </div>

      {/* ───── Filters ───── */}
      <div className="flex items-center gap-4 text-[11px] font-mono text-ink-muted">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={showNotPacking}
            onChange={(e) => setShowNotPacking(e.target.checked)}
            className="accent-ink"
          />
          Show not-packing ({totals.notPackingCount})
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyUnpacked}
            onChange={(e) => setShowOnlyUnpacked(e.target.checked)}
            className="accent-ink"
          />
          Only unpacked ({totals.unpackedCount})
        </label>
      </div>

      {/* ───── Categories ───── */}
      {categoryOrder.map((cat) => {
        const catItems = visible.filter((it) => it.category === cat);
        const allCatItems = items.filter((it) => it.category === cat);
        const catSubtotalOz = allCatItems
          .filter((it) => !it.isNotPacking && !it.isWorn)
          .reduce((sum, it) => sum + it.qty * it.weightOz, 0);
        if (catItems.length === 0 && !showNotPacking) return null;

        return (
          <section key={cat}>
            <div className="flex items-baseline justify-between mb-1.5 px-1">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
                {cat}
              </h2>
              <span className="font-mono text-[10px] text-ink-faint">
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
                  onToggle={onToggle}
                  onFieldChange={onFieldChange}
                  onDelete={() => onDelete(it.id)}
                />
              ))}
              <li className="px-3 py-2 bg-surface-2/50">
                <button
                  onClick={() => onAddPersonal(cat)}
                  className="font-mono text-[11px] text-ink-muted hover:text-ink"
                >
                  + Add personal item
                </button>
              </li>
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[16px] font-semibold leading-none">
        {value}
      </div>
      <div className="font-mono text-[9px] uppercase tracking-[0.05em] opacity-75 mt-1">
        {label}
      </div>
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

function ItemRow({
  item,
  onToggle,
  onFieldChange,
  onDelete,
}: {
  item: PackingItem;
  onToggle: (
    id: string,
    flag:
      | "isWorn"
      | "isConsumable"
      | "isSmellable"
      | "isPacked"
      | "isNotPacking",
    v: boolean,
  ) => void;
  onFieldChange: (
    id: string,
    field: "name" | "qty" | "weightOz",
    v: string | number,
  ) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(String(item.qty));
  const [weight, setWeight] = useState(String(item.weightOz));

  const dimmed = item.isNotPacking;

  return (
    <li
      className={`px-3 py-2 flex items-center gap-2 text-[12px] ${
        dimmed ? "opacity-50" : ""
      }`}
    >
      {/* Packed checkbox */}
      <input
        type="checkbox"
        checked={item.isPacked}
        onChange={(e) => onToggle(item.id, "isPacked", e.target.checked)}
        className="accent-ink shrink-0"
        aria-label="Packed"
        title="Packed"
      />

      {/* Name */}
      <div className="flex-1 min-w-0">
        {item.isCore ? (
          <span className="font-medium truncate block">{item.name}</span>
        ) : (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (name !== item.name) onFieldChange(item.id, "name", name);
            }}
            className="w-full font-medium bg-transparent border-b border-transparent focus:border-border-strong outline-none"
          />
        )}
      </div>

      {/* Qty */}
      <div className="flex items-center gap-0.5 shrink-0">
        <span className="font-mono text-[11px] text-ink-faint">×</span>
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
          className={`w-10 font-mono text-[12px] text-center bg-surface-2 border border-border rounded px-1 py-0.5 ${
            item.qty > 1 ? "font-semibold" : ""
          }`}
          aria-label="Quantity"
        />
      </div>

      {/* Weight (oz) */}
      <div className="flex items-center gap-1">
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
        <span className="font-mono text-[10px] text-ink-muted">oz</span>
      </div>

      {/* Flag toggles */}
      <FlagButton
        active={item.isWorn}
        onClick={() => onToggle(item.id, "isWorn", !item.isWorn)}
        label="W"
        title="Worn — excluded from base weight"
        tone="ok"
      />
      <FlagButton
        active={item.isConsumable}
        onClick={() => onToggle(item.id, "isConsumable", !item.isConsumable)}
        label="C"
        title="Consumable — depletes during trek"
        tone="info"
      />

      {/* Not-packing toggle (icon button) */}
      <button
        onClick={() => onToggle(item.id, "isNotPacking", !item.isNotPacking)}
        className={`font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
          item.isNotPacking
            ? "bg-ink text-bg"
            : "text-ink-faint hover:text-ink"
        }`}
        title={
          item.isNotPacking
            ? "Mark as packing"
            : "Mark as not packing (hide from totals)"
        }
      >
        {item.isNotPacking ? "OFF" : "·"}
      </button>

      {/* Delete (personal items only) */}
      {!item.isCore && (
        <button
          onClick={onDelete}
          className="text-ink-faint hover:text-danger-text shrink-0"
          aria-label="Delete"
          title="Delete personal item"
        >
          ✕
        </button>
      )}
    </li>
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
      className={`shrink-0 font-mono text-[10px] font-semibold w-5 h-5 rounded transition-colors ${
        active ? activeCls : "text-ink-faint hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
