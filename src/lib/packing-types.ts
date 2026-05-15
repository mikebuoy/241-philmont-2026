// Client-safe types and pure math helpers for the packing list.
// (Server-side fetching + seeding lives in lib/packing.ts which imports
// server-only modules and must not be imported from client components.)

export type PackingItem = {
  id: string;
  crewMemberId: string;
  category: string;
  name: string;
  qty: number;
  weightOz: number;
  isCore: boolean;
  isWorn: boolean;
  isConsumable: boolean;
  isSmellable: boolean;
  isPacked: boolean;
  isNotPacking: boolean;
  notes: string | null;
  sortOrder: number;
};

export type Totals = {
  baseOz: number;
  wornOz: number;
  consumableOz: number;
  smellableCount: number;
  notPackingCount: number;
  packedCount: number;
  unpackedCount: number;
};

export function computeTotals(items: PackingItem[]): Totals {
  let baseOz = 0;
  let wornOz = 0;
  let consumableOz = 0;
  let smellableCount = 0;
  let notPackingCount = 0;
  let packedCount = 0;
  let unpackedCount = 0;

  for (const it of items) {
    if (it.isNotPacking) {
      notPackingCount++;
      continue;
    }
    const total = it.qty * it.weightOz;
    if (it.isWorn) {
      wornOz += total;
    } else {
      baseOz += total;
      if (it.isConsumable) consumableOz += total;
    }
    if (it.isSmellable) smellableCount++;
    if (it.isPacked) packedCount++;
    else unpackedCount++;
  }

  return {
    baseOz,
    wornOz,
    consumableOz,
    smellableCount,
    notPackingCount,
    packedCount,
    unpackedCount,
  };
}
