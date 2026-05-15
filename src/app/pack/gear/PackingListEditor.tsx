"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { PackingItem } from "@/lib/packing-types";
import { computeTotals } from "@/lib/packing-types";
import { computeTargets, PACK_WEIGHT_CONSTANTS } from "@/data/packWeights";
import { TRAVEL_ONLY_CATEGORIES } from "@/data/coreItems";
import { StatusBadge } from "@/components/primitives/StatusBadge";
import {
  updateItemField,
  toggleItemFlag,
  addPersonalItem,
  deletePersonalItem,
  saveMyBodyWeight,
} from "./actions";

// Shelter is tracked as an actual packing item, so exclude it from the Day-1 constant
const GF = PACK_WEIGHT_CONSTANTS.gearAndFoodLbs - PACK_WEIGHT_CONSTANTS.shelterLbs;

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

type Mode = "pack" | "edit";

export function PackingListEditor({
  items: initialItems,
  bodyWeightLbs: initialBodyWeight,
  categoryOrder: propCategoryOrder,
  aboveHeader,
  children,
}: {
  items: PackingItem[];
  bodyWeightLbs: number | null;
  categoryOrder?: string[];
  /** Renders above the sticky green box (e.g. SubNav). Scrolls away on scroll. */
  aboveHeader?: ReactNode;
  children?: ReactNode;
}) {
  const [items, setItems] = useState<PackingItem[]>(initialItems);
  const [bodyWeight, setBodyWeight] = useState<number | null>(
    initialBodyWeight,
  );
  const [hideNotPacking, setHideNotPacking] = useState(false);
  const [hidePacked, setHidePacked] = useState(false);
  const [compact, setCompact] = useState(false);
  const [boxHeight, setBoxHeight] = useState<number | "auto">("auto");
  const [mode, setMode] = useState<Mode>("pack");
  const [, startTransition] = useTransition();

  const boxRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const compactRef = useRef<HTMLDivElement>(null);
  const expandedHRef = useRef(0);
  const compactHRef = useRef(0);
  const isCompactRef = useRef(false); // tracks state without stale closure

  useEffect(() => {
    const COLLAPSE_AT = 300;
    const EXPAND_AT = 290;

    document.documentElement.style.overflowAnchor = "none";

    const measure = () => {
      if (expandedRef.current) expandedHRef.current = expandedRef.current.offsetHeight;
      if (compactRef.current) compactHRef.current = compactRef.current.offsetHeight;
    };

    let prevY = window.scrollY;
    let lastToggle = 0;
    let cooldown = 150;

    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > prevY;
      prevY = y;

      if (Date.now() - lastToggle < cooldown) return;

      if (!isCompactRef.current && goingDown && y >= COLLAPSE_AT) {
        isCompactRef.current = true;
        lastToggle = Date.now();
        cooldown = 500; // longer after collapse — scroll-anchor takes more time to settle
        setCompact(true);
        setBoxHeight(compactHRef.current || compactRef.current?.offsetHeight || 60);
      } else if (isCompactRef.current && !goingDown && y <= EXPAND_AT) {
        isCompactRef.current = false;
        lastToggle = Date.now();
        cooldown = 150; // short after expand — keep it snappy
        setCompact(false);
        setBoxHeight(expandedHRef.current || expandedRef.current?.offsetHeight || 200);
      }
    };

    const onResize = () => {
      measure();
      setBoxHeight(isCompactRef.current ? compactHRef.current : expandedHRef.current);
    };

    // Measure after first paint, then check initial scroll position
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        measure();
        // Pin height so CSS transition has a concrete value to animate from
        setBoxHeight(expandedHRef.current);
        if (window.scrollY >= COLLAPSE_AT) {
          isCompactRef.current = true;
          setCompact(true);
          setBoxHeight(compactHRef.current);
        }
      })
    );

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Order categories: prefer server-supplied order (from gear_categories DB), fallback to alpha
  const categoryOrder = useMemo(() => {
    const present = new Set(items.map((i) => i.category));
    if (propCategoryOrder) {
      const ordered = propCategoryOrder.filter((c) => present.has(c));
      const extras = Array.from(present).filter((c) => !propCategoryOrder.includes(c));
      return [...ordered, ...extras.sort()];
    }
    return Array.from(present).sort();
  }, [items, propCategoryOrder]);

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
      isRequired: null,
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
    if (it.isNotPacking && hideNotPacking) return false;
    if (it.isPacked && hidePacked) return false;
    return true;
  });

  const isEditMode = mode === "edit";

  return (
    <div>
      {/* ───── Above-header slot (SubNav) — scrolls away ───── */}
      {aboveHeader}

      <div className="space-y-4">

      {/* ───── Sticky totals header ───── */}
      <div className="sticky top-0 z-30 -mx-6 !mt-0" style={{ overflowAnchor: "none" }}>

        {/* Colored status bar — dual-layer with CSS transitions */}
        <div
          ref={boxRef}
          className={`${statusBg} ${statusText} relative overflow-hidden ${compact ? "shadow-md" : "shadow-sm"}`}
          style={{
            height: boxHeight === "auto" ? "auto" : `${boxHeight}px`,
            transition: boxHeight === "auto" ? undefined : "height 250ms ease-out",
          }}
        >

          {/* ── Expanded layer ── */}
          <div
            ref={expandedRef}
            className="py-5"
            style={{ opacity: compact ? 0 : 1, transition: "opacity 200ms", pointerEvents: compact ? "none" : undefined }}
          >
            <div className="max-w-[900px] mx-auto px-6">
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
                    {status === "ok" ? "ON TARGET" : status === "warn" ? "CAUTION" : "OVER LIMIT"}
                  </StatusBadge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-2">
                <Stat label="Base" value={`${fmt(baseLbs)} lbs`} />
                <Stat label="Worn" value={`${fmt(ozToLbs(totals.wornOz))} lbs`} />
                <Stat label="Consumable" value={`${fmt(ozToLbs(totals.consumableOz))} lbs`} />
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
                    <div key={line} className="font-mono text-[12px] font-semibold text-center">
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

              <div className="flex justify-end mt-3">
                <button
                  onClick={() => setMode(isEditMode ? "pack" : "edit")}
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-[10px] font-medium font-mono uppercase tracking-[0.05em] bg-current/10 border border-current/20 hover:bg-current/20 active:scale-95 transition-all"
                >
                  {isEditMode ? "Done" : "Edit List"}
                </button>
              </div>
            </div>
          </div>

          {/* ── Compact layer (absolute overlay) ── */}
          <div
            ref={compactRef}
            className="absolute inset-x-0 top-0 pt-5 pb-2"
            style={{ opacity: compact ? 1 : 0, transition: "opacity 200ms", pointerEvents: compact ? undefined : "none" }}
          >
            <div className="max-w-[900px] mx-auto px-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 font-mono text-[12px] min-w-0">
                  <span className="whitespace-nowrap">
                    <span className="opacity-70 text-[10px] uppercase tracking-[0.06em]">Base </span>
                    <span className="font-semibold">{fmt(baseLbs)} lbs</span>
                  </span>
                  <span className="opacity-30">|</span>
                  <span className="whitespace-nowrap">
                    <span className="opacity-70 text-[10px] uppercase tracking-[0.06em]">Est. Max </span>
                    <span className="font-semibold">{fmt(totalDay1Lbs)} lbs</span>
                  </span>
                </div>
                <button
                  onClick={() => setMode(isEditMode ? "pack" : "edit")}
                  className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-medium font-mono uppercase tracking-[0.05em] bg-current/10 border border-current/20 hover:bg-current/20 active:scale-95 transition-all"
                >
                  {isEditMode ? "Done" : "Edit"}
                </button>
              </div>
            </div>
          </div>

        </div>{/* end colored bar */}

        {/* Column headers — edit mode only */}
        {isEditMode && (
          <div
            className="bg-surface-2 border-x border-b border-border px-3 py-1.5 flex items-center gap-2 text-[10px] font-mono text-ink-faint uppercase tracking-[0.05em] shadow-sm"
            style={{ borderWidth: "0.5px" }}
          >
            <span className="w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 min-w-0">Item</span>
            <span className="w-12 text-center shrink-0">QTY</span>
            <span className="w-16 text-right shrink-0">oz</span>
            <span className="w-5 text-center shrink-0">W</span>
            <span className="w-5 text-center shrink-0">C</span>
            <span className="w-8 text-center shrink-0">Off</span>
          </div>
        )}
      </div>{/* end sticky header */}

      {/* ───── Blue info note ───── */}
      {children}

      {/* ───── Filters ───── */}
      <div className="flex items-center justify-end gap-4 text-[11px] font-mono text-ink-muted">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 opacity-50">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={hideNotPacking}
            onChange={(e) => setHideNotPacking(e.target.checked)}
            className="accent-ink"
          />
          Hide non-packing ({totals.notPackingCount})
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={hidePacked}
            onChange={(e) => setHidePacked(e.target.checked)}
            className="accent-ink"
          />
          Hide packed ({totals.unpackedCount})
        </label>
      </div>

      {/* ───── Pack categories (counted) ───── */}
      {categoryOrder
        .filter((cat) => !TRAVEL_ONLY_CATEGORIES.has(cat))
        .map((cat) => {
          const catItems = visible.filter((it) => it.category === cat);
          const allCatItems = items.filter((it) => it.category === cat);
          const catSubtotalOz = allCatItems
            .filter((it) => !it.isNotPacking && !it.isWorn)
            .reduce((sum, it) => sum + it.qty * it.weightOz, 0);
          if (catItems.length === 0 && hideNotPacking) return null;

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
                    mode={mode}
                    onToggle={onToggle}
                    onFieldChange={onFieldChange}
                    onDelete={() => onDelete(it.id)}
                  />
                ))}
                {isEditMode && (
                  <li className="px-3 py-2 bg-surface-2/50">
                    <button
                      onClick={() => onAddPersonal(cat)}
                      className="font-mono text-[11px] text-ink-muted hover:text-ink"
                    >
                      + Add personal item
                    </button>
                  </li>
                )}
              </ul>
            </section>
          );
        })}

      {/* ───── Travel / Basecamp Only — NOT counted ───── */}
      {categoryOrder
        .filter((cat) => TRAVEL_ONLY_CATEGORIES.has(cat))
        .map((cat) => {
          const catItems = visible.filter((it) => it.category === cat);
          if (catItems.length === 0 && hideNotPacking) return null;

          return (
            <section key={cat} className="pt-4 border-t border-border-strong">
              <div className="flex items-baseline justify-between mb-1.5 px-1">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
                  {cat}
                </h2>
                <span className="font-mono text-[10px] text-ink-faint italic">
                  not in pack weight
                </span>
              </div>
              <p className="text-[11px] text-ink-faint mb-2 px-1 italic leading-snug">
                These travel to and from Philmont but don&apos;t go on trail.
                Not counted in any pack-weight totals.
              </p>
              <ul
                className="bg-surface-2 border border-border rounded-md overflow-hidden divide-y divide-border"
                style={{ borderWidth: "0.5px" }}
              >
                {catItems.map((it) => (
                  <ItemRow
                    key={it.id}
                    item={it}
                    mode={mode}
                    onToggle={onToggle}
                    onFieldChange={onFieldChange}
                    onDelete={() => onDelete(it.id)}
                  />
                ))}
                {isEditMode && (
                  <li className="px-3 py-2 bg-surface-2/70">
                    <button
                      onClick={() => onAddPersonal(cat)}
                      className="font-mono text-[11px] text-ink-muted hover:text-ink"
                    >
                      + Add personal item
                    </button>
                  </li>
                )}
              </ul>
            </section>
          );
        })}
      </div>{/* end space-y-4 */}
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

type ItemRowProps = {
  item: PackingItem;
  mode: Mode;
  onToggle: (
    id: string,
    flag: "isWorn" | "isConsumable" | "isSmellable" | "isPacked" | "isNotPacking",
    v: boolean,
  ) => void;
  onFieldChange: (id: string, field: "name" | "qty" | "weightOz", v: string | number) => void;
  onDelete: () => void;
};

function ItemRow({ item, mode, onToggle, onFieldChange, onDelete }: ItemRowProps) {
  if (mode === "pack") {
    return <PackRow item={item} onToggle={onToggle} />;
  }
  return <EditRow item={item} onToggle={onToggle} onFieldChange={onFieldChange} onDelete={onDelete} />;
}

function PackRow({
  item,
  onToggle,
}: {
  item: PackingItem;
  onToggle: ItemRowProps["onToggle"];
}) {
  const dimmed = item.isNotPacking;
  return (
    <li className={`px-3 py-2.5 flex items-center gap-3 text-[13px] ${dimmed ? "opacity-40" : ""}`}>
      <input
        type="checkbox"
        checked={item.isPacked}
        disabled={item.isNotPacking}
        onChange={(e) => onToggle(item.id, "isPacked", e.target.checked)}
        className="accent-ink shrink-0 w-4 h-4 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Packed"
        title="Packed"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <RequiredBadge isRequired={item.isRequired} isCore={item.isCore} />
          <span className={`font-medium leading-snug ${item.isPacked ? "line-through opacity-60" : ""}`}>
            {item.name}
          </span>
        </div>
        {item.description && (
          <div className="text-ink-muted font-normal text-[11px] leading-snug mt-0.5">
            {item.description}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {item.isWorn && (
          <span className="font-mono text-[10px] font-semibold text-ok-text" title="Worn">W</span>
        )}
        {item.isConsumable && (
          <span className="font-mono text-[10px] font-semibold text-info-text" title="Consumable">C</span>
        )}
      </div>
      <div className="shrink-0 font-mono text-[11px] text-ink-muted text-right whitespace-nowrap">
        {item.qty > 1 && <span>{item.qty} &times; </span>}
        {item.weightOz} oz
      </div>
    </li>
  );
}

function EditRow({
  item,
  onToggle,
  onFieldChange,
  onDelete,
}: {
  item: PackingItem;
  onToggle: ItemRowProps["onToggle"];
  onFieldChange: ItemRowProps["onFieldChange"];
  onDelete: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(String(item.qty));
  const [weight, setWeight] = useState(String(item.weightOz));
  const dimmed = item.isNotPacking;

  return (
    <li className={`px-3 py-2 flex items-center gap-2 text-[12px] ${dimmed ? "opacity-50" : ""}`}>
      <input
        type="checkbox"
        checked={item.isPacked}
        disabled={item.isNotPacking}
        onChange={(e) => onToggle(item.id, "isPacked", e.target.checked)}
        className="accent-ink shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Packed"
        title="Packed"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
          <RequiredBadge isRequired={item.isRequired} isCore={item.isCore} />
          {item.isCore ? (
            <span className="font-medium">{item.name}</span>
          ) : (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                if (name !== item.name) onFieldChange(item.id, "name", name);
              }}
              className="flex-1 font-medium bg-transparent border-b border-transparent focus:border-border-strong outline-none"
            />
          )}
          {item.description && (
            <span className="text-ink-muted font-normal text-[11px] leading-snug shrink-0">
              {item.description}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0 w-12 justify-end">
        <span className="font-mono text-[11px] text-ink-faint">&times;</span>
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
          className={`w-8 font-mono text-[12px] text-center bg-surface-2 border border-border rounded px-1 py-0.5 ${item.qty > 1 ? "font-semibold" : ""}`}
          aria-label="Quantity"
        />
      </div>

      <div className="flex items-center shrink-0 w-16 justify-end">
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
      </div>

      <FlagButton
        active={item.isWorn}
        onClick={() => onToggle(item.id, "isWorn", !item.isWorn)}
        label="W"
        title="Worn"
        tone="ok"
      />
      <FlagButton
        active={item.isConsumable}
        onClick={() => onToggle(item.id, "isConsumable", !item.isConsumable)}
        label="C"
        title="Consumable"
        tone="info"
      />

      <button
        onClick={() => onToggle(item.id, "isNotPacking", !item.isNotPacking)}
        className={`shrink-0 w-5 h-5 flex items-center justify-center rounded transition-colors ${
          item.isNotPacking ? "text-ink" : "text-ink-faint hover:text-ink"
        }`}
        title={item.isNotPacking ? "Mark as packing" : "Mark as not packing"}
        aria-label={item.isNotPacking ? "Mark as packing" : "Mark as not packing"}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <circle cx="7" cy="7" r="6" />
          <line x1="2.5" y1="11.5" x2="11.5" y2="2.5" />
        </svg>
      </button>

      {!item.isCore && (
        <button
          onClick={onDelete}
          className="text-ink-faint hover:text-danger-text shrink-0"
          aria-label="Delete"
          title="Delete personal item"
        >
          &#x2715;
        </button>
      )}
    </li>
  );
}

function RequiredBadge({
  isRequired,
  isCore,
}: {
  isRequired: boolean | null;
  isCore: boolean;
}) {
  if (!isCore || isRequired == null) return null;
  if (isRequired) {
    return (
      <span
        className="font-mono text-[9px] font-bold text-ok-text shrink-0 uppercase tracking-[0.04em]"
        title="Required"
      >
        REQ
      </span>
    );
  }
  return (
    <span
      className="font-mono text-[9px] text-ink-faint shrink-0 lowercase tracking-[0.04em]"
      title="Optional"
    >
      opt
    </span>
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
